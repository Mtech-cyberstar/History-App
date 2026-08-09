import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/user";

export type ContinueReading = {
  storySlug: string;
  figure: string;
  imagePath: string | null;
  totalChapters: number;
  chaptersLeft: number;
  completedPositions: number[];
  next: { position: number; title: string };
};

type ProgressRow = {
  completed_at: string | null;
  updated_at: string;
  chapters: {
    position: number;
    story_id: string;
    stories: { slug: string; figure: string; image_path: string | null } | null;
  } | null;
};

// What the "Dive Right Back In" panel needs: the story this reader touched most
// recently that they have not finished, and the chapter to resume at.
//
// Returns null for a signed-out visitor, and for anyone who has either read
// nothing or finished everything — in all three cases the panel is hidden
// rather than shown empty.
export async function getContinueReading(): Promise<ContinueReading | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("chapter_progress")
    .select(
      "completed_at, updated_at, chapters(position, story_id, stories(slug, figure, image_path))",
    )
    .eq("user_id", user.id)
    .not("completed_at", "is", null)
    .order("updated_at", { ascending: false })
    .limit(60);

  if (error) throw new Error(`Could not load progress: ${error.message}`);

  const rows = (data ?? []) as unknown as ProgressRow[];

  // Most recently touched story first. A Map keeps insertion order, and the
  // rows already arrive newest first, so the first key is the newest story.
  const byStory = new Map<string, { positions: Set<number>; row: ProgressRow }>();
  for (const row of rows) {
    if (!row.chapters?.stories) continue;
    const id = row.chapters.story_id;
    const entry = byStory.get(id) ?? { positions: new Set<number>(), row };
    entry.positions.add(row.chapters.position);
    byStory.set(id, entry);
  }

  if (byStory.size === 0) return null;

  // One query for every candidate story's chapters, not one query per story.
  // A loop containing a database call is how a page that was fine with three
  // stories becomes slow with thirty.
  const { data: chapters, error: chapterError } = await supabase
    .from("chapters")
    .select("story_id, position, title")
    .in("story_id", [...byStory.keys()])
    .order("position");

  if (chapterError) {
    throw new Error(`Could not load chapters: ${chapterError.message}`);
  }

  for (const [storyId, entry] of byStory) {
    const all = (chapters ?? []).filter((row) => row.story_id === storyId);
    const next = all.find((chapter) => !entry.positions.has(chapter.position));
    if (!next) continue; // finished this one, look at the story before it

    const story = entry.row.chapters!.stories!;
    return {
      storySlug: story.slug,
      figure: story.figure,
      imagePath: story.image_path,
      totalChapters: all.length,
      chaptersLeft: all.length - entry.positions.size,
      completedPositions: [...entry.positions],
      next,
    };
  }

  return null;
}
