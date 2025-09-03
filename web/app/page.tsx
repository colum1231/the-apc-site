// SERVER COMPONENT
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export default function Home() {
  return (
    <main className="landing">
      {/* Logo */}
      <img
        src="/aplayers-mark.svg"
        alt="A Players"
        className="landing__logo"
        width={120}
        height={120}
      />

      {/* Search (submit on Enter) */}
      <form action="/search" method="get" className="landing__form" role="search">
        <input
          type="text"
          name="q"
          placeholder="What’s your next move?"
          aria-label="Search"
          autoComplete="off"
        />
      </form>

      {/* HQ link */}
      <a href="/hq" className="landing__hq">Go to HQ</a>
    </main>
  );
}