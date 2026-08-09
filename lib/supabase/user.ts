import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

// Who is signed in, asked once per page load however many times it is called.
//
// supabase.auth.getUser() is not a local lookup — it sends the token to
// Supabase to be checked, which is a network round trip. The header wanted it,
// the continue-reading panel wanted it, and each page wanted it, so a single
// home page load was asking the same question three times over the network
// before it drew anything.
//
// React's cache() remembers the answer for the duration of one request, so the
// second and third callers get it for free. It does not cache between visitors
// or between requests, so nobody ever sees anybody else's account.
export const getCurrentUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});
