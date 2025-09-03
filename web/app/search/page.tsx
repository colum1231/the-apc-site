export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

import { Section, Card } from "@/app/components/Section";

const API_BASE = "https://app.customgpt.ai/api/v1";

type SectionKey =
  | "community_chats"
  | "transcripts"
  | "resources"
  | "partnerships"
  | "events";

// ---- Server-side CustomGPT call ----
async function ask(prompt: string) {
  const k = process.env.CUSTOMGPT_API_KEY!;
  const id = process.env.CUSTOMGPT_PROJECT_ID!;
  if (!k || !id) return { error: "Missing server envs" };

  const convRes = await fetch(`${API_BASE}/projects/${id}/conversations`, {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      authorization: `Bearer ${k}`,
    },
    body: JSON.stringify({ name: "APC session" }),
    cache: "no-store",
  });
  if (!convRes.ok) return { error: `Conversation error: ${await convRes.text()}` };
  const conv = await convRes.json();

  const msgRes = await fetch(
    `${API_BASE}/projects/${id}/conversations/${conv.session_id}/messages`,
    {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        authorization: `Bearer ${k}`,
      },
      body: JSON.stringify({ response_source: "default", prompt }),
      cache: "no-store",
    }
  );

  const data = await msgRes.json();
  if (!msgRes.ok) return { error: data?.message || "CustomGPT error" };

  let payload: unknown = data.message ?? data;
  if (typeof payload === "string") {
    try {
      payload = JSON.parse(payload);
    } catch {}
  }
  return { data: payload };
}

// Default section order (members first if present)
function pickOrder(d: Record<string, unknown>): SectionKey[] {
  const hasMembers =
    Array.isArray(d["community_chats"]) && (d["community_chats"] as unknown[]).length > 0;

  const order: SectionKey[] = [
    ...(hasMembers ? (["community_chats"] as SectionKey[]) : []),
    "transcripts",
    "resources",
    "partnerships",
    "events",
  ];

  return order.filter((k) => Array.isArray(d[k]) && (d[k] as unknown[]).length > 0);
}

export default async function Page({
  searchParams,
}: {
  searchParams?: { q?: string | string[] };
}) {
  const raw = searchParams?.q;
  const q = Array.isArray(raw) ? raw[0] : raw || "";

  const res = q ? await ask(q) : null;
  const data = (res?.data ?? null) as unknown;

  return (
    <main className="min-h-screen bg-black text-white p-6">
      <div className="mb-6">
        <form action="/search" method="get" className="flex gap-2 max-w-2xl">
          <input
            name="q"
            defaultValue={q}
            placeholder="What do you need?"
            className="flex-1 rounded-md border border-neutral-800 bg-transparent px-4 py-3"
          />
          <button className="rounded-md border border-neutral-700 px-5 py-3">Search</button>
        </form>
      </div>

      {!q && <div className="text-neutral-500">Enter a query to begin.</div>}
      {q && res?.error && <div className="text-red-400">Error: {res.error}</div>}

      {q && data && typeof data === "object" && data !== null && (
        <ResultsGrid data={data as Record<string, unknown>} />
      )}
    </main>
  );
}

function ResultsGrid({ data }: { data: Record<string, unknown> }) {
  const order = pickOrder(data);
  const leftKey = order[0];
  const rightKeys = order.slice(1);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div>{leftKey && <SectionBlock title={leftKey} items={data[leftKey]} />}</div>
      <div>
        {rightKeys.map((k) => (
          <SectionBlock key={k} title={k} items={data[k]} right />
        ))}
      </div>

      {/* Debug (optional) */}
      <div className="lg:col-span-2">
        <Section title="Raw Data (debug)">
          <Card>
            <pre className="text-xs whitespace-pre-wrap">
              {JSON.stringify(data, null, 2)}
            </pre>
          </Card>
        </Section>
      </div>
    </div>
  );
}

function SectionBlock({
  title,
  items,
  right,
}: {
  title: string;
  items: unknown;
  right?: boolean;
}) {
  const list = Array.isArray(items) ? (items as Record<string, unknown>[]) : [];
  const pretty = title.replace("_", " ").toUpperCase();

  return (
    <Section title={pretty} right={right}>
      {list.slice(0, 4).map((item, i) => {
        const quote = typeof item.quote === "string" ? item.quote : undefined;
        const context = typeof item.context === "string" ? item.context : undefined;
        const name = typeof item.name === "string" ? item.name : undefined;
        const titleTxt = typeof item.title === "string" ? item.title : undefined;
        const url = typeof item.url === "string" ? item.url : undefined;
        const username = typeof item.username === "string" ? item.username : undefined;
        const username_url =
          typeof item.username_url === "string" ? item.username_url : undefined;

        return (
          <Card key={i}>
            {quote && <div className="text-sm mb-1">“{quote}”</div>}
            {context && <div className="text-xs text-neutral-400 mb-2">{context}</div>}
            {name && <div className="text-xs text-neutral-500">{name}</div>}
            {titleTxt && url && (
              <a className="text-xs underline text-neutral-300" href={url} target="_blank">
                {titleTxt}
              </a>
            )}
            {username && username_url && (
              <div className="text-xs mt-1">
                <a className="underline text-neutral-300" href={username_url} target="_blank">
                  {username}
                </a>
              </div>
            )}
          </Card>
        );
      })}
      {list.length > 4 && (
        <a href="#" className="block text-xs text-neutral-400 hover:text-neutral-200 mt-2">
          Load more
        </a>
      )}
    </Section>
  );
}