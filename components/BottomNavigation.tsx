"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BottomNavigation() {
  const pathname = usePathname();
  const active = pathname.startsWith("/battle")
    ? "Battle"
    : pathname.startsWith("/profile")
      ? "Profile"
      : "Home";

  const items = [
    {
      label: "Home",
      href: "/",
      icon: <path d="M3.7 14.4 15.2 4.2a1.25 1.25 0 0 1 1.6 0l11.5 10.2a1.7 1.7 0 0 1 .6 1.3v11.1a1.5 1.5 0 0 1-1.5 1.5h-7.2v-8.8h-8.4v8.8H4.6a1.5 1.5 0 0 1-1.5-1.5V15.7c0-.5.2-1 .6-1.3Z" />,
    },
    {
      label: "Highlights",
      href: "/#stories",
      icon: <><rect x="4.1" y="2.4" width="23.8" height="27.2" rx="2.7" /><path d="m13.1 10.1 8.1 5.9-8.1 5.9V10.1Z" /></>,
    },
    {
      label: "Battle",
      href: "/battle",
      icon: <><circle cx="16" cy="16" r="13.1" /><path d="M14.8 3.1c-1 2.1-.6 4.1.6 5.2.9.9.5 2.7-.8 3.2l-3.1 1.3c-1 .4-1.5 1.6-1.1 2.6l1.2 2.8c.4 1-.1 2.2-1.1 2.6l-2.7 1.1M22.8 5.1l-1.5 3c-.5 1-.1 2.2.9 2.7l1.3.7c1.1.6 1.4 2 .7 3l-2 2.7c-.5.7-.5 1.7.1 2.4l2.6 3.2M14.2 29c.1-2 .9-3.6 2.6-4.7l1.5-1c.9-.6 1.2-1.7.8-2.6l-.6-1.3c-.5-1.1-1.8-1.6-2.9-1.1l-2.1.9" /></>,
    },
    {
      label: "Profile",
      href: "/profile",
      icon: <><circle cx="16" cy="8.8" r="5.8" /><path d="M5.2 28.2c.7-6.6 4.8-10.2 10.8-10.2s10.1 3.6 10.8 10.2H5.2Z" /></>,
    },
  ];

  return (
    <nav className="bottom-nav" aria-label="Primary navigation">
      {items.map((item) => (
        <Link
          key={item.label}
          className={active === item.label ? "active" : ""}
          href={item.href}
          aria-current={active === item.label ? "page" : undefined}
        >
          <svg className="nav-icon" viewBox="0 0 32 32" aria-hidden="true">
            {item.icon}
          </svg>
          <em>{item.label}</em>
        </Link>
      ))}
      <i className="home-indicator" aria-hidden="true" />
    </nav>
  );
}
