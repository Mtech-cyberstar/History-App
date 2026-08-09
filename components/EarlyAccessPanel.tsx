export default function EarlyAccessPanel() {
  return (
    <section className="early-card early-card-fallback">
      <span className="early-art-fallback" aria-hidden="true" />
      <span className="early-copy">
        <strong>
          Early Access
          <svg className="inline-pro-mark" viewBox="0 0 32 32" aria-hidden="true">
            <path d="m16 2 11 6.5v15L16 30 5 23.5v-15L16 2Z" />
            <path d="m10 17 4 4 8-10" />
          </svg>
        </strong>
        <small>Upgrade to Pro to get access before<br />everyone else</small>
      </span>
      <span className="white-cta">
        <strong>Aphrodite</strong>
        <small>The Price of Desire</small>
        <b>›</b>
      </span>
      <span className="dots" aria-hidden="true">••••••••••••••</span>
    </section>
  );
}
