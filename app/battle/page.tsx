import BattleBoard from "@/components/BattleBoard";
import BottomNavigation from "@/components/BottomNavigation";
import { getBattleTopics } from "@/lib/battle";

export const metadata = { title: "Battle — Stories" };

export default async function BattlePage() {
  let topics;
  try {
    topics = await getBattleTopics();
  } catch {
    return (
      <main className="page-bg">
        <div className="app-shell">
          <section className="battle-screen battle-empty" role="alert">
            <h1>Battle could not be loaded</h1>
            <p>Please check your connection and try again.</p>
          </section>
          <BottomNavigation />
        </div>
      </main>
    );
  }

  return (
    <main className="page-bg">
      <div className="app-shell">
        {topics.length > 0 ? (
          <BattleBoard topics={topics} />
        ) : (
          <section className="battle-screen battle-empty">
            <h1>Battle topics are being prepared</h1>
            <p>Check back soon.</p>
          </section>
        )}
        <BottomNavigation />
      </div>
    </main>
  );
}
