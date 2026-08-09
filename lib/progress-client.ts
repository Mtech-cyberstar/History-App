export type SubmittedAnswer = {
  questionId: string;
  answerIndex: number;
};

export async function saveChapterProgress(
  chapterId: string,
  answers: SubmittedAnswer[],
): Promise<void> {
  const response = await fetch("/api/progress", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chapterId, answers }),
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;
    throw new Error(body?.error ?? "Your progress could not be saved.");
  }
}
