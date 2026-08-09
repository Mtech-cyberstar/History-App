import { createClient } from "@/lib/supabase/server";

export type ProfilePageData = {
  displayName: string;
  secondaryName: string;
  avatarPath: string | null;
  chaptersDone: number;
  storiesStarted: number;
  storiesDone: number;
};

export async function getProfilePageData(): Promise<ProfilePageData | null> {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (!user) {
    if (userError && userError.name !== "AuthSessionMissingError") {
      throw new Error(`Could not load account: ${userError.message}`);
    }
    return null;
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("display_name, handle, avatar_path")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    throw new Error(`Could not load profile: ${profileError.message}`);
  }

  const { data: progress, error: progressError } = await supabase
    .from("chapter_progress")
    .select("chapter_id, completed_at")
    .eq("user_id", user.id)
    .not("completed_at", "is", null);

  if (progressError) {
    throw new Error(`Could not load progress: ${progressError.message}`);
  }

  // RLS limits this to chapters belonging to published stories. Keeping the
  // totals on that same set prevents old draft progress from inflating stats.
  const { data: chapters, error: chapterError } = await supabase
    .from("chapters")
    .select("id, story_id");

  if (chapterError) {
    throw new Error(`Could not count chapters: ${chapterError.message}`);
  }

  const completedIds = new Set(
    (progress ?? []).map((row) => row.chapter_id),
  );
  const storyTotals = new Map<string, number>();
  const storyCompleted = new Map<string, number>();

  for (const chapter of chapters ?? []) {
    storyTotals.set(
      chapter.story_id,
      (storyTotals.get(chapter.story_id) ?? 0) + 1,
    );
    if (completedIds.has(chapter.id)) {
      storyCompleted.set(
        chapter.story_id,
        (storyCompleted.get(chapter.story_id) ?? 0) + 1,
      );
    }
  }

  const chaptersDone = [...storyCompleted.values()].reduce(
    (total, count) => total + count,
    0,
  );
  const storiesStarted = storyCompleted.size;
  let storiesDone = 0;

  for (const [storyId, total] of storyTotals) {
    if (storyCompleted.get(storyId) === total) storiesDone++;
  }

  const emailName = user.email?.split("@")[0] ?? "Reader";

  return {
    displayName: profile?.display_name ?? emailName,
    secondaryName: profile?.handle ?? user.email ?? emailName,
    avatarPath: profile?.avatar_path ?? null,
    chaptersDone,
    storiesStarted,
    storiesDone,
  };
}
