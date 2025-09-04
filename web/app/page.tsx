// app/page.tsx
"use client";

import Link from "next/link";

export default function Home() {
  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundImage:
          'linear-gradient(to right, rgba(0,0,0,0.88), rgba(0,0,0,0.70), rgba(0,0,0,0.88)), url("/landing-bg.png")',
        backgroundSize: "cover",
        backgroundPosition: "center",
        color: "#fff",
        display: "grid",
        placeItems: "center",
        padding: "24px",
      }}
    >
      <div style={{ textAlign: "center", maxWidth: 720 }}>
        <img
          src="/aplayers-mark.png"
          alt="A Players Logo"
          style={{
            display: "block",
            margin: "0 auto 24px auto",
            width: 64,
            height: "auto",
          }}
        />

        <form action="/search" method="get" style={{ display: "flex", justifyContent: "center" }}>
          <input
            type="text"
            name="q"
            placeholder="What's your next move?"
            style={{
              width: 500,
              height: 44,
              borderRadius: 999,
              border: "2px solid #545454",
              background: "transparent",
              color: "#ddd",
              textAlign: "center",
              outline: "none",
            }}
            onFocus={(e) => (e.currentTarget.placeholder = "")}
            onBlur={(e) => (e.currentTarget.placeholder = "What's your next move?")}
          />
        </form>

        <div style={{ marginTop: 20 }}>
          <Link href="/hq" style={{ color: "#888", textDecoration: "none" }}>
            Go to HQ
          </Link>
        </div>
      </div>
    </main>
  );
}