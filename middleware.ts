import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// Next.js runs this before every request that matches the list below.
export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  // Everything except Next.js's own internal files and images. Those do not
  // need a login and checking them would only slow the site down.
  matcher: [
    "/((?!_next/static|_next/image|favicon.svg|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp3)$).*)",
  ],
};
