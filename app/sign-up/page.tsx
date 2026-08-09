import Link from "next/link";
import AuthForm from "@/components/AuthForm";

export const metadata = { title: "Create an account — Stories" };

export default function SignUpPage() {
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
          <AuthForm mode="sign-up" />
          <Link className="auth-back" href="/">
            ← Back to stories
          </Link>
        </section>
      </div>
    </main>
  );
}
