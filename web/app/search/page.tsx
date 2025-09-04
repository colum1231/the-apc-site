// web/app/search/page.tsx
import Link from "next/link";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

type SectionKey = "members" | "transcripts" | "resources" | "partnerships" | "events";

type StructuredResponse = {
  transcripts?: {
    section_title?: string;
    section_url?: string;
    items?: Array<{ title?: string; url?: string; quote?: string; name?: string; context?: string }>;
    load_more_token?: string;
  };
  community_chats?: {
    section_title?: string;
    section_url?: string;
    items?: Array<{
      title?: string; // "Name | Industry/Title | TG: @user // +353 ..."
      username?: string; // "@handle" or "handle"
      username_url?: string; // https://t.me/handle
      quote?: string;
      context?: string;
      source?: string;
    }>;
    load_more_token?: string;
  };
  resources?: {
    section_title?: string;
    section_url?: string;
    items?: Array<{ title?: string; summary?: string; url?: string }>;
    load_more_token?: string;
  };
  partnerships?: {
    section_title?: string;
    section_url?: string;
    items?: Array<{ title?: string; description?: string; contact_line?: string; url?: string }>;
    load_more_token?: string;
  };
  events?: {
    section_title?: string;
    section_url?: string;
    items?: Array<{ title?: string; url?: string }>;
    load_more_token?: string;
  };
};

function getBaseUrl() {
  if (process.env.NEXT_PUBLIC_BASE_URL) return process.env.NEXT_PUBLIC_BASE_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

/** Pulls JSON from /api/ask and returns either structured data or a raw object. */
async function ask(q: string): Promise<{ data: any; structured: StructuredResponse | null }> {
  const url = `${getBaseUrl()}/api/ask?q=${encodeURIComponent(q)}`;
  const res = await fetch(url, { cache: "no-store" });

  let payload: any;
  try {
    payload = await res.json();
  } catch {
    payload = { ok: false, status: res.status, body: await res.text() };
  }

  // Try to extract structured sections if the bot returned a ```json code block
  let structured: StructuredResponse | null = null;
  const openai = payload?.data?.openai_response ?? payload?.openai_response ?? payload;

  if (typeof openai === "string") {
    const m = openai.match(/```json\s*([\s\S]*?)```/i);
    if (m) {
      try {
        structured = JSON.parse(m[1]);
      } catch {
        structured = null;
      }
    }
  } else if (
    openai &&
    (openai.transcripts || openai.community_chats || openai.resources || openai.partnerships || openai.events)
  ) {
    structured = openai as StructuredResponse;
  }

  return { data: payload, structured };
}

/** Clean handle like "@name" -> "name" */
function normalizeHandle(u?: string) {
  if (!u) return "";
  return u.replace(/^@/, "");
}

/** Render a single member card (left column). */
function MemberCard(item: any, idx: number) {
  const title = item?.title || item?.name || "Member";
  const quote = item?.quote;
  const handle = normalizeHandle(item?.username);
  const tgUrl = item?.username_url || (handle ? `https://t.me/${handle}` : "");

  // Build “Name | Industry/Title | TG: @user // phone” display, but respect your rules:
  // - If no username, omit TG.
  // - We only render what's present; no fabrication.
  const header = title;

  return (
    <div
      key={`member-${idx}`}
      className="rounded-xl border border-neutral-800 p-4 hover:border-neutral-600 transition"
      style={{ color: "#8b8989" }}
    >
      <div className="text-[15px] font-medium">{header}</div>
      {quote && (
        <div className="mt-2 text-[13px] italic">
          “{quote}”
        </div>
      )}
      {handle && (
        <div className="mt-1 text-[12px]">
          TG:{" "}
          <a href={tgUrl} target="_blank" rel="noopener noreferrer" className="underline">
            @{handle}
          </a>
        </div>
      )}
    </div>
  );
}

/** Render a generic item card (right column), link only the title. */
function RightCard(
  kind: Exclude<SectionKey, "members">,
  item: any,
  idx: number
) {
  if (kind === "transcripts") {
    const title = item?.title || item?.name || "Call Recording";
    const url = item?.url || "#";
    const quote = item?.quote;
    return (
      <div key={`${kind}-${idx}`} className="rounded-xl border border-neutral-800 p-4 hover:border-neutral-600 transition">
        <a href={url} target="_blank" rel="noopener noreferrer" className="text-[15px] underline" style={{ color: "#8b8989" }}>
          {title}
        </a>
        {quote && <div className="mt-2 text-[13px] italic" style={{ color: "#8b8989" }}>“{quote}”</div>}
      </div>
    );
  }

  if (kind === "resources") {
    const title = item?.title || "Resource";
    const url = item?.url || "#";
    const summary = item?.summary;
    return (
      <div key={`${kind}-${idx}`} className="rounded-xl border border-neutral-800 p-4 hover:border-neutral-600 transition">
        <a href={url} target="_blank" rel="noopener noreferrer" className="text-[15px] underline" style={{ color: "#8b8989" }}>
          {title}
        </a>
        {summary && <div className="mt-2 text-[13px]" style={{ color: "#8b8989" }}>{summary}</div>}
      </div>
    );
  }

  if (kind === "partnerships") {
    const title = item?.title || "Partner";
    const url = item?.url || "#";
    const desc = item?.description;
    const contact = item?.contact_line; // We’ll display as-is (your prompt logic already formats it)
    return (
      <div key={`${kind}-${idx}`} className="rounded-xl border border-neutral-800 p-4 hover:border-neutral-600 transition">
        <a href={url} target="_blank" rel="noopener noreferrer" className="text-[15px] underline" style={{ color: "#8b8989" }}>
          {title}
        </a>
        {desc && <div className="mt-2 text-[13px]" style={{ color: "#8b8989" }}>{desc}</div>}
        {contact && <div className="mt-1 text-[12px]" style={{ color: "#8b8989" }}>{contact}</div>}
      </div>
    );
  }

  // events
  const title = item?.title || "Event";
  const url = item?.url || "#";
  return (
    <div key={`${kind}-${idx}`} className="rounded-xl border border-neutral-800 p-4 hover:border-neutral-600 transition">
      <a href={url} target="_blank" rel="noopener noreferrer" className="text-[15px] underline" style={{ color: "#8b8989" }}>
        {title}
      </a>
    </div>
  );
}

export default async function SearchPage(props: {
  // Next 15: searchParams is a Promise
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await props.searchParams;
  const raw = sp.q;
  const q = Array.isArray(raw) ? raw[0] : raw ?? "";

  // If no query, nudge back to landing
  if (!q) {
    return (
      <main className="min-h-screen bg-black px-6 py-8">
        <div className="max-w-6xl mx-auto" style={{ color: "#8b8989" }}>
          <Link href="/" className="underline">← Back</Link>
          <div className="mt-6">Type a search on the landing page.</div>
        </div>
      </main>
    );
  }

  const { data, structured } = await ask(q);

  // Normalize sections
  const members = structured?.community_chats?.items ?? [];
  const transcripts = structured?.transcripts?.items ?? [];
  const resources = structured?.resources?.items ?? [];
  const partnerships = structured?.partnerships?.items ?? [];
  const events = structured?.events?.items ?? [];

  // Hubs for “no items” click-through
  const hubs = {
    transcripts: structured?.transcripts?.section_url || "https://aplayers.com/hub/calls",
    resources: structured?.resources?.section_url || "https://aplayers.com/hub/resources",
    partnerships: structured?.partnerships?.section_url || "https://aplayers.com/hub/partners",
    events: structured?.events?.section_url || "https://aplayers.com/hub/events",
  };

  return (
    <main className="min-h-screen bg-black px-6 py-8">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT: search box + members */}
        <div className="lg:col-span-2">
          {/* Landing-style search pill */}
          <form action="/search" method="get" className="mb-6 flex items-center justify-center">
            <input
              name="q"
              defaultValue={q}
              placeholder="What’s your next move?"
              className="w-[800px] h-[80px] rounded-full bg-transparent border-2"
              style={{
                borderColor: "#545454",
                color: "#8b8989",
                textAlign: "center",
                fontSize: "18px",
                outline: "none",
                padding: "0 28px",
              }}
            />
          </form>

          {/* Members (no “(priority)” tag) */}
          <div className="mb-3 uppercase tracking-wide text-sm" style={{ color: "#8b8989" }}>
            Members
          </div>
          {members.length === 0 ? (
            <div className="text-sm" style={{ color: "#8b8989" }}>
              No directly relevant member messages found.
            </div>
          ) : (
            <div className="space-y-3">
              {members.slice(0, 5).map((m, i) => MemberCard(m, i))}
              {members.length > 5 && (
                <div className="text-right">
                  <Link href={`/members?q=${encodeURIComponent(q)}`} className="text-xs underline" style={{ color: "#8b8989" }}>
                    Load more
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

        {/* RIGHT: collapsible categories */}
        <div className="lg:col-span-1 space-y-3">
          {/* Call Recordings */}
          <details className="group rounded-xl border border-neutral-900 p-3">
            <summary className="list-none flex items-center justify-between cursor-pointer">
              <span className="uppercase tracking-wide text-sm group-open:font-medium" style={{ color: "#8b8989" }}>
                Call Recordings
              </span>
              <span className="text-neutral-500 group-open:rotate-90 transition">▸</span>
            </summary>
            <div className="mt-3 space-y-3">
              {transcripts.length ? (
                transcripts.slice(0, 3).map((it, i) => RightCard("transcripts", it, i))
              ) : (
                <Link href={hubs.transcripts} target="_blank" className="text-xs underline" style={{ color: "#8b8989" }}>
                  See all call recordings
                </Link>
              )}
            </div>
          </details>

          {/* Resources */}
          <details className="group rounded-xl border border-neutral-900 p-3">
            <summary className="list-none flex items-center justify-between cursor-pointer">
              <span className="uppercase tracking-wide text-sm group-open:font-medium" style={{ color: "#8b8989" }}>
                Resources
              </span>
              <span className="text-neutral-500 group-open:rotate-90 transition">▸</span>
            </summary>
            <div className="mt-3 space-y-3">
              {resources.length ? (
                resources.slice(0, 3).map((it, i) => RightCard("resources", it, i))
              ) : (
                <Link href={hubs.resources} target="_blank" className="text-xs underline" style={{ color: "#8b8989" }}>
                  See all resources
                </Link>
              )}
            </div>
          </details>

          {/* Partnerships */}
          <details className="group rounded-xl border border-neutral-900 p-3">
            <summary className="list-none flex items-center justify-between cursor-pointer">
              <span className="uppercase tracking-wide text-sm group-open:font-medium" style={{ color: "#8b8989" }}>
                Partnerships
              </span>
              <span className="text-neutral-500 group-open:rotate-90 transition">▸</span>
            </summary>
            <div className="mt-3 space-y-3">
              {partnerships.length ? (
                partnerships.slice(0, 3).map((it, i) => RightCard("partnerships", it, i))
              ) : (
                <Link href={hubs.partnerships} target="_blank" className="text-xs underline" style={{ color: "#8b8989" }}>
                  See all partnerships
                </Link>
              )}
            </div>
          </details>

          {/* Events */}
          <details className="group rounded-xl border border-neutral-900 p-3">
            <summary className="list-none flex items-center justify-between cursor-pointer">
              <span className="uppercase tracking-wide text-sm group-open:font-medium" style={{ color: "#8b8989" }}>
                Events
              </span>
              <span className="text-neutral-500 group-open:rotate-90 transition">▸</span>
            </summary>
            <div className="mt-3 space-y-3">
              {events.length ? (
                events.slice(0, 3).map((it, i) => RightCard("events", it, i))
              ) : (
                <Link href={hubs.events} target="_blank" className="text-xs underline" style={{ color: "#8b8989" }}>
                  See all events
                </Link>
              )}
            </div>
          </details>
        </div>
      </div>

      {/* Debug fallback: if nothing structured, show raw */}
      {!structured && (
        <div className="max-w-6xl mx-auto mt-8">
          <pre className="text-xs whitespace-pre-wrap rounded-lg border border-neutral-900 p-4" style={{ color: "#8b8989" }}>
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
    </main>
  );
}