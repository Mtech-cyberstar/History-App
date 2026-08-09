import BenefitsSection from "@/components/BenefitsSection";
import BottomNavigation from "@/components/BottomNavigation";
import ContinueReading from "@/components/ContinueReading";
import EarlyAccessPanel from "@/components/EarlyAccessPanel";
import HeroBanner from "@/components/HeroBanner";
import PathsPreview from "@/components/PathsPreview";
import ProPanel from "@/components/ProPanel";
import SiteHeader from "@/components/SiteHeader";
import StoryBrowse from "@/components/StoryBrowse";

// Nothing is awaited here on purpose. Each panel below fetches its own data,
// and because they are siblings React renders them at the same time instead of
// one after another. Awaiting anything in this function would put every panel
// behind it in a queue.
export default function BrowsePage() {
  return (
    <main className="page-bg">
      <div className="app-shell">
        <SiteHeader />
        <HeroBanner />
        <ContinueReading />
        <PathsPreview />
        <StoryBrowse />

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
