export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export default function Home(){
  return (
    <main className="landing-wrap">
      <img
        src="/aplayers-mark.png"
        alt="A Players Logo"
        className="logo"
        width={120}
        height={120}
      />
      <form action="/search" method="get" className="search">
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