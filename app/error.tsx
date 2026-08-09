"use client";

import Link from "next/link";
import { useEffect } from "react";

// Next.js shows this instead of a blank screen whenever a page throws while
// rendering — a database outage, a bad query, a missing setting.
//
// Without this file the visitor gets the browser's own black "This page
// couldn't load" screen, which tells them nothing and tells you nothing either.
export default function ErrorScreen({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Goes to the terminal in development, and to the Vercel logs in production.
    console.error(error);
  }, [error]);

  return (
    <main className="page-bg">
      <div className="app-shell">
        <header className="top-header">
          <h1>Stories</h1>
        </header>

        <section className="state-screen">
          <h2>Something went wrong</h2>
          <p>
            The stories could not be loaded. This is usually the database being
            briefly unreachable rather than anything you did.
          </p>

          {/* The digest is the only clue that survives into production, where
              the real message is hidden on purpose so errors cannot leak
              private detail to visitors. Quote it when asking for help. */}
          {error.digest && (
            <p className="state-detail">
              Reference: <code>{error.digest}</code>
            </p>
          )}

          <div className="state-actions">
            <button className="state-button" type="button" onClick={reset}>
              Try again
            </button>
            <Link className="state-link" href="/">
              Back to stories
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
