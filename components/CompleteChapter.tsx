"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { saveChapterProgress } from "@/lib/progress-client";

export default function CompleteChapter({
  chapterId,
  signedIn,
  nextHref,
  nextLabel,
}: {
  chapterId: string;
  signedIn: boolean;
  nextHref: string;
  nextLabel: string;
}) {
  const pathname = usePathname();
  const [complete, setComplete] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function finish() {
    setComplete(true);
    if (!signedIn) return;

    setBusy(true);
    setError(null);
    try {
      await saveChapterProgress(chapterId, []);
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Your progress could not be saved.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="chapter-complete" aria-live="polite">
      {complete ? (
        <>
          <strong>Chapter complete</strong>
          <p>
            {signedIn
              ? busy
                ? "Saving your progress…"
                : error ?? "Your progress is saved."
              : "Sign in to save your progress."}
          </p>
          <div className="quiz-result-actions">
            <Link className="quiz-continue" href={nextHref}>
              {nextLabel}
            </Link>
            {!signedIn && (
              <Link
                className="quiz-retry"
                href={`/sign-in?next=${encodeURIComponent(pathname)}`}
              >
                Sign in
              </Link>
            )}
          </div>
        </>
      ) : (
        <button type="button" onClick={() => void finish()}>
          Finish chapter
        </button>
      )}
    </section>
  );
}
