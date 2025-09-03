// web/app/page.tsx
import Image from "next/image";
import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="landing-wrap">
      {/* Logo */}
      <div className="logo">
        <Image
          src="/aplayers-mark.png"
          alt="A Players Logo"
          width={100}
          height={100}
          priority
        />
      </div>

      {/* Search form */}
      <form action="/search" method="get" className="search">
        <input
          type="text"
          name="q"
          placeholder="What's your next move?"
          className="input"
        />
      </form>

      {/* Bottom link */}
      <Link href="/hq" className="hq">
        Go to HQ
      </Link>
    </main>
  );
}