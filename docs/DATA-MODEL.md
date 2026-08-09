# Data model

Postgres, on Supabase. This models the Paladin domain as the real app appears
to work, read off the design: a **story** is a historical figure or event, a
story is made of ordered **chapters**, and a chapter is what you actually read,
listen to, and get quizzed on.

Every table says whether it is wired up now or modelled ahead of time. Tables
marked *later* still get created and still get RLS — an empty table with
policies costs nothing, and retrofitting a schema after the app is live costs a
lot.

- **[Identity](#identity)** — profiles
- **[Content](#content)** — stories, chapters, questions, collections, paths
- **[Progress](#progress)** — what a person has done
- **[Monetisation and play](#monetisation-and-play)** — Pro, hearts, battles
- **[Row Level Security](#row-level-security)** — not optional
- **[Authoring](#authoring-lessons-in-markdown)** — markdown in, Postgres out

---

## Identity

### `profiles` — *wired now*

Supabase creates and owns `auth.users`. Never write to it. This is our data
hanging off it.

```sql
create table profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  display_name  text,
  handle        text unique,                -- '@mbolt' in the design
  avatar_path   text,                       -- 'avatars/x.jpg', not a full URL
  created_at    timestamptz not null default now()
);
```

A row is created by a trigger on sign-up, so the app never has to remember:

```sql
create function handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, split_part(new.email, '@', 1));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
```

`security definer` lets the trigger write a table the new user cannot yet
touch. `set search_path = ''` is **not optional** — without it this function is
a privilege-escalation hole, which is why every identifier above is fully
qualified.

---

## Content

### `stories` — *wired now*

A figure or event. "Claudius", "The Odyssey", "The Chernobyl Disaster".

```sql
create table stories (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,        -- the URL, e.g. 'claudius'
  title       text not null,               -- card title, may contain a newline
  figure      text not null,               -- the person or subject
  era         text not null,               -- groups the browse page
  year        integer,                     -- negative for BC, so -44 is 44 BC
  summary     text,
  image_path  text,                        -- 'portraits/x.jpg', not a full URL
  kind        text not null default 'read'
              check (kind in ('read','video')),
  published   boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index stories_published_year_idx on stories (published, year);
create index stories_era_idx            on stories (era);
```

`kind` exists because the design has a "Video Stories" row. Everything is
`read` until video actually happens.

### `chapters` — *wired now*

The thing you read. Body, narration, and its own quiz.

```sql
create table chapters (
  id          uuid primary key default gen_random_uuid(),
  story_id    uuid not null references stories(id) on delete cascade,
  position    integer not null,            -- display order, from 1
  title       text not null,               -- "The Queen's Wrath"
  body        text not null,               -- markdown
  audio_path  text,                        -- 'lessons/x.mp3'
  created_at  timestamptz not null default now(),
  unique (story_id, position)
);

create index chapters_story_idx on chapters (story_id, position);
```

A story with one chapter is fine and is how the three seed stories start.
`"3 chapters left"` in the design is this count minus what the user finished.

### `quiz_questions` — *wired now*

```sql
create table quiz_questions (
  id           uuid primary key default gen_random_uuid(),
  chapter_id   uuid not null references chapters(id) on delete cascade,
  position     integer not null,           -- display order, from 1
  question     text not null,
  options      jsonb not null,             -- ["Meditations", "The Republic"]
  answer_index integer not null,           -- 0-based
  unique (chapter_id, position)
);
```

`answer_index` is **the position of the correct option starting at zero**. So
`0` means the first option is right. This trips everyone up at least once.

`on delete cascade` throughout means deleting a story removes its chapters and
their questions. Without it you accumulate orphaned rows pointing at nothing.

### `collections` and `collection_stories` — *wired now*

The themed rows on the home screen: "Most Popular", "Ancient & Classical
Minds", "Gods & Pharaohs".

```sql
create table collections (
  id        uuid primary key default gen_random_uuid(),
  slug      text not null unique,
  eyebrow   text,                          -- "Must Watch"
  title     text not null,                 -- "Video Stories"
  subtitle  text,                          -- the line under the heading
  position  integer not null,              -- order down the home screen
  published boolean not null default false
);

create table collection_stories (
  collection_id uuid not null references collections(id) on delete cascade,
  story_id      uuid not null references stories(id)     on delete cascade,
  position      integer not null,          -- order within the row
  primary key (collection_id, story_id)
);
```

The browse page can group by `era` with no collections at all — that is how it
ships first. Collections are how you later curate rows by hand instead.

### `paths` and `path_stories` — *later*

The purple and gold cards. A curated sequence: "The Hundred Years' War —
9 stories, 36 chapters".

```sql
create table paths (
  id         uuid primary key default gen_random_uuid(),
  slug       text not null unique,
  pill       text not null,                -- "FEUDAL EUROPE"
  title      text not null,                -- "The Hundred Years' War"
  theme      text not null                 -- maps to the .feudal / .tudors class
             check (theme in ('feudal','tudors')),
  image_path text,
  position   integer not null,
  published  boolean not null default false
);

create table path_stories (
  path_id  uuid not null references paths(id)    on delete cascade,
  story_id uuid not null references stories(id)  on delete cascade,
  position integer not null,
  primary key (path_id, story_id)
);
```

The story and chapter counts on the card are counted from these, never stored.
A stored count is a number that goes wrong silently.

---

## Progress

### `chapter_progress` — *wired now*

```sql
create table chapter_progress (
  user_id      uuid not null references auth.users(id) on delete cascade,
  chapter_id   uuid not null references chapters(id)   on delete cascade,
  completed_at timestamptz,
  quiz_score   integer,                    -- questions correct
  quiz_total   integer,                    -- questions asked
  updated_at   timestamptz not null default now(),
  primary key (user_id, chapter_id)
);

create index chapter_progress_user_idx on chapter_progress (user_id);
```

The composite primary key means one row per person per chapter, so re-taking a
quiz updates rather than piles up. A full history of every attempt would be a
separate `quiz_attempts` table — decide that deliberately, because it grows
fast and is rarely looked at.

Everything the Profile screen shows is counted from this table. "Chapters done"
is a count of rows with `completed_at`. "Stories done" is stories where every
chapter has one. Nothing is denormalised, because a stored counter that drifts
is worse than a query that takes 3ms.

### `user_stats` — *later*

The streak and hearts in the header. Separate from `profiles` because it is
written on almost every interaction, and `profiles` is not.

```sql
create table user_stats (
  user_id        uuid primary key references auth.users(id) on delete cascade,
  current_streak integer not null default 0,
  longest_streak integer not null default 0,
  last_active_on date,                     -- date, not timestamp: streaks are days
  hearts         integer not null default 3 check (hearts between 0 and 5),
  hearts_refill_at timestamptz,
  updated_at     timestamptz not null default now()
);
```

`last_active_on` is a `date` deliberately. A streak is a question about
calendar days, and storing a timestamp invites comparing instants instead —
which breaks the moment a user crosses a timezone.

---

## Monetisation and play

### `subscriptions` — *later*

Pro gates Early Access and unlimited hearts in the design. Modelled, not built.
No payment provider is wired; `status` is set by hand for now.

```sql
create table subscriptions (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  status     text not null default 'free'
             check (status in ('free','pro','cancelled')),
  started_at timestamptz,
  expires_at timestamptz,
  updated_at timestamptz not null default now()
);
```

Never read Pro status from the client and trust it. A Client Component may show
or hide a badge; whether a row is actually returned is RLS's job.

### `battle_topics` — *later, stub only*

The Battle screen renders from this. Picking one says "coming soon". There is
no `battles` table, because a match needs realtime, matchmaking and an
anti-cheat story, and none of that is in scope.

```sql
create table battle_topics (
  id         uuid primary key default gen_random_uuid(),
  slug       text not null unique,
  name       text not null,                -- "Ancient\nRome"
  image_path text,
  position   integer not null,
  published  boolean not null default false
);
```

---

## Row Level Security

**Not optional.** A table without RLS is readable and writable by anyone
holding the anon key, which is printed in the page source. This is the single
most common Supabase mistake and it is not recoverable after a leak.

```sql
alter table profiles           enable row level security;
alter table stories            enable row level security;
alter table chapters           enable row level security;
alter table quiz_questions     enable row level security;
alter table collections        enable row level security;
alter table collection_stories enable row level security;
alter table paths              enable row level security;
alter table path_stories       enable row level security;
alter table chapter_progress   enable row level security;
alter table user_stats         enable row level security;
alter table subscriptions      enable row level security;
alter table battle_topics      enable row level security;
```

**Content is world-readable when published, invisible when not.**

```sql
create policy "published stories readable"
  on stories for select using (published);

create policy "chapters of published stories readable"
  on chapters for select using (
    exists (select 1 from stories
             where stories.id = chapters.story_id and stories.published)
  );

create policy "questions of readable chapters readable"
  on quiz_questions for select using (
    exists (select 1 from chapters
              join stories on stories.id = chapters.story_id
             where chapters.id = quiz_questions.chapter_id and stories.published)
  );

create policy "published collections readable"
  on collections for select using (published);
create policy "collection members readable"
  on collection_stories for select using (
    exists (select 1 from collections
             where collections.id = collection_stories.collection_id
               and collections.published)
  );

create policy "published paths readable" on paths for select using (published);
create policy "path members readable"
  on path_stories for select using (
    exists (select 1 from paths
             where paths.id = path_stories.path_id and paths.published)
  );

create policy "published battle topics readable"
  on battle_topics for select using (published);
```

**Personal data is private to its owner.**

```sql
create policy "profiles readable"    on profiles for select using (true);
create policy "own profile updatable" on profiles for update
  using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

create policy "own progress readable"  on chapter_progress for select
  using ((select auth.uid()) = user_id);
create policy "own progress insertable" on chapter_progress for insert
  with check ((select auth.uid()) = user_id);
create policy "own progress updatable"  on chapter_progress for update
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create policy "own stats readable"  on user_stats for select
  using ((select auth.uid()) = user_id);
create policy "own stats writable"  on user_stats for all
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create policy "own subscription readable" on subscriptions for select
  using ((select auth.uid()) = user_id);
```

Three things to notice:

**No write policies on any content table.** Nobody can insert or edit a story
through the API at all. Content arrives via the import script, which uses the
service-role key from a terminal and bypasses RLS entirely.

**No write policy on `subscriptions`.** A user must not be able to make
themselves Pro. Only the service role changes that row.

**`(select auth.uid())` rather than bare `auth.uid()`** is deliberate: it lets
Postgres evaluate the call once per query instead of once per row. On a table
scan that is the difference between fast and not.

### Two things that stay true

**Paths, never URLs.** `image_path` holds `portraits/x.jpg`. The full address is
built in the app from `NEXT_PUBLIC_ASSET_BASE_URL`. Moving hosts becomes a
config change, not a data migration.

**Nothing writes to `auth.users`.** Supabase owns it. Our data hangs off it by
foreign key, always with `on delete cascade`, so deleting an account genuinely
deletes the account.

---

## Authoring lessons in markdown

A story is written as a file in `content/`, then imported. The filename becomes
the slug:

```
content/marcus-aurelius.md   →   /stories/marcus-aurelius
```

### The shape of a story file

```markdown
---
title: The Emperor Who Wrote to Himself
figure: Marcus Aurelius
era: Ancient Rome
year: 161
image: portraits/marcus-aurelius.jpg
published: true
summary: A Roman emperor kept a private notebook. It became one of history's
  most-read books, and he never meant anyone to see it.
chapters:
  - title: The Private Notebook
    audio: lessons/marcus-aurelius-1.mp3
    quiz:
      - question: What was Marcus Aurelius best known for writing?
        options:
          - Meditations
          - The Republic
          - The Aeneid
        answer: 0
    body: |
      The lesson text goes here, in markdown. Blank lines separate paragraphs.

      **Bold** and *italic* work as you would expect.
---
```

The bit between the `---` lines is **frontmatter**: everything about the story.
With chapters, the body lives inside each chapter's `body:` block rather than
after the frontmatter.

### Every field

| Field | Required | Goes to |
|---|---|---|
| `title` | yes | `stories.title` |
| `figure` | yes | `stories.figure` |
| `era` | yes | `stories.era` — groups the browse page |
| `year` | no | `stories.year`. Negative for BC |
| `image` | no | `stories.image_path` |
| `summary` | no | `stories.summary` |
| `kind` | no | `stories.kind` — `read` or `video` |
| `published` | no | `stories.published`, default false |
| `chapters[].title` | yes | `chapters.title` |
| `chapters[].body` | yes | `chapters.body` |
| `chapters[].audio` | no | `chapters.audio_path` |
| `chapters[].quiz` | no | `quiz_questions`, one row each |

### Importing

`npm run import` reads every file in `content/`, upserts stories on `slug`,
replaces that story's chapters and questions, and leaves stories it did not see
alone. It uses the **service-role key** and therefore only ever runs from a
terminal — never from the site, never in a Route Handler.

Re-running it is safe. That is the point of upserting on `slug`.

### Rules that matter

**`image` and `audio` are paths, not full web addresses.** Write
`portraits/marcus-aurelius.jpg`, never
`https://bucket.s3.amazonaws.com/portraits/marcus-aurelius.jpg`.

**Filenames lowercase with hyphens.** `marcus-aurelius.md`, not
`Marcus Aurelius.md`. The filename becomes part of the URL, and spaces and
capitals cause problems there.

**Missing fields must not crash the site.** No `audio`, no player. No `quiz`,
no quiz section. Half-written stories are normal while drafting — that is what
`published: false` is for.

### Why keep markdown at all

Adding a story is writing a file and running one command. No admin panel to
build, and Git keeps the history of every edit for free. When someone who
cannot use a terminal needs to add stories, that is when an admin screen earns
its keep — and the schema above already supports it.
