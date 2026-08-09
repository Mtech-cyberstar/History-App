import Link from "next/link";
import AuthForm from "@/components/AuthForm";
import { safeNext } from "@/lib/safe-next";

export const metadata = { title: "Create an account — Stories" };

export default async function SignUpPage({
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
          <h1>Sign up</h1>
        </header>
        <section className="auth-screen">
          <p className="auth-intro">
            An account saves your progress across every story.
          </p>
          <AuthForm mode="sign-up" next={destination} />
          <Link className="auth-back" href="/">
            ← Back to stories
          </Link>
        </section>
      </div>
    </main>
  );
}
