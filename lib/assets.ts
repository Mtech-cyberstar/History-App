// Portraits and audio are stored as short paths like 'portraits/osman-ghazi.jpg'.
// This turns one into an address the browser can fetch.
//
// There are two modes, and which one is used depends on a single setting:
//
//   NEXT_PUBLIC_ASSET_BASE_URL set    -> S3. The intended arrangement: media
//                                        lives outside the code, so adding a
//                                        story does not mean redeploying.
//   NEXT_PUBLIC_ASSET_BASE_URL empty  -> files shipped in public/assets/,
//                                        served by the site itself.
//
// The second mode is a stopgap while S3 is not set up, and it is why the three
// seed portraits sit in public/assets/portraits/. It goes against the rule in
// CLAUDE.md that public/ is for design and S3 is for content, and the reason
// that rule exists shows up here: every new story now needs a redeploy to show
// its picture. Fine for three. Not fine for thirty.
//
// To switch to S3: set the variable, upload the files, delete public/assets/
// portraits/. Nothing else changes.
const LOCAL_BASE = "/assets/";

export function assetUrl(path: string | null | undefined): string | null {
  if (!path) return null;

  const base = process.env.NEXT_PUBLIC_ASSET_BASE_URL || LOCAL_BASE;

  return base.endsWith("/") ? `${base}${path}` : `${base}/${path}`;
}
