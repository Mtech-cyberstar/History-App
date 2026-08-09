import Link from "next/link";
import { assetUrl } from "@/lib/assets";
import type { StoryCard as StoryCardData } from "@/lib/stories";

// One card in a row. The design used a <button> here, but this moves you to
// another page, so it is a real link — see the code style notes in CLAUDE.md.
export default function StoryCard({ story }: { story: StoryCardData }) {
  const image = assetUrl(story.image_path);

  return (
    <Link className="story-card" href={`/stories/${story.slug}`}>
      {image ? (
        <img src={image} alt={story.figure} />
      ) : (
        // No portrait yet. Keep the card exactly the same shape rather than
        // collapsing it, so a half-written story does not break the row.
        <span className="story-card-blank" aria-hidden="true">
          {story.figure.charAt(0)}
        </span>
      )}
      <strong>{story.figure}</strong>
    </Link>
  );
}
