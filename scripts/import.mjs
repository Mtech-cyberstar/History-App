// Reads every .md file in content/ and puts it into the database.
//
// Run it with:  npm run import
//
// This is a terminal tool, not part of the website. It uses the service-role
// key, which ignores the Row Level Security rules — that is why it can write
// stories when the website itself cannot. Never import this file from anything
// under app/.
//
// Safe to run as often as you like. Stories are matched on their slug, so
// re-running updates rather than duplicating.

import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { load as parseYaml } from "js-yaml";
import { createClient } from "@supabase/supabase-js";

const CONTENT_DIR = "content";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error(
    "\nMissing keys. NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY\n" +
      "must both be filled in in .env.local\n",
  );
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false },
});

// --- Reading a file -------------------------------------------------------

// A story file is frontmatter between two --- lines. Everything we need is in
// there, including each chapter's text.
function readStoryFile(filename) {
  const raw = readFileSync(join(CONTENT_DIR, filename), "utf8");
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);

  if (!match) {
    throw new Error("no frontmatter found (the part between --- lines)");
  }

  const data = parseYaml(match[1]);
  const slug = filename.replace(/\.md$/, "");

  for (const field of ["title", "figure", "era"]) {
    if (!data[field]) throw new Error(`missing required field: ${field}`);
  }

  const chapters = data.chapters ?? [];
  if (chapters.length === 0) throw new Error("no chapters");

  chapters.forEach((chapter, i) => {
    if (!chapter.title) throw new Error(`chapter ${i + 1} has no title`);
    if (!chapter.body) throw new Error(`chapter ${i + 1} has no body`);

    for (const [q, question] of (chapter.quiz ?? []).entries()) {
      const count = question.options?.length ?? 0;
      if (count < 2 || count > 4) {
        throw new Error(
          `chapter ${i + 1}, question ${q + 1}: needs 2 to 4 options, found ${count}`,
        );
      }
      // Counting starts at zero. answer: 0 means the first option.
      if (question.answer < 0 || question.answer >= count) {
        throw new Error(
          `chapter ${i + 1}, question ${q + 1}: answer is ${question.answer}, ` +
            `but with ${count} options it must be between 0 and ${count - 1}`,
        );
      }
    }
  });

  return { slug, data, chapters };
}

// --- Writing to the database ---------------------------------------------

async function importStory({ slug, data, chapters }) {
  const { data: story, error: storyError } = await supabase
    .from("stories")
    .upsert(
      {
        slug,
        title: data.title,
        figure: data.figure,
        era: data.era,
        year: data.year ?? null,
        summary: data.summary ?? null,
        image_path: data.image ?? null,
        kind: data.kind ?? "read",
        published: data.published ?? false,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "slug" },
    )
    .select("id")
    .single();

  if (storyError) throw new Error(storyError.message);

  // Update chapters in place, matching them up by position.
  //
  // Do NOT delete and recreate them. chapter_progress points at chapters with
  // `on delete cascade`, so throwing a chapter away throws away every reader's
  // record of having finished it. Upserting keeps the same row, and therefore
  // the same id, so progress survives a re-import.
  const { data: savedChapters, error: chapterError } = await supabase
    .from("chapters")
    .upsert(
      chapters.map((chapter, index) => ({
        story_id: story.id,
        position: index + 1,
        title: chapter.title,
        body: chapter.body.trim(),
        audio_path: chapter.audio ?? null,
      })),
      { onConflict: "story_id,position" },
    )
    .select("id, position");

  if (chapterError) throw new Error(chapterError.message);

  // If the file used to have more chapters than it does now, drop the extras.
  // Progress against a chapter that no longer exists goes with it, which is
  // correct — there is nothing left to have made progress on.
  const { error: trimError } = await supabase
    .from("chapters")
    .delete()
    .eq("story_id", story.id)
    .gt("position", chapters.length);
  if (trimError) throw new Error(trimError.message);

  let questionCount = 0;

  for (const [index, chapter] of chapters.entries()) {
    const saved = savedChapters.find((row) => row.position === index + 1);

    // Questions are safe to replace outright: nothing points at them, so
    // rebuilding them loses nothing. Only the score is kept, on the chapter.
    const { error: clearError } = await supabase
      .from("quiz_questions")
      .delete()
      .eq("chapter_id", saved.id);
    if (clearError) throw new Error(clearError.message);

    const questions = (chapter.quiz ?? []).map((question, i) => ({
      chapter_id: saved.id,
      position: i + 1,
      question: question.question,
      options: question.options,
      answer_index: question.answer,
    }));

    if (questions.length > 0) {
      const { error } = await supabase.from("quiz_questions").insert(questions);
      if (error) throw new Error(error.message);
      questionCount += questions.length;
    }
  }

  return { chapters: chapters.length, questions: questionCount };
}

// --- Go -------------------------------------------------------------------

const files = readdirSync(CONTENT_DIR).filter((f) => f.endsWith(".md"));

if (files.length === 0) {
  console.log(`No .md files in ${CONTENT_DIR}/ — nothing to do.`);
  process.exit(0);
}

console.log(`\nImporting ${files.length} file(s) from ${CONTENT_DIR}/\n`);

let failed = 0;

for (const file of files) {
  try {
    const story = readStoryFile(file);
    const { chapters, questions } = await importStory(story);
    console.log(
      `  OK  ${file.padEnd(30)} ${chapters} chapter(s), ${questions} question(s)`,
    );
  } catch (error) {
    failed++;
    console.error(`  --  ${file.padEnd(30)} ${error.message}`);
  }
}

console.log(
  failed === 0
    ? "\nDone. Everything imported.\n"
    : `\nDone, but ${failed} file(s) failed. See the lines marked -- above.\n`,
);

process.exit(failed === 0 ? 0 : 1);
