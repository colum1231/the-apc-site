// web/app/search/page.tsx
import { headers } from "next/headers";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

function getOrigin() {
  const h = headers();
  const proto = h.get("x-forwarded-proto") || "https";
  const host = h.get("x-forwarded-host") || h.get("host") || "localhost:3000";
  return `${proto}://${host}`;
}

async function fetchResults(q: string) {
  const origin = getOrigin();
  const res = await fetch(`${origin}/api/ask?q=${encodeURIComponent(q)}`, {
    method: "GET",
    cache: "no-store",
  });
  return res.json();
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams?: { q?: string | string[] };
}) {
  const raw = searchParams?.q;
  const q = Array.isArray(raw) ? raw[0] : raw || "";

  if (!q) {
    return (
      <main className="min-h-screen bg-black text-white p-8">
        <h1 className="text-2xl font-bold mb-4">Search</h1>
        <p className="text-neutral-400">Add <code>?q=your+query</code> to the URL.</p>
      </main>
    );
  }

  const result = await fetchResults(q);

  return (
    <main className="min-h-screen bg-black text-white p-8">
      <h1 className="text-2xl font-bold mb-4">Search</h1>
      <p className="text-neutral-400 mb-4">Your search: {q}</p>

      {"ok" in result && !result.ok && (
        <div className="text-red-400 mb-4">
          Error: {result.step || "request"} — {result.status} —{" "}
          {typeof result.body === "string"
            ? result.body
            : JSON.stringify(result.body)}
        </div>
      )}

      {"ok" in result && result.ok ? (
        <pre className="text-xs whitespace-pre-wrap">
          {JSON.stringify(result.data, null, 2)}
        </pre>
      ) : null}
    </main>
  );
}