// web/app/search/page.tsx
import Link from "next/link";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

function absoluteUrl(path: string) {
  const h = headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}${path}`;
}

export default async function SearchPage(props: { searchParams: Promise<{ q?: string | string[] }> }) {
  const { q: raw } = await props.searchParams;
  const q = Array.isArray(raw) ? raw[0] : (raw ?? "");

  if (!q) {
    return (
      <main className="min-h-screen bg-black text-white p-8">
        <Link href="/" className="text-neutral-400 hover:text-white">← Back</Link>
        <h1 className="text-2xl mt-6">Search</h1>
        <p className="mt-2 text-neutral-400">Type something on the landing page.</p>
      </main>
    );
  }

  // ✅ Build absolute URL for server-side fetch
  const url = absoluteUrl(`/api/ask?q=${encodeURIComponent(q)}`);

  const res = await fetch(url, { cache: "no-store" });
  const data = await res.json().catch(() => ({}));

  return (
    <main className="min-h-screen bg-black text-white p-8">
      <Link href="/" className="text-neutral-400 hover:text-white">← Back</Link>
      <h1 className="text-2xl mt-6">Search</h1>
      <p className="mt-2 text-neutral-400">Your search: <span className="text-white">{q}</span></p>

      <pre className="mt-6 text-sm bg-neutral-900/60 rounded-lg p-4 overflow-auto">
        {JSON.stringify(data, null, 2)}
      </pre>
    </main>
  );
}