export default function HeroBanner() {
  return (
    <section className="hero-card decorative-static" aria-label="Featured collection">
      <img
        src="/assets/ui/hero-art.jpg"
        alt="Warriors facing a mysterious doorway"
      />
      <span className="hero-shade" aria-hidden="true" />
      <span className="hero-copy">
        <small><i>●</i> Hot right now</small>
        <strong>
          One myth.<br />
          <em>Three lenses</em> to<br />
          experience it.
        </strong>
        <b>Explore the collection <span>›</span></b>
      </span>
    </section>
  );
}
