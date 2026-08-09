# Start here

This is the only file you need to read. Everything else in this project is
written for the AI, not for you.

Follow this top to bottom. You don't need to understand it all up front.

Anything written `like this` gets typed into a terminal.

> **What's a terminal?** A window where you type commands instead of clicking
> buttons. On a Mac it's called Terminal, on Windows it's PowerShell. Search
> your applications for it. It looks intimidating and mostly isn't — you'll
> type about ten commands in total.

---

## 1. Install four things

Each one is a download-and-click-next job.

### Node

Your website is written in JavaScript. Node runs JavaScript on your own
computer, so you can see the site before anyone else does.

Get the version marked **LTS** from [nodejs.org](https://nodejs.org). Install
it, then **close your terminal and open a new one** — it only notices new
software when it starts up.

Check it worked:

```
node --version
```

A number like `v22.1.0` means you're set. Anything 20 or higher is fine.

If it says *command not found*, the install didn't finish. Restart your
computer and run the installer again. This happens to everyone.

### VS Code

Where you'll write. Free, from [code.visualstudio.com](https://code.visualstudio.com).
Every guide online assumes you have it.

### Git and GitHub

**Git** keeps a history of your work, so you can always get back to when things
worked. **GitHub** stores that history online. You need both, mainly because
the service that publishes your site reads from GitHub.

1. Free account at [github.com](https://github.com)
2. Install [Git](https://git-scm.com/downloads)
3. Introduce yourself so your changes carry your name:

```
git config --global user.name "Your Name"
git config --global user.email "your@email.com"
```

### An AI coding assistant

[Claude Code](https://claude.com/claude-code) or [Cursor](https://cursor.com).
This is what actually writes the site. You describe what you want in plain
English and it writes the code.

---

## 2. Get a database

Your site needs somewhere to keep stories and accounts. We use **Supabase**,
which is a database plus a login system, free at this size.

1. Sign up at [supabase.com](https://supabase.com) with your GitHub account
2. **New project**. Pick any name. Choose the region closest to you
3. It gives you a **database password** — save it somewhere safe now. You
   cannot see it again, only reset it
4. Wait about two minutes while it builds

Then find your keys: **Project Settings → API**. You need two values from that
page, `Project URL` and the `anon public` key. Keep the tab open.

> **Is it safe to have a key in my website?** The anon key is *meant* to be
> public — it's in the page source of every Supabase site. What actually keeps
> your data safe is a thing called Row Level Security, which the AI switches on
> for every table. There's a third key on that page marked `service_role`.
> **That one is not public.** Never put it anywhere except the file in step 4.

---

## 3. Open the project

Open this whole folder in VS Code: **File → Open Folder**.

Your folder should look roughly like this:

```
history-app/
  START-HERE.md              ← you're reading it
  CLAUDE.md                  ← instructions for the AI
  docs/                      ← more instructions for the AI
  app/                       ← the website itself
  content/                   ← your stories, as text files
  Paladin_Home_Master_Source/ ← the design, for reference
```

---

## 4. Write down your keys

Make a new file in this folder called exactly **`.env.local`** — yes, starting
with a dot. There's a file called `.env.local.example` next to it showing the
shape. Copy it and fill in the real values:

```
NEXT_PUBLIC_SUPABASE_URL=the Project URL from step 2
NEXT_PUBLIC_SUPABASE_ANON_KEY=the anon public key from step 2
NEXT_PUBLIC_ASSET_BASE_URL=the web address your uncle sends you, ending in /
SUPABASE_SERVICE_ROLE_KEY=the service_role key from step 2
```

> **Why a separate file?** So these live in one place instead of scattered
> through your code, and so the secret ones never reach GitHub. `.env.local` is
> deliberately ignored by Git. That's why it's the right home for anything you
> wouldn't post publicly.

---

## 5. Run the site

```
npm install
```

Downloads all the pre-written code your site depends on. Takes a few minutes
the first time and prints a wall of text you can ignore completely. You only
ever run this once.

### Create the tables

There is no command for this one — you paste it in by hand, which sounds worse
than it is and takes about a minute.

1. In VS Code, open the newest file in `supabase/migrations/`
2. Click inside it, press **Ctrl+A** then **Ctrl+C**
3. In Supabase: **SQL Editor** → **New query** → click in the big box →
   **Ctrl+V** → **Run**

You want **"Success. No rows returned"** in green. That is correct — it built
things rather than looking things up.

Do this once for each file in `supabase/migrations/`, oldest first, and again
whenever the AI adds a new one. If you get red text, paste the whole thing to
your assistant.

```
npm run import
```

Reads the story files in `content/` and puts them in the database. Run it again
every time you add or edit a story. It's safe to re-run.

```
npm run dev
```

Starts the site. Now open **http://localhost:3000** in your browser.

That address just means "this computer". The site is running on your machine
and nobody else can see it yet.

> **Leave that terminal open.** It's actively running the site — close it and
> the site stops. When you edit a file and save, the browser updates by itself
> within a second. You don't restart anything.
>
> **Except after changing `.env.local`.** That file is only read when the site
> starts. Press **Ctrl + C** and run `npm run dev` again. If your keys or
> portraits don't seem to work, this is almost always why.

---

## 6. Make an account

Click **Sign up** on your own site and make yourself an account. Use a real
email address.

You should land back on the home page with your name in the corner. Finish a
chapter's quiz and your score is saved — refresh the page and it's still there.
That's the database working.

If you want to see it for real: Supabase → **Table Editor** → `chapter_progress`.
Your row is in there.

---

## 7. Put it on the internet

Right now the site only exists on your computer.

### Send your work to GitHub

In VS Code, click the **Source Control** icon in the left bar (a little
branching line). Type a short note like "first version", click **Commit**, then
**Publish Branch**. Choose **private** when it asks.

### Connect Vercel

Vercel takes your code from GitHub and turns it into a real website. Free at
this size.

1. Sign up at [vercel.com](https://vercel.com) using your GitHub account
2. **Add New → Project**, pick your repository
3. **Before clicking deploy** — find **Environment Variables** and add every
   line from your `.env.local`, one at a time
4. Deploy

A minute later you have a real web address to send people.

Then one last thing: back in Supabase, **Authentication → URL Configuration**,
and add your new Vercel address. Sign-in emails need to know where to send
people back to, and they'll fail confusingly if you skip this.

> **Don't skip step 3.** Your `.env.local` stays on your computer and never
> goes to GitHub, deliberately — that's where private things belong. So Vercel
> has no idea what any of it is unless you tell it separately.
>
> Site works perfectly on your machine but is broken once it's online? This is
> why. It's the most common thing to miss.

From now on, every push to GitHub updates the live site on its own. You never
do this setup again.

---

## 8. Adding a story

1. Copy an existing `.md` file in `content/` and rename it. The filename
   becomes the web address, so use lowercase-with-hyphens: `marcus-aurelius.md`
2. Edit the details at the top and write the chapters
3. Ask your uncle to put the matching audio and portrait on S3
4. Run `npm run import`
5. Commit and push, same as before

Live site updates about a minute later.

The full list of fields is in [docs/DATA-MODEL.md](docs/DATA-MODEL.md). That's
written for the AI, but the *Authoring* section at the bottom is a perfectly
good reference for you too. One thing to watch: `answer: 0` means the **first**
option is correct. Counting starts at zero, and it catches everybody once.

Or just ask your assistant: *"add a new story about Cleopatra"*.

---

## When things break

They will, constantly. That isn't a sign you're doing badly — it's what this
work is like. Experienced developers see errors all day.

**Copy the whole error and paste it to your AI assistant.** The actual red
text, not your description of it. That single habit is most of the difference
between people who get unstuck and people who quit.

**"Port 3000 is already in use"** — the site is already running in another
terminal you forgot about. Find it and press Ctrl + C, or restart your
computer.

**"command not found: npm"** — Node didn't install, or your terminal was
already open when you installed it. Close it, open a new one.

**Site loads but there are no stories** — you haven't run `npm run import`, or
it failed. Run it again and read what it says.

**"Invalid API key" or a blank page** — a typo in `.env.local`, or you didn't
restart after editing it. If it's the live site rather than your computer, it's
the Vercel setting in step 7.

**Signed up but no email arrived** — check spam. Supabase's built-in email is
rate-limited and slow. For testing, Supabase → **Authentication → Users** lets
you confirm an account by hand.

**Rows exist in Supabase but the site shows nothing** — this is almost always
Row Level Security. Paste the whole thing to your assistant; don't turn RLS off
to make it go away.

**"AccessDenied" when you press play** — the S3 permissions are wrong. Your
uncle's problem, not yours.

**Changed something and nothing happened** — check you saved, and check you're
editing the file you think you are. Everybody does this one.

### Two habits worth having

**Change one thing at a time.** Ask for a single change, look at the site, then
ask for the next. Ask for five at once and when something breaks you won't know
which one did it.

**Ask it to explain.** *"What does `[slug]` mean in that folder name?"* is a
completely reasonable question. Asking is how code stops being magic you can't
touch and becomes something you can change.

---
---

# For the uncle

Everything above is for him. This part is yours.

## Shrink the audio first

Speech doesn't need stereo or a high bitrate. This makes files about four times
smaller with no audible difference — which matters because with online storage
you pay for **how often files are downloaded**, not how many you keep.

```
ffmpeg -i input.mp3 -ac 1 -b:a 64k output.mp3
```

Whole folder:

```
for f in *.mp3; do ffmpeg -i "$f" -ac 1 -b:a 64k "out/$f"; done
```

At these settings, roughly half a megabyte per minute, so a gigabyte holds
about 33 hours.

## Create the bucket

1. S3 → **Create bucket**, name it, leave defaults
2. Untick **Block all public access**, confirm the warning
3. **Permissions → Bucket policy**, paste this with the real name:

```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Sid": "PublicRead",
    "Effect": "Allow",
    "Principal": "*",
    "Action": "s3:GetObject",
    "Resource": "arn:aws:s3:::YOUR-BUCKET-NAME/*"
  }]
}
```

That permits reading and nothing else — no uploading, no deleting, not even
listing the contents. Every read path in the app needs no credentials at all.

## The upload key

The site has one Route Handler that mints presigned PUTs, so stories can be
uploaded without a terminal. That needs a real key. Make a **separate IAM user**
for it, with only this:

```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Action": "s3:PutObject",
    "Resource": [
      "arn:aws:s3:::YOUR-BUCKET-NAME/portraits/*",
      "arn:aws:s3:::YOUR-BUCKET-NAME/lessons/*"
    ]
  }]
}
```

Write-only, two prefixes, no read, no delete, no list. Its keys go in
`.env.local` and Vercel as `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` —
never with a `NEXT_PUBLIC_` prefix, which would ship them to the browser.

Also set a CORS rule on the bucket allowing `PUT` from your Vercel origin and
`http://localhost:3000`, or browser uploads fail with an opaque error.

## Seed content

`seed-assets/portraits/` holds the portraits extracted from the design, ready
to go:

```
aws s3 sync ./seed-assets/portraits s3://YOUR-BUCKET-NAME/portraits/
aws s3 sync ./lessons              s3://YOUR-BUCKET-NAME/lessons/
```

## Send him one line

```
https://YOUR-BUCKET-NAME.s3.amazonaws.com/
```

Test it first — paste that with `portraits/claudius.jpg` on the end into a
browser. If it loads, done. **AccessDenied** means the policy didn't save.

## Cost

S3 storage is about 2 cents per GB per month, nothing. Downloads are about 9
cents per GB, and that's the one that surprises people if something gets shared
widely. Set a **billing alert at $5** in AWS Budgets and stop thinking about it.

Supabase's free tier covers this comfortably. It pauses a project after a week
of no activity, which looks like an outage and isn't — opening the dashboard
wakes it.
