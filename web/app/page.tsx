// web/app/page.tsx
import Image from "next/image";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export default function Home() {
  return (
    <main className="landing-wrap">
      {/* Logo */}
      <div className="logo" aria-label="A Players Logo">
        <Image
          src="/aplayers-mark.png"
          alt="A Players Logo"
          width={90}
          height={90}
          priority
        />
      </div>

      {/* Search */}
      <form action="/search" method="get" className="search">
        <input
          type="text"
          name="q"
          placeholder="What's your next move?"
          className="input"
          onFocus={(e) => (e.currentTarget.placeholder = "")}
          onBlur={(e) => (e.currentTarget.placeholder = "What's your next move?")}
        />
      </form>

      {/* Bottom link */}
      <Link href="/hq" className="hq">Go to HQ</Link>
    </main>
  );
}