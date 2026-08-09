import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

// The design's header, minus the streak, hearts and search buttons — those
// were cut, see docs/SPEC.md. In their place: who is signed in.
//
// This runs on the server, so it can ask Supabase who the visitor is before
// the page is ever sent to the browser. No flicker, no "loading…" state.
export default async function SiteHeader() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let name: string | null = null;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name")
      .eq("id", user.id)
      .maybeSingle();
    name = profile?.display_name ?? user.email ?? null;
  }

  return (
    <header className="top-header">
      <h1>Stories</h1>
      <div className="header-actions">
        {user ? (
          <span className="site-user">
            <Link className="site-user-name" href="/profile">
              {name}
            </Link>
            <form action="/auth/sign-out" method="post">
              <button className="sign-out-button" type="submit">
                Sign out
              </button>
            </form>
          </span>
        ) : (
          <Link className="sign-in-link" href="/sign-in">
            Sign in
          </Link>
        )}
      </div>
    </header>
  );
}
