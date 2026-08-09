import { createBrowserClient } from "@supabase/ssr";

// The Supabase connection for code that runs in the browser: the sign-in form,
// the sign-up form, the quiz. Only ever uses the anon key, which is public.
//
// There is a second, separate version of this for code that runs on the
// server, in ./server.ts. They cannot be swapped for each other, because the
// browser keeps the login in a cookie it manages itself and the server has to
// read that cookie out of the request.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
