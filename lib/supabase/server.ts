import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// The Supabase connection for code that runs on the server: pages, and the
// handlers under app/auth/. It reads the login out of the browser's cookies so
// it knows who is asking.
//
// Always `await createClient()` fresh inside the function that needs it. Do not
// store it in a variable shared between requests — it holds one person's login,
// and sharing it would show one visitor another visitor's data.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Pages are not allowed to set cookies while rendering. That is
            // fine: middleware.ts already refreshed the login for this request.
          }
        },
      },
    },
  );
}
