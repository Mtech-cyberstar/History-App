# Project rules

A history-lessons web app, modelled on the Paladin Android app. Short lessons
about historical figures, each with a portrait, narrated audio, the lesson
text, and a quiz. People sign in, and their progress is saved.

**Read [docs/SPEC.md](docs/SPEC.md) for what to build and in what order.**
**Read [docs/DATA-MODEL.md](docs/DATA-MODEL.md) for how content is stored.**

## Who you are working with

Two people, and it matters which one is talking.

The **nephew** is new to programming and does the day-to-day work. The
**uncle** is an experienced developer, owns the architecture, and appears
occasionally. If someone asks for a database migration or an IAM policy, it is
probably the uncle. If in doubt, ask.

Working with the nephew means:

- Favour simple, readable code over clever or idiomatic code.
- Explain anything non-obvious in a short comment, and in your replies.
- When you finish a step, say what they should look at in the browser to check
  it worked.
- If they ask what something means, answer properly. That is part of the job
  here, not a distraction from it.
- Never silently do something clever. If you deviate from these rules, say so.

## The design

`Paladin_Home_Master_Source/` is a complete, working reconstruction of the
Paladin home screen — real React, real CSS, pixel-matched. **It is the source
of truth for how the site looks.**

It is *reference only*. It runs on a different stack (Vite, vinext, Cloudflare
Workers, Drizzle, D1) and is excluded from our build and from Git. Read it,
lift markup and CSS out of it, and build in the project root.

`docs/design-reference/` holds screenshots of the real Android app, for
pixel-matching.

## Stack — exactly this, nothing else

- **Next.js** with the App Router, **TypeScript**
- **Next.js itself is the backend.** Server Components for reading, Route
  Handlers for writing. No separate API service.
- **Supabase** — Postgres, Auth, and Row Level Security
- **Plain CSS**, lifted from the design. No preprocessor
- **AWS S3** for portraits and narration audio
- Deployed on **Vercel**

Do **not** add: Tailwind, styled-components, CSS modules, any UI component
library, Redux, React Query, or a second auth provider.

Approved dependencies beyond the above: `@supabase/supabase-js`,
`@supabase/ssr`, `react-markdown`, `@aws-sdk/client-s3`,
`@aws-sdk/s3-request-presigner`. Anything else, stop and ask first, explaining
why. Do not install it and mention it afterwards.

**No ORM for now.** Row Level Security does the authorization and the queries
are simple. If they stop being simple, ask before reaching for Drizzle.

## Hard rules

**Secrets are server-side only.** Anything prefixed `NEXT_PUBLIC_` ships to the
browser and is readable by anyone. The AWS keys, the Supabase service-role key
and the database URL must never carry that prefix and must never be imported
into a Client Component. Only two values are public: the Supabase URL and its
anon key — which are public by design, and safe *only* because Row Level
Security is switched on.

**Turn on Row Level Security on every table, immediately.** In Supabase a table
without RLS is readable and writable by anyone holding the anon key, which is
in the page source. This is the single most common Supabase mistake and it is
not recoverable after a leak.

**S3 reads need no credentials.** The bucket is public-read, so portraits and
audio are fetched by plain `<img>` and `<audio>` tags over HTTPS. Only
*uploading* needs a key, and that happens in one Route Handler that mints a
short-lived presigned PUT. If a read path seems to need an AWS key, you have
misunderstood the task — ask.

**Asset paths, never full URLs.** The database stores `portraits/x.jpg`. The
full address is built by joining it onto `NEXT_PUBLIC_ASSET_BASE_URL`. One
small helper, used everywhere. Never hardcode the bucket address in a
component — if the files move host, one variable should change, not every file.

**Keep the design's CSS and class names exactly as they are.** Do not rename,
reorganise, or improve them. The point is that the design project and this one
can sit side by side showing the same names.

**`public/` is for design, S3 is for content.** Interface artwork ships with
the code in `public/assets/ui/`. Portraits and audio come from S3 and change as
lessons are added. Getting this backwards means either redeploying the site to
add a lesson, or paying AWS to serve a logo forever.

**Do not add features that are not in `docs/SPEC.md`.** No payments, no
comments, no analytics, no dark mode, no matchmaking. If you think something is
missing, ask.

## Code style

- **Server Components by default.** Add `"use client"` only where a component
  genuinely needs state or event handlers — the quiz, the sign-in form. Keep
  the client boundary as low in the tree as possible.
- Never trust the client. Anything a Route Handler writes must be re-checked
  against the signed-in user server-side, regardless of what RLS also enforces.
- Semantic HTML: `<main>`, `<article>`, `<nav>`. A real `<button>` for actions,
  a real `<Link>` for navigation. Do not use a button to change page.
- Every image needs an `alt`. A portrait's alt is the figure's name.
- Small components, one per file, under `components/`.
- Comment only where the reason is not visible from the code. No comments
  restating what the line obviously does.

## Working style

Build in the order given in `docs/SPEC.md`, one step at a time. After each,
stop and say what to check.

Do not run `npm run dev` and leave it running — the nephew needs to do that
themselves in their own terminal, and understand that they have.

Never run a destructive database command against a project you did not create
in this session. Migrations are written to a file and applied deliberately, not
typed into a shell.
