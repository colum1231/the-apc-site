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
      <img
        src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIwAAACMCAYAAABT6bXOAAAACXBIWXMAAAsSAAALEgHS3X78AAAAB3RJTUUH5AQaCQs1wE9TrgAAAB1pVFh0Q29tbWVudAAAAAAAQmxhbmsgMSx4MSBwbGFjZWhvbGRlcgAAAAlwSFlzAAAOxAAADsQBlSsOGwAAAENJREFUeNrtwTEBAAAAwqD1T20MH6AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP4F3QABYtV4SgAAAABJRU5ErkJggg=="
        alt="Test Inline Logo"
        className="landing-logo"
        width={120}
        height={120}
      />

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