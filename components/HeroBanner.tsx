import Link from "next/link";

// The banner at the top of the home page. Its own words are "Explore the
// collection", so that is now exactly what it does: jumps to the story rows
// further down. It used to be a decorative <section> that ignored taps.
export default function HeroBanner() {
  return (
    <Link className="hero-card" href="/#stories" aria-label="Explore the collection">
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
    </Link>
  );
}
