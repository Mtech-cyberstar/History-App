import Link from "next/link";
import AuthForm from "@/components/AuthForm";
import { safeNext } from "@/lib/safe-next";

export const metadata = { title: "Sign in — Stories" };

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const destination = safeNext(next);

  return (
    <main className="page-bg">
      <div className="app-shell">
        <header className="top-header">
          <h1>Sign in</h1>
        </header>
        <section className="auth-screen">
          <p className="auth-intro">
            Sign in to keep your place and save your quiz scores.
          </p>
          <AuthForm mode="sign-in" next={destination} />
          <Link className="auth-back" href="/">
            ← Back to stories
          </Link>
        </section>
      </div>
    </main>
  );
}
