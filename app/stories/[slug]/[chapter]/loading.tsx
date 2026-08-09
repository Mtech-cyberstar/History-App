import ScreenSkeleton from "@/components/ScreenSkeleton";

export default function LoadingChapter() {
  return (
    <main className="page-bg">
      <div className="app-shell">
        <header className="top-header">
          <h1>Stories</h1>
        </header>
        <ScreenSkeleton />
      </div>
    </main>
  );
}
