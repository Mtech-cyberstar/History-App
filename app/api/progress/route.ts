import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

type SubmittedAnswer = {
  questionId: string;
  answerIndex: number;
};

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Sign in to save progress." }, { status: 401 });
  }

  let payload: { chapterId?: unknown; answers?: unknown };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (typeof payload.chapterId !== "string" || !Array.isArray(payload.answers)) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const answers: SubmittedAnswer[] = [];
  for (const answer of payload.answers) {
    if (
      typeof answer !== "object" ||
      answer === null ||
      !("questionId" in answer) ||
      !("answerIndex" in answer) ||
      typeof answer.questionId !== "string" ||
      !Number.isInteger(answer.answerIndex)
    ) {
      return NextResponse.json({ error: "Invalid answer data." }, { status: 400 });
    }
    answers.push({
      questionId: answer.questionId,
      answerIndex: answer.answerIndex as number,
    });
  }

  const { data: chapter, error: chapterError } = await supabase
    .from("chapters")
    .select("id")
    .eq("id", payload.chapterId)
    .maybeSingle();

  if (chapterError) {
    return NextResponse.json({ error: "Progress could not be saved." }, { status: 503 });
  }
  if (!chapter) {
    return NextResponse.json({ error: "Chapter not found." }, { status: 404 });
  }

  const { data: questions, error: questionError } = await supabase
    .from("quiz_questions")
    .select("id, answer_index, options")
    .eq("chapter_id", chapter.id)
    .order("position", { ascending: true });

  if (questionError) {
    return NextResponse.json({ error: "Progress could not be saved." }, { status: 503 });
  }
  if (answers.length !== (questions ?? []).length) {
    return NextResponse.json({ error: "Answer every question first." }, { status: 400 });
  }

  const submitted = new Map<string, number>();
  for (const answer of answers) {
    if (submitted.has(answer.questionId)) {
      return NextResponse.json({ error: "Duplicate answer data." }, { status: 400 });
    }
    submitted.set(answer.questionId, answer.answerIndex);
  }

  let score = 0;
  for (const question of questions ?? []) {
    const answer = submitted.get(question.id);
    const optionCount = Array.isArray(question.options) ? question.options.length : 0;

    if (answer === undefined || answer < 0 || answer >= optionCount) {
      return NextResponse.json({ error: "Invalid answer data." }, { status: 400 });
    }
    if (answer === question.answer_index) score++;
  }

  const { error: saveError } = await supabase.from("chapter_progress").upsert(
    {
      user_id: user.id,
      chapter_id: chapter.id,
      completed_at: new Date().toISOString(),
      quiz_score: score,
      quiz_total: (questions ?? []).length,
    },
    { onConflict: "user_id,chapter_id" },
  );

  if (saveError) {
    return NextResponse.json({ error: "Progress could not be saved." }, { status: 503 });
  }

  return NextResponse.json({ score, total: (questions ?? []).length });
}
