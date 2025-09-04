// app/search/page.tsx
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

const ORIGIN =
  process.env.NEXT_PUBLIC_BASE_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

async function ask(q: string) {
  const res = await fetch(`${ORIGIN}/api/ask?q=${encodeURIComponent(q)}`, {
    method: "GET",
    cache: "no-store",
  });
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return { ok: false, status: res.status, body: text };
  }
}

export default async function SearchPage(props: {
  // In Next 15, searchParams is a Promise you must await:
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  const sp = await props.searchParams;
  const raw = sp?.q;
  const q = Array.isArray(raw) ? raw[0] : raw || "";

  if (!q) {
    return (
      <main className="min-h-screen bg-black text-white p-8">
        <h1 className="text-2xl font-bold mb-4">Search</h1>
        <p className="text-neutral-400">
          Add <code>?q=your+query</code> to the URL.
        </p>
      </main>
    );
  }

  const result = await ask(q);

  return (
    <main className="min-h-screen bg-black text-white p-8">
      <h1 className="text-2xl font-bold mb-4">Search</h1>
      <p className="text-neutral-400 mb-4">Your search: {q}</p>

      <pre className="text-xs whitespace-pre-wrap">
        {JSON.stringify(result, null, 2)}
      </pre>
    </main>
  );
}