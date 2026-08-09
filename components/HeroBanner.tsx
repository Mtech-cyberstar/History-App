// The banner at the top of the home page. Its own words are "Explore the
// collection", so that is now exactly what it does: jumps to the story rows
// further down. It used to be a decorative <section> that ignored taps.
//
// A plain <a>, not a <Link>. The target is on this same page, so there is no
// page to fetch — the browser just scrolls, instantly. Routing it through
// Next.js only adds a delay before the same thing happens.
export default function HeroBanner() {
  return (
    <a className="hero-card" href="#stories" aria-label="Explore the collection">
      <img
        src="/assets/ui/hero-art.jpg"
        alt="Warriors facing a mysterious doorway"
      />
      <span className="hero-shade" aria-hidden="true" />
      <span className="hero-copy">
        <small>
          <i>●</i> Hot right now
        </small>
        <strong>
          One myth.
          <br />
          <em>Three lenses</em> to
          <br />
          experience it.
        </strong>
        <b>
          Explore the collection <span aria-hidden="true">›</span>
        </b>
      </span>
    </a>
  );
}
