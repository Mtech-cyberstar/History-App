import Link from "next/link";
import { notFound } from "next/navigation";
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
            />
          ) : (
            <CompleteChapter
              chapterId={chapter.id}
              signedIn={chapter.signedIn}
            />
          )}
        </article>
      </div>
    </main>
  );
}
