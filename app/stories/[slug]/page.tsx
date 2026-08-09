import Link from "next/link";
import { notFound } from "next/navigation";
import BottomNavigation from "@/components/BottomNavigation";
import SiteHeader from "@/components/SiteHeader";
import StoryChapterList from "@/components/StoryChapterList";
import { assetUrl } from "@/lib/assets";
import { getStoryBySlug } from "@/lib/stories";

export default async function StoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let story;
  try {
    story = await getStoryBySlug(slug);
  } catch {
    return (
      <main className="page-bg">
        <div className="app-shell">
          <SiteHeader />
          <section className="story-error" role="alert">
            <h2>The story could not be loaded</h2>
            <p>Please check your connection and try this page again.</p>
            <Link href="/">← Back to all stories</Link>
          </section>
        </div>
      </main>
    );
  }

  if (!story) notFound();

  const portrait = assetUrl(story.image_path);

  // The one obvious thing to press. Resumes at the first unfinished chapter,
  // so a returning reader does not have to remember where they got to.
  const firstUnread =
    story.chapters.find((chapter) => !chapter.completed) ?? story.chapters[0];
  const allDone =
    story.chapters.length > 0 &&
    story.chapters.every((chapter) => chapter.completed);
  const startedAny = story.chapters.some((chapter) => chapter.completed);

  return (
    <main className="page-bg">
      <div className="app-shell">
        <SiteHeader />

        <article className="story-screen">
          <Link className="story-back" href="/">
            ← All stories
          </Link>

          <div className="story-portrait">
            {portrait ? (
              <img src={portrait} alt={story.figure} />
            ) : (
              <span className="story-portrait-blank" aria-hidden="true">
                {story.figure.charAt(0)}
              </span>
            )}
          </div>

          <header className="story-copy">
            <small>{story.era}</small>
            <h1>{story.figure}</h1>
            <h2>{story.title}</h2>
            {story.summary && <p>{story.summary}</p>}
          </header>

          {firstUnread && (
            <Link
              className="story-start"
              href={`/stories/${story.slug}/${firstUnread.position}`}
            >
              {allDone
                ? "Read it again"
                : startedAny
                  ? `Continue — Chapter ${firstUnread.position}`
                  : "Start reading"}
            </Link>
          )}

          <StoryChapterList
            slug={story.slug}
            chapters={story.chapters}
            signedIn={story.signedIn}
          />
        </article>

        <div className="scroll-spacer" />
        <BottomNavigation />
      </div>
    </main>
  );
}
