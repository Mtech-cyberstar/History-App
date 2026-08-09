import Link from "next/link";
import { assetUrl } from "@/lib/assets";
import { getContinueReading } from "@/lib/continue-reading";
import { romanNumeral } from "@/lib/format";

// The design's "Dive Right Back In" section, wired to real progress.
//
// Hidden entirely for signed-out visitors and for anyone with nothing part
// finished, because a progress panel showing no progress is just clutter.
export default async function ContinueReading() {
  const resume = await getContinueReading();
  if (!resume) return null;

  const portrait = assetUrl(resume.imagePath);
  const chapterHref = `/stories/${resume.storySlug}/${resume.next.position}`;

  return (
    <section className="continue-section">
      <h2>Dive Right Back In</h2>

      <div className="journey-head">
        {portrait ? (
          <img src={portrait} alt={resume.figure} />
        ) : (
          <span className="journey-head-blank" aria-hidden="true">
            {resume.figure.charAt(0)}
          </span>
        )}
        <div>
          <strong>{resume.figure}</strong>
          <span>
            {resume.chaptersLeft}{" "}
            {resume.chaptersLeft === 1 ? "chapter" : "chapters"} left
          </span>
        </div>
      </div>

      <div
        className="chapter-progress"
        aria-label={`Chapter ${resume.next.position} of ${resume.totalChapters}`}
      >
        {Array.from({ length: resume.totalChapters }, (_, index) => {
          const position = index + 1;
          const done = resume.completedPositions.includes(position);
          const current = position === resume.next.position;
          return (
            <span
              className={done ? "done" : current ? "current" : ""}
              key={position}
            >
              {romanNumeral(position)}
            </span>
          );
        }).flatMap((node, index) =>
          // The design puts a connecting bar between each circle.
          index === 0 ? [node] : [<i key={`bar-${index}`} />, node],
        )}
        <svg className="progress-swords" viewBox="0 0 48 48" aria-hidden="true">
          <path d="m9 7 6 2 22 25-4 4L9 14V7Zm30 0-6 2-9 10 4 5 11-10V7Z" />
          <path d="m8 35 5 5m22-5-5 5M5 39l4 4m34-4-4 4" />
        </svg>
      </div>

      <Link className="continue-card" href={chapterHref}>
        {portrait ? (
          <img src={portrait} alt="" />
        ) : (
          <span className="continue-card-blank" aria-hidden="true">
            {resume.figure.charAt(0)}
          </span>
        )}
        <span>
          <small>CHAPTER {romanNumeral(resume.next.position)}</small>
          <strong>{resume.next.title}</strong>
        </span>
      </Link>
    </section>
  );
}
