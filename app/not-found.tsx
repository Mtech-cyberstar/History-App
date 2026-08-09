import Link from "next/link";

// Shown for an address that does not exist, and whenever a page calls
// notFound() — an unknown story slug, or a chapter number past the end.
//
// Unpublished stories land here too, and that is deliberate: a draft is
// indistinguishable from something that was never written, so nobody can
// discover what you are working on by guessing addresses.
export default function NotFound() {
  return (
    <main className="page-bg">
      <div className="app-shell">
        <header className="top-header">
          <h1>Stories</h1>
        </header>

        <section className="state-screen">
          <h2>Nothing here</h2>
          <p>
            That story does not exist, or it has not been published yet.
          </p>
          <div className="state-actions">
            <Link className="state-link" href="/">
              Back to stories
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
