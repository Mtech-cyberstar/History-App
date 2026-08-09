import Link from "next/link";
import BottomNavigation from "@/components/BottomNavigation";
import ProfileStats from "@/components/ProfileStats";
import SiteHeader from "@/components/SiteHeader";
import { assetUrl } from "@/lib/assets";
import { getProfilePageData } from "@/lib/profile";

export const metadata = { title: "Profile — Stories" };

export default async function ProfilePage() {
  let profile;
  try {
    profile = await getProfilePageData();
  } catch {
    return (
      <main className="page-bg">
        <div className="app-shell">
          <SiteHeader />
          <section className="story-error" role="alert">
            <h2>Your profile could not be loaded</h2>
            <p>Please check your connection and try this page again.</p>
            <Link href="/">← Back to all stories</Link>
          </section>
          <BottomNavigation />
        </div>
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="page-bg">
        <div className="app-shell">
          <SiteHeader />
          <section className="profile-guest">
            <h2>Your history lives here</h2>
            <p>Sign in to see completed chapters and stories.</p>
            <Link href="/sign-in">Sign in</Link>
          </section>
          <BottomNavigation />
        </div>
      </main>
    );
  }

  const avatar = assetUrl(profile.avatarPath);

  return (
    <main className="page-bg">
      <div className="app-shell">
        <section className="profile-screen profile-screen-real">
          <nav className="profile-toolbar" aria-label="Profile actions">
            <Link href="/">← Stories</Link>
            <form action="/auth/sign-out" method="post">
              <button type="submit">Sign out</button>
            </form>
          </nav>

          <div className="profile-identity">
            {avatar ? (
              <img
                className="profile-avatar"
                src={avatar}
                alt={`${profile.displayName}'s avatar`}
              />
            ) : (
              <span className="profile-avatar profile-avatar-blank" aria-hidden="true">
                {profile.displayName.charAt(0)}
              </span>
            )}
            <h1>{profile.displayName}</h1>
            <p>{profile.secondaryName}</p>
          </div>

          <ProfileStats
            chaptersDone={profile.chaptersDone}
            storiesStarted={profile.storiesStarted}
            storiesDone={profile.storiesDone}
          />
        </section>
        <BottomNavigation />
      </div>
    </main>
  );
}
