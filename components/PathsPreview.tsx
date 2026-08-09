import Link from "next/link";
import { getPaths } from "@/lib/paths";

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
            {path.theme === "feudal" ? (
              <span className="path-art path-art-feudal" aria-hidden="true">
                <svg viewBox="0 0 120 92">
                  <path d="M60 8c-14 0-24 10-24 24 0 8 3 13 3 20l-6 12h54l-6-12c0-7 3-12 3-20 0-14-10-24-24-24Z" />
                  <path d="M48 40h24M52 54h16" />
                </svg>
              </span>
            ) : (
              <span className="path-art tudor-art" aria-hidden="true">
                <svg viewBox="0 0 120 92">
                  <path d="m12 29 27 20L59 9l22 40 28-20-9 47H20L12 29Z" />
                  <path d="M23 76h74v9H23z" />
                </svg>
              </span>
            )}

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
