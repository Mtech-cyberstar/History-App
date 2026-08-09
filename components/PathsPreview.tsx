import Link from "next/link";
import type { ReactNode } from "react";
import { getPaths } from "@/lib/paths";

// Drawn rather than photographed, so none of this waits on S3. Keyed by path
// so two cards sharing a colour still look different; anything not listed
// falls back to the shield.
const ART: Record<string, ReactNode> = {
  "rise-of-the-ottomans": (
    <>
      <path d="M60 12c-15 0-26 11-26 26 0 9 3 14 3 21l-6 13h58l-6-13c0-7 3-12 3-21 0-15-11-26-26-26Z" />
      <path d="M46 44h28M50 60h20" />
    </>
  ),
  "voices-of-anatolia": (
    <>
      <path d="M18 22h30c6 0 12 4 12 9v41c0-5-6-9-12-9H18V22Z" />
      <path d="M102 22H72c-6 0-12 4-12 9v41c0-5 6-9 12-9h30V22Z" />
    </>
  ),
  "before-the-empire": (
    <>
      <path d="M22 70h76" />
      <path d="M60 24v10M32 36l7 7M88 36l-7 7M18 62h12M90 62h12" />
      <path d="M38 62a22 22 0 0 1 44 0" />
    </>
  ),
  "fall-of-constantinople": (
    <>
      <path d="M20 82V40h10V28h10v12h12V28h10v12h12V28h10v12h10v42Z" />
      <path d="M52 82V62h16v20" />
    </>
  ),
};

const FALLBACK = (
  <>
    <path d="m12 29 27 20L59 9l22 40 28-20-9 47H20L12 29Z" />
    <path d="M23 76h74v9H23z" />
  </>
);

// The two big cards. These used to be hard-coded mock-ups that did nothing
// when tapped; they now come from the paths table and open a real page.
//
// The design draws its own artwork for these in CSS and SVG, so no picture is
// needed and nothing here is waiting on S3.
export default async function PathsPreview() {
  const paths = await getPaths();
  if (paths.length === 0) return null;

  return (
    <section className="paths">
      <div className="section-heading">
        <h2>
          Paths <sup>NEW</sup>
        </h2>
        <p>
          Follow a run of stories in order, from the beginning
          <br />
          to where it all ended up
        </p>
      </div>

      <div className="paths-row paths-row-scroll">
        {paths.map((path) => (
          <Link
            className={`path-card ${path.theme}`}
            href={`/paths/${path.slug}`}
            key={path.slug}
          >
            <span
              className={`path-art path-art-drawn ${path.theme}`}
              aria-hidden="true"
            >
              <svg viewBox="0 0 120 92">{ART[path.slug] ?? FALLBACK}</svg>
            </span>

            <span className="pill">{path.pill}</span>

            <strong className="path-title">
              {path.title.split("\n").map((line, index) => (
                <span key={line}>
                  {line}
                  {index < path.title.split("\n").length - 1 && <br />}
                </span>
              ))}
            </strong>

            <span className="path-stats">
              <b>
                {path.storyCount}{" "}
                <em>{path.storyCount === 1 ? "story" : "stories"}</em>
              </b>
              <b>
                {path.chapterCount}{" "}
                <em>{path.chapterCount === 1 ? "chapter" : "chapters"}</em>
              </b>
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

            <span className="path-view">
              View <b>→</b>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
