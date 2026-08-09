# Spec

What to build. Read [../CLAUDE.md](../CLAUDE.md) first for the stack and the
rules, and [DATA-MODEL.md](DATA-MODEL.md) for the schema.

---

## What the site is

A web version of the Paladin Android app, cut down to what one person can
build. Short history lessons about individual figures and events.

A **story** is a figure or event. A story is made of ordered **chapters**. A
chapter is what you read and listen to, and it ends in a quiz. People sign in,
and their progress is saved.

A visitor browses stories, opens one, works through its chapters, and answers
the quiz at the end of each.

## How much of Paladin

The design has more screens than we are building. The rule:

- **Real:** browse, story, chapter, quiz, sign in / sign up, profile.
- **Decorative:** the hero banner, Paths cards, Early Access and Pro panels,
  benefits strips. They render, they look right, they are not clickable.
- **Stub:** Battle. Renders from `battle_topics`; picking one says
  "coming soon". No matchmaking, no multiplayer, not now.
- **Cut:** streak counter, hearts, search, payments, Settings.

The database models more than the app uses — see the *later* markers in
[DATA-MODEL.md](DATA-MODEL.md). That is deliberate. Tables are cheap; migrating
a live schema is not.

If you think something should move category, ask. Do not move it quietly.

---

## Using the design

`Paladin_Home_Master_Source/` is the source of truth for how the site looks.
`docs/design-reference/` holds screenshots of the real app for pixel-matching.

- The design's CSS is already lifted into `app/globals.css`. **Keep the class
  names exactly.** Do not rename or reorganise.
- Split markup into components mirroring the design's own components. Anything
  repeated — several cards, several quiz options — is **one component rendered
  from data**, not copied markup. The design already does this; follow its lead.
- **Interface artwork** lives in `public/assets/ui/` and ships with the code.
- **Portraits and audio** come from S3, never from `public/`. Where the design
  shows a placeholder portrait, wire it to `stories.image_path`.
- Keep the responsive behaviour. The design sizes everything in `cqw` against
  `.app-shell`; media queries carry over untouched.

The design has **no chapter screen and no quiz screen**. Those are invented.
Build them from the design's existing class names, colours and sizing so they
belong, and say clearly which parts you invented.

---

## Pages

| Route | What |
|---|---|
| `/` | Browse. Story cards grouped by era, oldest era first |
| `/stories/[slug]` | Story. Portrait, figure, era, summary, chapter list with progress |
| `/stories/[slug]/[chapter]` | Chapter. Audio player, markdown body, then the quiz |
| `/sign-in`, `/sign-up` | Supabase email + password |
| `/profile` | Display name, avatar, real progress stats |
| `/battle` | Stub screen |
| `/auth/callback` | Route Handler. Supabase redirects here after sign-in |
| `/api/uploads/sign` | Route Handler. Mints a presigned S3 PUT. Admin only |

`[chapter]` is the chapter's `position`, from 1. So
`/stories/boudica/2` is chapter II.

Browse sorts by `year` ascending within each era, oldest era first. Stories with
no `year` go last. Only `published` stories appear — RLS enforces that, so an
unpublished slug 404s for everyone, signed in or not.

---

## Environment variables

`.env.local.example` lists these. The ones without `NEXT_PUBLIC_` must never
appear in a Client Component.

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_ASSET_BASE_URL=https://your-bucket.s3.amazonaws.com/

SUPABASE_SERVICE_ROLE_KEY=
AWS_REGION=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
S3_BUCKET=
```

The anon key is public by design and safe **only** because Row Level Security
is on. See [DATA-MODEL.md](DATA-MODEL.md).

---

## Quiz behaviour

- One question at a time.
- Tapping an option locks the answer in and shows whether it was right. If it
  was wrong, mark which option was correct.
- Then a control to move to the next question.
- After the last one, show the score as "4 out of 5" and offer a retry that
  resets to the first question.
- State lives in the component while the quiz is being taken. On finishing, a
  signed-in user's score is written to `chapter_progress` through a Route
  Handler, which re-checks the answers server-side rather than trusting the
  score the browser sends. A signed-out user sees their score and is invited to
  sign in; nothing is saved.
- Keyboard accessible: options are real `<button>` elements, focusable and
  usable with Enter.

---

## Must handle gracefully

None of these should break the site or show an empty box:

- No `audio_path` → no player
- No `image_path` → card still works and keeps its shape
- No questions → quiz section absent, chapter still completable
- A slug that does not exist, or is unpublished → Next.js 404, not a crash
- A chapter number past the end → 404
- No stories at all → browse page says there is nothing yet
- Signed out → the whole site works, minus saved progress
- Supabase unreachable → an error message, not a white screen

---

## Build in this order

Steps 1–12 are done and the site is live. Kept as a record of the order, and
because it is still the order to follow if any of it is rebuilt.

1. **Skeleton.** ✅ Project set up, `globals.css` from the design, root
   layout, interface artwork in `public/assets/ui/`.
2. **Database.** Supabase project. Every table, trigger and RLS policy from
   `DATA-MODEL.md`, checked in as a migration file under
   `supabase/migrations/`. Nothing is applied by hand in the dashboard.
3. **Auth.** Sign up, sign in, sign out. The `/auth/callback` handler and a
   `middleware.ts` that refreshes the session cookie. The header shows who is
   signed in. This is where the two Supabase clients get written — one for
   Server Components, one for the browser.
4. **Content.** `content/` with three real example stories, the import script,
   and their portraits uploaded to S3. Pick three genuinely different figures
   and eras, and write real text — not lorem ipsum, not placeholder sentences.
5. **Browse page** at `/`, grouped by era, reading from Postgres.
6. **Story page** at `/stories/[slug]`, with the chapter list and per-chapter
   progress ticks.
7. **Chapter page** at `/stories/[slug]/[chapter]`, with audio and markdown.
8. **Quiz**, and saving progress for signed-in users.
9. **Profile** at `/profile`, with stats counted from `chapter_progress`.
10. **Decorative sections** — hero, Paths, Early Access, benefits, Battle stub.
11. **Upload route** — presigned S3 PUT, admin only. Written but never
    exercised: no AWS credentials exist yet.
12. **Deploy** to Vercel. Live at `history-app-tan.vercel.app`.

Steps 2 and 3 come first on purpose: the tables and the sign-in exist before
anything is wired to them, so the frontend is built against a real database
from its first line rather than against mock data that has to be torn out.

---

## Still open

- **S3 is not set up.** `NEXT_PUBLIC_ASSET_BASE_URL` is empty, so portraits
  fall back to the initial-letter placeholder and no chapter has audio. The
  upload route in step 11 has never run. `public/dev-assets/` is a temporary
  local-only stand-in — see the note in `lib/assets.ts` and delete it when S3
  arrives.
- **Seed portraits are ~2.5 MB each** for a card rendered about 130px wide.
  Resize before uploading.
- **`js-yaml`** is a dev dependency used only by the import script, added
  without the sign-off `CLAUDE.md` asks for.
- **Migrations are applied by hand** through the Supabase SQL editor. There is
  no `db:push`. Fine at this size; revisit if migrations become frequent.

---

## When finished

Say:

- the exact commands to install, migrate, import and run it
- what they should see at `http://localhost:3000`
- which parts of the design you had to interpret or invent
- anything in these docs that seems wrong or contradictory
