// app/page.tsx
export default function Home() {
  return (
    <main className="landing-wrap">
      <img
        className="logo"
        src="/aplayers-mark.png"
        alt="A Players"
        width={64}
        height={64}
      />

      <form action="/search" method="get" className="search" role="search">
        <input
          className="input"
          type="text"
          name="q"
          placeholder="What’s your next move?"
          autoComplete="off"
        />
      </form>

      <a href="/hq" className="hq">Go to HQ</a>
    </main>
  );
}