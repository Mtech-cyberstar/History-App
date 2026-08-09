import Link from "next/link";

// The blue Pro panel. It now opens a page that says plainly what Pro would be
// and that it does not exist yet, rather than being a button that ignores you.
export default function ProPanel() {
  return (
    <Link className="pro-power" href="/pro">
      <span>
        <strong>The great power of Pro</strong>
        <small>Here&apos;s what you&apos;re missing</small>
      </span>
      <img src="/assets/ui/pro-arena.jpg" alt="Two ancient warriors dueling" />
      <b>→&nbsp; View Pro offers</b>
    </Link>
  );
}
