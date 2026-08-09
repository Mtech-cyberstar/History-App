"use client";

import Link from "next/link";
import { useState } from "react";
import { saveChapterProgress } from "@/lib/progress-client";

export default function CompleteChapter({
  chapterId,
  signedIn,
}: {
  chapterId: string;
  signedIn: boolean;
}) {
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
          {!signedIn && <Link href="/sign-in">Sign in</Link>}
        </>
      ) : (
        <button type="button" onClick={() => void finish()}>
          Finish chapter
        </button>
      )}
    </section>
  );
}
