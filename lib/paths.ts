import { createClient } from "@/lib/supabase/server";
import type { StoryCard } from "@/lib/stories";

// A path is a curated run of stories — the big purple and gold cards.
// `theme` picks the colour, and matches the design's .feudal / .tudors classes.
export type PathCard = {
  slug: string;
  pill: string;
  title: string;
  theme: string;
  storyCount: number;
  chapterCount: number;
};

export type PathDetail = PathCard & {
  stories: StoryCard[];
};

// The shape Supabase returns for the nested select below. Written out because
// the counts arrive as [{ count: n }], which is easy to misread.
type PathRow = {
  slug: string;
  pill: string;
  title: string;
  theme: string;
  path_stories: {
    position: number;
    stories: (StoryCard & { chapters: { count: number }[] }) | null;
  }[];
};

const SELECT = `
  slug, pill, title, theme,
  path_stories(
    position,
    stories(slug, title, figure, era, year, summary, image_path, chapters(count))
  )
`;

function shape(row: PathRow): PathDetail {
  const members = [...(row.path_stories ?? [])]
    .sort((a, b) => a.position - b.position)
    .map((member) => member.stories)
    // A story can be missing here when it exists but is unpublished: Row Level
    // Security hides the row rather than erroring, so the join returns null.
    .filter((story): story is NonNullable<typeof story> => story !== null);

  return {
    slug: row.slug,
    pill: row.pill,
    title: row.title,
    theme: row.theme,
    storyCount: members.length,
    // Counted, never stored. A stored total is a number that drifts silently.
    chapterCount: members.reduce(
      (total, story) => total + (story.chapters[0]?.count ?? 0),
      0,
    ),
    stories: members.map(({ chapters: _chapters, ...story }) => story),
  };
}

export async function getPaths(): Promise<PathCard[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("paths")
    .select(SELECT)
    .order("position");

  if (error) throw new Error(`Could not load paths: ${error.message}`);
  return ((data ?? []) as unknown as PathRow[]).map(shape);
}

export async function getPathBySlug(slug: string): Promise<PathDetail | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("paths")
    .select(SELECT)
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw new Error(`Could not load path: ${error.message}`);
  if (!data) return null;
  return shape(data as unknown as PathRow);
}
