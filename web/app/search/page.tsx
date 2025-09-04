// web/app/search/page.tsx
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

type SectionKey = "members" | "transcripts" | "resources" | "partnerships" | "events";

type MembersItem = {
  title: string;          // "Name | Title | TG: @handle // +353..."
  name?: string;          // "Name | Role"
  username?: string;      // "@handle"
  username_url?: string;  // "https://t.me/handle"
  quote?: string;         // short relevant message
  context?: string;       // one-line chat context
};

type TranscriptItem = {
  name: string;           // "Speaker | Role"
  quote: string;          // actionable fragment
  context: string;        // one-liner
  title: string;          // "Paul Daley APC Mastermind Call"
  url?: string;           // youtube/unlisted link
};

type Cardish = {
  title: string;
  summary?: string;
  description?: string;
  url?: string;
  contact_line?: string;  // partnerships
};

type AskResponse = {
  members?: MembersItem[];
  transcripts?: TranscriptItem[];
  resources?: Cardish[];
  partnerships?: Cardish[];
  events?: Cardish[];
};

function SectionHeader({
  label,
  href,
}: {
  label: string;
  href: string;
}) {
  return (
    <div className="flex items-center justify-between mb-2">
      <a href={href} className="uppercase tracking-wide text-sm text-neutral-300 hover:text-white">
        {label}
      </a>
      <span className="text-neutral-500">▸</span>
    </div>
  );
}

function ItemCard({
  title,
  sub,
  meta,
  href,
}: {
  title: string;
  sub?: string;
  meta?: string;
  href?: string;
}) {
  const inner = (
    <div className="rounded-xl border border-neutral-700/60 p-4 hover:border-neutral-400/60 transition">
      <div className="text-[15px] text-neutral-200">{title}</div>
      {sub && <div className="mt-2 text-[13px] text-neutral-400 italic">“{sub}”</div>}
      {meta && <div className="mt-1 text-[12px] text-neutral-500">{meta}</div>}
    </div>
  );
  return href ? <a href={href} target="_blank" rel="noreferrer">{inner}</a> : inner;
}

async function fetchAsk(q: string, req: Request) {
  // Build absolute URL to our API in this request’s host (works on Vercel)
  const url = new URL(req.url);
  const base = `${url.protocol}//${url.host}`;
  const res = await fetch(`${base}/api/ask?q=${encodeURIComponent(q)}`, {
    method: "GET",
    cache: "no-store",
  });
  const data = await res.json();
  if (!res.ok || !data?.ok) {
    return { error: data?.error || data?.body || "Ask API error" };
  }
  // CustomGPT sometimes returns under data.data or data
  const payload: AskResponse =
    data?.data?.openai_response && typeof data.data.openai_response !== "object"
      ? {} // string case (e.g., "No results found. — APC Almanac")
      : (data?.data as AskResponse) ||
        (data as AskResponse) ||
        {};
  return { data: payload };
}

function orderSections(q: string, d: AskResponse): SectionKey[] {
  // Default priority: members -> transcripts -> resources -> partnerships -> events
  const base: SectionKey[] = ["members", "transcripts", "resources", "partnerships", "events"];

  // If query asks "who", "who to speak", "contact", push members to front (already first)
  const whoIntent = /\b(who|speak|contact|talk|mentor|help)\b/i.test(q);
  // If query asks about events
  const eventIntent = /\b(event|meetup|hyrox|retreat|conference|summit)\b/i.test(q);

  let ordered = [...base];
  if (eventIntent) {
    ordered = ["events", ...base.filter((k) => k !== "events")];
  } else if (whoIntent) {
    ordered = ["members", ...base.filter((k) => k !== "members")];
  }

  // Keep only sections that have data
  return ordered.filter((k) => (d as any)[k]?.length);
}

export default async function Page({
  searchParams,
}: {
  searchParams?: { q?: string | string[] };
}) {
  const raw = searchParams?.q;
  const q = Array.isArray(raw) ? raw[0] : raw || "";

  if (!q) {
    return (
      <main className="min-h-screen bg-black text-white p-8">
        <h1 className="text-2xl font-bold mb-2">Search</h1>
        <p className="text-neutral-400 mb-6">Your search: —</p>
        <p className="text-neutral-500">Go back and enter a prompt.</p>
      </main>
    );
  }

  // Fetch using the same host that served this page
  const req = new Request("http://placeholder"); // not used, we only need shape for fetchAsk
  (req as any).url = `https://dummy-host/`; // stub to satisfy types; actual host passed below:
  const result = await fetchAsk(q, (globalThis as any).request || ({} as Request));

  if (result.error) {
    return (
      <main className="min-h-screen bg-black text-white p-8">
        <h1 className="text-2xl font-bold mb-2">Search</h1>
        <p className="text-neutral-400 mb-6">Your search: {q}</p>
        <div className="text-red-400">Error: {String(result.error)}</div>
      </main>
    );
  }

  const d = result.data as AskResponse;
  const order = orderSections(q, d);
  const priority: SectionKey = order[0] || "members";
  const side = order.filter((k) => k !== priority);

  return (
    <main className="min-h-screen bg-black text-white p-6 md:p-10">
      {/* Top search echo */}
      <div className="mb-6">
        <div className="text-sm text-neutral-500">Your search</div>
        <div className="text-xl font-medium">{q}</div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT: Priority section */}
        <section className="lg:col-span-7 space-y-3">
          <div className="uppercase tracking-wide text-sm text-neutral-300">{priority}</div>
          <div className="space-y-3">
            {(d[priority] as any[])?.slice(0, 4)?.map((item, i) => {
              if (priority === "members") {
                const m = item as MembersItem;
                const meta = m.context || m.title;
                const title = m.title || m.name || "Member";
                return (
                  <ItemCard
                    key={`${priority}-${i}`}
                    title={title}
                    sub={m.quote}
                    meta={meta}
                    href={m.username_url}
                  />
                );
              }
              if (priority === "transcripts") {
                const t = item as TranscriptItem;
                return (
                  <ItemCard
                    key={`${priority}-${i}`}
                    title={`${t.name} — ${t.title}`}
                    sub={t.quote}
                    meta={t.context}
                    href={t.url}
                  />
                );
              }
              const c = item as Cardish;
              return (
                <ItemCard
                  key={`${priority}-${i}`}
                  title={c.title}
                  sub={c.summary || c.description}
                  meta={c.contact_line}
                  href={c.url}
                />
              );
            })}
          </div>
          {((d[priority] as any[])?.length || 0) > 4 && (
            <a
              className="inline-block mt-2 text-sm text-neutral-400 hover:text-white"
              href={`/${priority}`}
            >
              Load more
            </a>
          )}
        </section>

        {/* RIGHT: Other sections as dropdown headers (not expanded yet) */}
        <aside className="lg:col-span-5 space-y-6">
          {side.map((k) => (
            <div key={k}>
              <SectionHeader label={k} href={`/${k}`} />
              {/* collapsed by default; clicking the header takes to the full library page */}
            </div>
          ))}
        </aside>
      </div>
    </main>
  );
}