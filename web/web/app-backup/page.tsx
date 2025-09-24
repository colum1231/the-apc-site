"use client";
// app/page.tsx
import React, { useEffect, useState } from "react";

export default function Home() {
  const [showFade, setShowFade] = useState(true);
  useEffect(() => {
    const timeout = setTimeout(() => setShowFade(false), 3015);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <main className="landing-wrap">
      {/* Black overlay for fade effect */}
      {showFade && <div className="landing-fade" aria-hidden="true" />}

      {/* Centered logo overlay */}
      <img src="/aplayers-mark.png" alt="APlayers Mark" className="logo-overlay" />

      <form action="/search" method="get" className="search" role="search">
        <input
          className="input"
          type="text"
          name="q"
          placeholder="What’s your next move?"
          autoComplete="off"
        />
      </form>

      <a href="/hq" className="hq">GO TO HQ</a>
    </main>
  );
}