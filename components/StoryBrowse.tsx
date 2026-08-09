import StoryCollection from "@/components/StoryCollection";
import { getStoriesByEra } from "@/lib/stories";

// The era rows. This lives in its own component so the home page does not have
// to wait for it before it can even start the other panels — as siblings, the
// hero, continue-reading, paths and these rows are all fetched at once.
export default async function StoryBrowse() {
  const eras = await getStoriesByEra();

  return (
    <div id="stories" className="story-browse">
      {eras.length === 0 ? (
        <section className="collection">
          <div className="collection-copy">
            <h2>No stories yet</h2>
            <p>
              Write one in the content folder, then run{" "}
              <code>npm run import</code>.
            </p>
          </div>
        </section>
      ) : (
        eras.map((group) => (
          <StoryCollection
            key={group.era}
            title={group.era}
            stories={group.stories}
          />
        ))
      )}
    </div>
  );
}
