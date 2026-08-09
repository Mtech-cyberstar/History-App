import Link from "next/link";
import AuthForm from "@/components/AuthForm";

export const metadata = { title: "Sign in — Stories" };

export default function SignInPage() {
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
          <AuthForm mode="sign-in" />
          <Link className="auth-back" href="/">
            ← Back to stories
          </Link>
        </section>
      </div>
    </main>
  );
}
