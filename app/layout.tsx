import type { Metadata } from "next";
import { Rubik } from "next/font/google";
import "./globals.css";

// The design uses the Rubik font. next/font is built into Next.js, so this
// needs no extra package: it downloads Rubik at build time and serves it from
// our own site. `variable` puts the font's real name into a CSS variable
// called --font-rubik, which app/globals.css reads in its `body` rule.
const rubik = Rubik({
  subsets: ["latin"],
  variable: "--font-rubik",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Stories",
  description: "Short history lessons about the people who shaped the world.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={rubik.variable}>
      {/* suppressHydrationWarning is here because browser extensions such as
          Grammarly add their own attributes to <body> before React starts,
          which React then reports as the page not matching itself. It silences
          that one complaint on this one tag only — a genuine mismatch anywhere
          inside the page is still reported normally. */}
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
