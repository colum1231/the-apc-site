// SERVER COMPONENT – no hooks. Calls CustomGPT on the server.
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

const API_BASE = "https://app.customgpt.ai/api/v1";

async function askCustomGPT(prompt: string) {
  const apiKey = process.env.CUSTOMGPT_API_KEY!;
  const projectId = process.env.CUSTOMGPT_PROJECT_ID!;
  if (!apiKey || !projectId) return { error: "Missing server envs" };

  const convRes = await fetch(`${API_BASE}/projects/${projectId}/conversations`, {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ name: "APC session" }),
    cache: "no-store",
  });
  if (!convRes.ok) return { error: `Conversation error: ${await convRes.text()}` };
  const conv = await convRes.json();

  const msgRes = await fetch(
    `${API_BASE}/projects/${projectId}/conversations/${conv.session_id}/messages`,
    {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ response_source: "default", prompt }),
      cache: "no-store",
    }
  );
  const data = await msgRes.json();
  if (!msgRes.ok) return { error: data?.message || "CustomGPT error" };

  let payload: unknown = (data && (data.message ?? data)) as unknown;
  if (typeof payload === "string") { try { payload = JSON.parse(payload); } catch {} }
  return { data: payload };
}

export default async function Page({
  searchParams,
}: { searchParams: { q?: string | string[] } }) {
  const rawQ = searchParams?.q;
  const q = Array.isArray(rawQ) ? rawQ[0] : rawQ || "";
  const result = q ? await askCustomGPT(q) : null;

  return (
    <main className="min-h-screen bg-black text-white p-8">
      <h1 className="text-2xl font-bold mb-4">Results</h1>
      <p className="text-neutral-400 mb-6">Your search: {q || "—"}</p>
      {!q && <div className="text-neutral-500">Enter a query to begin.</div>}
      {q && result?.error && <div className="text-red-400">Error: {result.error}</div>}
      {q && result?.data && (
        <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(result.data, null, 2)}</pre>
      )}
    </main>
  );
}
