import Link from "next/link";
import { romanNumeral } from "@/lib/format";
import type { StoryChapter } from "@/lib/stories";

export default function StoryChapterList({
  slug,
  chapters,
  signedIn,
}: {
  slug: string;
  chapters: StoryChapter[];
  signedIn: boolean;
}) {
  const completed = chapters.filter((chapter) => chapter.completed).length;

  return (
    <section className="story-chapter-section">
      <div className="story-chapter-heading">
        <h2>Chapters</h2>
        <p>
          {signedIn
            ? `${completed} of ${chapters.length} complete`
            : "Sign in to save your progress"}
        </p>
      </div>

      {chapters.length === 0 ? (
        <p className="story-no-chapters">This story has no chapters yet.</p>
      ) : (
        <ol className="story-chapter-list">
          {chapters.map((chapter) => (
            <li key={chapter.id}>
              <Link
                href={`/stories/${slug}/${chapter.position}`}
                aria-label={`Chapter ${chapter.position}: ${chapter.title}${
                  chapter.completed ? ", completed" : ""
                }`}
              >
                <span
                  className={`story-chapter-number${
                    chapter.completed ? " done" : ""
                  }`}
                  aria-hidden="true"
                >
                  {romanNumeral(chapter.position)}
                </span>
                <span className="story-chapter-copy">
                  <small>CHAPTER {romanNumeral(chapter.position)}</small>
                  <strong>{chapter.title}</strong>
                </span>
                <span className="story-chapter-state" aria-hidden="true">
                  {chapter.completed ? "✓" : "→"}
                </span>
              </Link>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
