"use client";

import { useState } from "react";
import type { BattleTopic } from "@/lib/battle";

export default function BattleBoard({ topics }: { topics: BattleTopic[] }) {
  const [notice, setNotice] = useState("");

  return (
    <section className="battle-screen">
      <img
        className="battle-logo"
        src="/assets/ui/battle-logo.jpg"
        alt="One versus one Battles — pick your topic"
      />
      <div className="battle-grid">
        {topics.map((topic) => (
          <button
            className="battle-topic"
            type="button"
            key={topic.slug}
            onClick={() =>
              setNotice(`${topic.name.replace("\n", " ")} battles are coming soon.`)
            }
          >
            <span className="trophy">
              <svg viewBox="0 0 28 28" aria-hidden="true">
                <path d="M8 3h12v5.5c0 4.4-2.3 7.2-6 7.2s-6-2.8-6-7.2V3Z" />
                <path d="M8 6H3.5c0 5 2 7.2 6 7.5M20 6h4.5c0 5-2 7.2-6 7.5M14 16v5M9 24h10M11 21h6" />
              </svg>
              <b>0</b>
            </span>
            <img src={`/assets/ui/${topic.imagePath}`} alt={topic.name.replace("\n", " ")} />
            <strong>
              {topic.name.split("\n").map((line, index) => (
                <span key={line}>
                  {line}
                  {index < topic.name.split("\n").length - 1 && <br />}
                </span>
              ))}
            </strong>
          </button>
        ))}
      </div>
      <div className={notice ? "toast show" : "toast"} role="status">
        {notice}
      </div>
    </section>
  );
}
