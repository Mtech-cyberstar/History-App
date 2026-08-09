import StoryCard from "@/components/StoryCard";
import type { StoryCard as StoryCardData } from "@/lib/stories";

// One titled row of cards, straight out of the design. On the browse page the
// heading is an era, so a new row appears by itself as soon as you write a
// story set in a period you have not covered before.
export default function StoryCollection({
  title,
  subtitle,
  stories,
}: {
  title: string;
  subtitle?: string;
  stories: StoryCardData[];
}) {
  return (
    <section className="collection">
      <div className="collection-copy">
        <h2>{title}</h2>
        {subtitle && <p>{subtitle}</p>}
      </div>
      <div className="card-row card-row-scroll">
        {stories.map((story) => (
          <StoryCard key={story.slug} story={story} />
        ))}
      </div>
    </section>
  );
}
