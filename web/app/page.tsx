// SERVER COMPONENT — no "use client" needed.
// Landing page with pixel-precise layout mapped from a 1080px design.

export default function Home() {
  return (
    <main className="landing">
      {/* Logo — centered horizontally; center sits 274px (≈25.37vh) from top */}
      <img
        src="/aplayers-mark.svg"
        alt="A Players Logo"
        className="logo"
        width={92}
        height={92}
      />

      {/* Search — top edge 585px (≈54.17vh); height 80px (≈7.41vh) */}
      <form action="/search" method="get" className="search-wrap">
        <input
          type="text"
          name="q"
          placeholder="What’s your next move?"
          className="search-input"
          aria-label="Search"
        />
        {/* No button; Enter submits */}
      </form>

      {/* Bottom link */}
      <a href="/hq" className="to-hq">Go to HQ</a>
    </main>
  );
}