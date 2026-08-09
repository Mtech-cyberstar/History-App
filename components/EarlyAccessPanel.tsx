import Link from "next/link";
import { getNewestStory } from "@/lib/stories";

// In the design this panel advertised a story that does not exist and did
// nothing when tapped. It now shows whichever story was added most recently
// and opens it.
export default async function EarlyAccessPanel() {
  const story = await getNewestStory();
  if (!story) return null;

  return (
    <section className="early-card early-card-fallback">
      <span className="early-art-fallback" aria-hidden="true" />
      <span className="early-copy">
        <strong>
          Just added
          <svg className="inline-pro-mark" viewBox="0 0 32 32" aria-hidden="true">
            <path d="m16 2 11 6.5v15L16 30 5 23.5v-15L16 2Z" />
            <path d="m10 17 4 4 8-10" />
          </svg>
        </strong>
        <small>
          The newest story in the collection,
          <br />
          free to read like all the others
        </small>
      </span>
      <Link className="white-cta" href={`/stories/${story.slug}`}>
        <strong>{story.figure}</strong>
        <small>{story.title}</small>
        <b aria-hidden="true">›</b>
      </Link>
      <span className="dots" aria-hidden="true">
        ••••••••••••••
      </span>
    </section>
  );
}
