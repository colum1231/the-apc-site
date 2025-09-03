// Pixel-precise landing on a 1920×1080 stage scaled to your viewport.
// Edit positions/sizes via CSS variables in globals.css.

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export default function Home() {
  return (
    <main className="landing-wrap">
      <div className="stage">
        {/* Logo (PNG) */}
        <img
          src="/aplayers-mark.png"
          alt="A Players Logo"
          className="logo"
          width={120}
          height={120}
        />

        {/* Search (submit on Enter; no button) */}
        <form action="/search" method="get" className="search">
          <input
            type="text"
            name="q"
            placeholder="What’s your next move?"
            className="input"
            autoComplete="off"
          />
        </form>

        {/* Bottom link */}
        <a href="/hq" className="hq">Go to HQ</a>

        {/* Toggle this class on the container to see the grid: <div className="stage debug"> */}
        <div className="grid-overlay" aria-hidden="true"></div>
      </div>
    </main>
  );
}