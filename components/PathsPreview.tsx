export default function PathsPreview() {
  return (
    <section className="paths paths-preview">
      <div className="section-heading">
        <h2>Paths <sup>NEW</sup></h2>
        <p>Experience stories in a new, interactive and<br />engaging format</p>
      </div>
      <div className="paths-row">
        <article className="path-card feudal">
          <img
            className="path-art"
            src="/assets/ui/path-feudal-art.jpg"
            alt="Purple medieval knight helmet"
          />
          <span className="pill">FEUDAL EUROPE</span>
          <strong className="path-title">The Hundred<br />Years&apos; War</strong>
          <span className="path-stats">
            <b>9 <em>stories</em></b>
            <b>36 <em>chapters</em></b>
          </span>
          <span className="path-map" aria-hidden="true">
            <svg viewBox="0 0 170 180">
              <path d="M154 5C111 43 135 74 78 98S39 151 5 175" />
            </svg>
            <svg className="rook rook-one" viewBox="0 0 44 44">
              <ellipse cx="22" cy="35" rx="16" ry="6" />
              <path d="M14 11h16v7l-3 3v8H17v-8l-3-3v-7Zm0 0V6h5v5m6 0V6h5v5M17 29l-4 5h18l-4-5" />
              <path d="M20 22h4v5h-4z" />
            </svg>
            <svg className="rook rook-two" viewBox="0 0 44 44">
              <ellipse cx="22" cy="35" rx="16" ry="6" />
              <path d="M14 11h16v7l-3 3v8H17v-8l-3-3v-7Zm0 0V6h5v5m6 0V6h5v5M17 29l-4 5h18l-4-5" />
              <path d="M20 22h4v5h-4z" />
            </svg>
          </span>
          <span className="path-view">View <b>→</b></span>
        </article>

        <article className="path-card tudors">
          <span className="path-art tudor-art" aria-hidden="true">
            <svg viewBox="0 0 120 92">
              <path d="m12 29 27 20L59 9l22 40 28-20-9 47H20L12 29Z" />
              <path d="M23 76h74v9H23z" />
            </svg>
          </span>
          <span className="pill">THE TUDORS</span>
          <strong className="path-title">The Tudor<br />Dynasty</strong>
          <span className="path-stats">
            <b>8 <em>stories</em></b>
            <b>28 <em>chapters</em></b>
          </span>
          <span className="path-view">View <b>→</b></span>
        </article>
      </div>
    </section>
  );
}
