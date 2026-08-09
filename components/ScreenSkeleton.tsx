// Grey placeholder blocks in roughly the shape of the page being fetched.
//
// Next.js shows this the instant a link is tapped, so pressing a story card
// does something immediately instead of appearing to ignore you until the
// database answers. On a phone connection that gap is very noticeable.
export default function ScreenSkeleton({
  portrait = false,
}: {
  portrait?: boolean;
}) {
  return (
    <div className="skeleton-screen" aria-busy="true" aria-label="Loading">
      {portrait && <div className="skeleton-block skeleton-portrait" />}
      <div className="skeleton-block skeleton-line short" />
      <div className="skeleton-block skeleton-line wide" />
      <div className="skeleton-block skeleton-line" />
      <div className="skeleton-block skeleton-line" />
      <div className="skeleton-block skeleton-card" />
      <div className="skeleton-block skeleton-card" />
    </div>
  );
}
