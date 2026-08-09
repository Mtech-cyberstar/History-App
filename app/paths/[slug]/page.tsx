import Link from "next/link";
import { notFound } from "next/navigation";
import BottomNavigation from "@/components/BottomNavigation";
import SiteHeader from "@/components/SiteHeader";
import { assetUrl } from "@/lib/assets";
import { getPathBySlug } from "@/lib/paths";

export default async function PathPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let path;
  try {
    path = await getPathBySlug(slug);
  } catch {
    return (
      <main className="page-bg">
        <div className="app-shell">
          <SiteHeader />
          <section className="story-error" role="alert">
            <h2>The path could not be loaded</h2>
            <p>Please check your connection and try this page again.</p>
            <Link href="/">← Back to all stories</Link>
          </section>
        </div>
      </main>
    );
  }

  if (!path) notFound();

  return (
    <main className="page-bg">
      <div className="app-shell">
        <SiteHeader />

        <article className="path-screen">
          <Link className="story-back" href="/">
            ← All stories
          </Link>

          <header className={`path-hero ${path.theme}`}>
            <span className="pill">{path.pill}</span>
            <h1>{path.title.replace("\n", " ")}</h1>
            <p>
              {path.storyCount} {path.storyCount === 1 ? "story" : "stories"} ·{" "}
              {path.chapterCount}{" "}
              {path.chapterCount === 1 ? "chapter" : "chapters"}
            </p>
          </header>

          <ol className="path-list">
            {path.stories.map((story, index) => {
              const portrait = assetUrl(story.image_path);
              return (
                <li key={story.slug}>
                  <Link href={`/stories/${story.slug}`}>
                    <span className="path-list-number">{index + 1}</span>
                    {portrait ? (
                      <img
                        className="path-list-portrait"
                        src={portrait}
                        alt={story.figure}
                      />
                    ) : (
                      <span className="path-list-portrait blank" aria-hidden="true">
                        {story.figure.charAt(0)}
                      </span>
                    )}
                    <span className="path-list-copy">
                      <small>{story.era}</small>
                      <strong>{story.figure}</strong>
                      {story.summary && <em>{story.summary}</em>}
                    </span>
                    <b aria-hidden="true">→</b>
                  </Link>
                </li>
              );
            })}
          </ol>

          {path.stories.length === 0 && (
            <p className="path-empty">
              No published stories in this path yet.
            </p>
          )}
        </article>

        <div className="scroll-spacer" />
        <BottomNavigation />
      </div>
    </main>
  );
}
