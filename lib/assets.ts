// Portraits and audio live on S3, and the database only stores the short path
// to them, like 'portraits/osman-ghazi.png'. This sticks that onto the front
// half of the address, which lives in one environment variable.
//
// The point of doing it here and nowhere else: if those files ever move to a
// different host, one line in .env.local changes and every story keeps working.
//
// Returns null when there is nothing to show. Callers must handle null,
// because a story written before its picture arrives is normal.

// TEMPORARY, and only on your own computer.
//
// Until the S3 address arrives there is nowhere real to fetch portraits from,
// so local copies in public/dev-assets/ stand in, purely so the site can be
// looked at. This is against the rule in CLAUDE.md that public/ holds design
// and S3 holds content, and it is deliberately narrow:
//
//   - it never applies once NEXT_PUBLIC_ASSET_BASE_URL is set
//   - it never applies in a production build
//   - public/dev-assets/ is not committed, so it never reaches the live site
//
// Delete this constant and the two lines that use it once S3 is set up.
const LOCAL_PREVIEW_BASE = "/dev-assets/";

export function assetUrl(path: string | null | undefined): string | null {
  if (!path) return null;

  let base = process.env.NEXT_PUBLIC_ASSET_BASE_URL;

  if (!base && process.env.NODE_ENV !== "production") {
    base = LOCAL_PREVIEW_BASE;
  }

  if (!base) return null;

  return base.endsWith("/") ? `${base}${path}` : `${base}/${path}`;
}
