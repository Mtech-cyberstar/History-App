// Applies supabase/migrations/20260809000000_seed_paths.sql through the API,
// because there is no db:push here and migrations are otherwise pasted into
// the Supabase SQL editor by hand.
//
// Run with:  npm run seed:paths
// Safe to run more than once.

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } },
);

const paths = [
  {
    slug: "rise-of-the-ottomans",
    pill: "OTTOMAN FRONTIER",
    title: "The Rise of\nthe Ottomans",
    theme: "feudal",
    position: 1,
    published: true,
    stories: ["osman-ghazi", "mehmed-the-conqueror"],
  },
  {
    slug: "voices-of-anatolia",
    pill: "MEDIEVAL ANATOLIA",
    title: "Voices of\nAnatolia",
    theme: "tudors",
    position: 2,
    published: true,
    stories: ["yunus-emre"],
  },
  {
    slug: "before-the-empire",
    pill: "THE 1200s",
    title: "Before the\nEmpire",
    theme: "feudal",
    position: 3,
    published: true,
    // Both alive in the same century, on the same collapsing frontier.
    stories: ["yunus-emre", "osman-ghazi"],
  },
  {
    slug: "fall-of-constantinople",
    pill: "1453",
    title: "The Fall of\nConstantinople",
    theme: "tudors",
    position: 4,
    published: true,
    stories: ["mehmed-the-conqueror"],
  },
];

// A story can sit in more than one path on purpose. These are different routes
// through the same small library, not a filing system where each story has one
// home. Only `theme` values allowed by the paths_theme_check constraint work
// here — currently 'feudal' and 'tudors'.

for (const { stories, ...path } of paths) {
  const { data: row, error } = await supabase
    .from("paths")
    .upsert(path, { onConflict: "slug" })
    .select("id")
    .single();

  if (error) {
    console.error(`  --  ${path.slug}: ${error.message}`);
    process.exit(1);
  }

  const { data: storyRows } = await supabase
    .from("stories")
    .select("id, slug")
    .in("slug", stories);

  const members = stories
    .map((slug, index) => {
      const story = storyRows?.find((s) => s.slug === slug);
      return story
        ? { path_id: row.id, story_id: story.id, position: index + 1 }
        : null;
    })
    .filter(Boolean);

  if (members.length !== stories.length) {
    console.error(`  --  ${path.slug}: some stories were not found`);
    process.exit(1);
  }

  const { error: memberError } = await supabase
    .from("path_stories")
    .upsert(members, { onConflict: "path_id,story_id" });

  if (memberError) {
    console.error(`  --  ${path.slug}: ${memberError.message}`);
    process.exit(1);
  }

  console.log(`  OK  ${path.slug.padEnd(24)} ${members.length} story/stories`);
}

console.log("\nPaths seeded.\n");
