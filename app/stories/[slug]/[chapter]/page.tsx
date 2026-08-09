import Link from "next/link";
import { notFound } from "next/navigation";
import BottomNavigation from "@/components/BottomNavigation";
import ChapterBody from "@/components/ChapterBody";
import CompleteChapter from "@/components/CompleteChapter";
import Quiz from "@/components/Quiz";
import SiteHeader from "@/components/SiteHeader";
import { assetUrl } from "@/lib/assets";
import { romanNumeral } from "@/lib/format";
import { getChapterByPosition } from "@/lib/stories";

export default async function ChapterPage({
  params,
}: {
  params: Promise<{ slug: string; chapter: string }>;
}) {
  const { slug, chapter: chapterParam } = await params;
  const position = Number(chapterParam);

  if (!Number.isInteger(position) || position < 1) notFound();

  let chapter;
  try {
    chapter = await getChapterByPosition(slug, position);
  } catch {
    return (
      <main className="page-bg">
        <div className="app-shell">
          <SiteHeader />
          <section className="story-error" role="alert">
            <h2>The chapter could not be loaded</h2>
            <p>Please check your connection and try this page again.</p>
            <Link href={`/stories/${slug}`}>← Back to the story</Link>
          </section>
        </div>
      </main>
    );
  }

  if (!chapter) notFound();

  const audio = assetUrl(chapter.audio_path);
  const numeral = romanNumeral(chapter.position);
  const storyHref = `/stories/${chapter.story.slug}`;

  // Where the reader goes when this chapter is done. On the last chapter that
  // is back to the story, which is also where the completed ticks now show.
  const nextHref = chapter.next
    ? `${storyHref}/${chapter.next.position}`
    : storyHref;
  const nextLabel = chapter.next ? "Next chapter →" : "Finish story →";

  return (
    <main className="page-bg">
      <div className="app-shell">
        <SiteHeader />

        <article className="chapter-screen">
          <Link className="chapter-back" href={`/stories/${chapter.story.slug}`}>
            ← {chapter.story.figure}
          </Link>

          <header className="chapter-heading">
            <small>
              {chapter.story.era} · CHAPTER {numeral}
            </small>
            <h1>{chapter.title}</h1>
            <p>{chapter.story.title}</p>
          </header>

          {audio && (
            <section className="chapter-audio" aria-label="Chapter narration">
              <div>
                <small>NARRATION</small>
                <strong>Listen to this chapter</strong>
              </div>
              <audio controls preload="metadata" src={audio}>
                Your browser does not support audio playback.
              </audio>
            </section>
          )}

          <ChapterBody body={chapter.body} />

          {chapter.questions.length > 0 ? (
            <Quiz
              chapterId={chapter.id}
              questions={chapter.questions}
              signedIn={chapter.signedIn}
              nextHref={nextHref}
              nextLabel={nextLabel}
            />
          ) : (
            <CompleteChapter
              chapterId={chapter.id}
              signedIn={chapter.signedIn}
              nextHref={nextHref}
              nextLabel={nextLabel}
            />
          )}

          <nav className="chapter-pager" aria-label="Chapter navigation">
            {chapter.previous ? (
              <Link
                className="chapter-pager-item prev"
                href={`${storyHref}/${chapter.previous.position}`}
              >
                <small>← Previous</small>
                <strong>{chapter.previous.title}</strong>
              </Link>
            ) : (
              <Link className="chapter-pager-item prev" href={storyHref}>
                <small>← Back</small>
                <strong>{chapter.story.figure}</strong>
              </Link>
            )}

            {chapter.next ? (
              <Link
                className="chapter-pager-item next"
                href={`${storyHref}/${chapter.next.position}`}
              >
                <small>Next →</small>
                <strong>{chapter.next.title}</strong>
              </Link>
            ) : (
              <Link className="chapter-pager-item next" href={storyHref}>
                <small>Last chapter →</small>
                <strong>All chapters</strong>
              </Link>
            )}
          </nav>

          <p className="chapter-position">
            Chapter {chapter.position} of {chapter.chapterCount}
          </p>
        </article>

        <div className="scroll-spacer" />
        <BottomNavigation />
      </div>
    </main>
  );
}
