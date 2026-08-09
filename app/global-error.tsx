"use client";

// The last resort. app/error.tsx handles a page that fails; this handles the
// layout itself failing, which is rarer and more total — at that point the
// site's own CSS may not have loaded, so this file carries its own styling and
// its own <html> and <body> tags.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "#1e2730",
          color: "#fbfbfb",
          fontFamily: "Arial, sans-serif",
          padding: "24px",
          textAlign: "center",
        }}
      >
        <div>
          <h1 style={{ fontSize: "22px", marginBottom: "12px" }}>
            The site failed to start
          </h1>
          <p style={{ color: "#b9c2cb", marginBottom: "20px" }}>
            Reload the page. If it keeps happening, the site needs looking at.
          </p>
          {error.digest && (
            <p style={{ color: "#7d8894", fontSize: "13px" }}>
              Reference: {error.digest}
            </p>
          )}
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: "16px",
              padding: "10px 20px",
              border: 0,
              borderRadius: "8px",
              background: "#fff",
              color: "#162b42",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
