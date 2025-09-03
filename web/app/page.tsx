// Pixel-precise landing mapped to a 1920×1080 design.
// We place elements inside a 1920×1080 "stage" and scale it to the viewport.

export default function Home() {
  return (
    <main className="landing">
      <div className="stage">
        {/* A Players logo — top at h972 => top: 108px */}
        <img
          src="/aplayers-mark.svg"
          alt=""
          className="logo-abs"
          width={100}
          height={100}
          aria-hidden="true"
        />

        {/* Search box — top at h495 => top: 585px; height 80px; width 800px; centered text; submit on Enter */}
        <form action="/search" method="get" className="search-abs">
          <input
            type="text"
            name="q"
            placeholder="What’s your next move?"
            className="search-input"
            aria-label="Search"
          />
        </form>

        {/* Bottom link (centered, stays near bottom of canvas) */}
        <a href="/hq" className="hq-link">Go to HQ</a>
      </div>
    </main>
  );
}