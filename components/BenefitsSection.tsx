export default function BenefitsSection({
  heading,
  kind,
  title,
  firstLine,
  secondLine,
}: {
  heading: string;
  kind: "heart" | "calendar";
  title: string;
  firstLine: string;
  secondLine: string;
}) {
  return (
    <section className="benefits">
      <h2>{heading}</h2>
      <div className="feature-strip">
        <span className={`feature-icon ${kind}`} aria-hidden="true">
          {kind === "heart" ? "∞" : "▦"}
        </span>
        <div>
          <strong>{title}</strong>
          <p>{firstLine}<br />{secondLine}</p>
        </div>
        <span className="blocked" aria-hidden="true">⊘</span>
      </div>
    </section>
  );
}
