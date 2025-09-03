export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export default function Home() {
  // Helper: convert your h-coordinate to CSS top using 1080 reference.
  const h = (val: number) => `calc(100vh * ${(1080 - val) / 1080})`;

  return (
    <main
      className="landing-root"
      // optional subtle bg if you add /landing-bg.jpg later:
      // style={{ backgroundImage: 'url("/landing-bg.jpg")' }}
    >
      {/* A-Players logo — top at h972 -> 10vh from the top */}

      {/* Inline SVG logo to prove render (no external file needed) */}
      <div
        className="landing-logo"
        style={{ width: 120, height: 120, position: "absolute", left: "50%", transform: "translateX(-50%)", top: "calc(100vh * ((1080 - 972) / 1080))", zIndex: 2 }}
      >
        <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" width="120" height="120">
          <circle cx="60" cy="60" r="58" fill="none" stroke="#545454" strokeWidth="4"/>
          <text x="50%" y="54%" dominantBaseline="middle" textAnchor="middle" fontSize="56" fill="#545454" fontFamily="Inter, system-ui, sans-serif">A</text>
        </svg>
      </div>

      {/* Search box — top at h495 (=> 585px from top), height 80px */}
      <form action="/search" method="get" className="landing-form" style={{ top: h(495) }}>
        <input
          type="text"
          name="q"
          placeholder="What’s your next move?"
          className="landing-input"
          autoComplete="off"
        />
        {/* submit on Enter only (no button) */}
      </form>

      {/* Go to HQ — fixed near bottom, 20px font, #272727 */}
      <a href="/hq" className="landing-hq">Go to HQ</a>
    </main>
  );
}