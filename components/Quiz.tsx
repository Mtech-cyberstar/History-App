"use client";

import Link from "next/link";
import { useState } from "react";
import { saveChapterProgress } from "@/lib/progress-client";
import type { QuizQuestion } from "@/lib/stories";

export default function Quiz({
  chapterId,
  questions,
  signedIn,
}: {
  chapterId: string;
  questions: QuizQuestion[];
  signedIn: boolean;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(() =>
    questions.map(() => null),
  );
  const [finished, setFinished] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const question = questions[currentIndex];
  const selected = answers[currentIndex];
  const score = answers.reduce<number>(
    (total, answer, index) =>
      total + (answer === questions[index].answerIndex ? 1 : 0),
    0,
  );

  function chooseAnswer(answerIndex: number) {
    if (selected !== null) return;
    setAnswers((current) => {
      const next = [...current];
      next[currentIndex] = answerIndex;
      return next;
    });
  }

  async function finishQuiz() {
    setFinished(true);
    if (!signedIn) return;

    setSaving(true);
    setSaveError(null);
    try {
      await saveChapterProgress(
        chapterId,
        questions.map((item, index) => ({
          questionId: item.id,
          answerIndex: answers[index]!,
        })),
      );
      setSaved(true);
    } catch (error) {
      setSaveError(
        error instanceof Error ? error.message : "Your progress could not be saved.",
      );
    } finally {
      setSaving(false);
    }
  }

  function advance() {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((index) => index + 1);
    } else {
      void finishQuiz();
    }
  }

  function retry() {
    setAnswers(questions.map(() => null));
    setCurrentIndex(0);
    setFinished(false);
    setSaving(false);
    setSaved(false);
    setSaveError(null);
  }

  if (finished) {
    return (
      <section className="quiz-result" aria-live="polite">
        <small>CHAPTER COMPLETE</small>
        <h2>{score} out of {questions.length}</h2>
        {signedIn ? (
          <p>
            {saving
              ? "Saving your progress…"
              : saved
                ? "Your progress is saved."
                : saveError}
          </p>
        ) : (
          <p>
            Your score is not saved. <Link href="/sign-in">Sign in</Link> to
            keep your progress.
          </p>
        )}
        <button type="button" onClick={retry} disabled={saving}>
          Try again
        </button>
      </section>
    );
  }

  return (
    <section className="quiz-section" aria-labelledby="quiz-heading">
      <div className="quiz-heading">
        <div>
          <small>QUICK CHECK</small>
          <h2 id="quiz-heading">Question {currentIndex + 1}</h2>
        </div>
        <span>{currentIndex + 1} of {questions.length}</span>
      </div>

      <p className="quiz-question">{question.question}</p>
      <div className="quiz-options">
        {question.options.map((option, optionIndex) => {
          const answered = selected !== null;
          const correct = answered && optionIndex === question.answerIndex;
          const wrong = answered && optionIndex === selected && !correct;

          return (
            <button
              className={`quiz-option${correct ? " correct" : ""}${
                wrong ? " wrong" : ""
              }`}
              type="button"
              key={option}
              onClick={() => chooseAnswer(optionIndex)}
              disabled={answered}
            >
              <span>{String.fromCharCode(65 + optionIndex)}</span>
              {option}
            </button>
          );
        })}
      </div>

      {selected !== null && (
        <div className="quiz-feedback" role="status">
          <strong>
            {selected === question.answerIndex ? "Correct" : "Not quite"}
          </strong>
          <button className="quiz-next" type="button" onClick={advance}>
            {currentIndex === questions.length - 1 ? "See my score" : "Next question"}
          </button>
        </div>
      )}
    </section>
  );
}
