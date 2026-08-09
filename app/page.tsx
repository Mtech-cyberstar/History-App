import BenefitsSection from "@/components/BenefitsSection";
import BottomNavigation from "@/components/BottomNavigation";
import EarlyAccessPanel from "@/components/EarlyAccessPanel";
import HeroBanner from "@/components/HeroBanner";
import PathsPreview from "@/components/PathsPreview";
import ProPanel from "@/components/ProPanel";
import SiteHeader from "@/components/SiteHeader";
import StoryCollection from "@/components/StoryCollection";
import { getStoriesByEra } from "@/lib/stories";

export default async function BrowsePage() {
  const eras = await getStoriesByEra();

  return (
    <main className="page-bg">
      <div className="app-shell">
        <SiteHeader />
        <HeroBanner />
        <PathsPreview />

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

        <EarlyAccessPanel />
        <BenefitsSection
          heading="What you're missing"
          kind="heart"
          title="Unlimited Hearts"
          firstLine="Answer quizzes with"
          secondLine="no worries"
        />
        <ProPanel />
        <BenefitsSection
          heading="All Pro Benefits"
          kind="calendar"
          title="Early Access"
          firstLine="Read all new stories"
          secondLine="ahead of others"
        />

        <div className="scroll-spacer" />
        <BottomNavigation />
      </div>
    </main>
  );
}
