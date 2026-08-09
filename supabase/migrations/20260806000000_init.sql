-- ===========================================================================
-- The whole database, in one file.
--
-- This is a "migration": a list of instructions that builds the database from
-- nothing. You never run these commands by hand — a command does it for you.
-- Keeping it as a file means the database can always be rebuilt exactly, and
-- Git remembers every change to it.
--
-- Written from docs/DATA-MODEL.md. If you change one, change the other.
-- ===========================================================================


-- ---------------------------------------------------------------------------
-- A small helper, used by several tables below.
-- Any table with an `updated_at` column gets this attached, so the column
-- actually changes when the row changes. Without it the column would sit
-- there holding the time the row was created and quietly lie to you.
-- ---------------------------------------------------------------------------
create function touch_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;


-- ===========================================================================
-- IDENTITY
-- ===========================================================================

-- Supabase owns the list of accounts, in a table called auth.users. We never
-- write to it. This table is our own information about a person, joined onto
-- theirs by id.
create table profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  handle       text unique,                 -- '@mbolt' in the design
  avatar_path  text,                        -- 'avatars/x.jpg', not a full URL
  created_at   timestamptz not null default now()
);

-- When someone signs up, give them a profile row automatically, so no part of
-- the app has to remember to do it.
--
-- `security definer` lets this run with enough permission to write a table the
-- brand-new user cannot touch yet. `set search_path = ''` is NOT optional --
-- without it this function is a well-known security hole, which is why every
-- name below is written out in full as public.profiles and so on.
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


-- ===========================================================================
-- CONTENT
-- ===========================================================================

-- A story is a figure or an event: "Claudius", "The Chernobyl Disaster".
create table stories (
  id         uuid primary key default gen_random_uuid(),
  slug       text not null unique,          -- the web address, e.g. 'claudius'
  title      text not null,
  figure     text not null,
  era        text not null,                 -- groups the browse page
  year       integer,                       -- negative for BC, so -44 is 44 BC
  summary    text,
  image_path text,                          -- 'portraits/x.jpg', not a full URL
  kind       text not null default 'read' check (kind in ('read','video')),
  published  boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index stories_published_year_idx on stories (published, year);
create index stories_era_idx            on stories (era);

create trigger stories_touch before update on stories
  for each row execute function touch_updated_at();


-- A story is made of chapters, in order. A chapter is the thing you actually
-- read and listen to. A story with only one chapter is perfectly normal.
create table chapters (
  id         uuid primary key default gen_random_uuid(),
  story_id   uuid not null references stories(id) on delete cascade,
  position   integer not null,              -- display order, starting at 1
  title      text not null,
  body       text not null,                 -- markdown
  audio_path text,                          -- 'lessons/x.mp3'
  created_at timestamptz not null default now(),
  unique (story_id, position)
);

create index chapters_story_idx on chapters (story_id, position);


-- The quiz at the end of a chapter.
create table quiz_questions (
  id           uuid primary key default gen_random_uuid(),
  chapter_id   uuid not null references chapters(id) on delete cascade,
  position     integer not null,            -- display order, starting at 1
  question     text not null,
  options      jsonb not null,              -- ["Meditations","The Republic"]
  answer_index integer not null,            -- 0 means the FIRST option is right
  unique (chapter_id, position)
);


-- The themed rows down the home screen: "Most Popular", "Gods & Pharaohs".
create table collections (
  id        uuid primary key default gen_random_uuid(),
  slug      text not null unique,
  eyebrow   text,                           -- the small line above, "Must Watch"
  title     text not null,
  subtitle  text,
  position  integer not null,               -- order down the home screen
  published boolean not null default false
);

-- Which stories are in which row, and in what order. A story can appear in
-- several rows, which is why this is its own table rather than a column.
create table collection_stories (
  collection_id uuid not null references collections(id) on delete cascade,
  story_id      uuid not null references stories(id)     on delete cascade,
  position      integer not null,
  primary key (collection_id, story_id)
);


-- The big purple and gold cards: a curated run of stories.
-- Not used by the site yet. Created now because adding a table to a database
-- that is already live is a great deal more work than creating it empty today.
create table paths (
  id         uuid primary key default gen_random_uuid(),
  slug       text not null unique,
  pill       text not null,                 -- "FEUDAL EUROPE"
  title      text not null,                 -- "The Hundred Years' War"
  theme      text not null check (theme in ('feudal','tudors')),
  image_path text,
  position   integer not null,
  published  boolean not null default false
);

create table path_stories (
  path_id  uuid not null references paths(id)   on delete cascade,
  story_id uuid not null references stories(id) on delete cascade,
  position integer not null,
  primary key (path_id, story_id)
);


-- ===========================================================================
-- PROGRESS
-- ===========================================================================

-- One row per person per chapter. Because the two ids together are the
-- primary key, re-taking a quiz updates the row instead of piling up a new
-- one each time.
create table chapter_progress (
  user_id      uuid not null references auth.users(id) on delete cascade,
  chapter_id   uuid not null references chapters(id)   on delete cascade,
  completed_at timestamptz,
  quiz_score   integer,                     -- questions correct
  quiz_total   integer,                     -- questions asked
  updated_at   timestamptz not null default now(),
  primary key (user_id, chapter_id)
);

create index chapter_progress_user_idx on chapter_progress (user_id);

create trigger chapter_progress_touch before update on chapter_progress
  for each row execute function touch_updated_at();


-- The streak and hearts in the header. Not used by the site yet.
-- Kept apart from `profiles` because this gets written constantly and
-- profiles almost never does.
create table user_stats (
  user_id          uuid primary key references auth.users(id) on delete cascade,
  current_streak   integer not null default 0,
  longest_streak   integer not null default 0,
  last_active_on   date,                    -- a DATE, not a time: see below
  hearts           integer not null default 3 check (hearts between 0 and 5),
  hearts_refill_at timestamptz,
  updated_at       timestamptz not null default now()
);
-- last_active_on is a date on purpose. A streak is a question about calendar
-- days. Storing an exact instant invites comparing instants, which breaks the
-- first time somebody flies to another country.

create trigger user_stats_touch before update on user_stats
  for each row execute function touch_updated_at();


-- ===========================================================================
-- PRO, AND BATTLE
-- ===========================================================================

-- Not used by the site yet, and no payment provider is connected. Status is
-- set by hand for now.
create table subscriptions (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  status     text not null default 'free'
             check (status in ('free','pro','cancelled')),
  started_at timestamptz,
  expires_at timestamptz,
  updated_at timestamptz not null default now()
);

create trigger subscriptions_touch before update on subscriptions
  for each row execute function touch_updated_at();


-- The Battle screen shows these. Picking one says "coming soon". There is no
-- table for an actual match, because a real one needs live connections and
-- cheat prevention, and none of that is in scope.
create table battle_topics (
  id         uuid primary key default gen_random_uuid(),
  slug       text not null unique,
  name       text not null,
  image_path text,
  position   integer not null,
  published  boolean not null default false
);


-- ===========================================================================
-- ROW LEVEL SECURITY
--
-- Read this bit even if you skip the rest.
--
-- Your site carries a key called the "anon key". It is printed in the page
-- source of every page, on purpose, and anyone can read it. What stops a
-- stranger using it to download your whole database is the rules below.
--
-- A table WITHOUT these rules is wide open to anybody who finds that key.
-- Every table therefore gets `enable row level security`, and then explicit
-- permission for the few things that genuinely should be allowed.
-- ===========================================================================

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


-- --- Content: anybody may read it, but only once it is published. ----------
-- An unfinished story is invisible to the whole world, including you in the
-- browser. That is what `published: false` is for while you are drafting.

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

create policy "published paths readable"
  on paths for select using (published);

create policy "path members readable"
  on path_stories for select using (
    exists (select 1 from paths
             where paths.id = path_stories.path_id and paths.published)
  );

create policy "published battle topics readable"
  on battle_topics for select using (published);

-- Notice there is no permission to WRITE any of the tables above. Nobody can
-- add or edit a story through the website at all. Stories arrive only through
-- `npm run import`, which runs from your terminal with the secret key and is
-- allowed to ignore these rules.


-- --- People: your own things are yours. ------------------------------------
-- auth.uid() means "the person making this request". Wrapping it in
-- (select ...) lets the database work it out once for the whole query instead
-- of once for every single row, which on a big table is the difference
-- between fast and not.

create policy "profiles readable"
  on profiles for select using (true);
create policy "own profile updatable"
  on profiles for update
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create policy "own progress readable"
  on chapter_progress for select using ((select auth.uid()) = user_id);
create policy "own progress insertable"
  on chapter_progress for insert with check ((select auth.uid()) = user_id);
create policy "own progress updatable"
  on chapter_progress for update
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "own stats readable"
  on user_stats for select using ((select auth.uid()) = user_id);
create policy "own stats writable"
  on user_stats for all
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- Read only, deliberately. A person must not be able to make themselves Pro.
create policy "own subscription readable"
  on subscriptions for select using ((select auth.uid()) = user_id);
