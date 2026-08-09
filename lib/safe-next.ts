// Cleans up a "?next=" value before we send anyone to it.
//
// Anything that redirects to a URL from the address bar has to be checked.
// Without this, a link like /sign-in?next=https://evil.example would sign a
// person in and then hand them straight to somebody else's site, which is an
// old and effective phishing trick called an open redirect.
//
// The rule: it must be a path on this site. Starts with a single slash, and
// not "//" or "/\", both of which browsers read as "another website".
export function safeNext(value: string | undefined | null): string {
  if (!value) return "/";
  if (!value.startsWith("/")) return "/";
  if (value.startsWith("//") || value.startsWith("/\\")) return "/";
  return value;
}
