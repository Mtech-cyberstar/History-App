import { createClient } from "@/lib/supabase/server";

// What a story card needs to know about itself. Deliberately smaller than the
// full database row — the browse page has no use for the chapter text.
export type StoryCard = {
  slug: string;
  title: string;
  figure: string;
  era: string;
  year: number | null;
  summary: string | null;
  image_path: string | null;
};

export type EraGroup = {
  era: string;
  stories: StoryCard[];
};

export type StoryChapter = {
  id: string;
  position: number;
  title: string;
  completed: boolean;
};

export type StoryDetail = StoryCard & {
  chapters: StoryChapter[];
  signedIn: boolean;
};

export type ChapterLink = {
  position: number;
  title: string;
};

export type ChapterDetail = {
  id: string;
  position: number;
  title: string;
  body: string;
  audio_path: string | null;
  questions: QuizQuestion[];
  signedIn: boolean;
  // Where the reader can go next. Without these the chapter is a dead end:
  // you finish the quiz and the only way on is the browser back button.
  chapterCount: number;
  previous: ChapterLink | null;
  next: ChapterLink | null;
  story: {
    slug: string;
    title: string;
    figure: string;
    era: string;
  };
};

export type QuizQuestion = {
  id: string;
  position: number;
  question: string;
  options: string[];
  answerIndex: number;
};

// Every published story, gathered into one group per era, oldest era first.
//
// Only published stories come back, and that is not enforced here — it is
// enforced by the database itself, by the Row Level Security rules in
// supabase/migrations/. Even a mistake in this file cannot leak a draft.
export async function getStoriesByEra(): Promise<EraGroup[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("stories")
    .select("slug, title, figure, era, year, summary, image_path")
    // nullsFirst: false puts stories with no year at the end, as SPEC.md asks.
    .order("year", { ascending: true, nullsFirst: false });

  if (error) throw new Error(`Could not load stories: ${error.message}`);

  const groups: EraGroup[] = [];

  // The rows arrive already sorted oldest first, so the first time we meet an
  // era is also its earliest story. Adding groups in that order therefore puts
  // the eras in date order too, without a second sort.
  for (const story of data ?? []) {
    const existing = groups.find((group) => group.era === story.era);
    if (existing) existing.stories.push(story);
    else groups.push({ era: story.era, stories: [story] });
  }

  return groups;
}

// One published story and the small amount of chapter data its overview page
// needs. The chapter body and quiz stay out of this query until the reader
// opens a chapter.
export async function getStoryBySlug(
  slug: string,
): Promise<StoryDetail | null> {
  const supabase = await createClient();

  const { data: story, error } = await supabase
    .from("stories")
    .select(
      "slug, title, figure, era, year, summary, image_path, chapters(id, position, title)",
    )
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw new Error(`Could not load story: ${error.message}`);
  if (!story) return null;

  const chapters = [...(story.chapters ?? [])].sort(
    (a, b) => a.position - b.position,
  );
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const completedChapterIds = new Set<string>();

  if (user && chapters.length > 0) {
    const { data: progress, error: progressError } = await supabase
      .from("chapter_progress")
      .select("chapter_id, completed_at")
      .eq("user_id", user.id)
      .in(
        "chapter_id",
        chapters.map((chapter) => chapter.id),
      );

    if (progressError) {
      throw new Error(`Could not load story progress: ${progressError.message}`);
    }

    for (const row of progress ?? []) {
      if (row.completed_at) completedChapterIds.add(row.chapter_id);
    }
  }

  return {
    slug: story.slug,
    title: story.title,
    figure: story.figure,
    era: story.era,
    year: story.year,
    summary: story.summary,
    image_path: story.image_path,
    signedIn: Boolean(user),
    chapters: chapters.map((chapter) => ({
      ...chapter,
      completed: completedChapterIds.has(chapter.id),
    })),
  };
}

// Chapter pages load only one body at a time. Looking up the story first makes
// unpublished and unknown slugs indistinguishable, as the public site needs.
export async function getChapterByPosition(
  slug: string,
  position: number,
): Promise<ChapterDetail | null> {
  const supabase = await createClient();

  const { data: story, error: storyError } = await supabase
    .from("stories")
    .select("id, slug, title, figure, era")
    .eq("slug", slug)
    .maybeSingle();

  if (storyError) {
    throw new Error(`Could not load story: ${storyError.message}`);
  }
  if (!story) return null;

  const { data: chapter, error: chapterError } = await supabase
    .from("chapters")
    .select(
      "id, position, title, body, audio_path, quiz_questions(id, position, question, options, answer_index)",
    )
    .eq("story_id", story.id)
    .eq("position", position)
    .maybeSingle();

  if (chapterError) {
    throw new Error(`Could not load chapter: ${chapterError.message}`);
  }
  if (!chapter) return null;

  const questions: QuizQuestion[] = [];
  const questionRows = [...(chapter.quiz_questions ?? [])].sort(
    (a, b) => a.position - b.position,
  );

  for (const row of questionRows) {
    if (
      !Array.isArray(row.options) ||
      !row.options.every((option) => typeof option === "string") ||
      !Number.isInteger(row.answer_index) ||
      row.answer_index < 0 ||
      row.answer_index >= row.options.length
    ) {
      throw new Error(`Question ${row.id} has invalid answer data`);
    }

    questions.push({
      id: row.id,
      position: row.position,
      question: row.question,
      options: row.options,
      answerIndex: row.answer_index,
    });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // The neighbours, so the chapter can offer somewhere to go when it ends.
  const { data: siblings, error: siblingError } = await supabase
    .from("chapters")
    .select("position, title")
    .eq("story_id", story.id)
    .order("position");

  if (siblingError) {
    throw new Error(`Could not load chapter list: ${siblingError.message}`);
  }

  const ordered = siblings ?? [];
  const here = ordered.findIndex((row) => row.position === chapter.position);

  return {
    id: chapter.id,
    position: chapter.position,
    title: chapter.title,
    body: chapter.body,
    audio_path: chapter.audio_path,
    questions,
    signedIn: Boolean(user),
    chapterCount: ordered.length,
    previous: here > 0 ? ordered[here - 1] : null,
    next: here >= 0 && here < ordered.length - 1 ? ordered[here + 1] : null,
    story: {
      slug: story.slug,
      title: story.title,
      figure: story.figure,
      era: story.era,
    },
  };
}
