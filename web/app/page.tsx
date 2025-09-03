export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export default function Home() {
  // helper to place elements by your 1080 grid
  const h = (val: number) => `calc(100vh * ${(1080 - val) / 1080})`;

  return (
    <main
      className="landing-root"
      style={{
        // bind bg to the container (not body) so nothing overlays it
        backgroundImage: "url('/landing-bg.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* PNG logo */}
      <img
        src="/aplayers-mark.png?v=4"
        alt="A Players Logo"
        className="landing-logo"
        width={120}
        height={120}
        style={{
          position: "absolute",
          left: "50%",
          transform: "translateX(-50%)",
          top: h(972), // h972 => 108px down on a 1080 canvas
          zIndex: 2,
        }}
      />

      {/* Search */}
      <form className="landing-form" action="/search" method="get" style={{ top: h(495) }}>
        <input
          className="landing-input"
          type="text"
          name="q"
          placeholder="What’s your next move?"
          autoComplete="off"
        />
      </form>

      {/* HQ link */}
      <a href="/hq" className="landing-hq">Go to HQ</a>
    </main>
  );
}