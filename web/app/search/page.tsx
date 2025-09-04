// app/search/page.tsx
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

async function ask(q: string) {
  const res = await fetch(`/api/ask?q=${encodeURIComponent(q)}`, {
    method: "GET",
    cache: "no-store",
  });
  let body: unknown = null;
  try { body = await res.json(); } catch { body = await res.text(); }
  return { ok: res.ok, status: res.status, body };
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams?: { q?: string | string[] };
}) {
  const raw = searchParams?.q;
  const q = Array.isArray(raw) ? raw[0] : (raw || "");

  if (!q) {
    return (
      <main style={{ padding: 32, color: "#fff", background: "#000", minHeight: "100vh" }}>
        <h1>Search</h1>
        <p>Append <code>?q=ping</code> to the URL to test.</p>
        <p>Example: <code>/search?q=ping</code></p>
      </main>
    );
  }

  const r = await ask(q);

  return (
    <main style={{ padding: 32, color: "#fff", background: "#000", minHeight: "100vh", whiteSpace: "pre-wrap" }}>
      <h1>Search</h1>
      <p>Your search: <strong>{q}</strong></p>
      <hr style={{ opacity: .2, margin: "16px 0" }} />
      <div>{JSON.stringify(r, null, 2)}</div>
      <p style={{ opacity: .7, marginTop: 16 }}>
        If this shows <code>"ok": true</code> and a real response, the page and API are good. Next we’ll render real sections.
      </p>
    </main>
  );
}