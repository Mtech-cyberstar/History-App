import Link from "next/link";
import BottomNavigation from "@/components/BottomNavigation";
import SiteHeader from "@/components/SiteHeader";

export const metadata = { title: "Pro — Stories" };

// The Pro panel on the home page had to lead somewhere. This says plainly
// that Pro does not exist rather than pretending to sell it: there is no
// payment provider connected, and every story here is free.
export default function ProPage() {
  return (
    <main className="page-bg">
      <div className="app-shell">
        <SiteHeader />

        <section className="state-screen">
          <h2>Pro isn&apos;t a thing yet</h2>
          <p>
            Everything on this site is free, and there is nothing to buy. No
            payment system is connected.
          </p>
          <p>
            The Paladin app this one is modelled on charges for early access,
            unlimited hearts and a few other extras. Those panels are kept here
            because they are part of the design, but nothing behind them is
            real.
          </p>

          <div className="state-actions">
            <Link className="state-button" href="/">
              Read something instead
            </Link>
          </div>
        </section>

        <div className="scroll-spacer" />
        <BottomNavigation />
      </div>
    </main>
  );
}
