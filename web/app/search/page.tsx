// web/app/search/page.tsx
import Link from "next/link";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

function getBaseUrl() {
  // Prefer explicit base URL if you set it in Vercel envs
  if (process.env.NEXT_PUBLIC_BASE_URL) return process.env.NEXT_PUBLIC_BASE_URL;
  // Vercel provides this at runtime (e.g. aplayersalmanac.vercel.app)
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  // Local dev
  return "http://localhost:3000";
}

export default async function SearchPage(props: {
  // Next 15: searchParams is a Promise
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await props.searchParams;
  const raw = sp.q;
  const q = Array.isArray(raw) ? raw[0] : raw ?? "";

  if (!q) {
    return (
      <main className="min-h-screen bg-black text-white p-8">
        <Link href="/" className="text-neutral-400 hover:text-white">← Back</Link>
        <h1 className="text-2xl mt-6">Search</h1>
        <p className="mt-2 text-neutral-400">Type something on the landing page.</p>
      </main>
    );
  }

  const url = `${getBaseUrl()}/api/ask?q=${encodeURIComponent(q)}`;

  const res = await fetch(url, { cache: "no-store" });
  let data: unknown;
  try {
    data = await res.json();
  } catch {
    data = { ok: false as const, status: res.status, body: await res.text() };
  }

  return (
    <main className="min-h-screen bg-black text-white p-8">
      <Link href="/" className="text-neutral-400 hover:text-white">← Back</Link>
      <h1 className="text-2xl mt-6">Search</h1>
      <p className="mt-2 text-neutral-400">
        Your search: <span className="text-white">{q}</span>
      </p>

      <pre className="mt-6 text-sm bg-neutral-900/60 rounded-lg p-4 overflow-auto">
        {JSON.stringify(data, null, 2)}
      </pre>
    </main>
  );
}