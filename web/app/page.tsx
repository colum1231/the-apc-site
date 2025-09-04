// app/page.tsx
import Link from "next/link";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export default function Home() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#000",
        color: "#fff",
        display: "grid",
        placeItems: "center",
        padding: "24px",
      }}
    >
      <div style={{ textAlign: "center", maxWidth: 720 }}>
        <h1 style={{ fontSize: 28, marginBottom: 12 }}>A Players</h1>
        <form action="/search" method="get" style={{ display: "flex", gap: 8, justifyContent: "center" }}>
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