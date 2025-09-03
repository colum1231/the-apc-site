export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export default function Page() {
  return (
    <main className="relative min-h-screen bg-black text-white flex flex-col items-center justify-center">
      {/* Background with faint vertical fade */}
      <div className="absolute inset-0">
        <img
          src="/landing-bg.jpg"
          alt="Background"
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black" />
      </div>

      {/* Foreground content */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Logo */}
        <img
          src="/aplayers-mark.svg"
          alt="A Players Logo"
          className="w-20 h-20 mb-8"
        />

        {/* Title */}
        <h1 className="text-3xl font-bold mb-6">What’s your next move?</h1>

        {/* Search bar */}
        <form action="/search" method="get" className="w-full max-w-md">
          <input
            type="text"
            name="q"
            placeholder="Enter your prompt..."
            className="w-full rounded-xl px-4 py-2 bg-neutral-900 border border-neutral-700 text-white focus:outline-none focus:border-neutral-500"
          />
        </form>
      </div>
    </main>
  );
}