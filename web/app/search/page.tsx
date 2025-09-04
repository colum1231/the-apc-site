// web/app/search/page.tsx
import Link from "next/link";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

type SectionKey = "transcripts" | "community_chats" | "resources" | "partnerships" | "events";

type Sections = {
  transcripts?: { title?: string; url?: string; name?: string; quote?: string; context?: string; source?: string }[];
  community_chats?: {
    title?: string; // "Name | Industry/Title | @username // phone"
    name?: string;
    username?: string; // "@handle"
    username_url?: string;
    quote?: string;
    context?: string;
    source?: string;
  }[];
  resources?: { title?: string; summary?: string; url?: string; source?: string }[];
  partnerships?: { title?: string; description?: string; contact_line?: string; url?: string; source?: string }[];
  events?: { title?: string; url?: string; source?: string }[];
};

type Envelope = {
  transcripts?: { section_title?: string; section_url?: string; items?: Sections["transcripts"]; load_more_token?: string };
  community_chats?: { section_title?: string; section_url?: string; items?: Sections["community_chats"]; load_more_token?: string };
  resources?: { section_title?: string; section_url?: string; items?: Sections["resources"]; load_more_token?: string };
  partnerships?: { section_title?: string; section_url?: string; items?: Sections["partnerships"]; load_more_token?: string };
  events?: { section_title?: string; section_url?: string; items?: Sections["events"]; load_more_token?: string };
};

function getBaseUrl() {
  if (process.env.NEXT_PUBLIC_BASE_URL) return process.env.NEXT_PUBLIC_BASE_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

function parseMaybeJsonBlock(body: unknown): Envelope | null {
  // Body from /api/ask can be {ok:true,data:{…}} or the data may include a string with ```json … ```
  const unwrap = (x: any) => (x && x.data ? x.data : x);
  const raw = unwrap(body);

  // Already an object with sections
  if (raw && typeof raw === "object" && ("transcripts" in raw || "community_chats" in raw)) {
    return raw as Envelope;
  }

  // Might be string with ```json fenced block
  const str = typeof raw === "string" ? raw : (typeof (raw as any)?.openai_response === "string" ? (raw as any).openai_response : null);
  if (!str) return null;

  const fence = /```json\s*([\s\S]*?)```/i.exec(str);
  const candidate = fence ? fence[1] : str;
  try {
    const parsed = JSON.parse(candidate);
    if (parsed && typeof parsed === "object") return parsed as Envelope;
  } catch {
    // ignore
  }
  return null;
}

// Display helper: trim to max words for UI (non-authoritative)
function trimWords(s?: string, max = 14) {
  if (!s) return s;
  const parts = s.trim().split(/\s+/);
  return parts.length > max ? parts.slice(0, max).join(" ") + "…" : s;
}

// Hide empty @username / phone fragments in the composed title
function normalizeMemberTitle(input?: string, username?: string) {
  if (!input) return "";
  let t = input;

  // If username is missing or blank, remove " | @username" and variants
  const hasUser = !!(username && username.replace("@", "").trim());
  if (!hasUser) {
    t = t.replace(/\s*\|\s*@[^/]+/g, ""); // remove " | @handle"
  }
  // Remove orphaned "// phone" if it ends with // … and no actual digits
  t = t.replace(/\s*\/\/\s*(?:\+?[()\d\s-]{0,3})?\.{0,3}\s*$/g, "");

  // Squash duplicate spaces / separators
  t = t.replace(/\s{2,}/g, " ").replace(/\s\|\s\|\s/g, " | ").trim();
  return t;
}

function SectionHeader({
  label,
  href,
  collapsible = false,
}: {
  label: string;
  href: string;
  collapsible?: boolean;
}) {
  return (
    <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
      <Link href={href} className="uppercase tracking-wide text-sm text-neutral-400 hover:text-white">
        {label}
      </Link>
      {collapsible && <span className="text-neutral-500">▸</span>}
    </div>
  );
}

export default async function SearchPage(props: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await props.searchParams;
  const raw = sp.q;
  const q = Array.isArray(raw) ? raw[0] : raw ?? "";

  if (!q) {
    return (
      <main className="min-h-screen bg-black text-white p-8">
        <div className="max-w-6xl mx-auto">
          <Link href="/" className="text-neutral-400 hover:text-white">← Back</Link>
          <h1 className="text-2xl mt-6">Search</h1>
          <p className="mt-2 text-neutral-400">Type something on the landing page.</p>
        </div>
      </main>
    );
  }

  const url = `${getBaseUrl()}/api/ask?q=${encodeURIComponent(q)}`;
  const res = await fetch(url, { cache: "no-store" });

  let body: any;
  try {
    body = await res.json();
  } catch {
    body = { ok: false, status: res.status, body: await res.text() };
  }

  // Prefer nested .body / .data shapes from our API result
  const candidate = body?.body ?? body?.data ?? body;
  const parsed = parseMaybeJsonBlock(candidate) || parseMaybeJsonBlock(body) || null;

  const members = parsed?.community_chats?.items ?? [];
  const transcripts = parsed?.transcripts?.items ?? [];
  const resources = parsed?.resources?.items ?? [];
  const partnerships = parsed?.partnerships?.items ?? [];
  const events = parsed?.events?.items ?? [];

  const priority: SectionKey = members.length > 0 ? "community_chats" : (["transcripts", "resources", "partnerships", "events"] as SectionKey[]).find(
    (k) => (parsed as any)?.[k]?.items?.length > 0
  ) || "community_chats";

  const sideOrder: SectionKey[] = (["community_chats", "transcripts", "resources", "partnerships", "events"] as SectionKey[])
    .filter((k) => k !== priority);

  return (
    <main className="min-h-screen bg-black text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <Link href="/" className="text-neutral-400 hover:text-white">← Back</Link>
          <div className="text-neutral-400">Your search: <span className="text-white">{q}</span></div>
        </div>

        {/* If the model didn’t give structured JSON, show raw for debugging */}
        {!parsed && (
          <pre className="mt-6 text-sm bg-neutral-900/60 rounded-lg p-4 overflow-auto">
            {JSON.stringify(body, null, 2)}
          </pre>
        )}

        {parsed && (
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* LEFT: Priority section (spans 2 columns) */}
            <div className="lg:col-span-2">
              <div className="mb-3 uppercase tracking-wide text-sm text-neutral-300">
                {priority === "community_chats"
                  ? "Members (priority)"
                  : priority === "transcripts"
                  ? "Call Recordings (priority)"
                  : priority.charAt(0).toUpperCase() + priority.slice(1) + " (priority)"}
              </div>

              <div className="space-y-3">
                {(priority === "community_chats" ? members : (priority === "transcripts" ? transcripts : priority === "resources" ? resources : priority === "partnerships" ? partnerships : events))
                  .slice(0, priority === "community_chats" ? 5 : 3)
                  .map((it: any, i: number) => {
                    if (priority === "community_chats") {
                      const title = normalizeMemberTitle(it?.title || it?.name, it?.username);
                      const quote = trimWords(it?.quote, 14);
                      const handle = (it?.username || "").replace(/^@/, "");
                      const uurl = handle ? `https://t.me/${handle}` : undefined;

                      return (
                        <div key={`m-${i}`} className="rounded-xl border border-neutral-800 p-4 hover:border-neutral-500/70 transition">
                          <div className="text-[15px] text-neutral-200">{title || "Member"}</div>
                          {quote && <div className="mt-2 text-[13px] text-neutral-400 italic">“{quote}”</div>}
                          {uurl && (
                            <div className="mt-1 text-[12px]">
                              <a href={uurl} className="text-neutral-400 hover:text-white">@{handle}</a>
                            </div>
                          )}
                        </div>
                      );
                    }

                    if (priority === "transcripts") {
                      const title = it?.title || it?.name || "Transcript";
                      const quote = trimWords(it?.quote, 14);
                      const url = it?.url;
                      return (
                        <a key={`t-${i}`} href={url || "#"} target={url ? "_blank" : "_self"} className="block rounded-xl border border-neutral-800 p-4 hover:border-neutral-500/70 transition">
                          <div className="text-[15px] text-neutral-200">{title}</div>
                          {quote && <div className="mt-2 text-[13px] text-neutral-400 italic">“{quote}”</div>}
                        </a>
                      );
                    }

                    if (priority === "resources") {
                      const title = it?.title || "Resource";
                      const summary = it?.summary;
                      const url = it?.url;
                      return (
                        <a key={`r-${i}`} href={url || "#"} target={url ? "_blank" : "_self"} className="block rounded-xl border border-neutral-800 p-4 hover:border-neutral-500/70 transition">
                          <div className="text-[15px] text-neutral-200">{title}</div>
                          {summary && <div className="mt-2 text-[13px] text-neutral-400">{summary}</div>}
                        </a>
                      );
                    }

                    if (priority === "partnerships") {
                      const title = it?.title || "Partner";
                      const desc = it?.description;
                      const contact = it?.contact_line;
                      const url = it?.url;
                      return (
                        <a key={`p-${i}`} href={url || "#"} target={url ? "_blank" : "_self"} className="block rounded-xl border border-neutral-800 p-4 hover:border-neutral-500/70 transition">
                          <div className="text-[15px] text-neutral-200">{title}</div>
                          {desc && <div className="mt-2 text-[13px] text-neutral-400">{desc}</div>}
                          {contact && <div className="mt-1 text-[12px] text-neutral-500">{contact}</div>}
                        </a>
                      );
                    }

                    // events
                    const title = it?.title || "Event";
                    const url = it?.url;
                    return (
                      <a key={`e-${i}`} href={url || "#"} target={url ? "_blank" : "_self"} className="block rounded-xl border border-neutral-800 p-4 hover:border-neutral-500/70 transition">
                        <div className="text-[15px] text-neutral-200">{title}</div>
                      </a>
                    );
                  })}
                {/* Load more link */}
                {((priority === "community_chats" && members.length > 5) ||
                  (priority !== "community_chats" && (parsed as any)[priority]?.items?.length > 3)) && (
                  <div className="text-right">
                    <Link href={`/${priority}`} className="text-xs text-neutral-400 hover:text-white underline">
                      Load more
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT: Other sections (collapsibles) */}
            <div className="lg:col-span-1">
              <div className="space-y-4">
                {sideOrder.map((k) => {
                  const block = (parsed as any)?.[k];
                  const items = block?.items ?? [];
                  const label =
                    k === "community_chats" ? "Members"
                    : k === "transcripts" ? "Call Recordings"
                    : k.charAt(0).toUpperCase() + k.slice(1);

                  if (items.length === 0) {
                    // No strong match → link to hub page
                    return (
                      <div key={k} className="rounded-xl border border-neutral-800 p-4">
                        <SectionHeader label={label} href={block?.section_url || "/"} />
                        <div className="text-[13px] text-neutral-500 mt-3">
                          See all available {label.toLowerCase()} in the APC Hub.
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={k} className="rounded-xl border border-neutral-800 p-4">
                      <SectionHeader label={label} href={block?.section_url || "/"} collapsible />
                      <div className="mt-3 space-y-3">
                        {items.slice(0, 3).map((it: any, i: number) => {
                          if (k === "community_chats") {
                            const title = normalizeMemberTitle(it?.title || it?.name, it?.username);
                            const quote = trimWords(it?.quote, 14);
                            const handle = (it?.username || "").replace(/^@/, "");
                            const uurl = handle ? `https://t.me/${handle}` : undefined;
                            return (
                              <div key={`${k}-${i}`} className="rounded-lg border border-neutral-800 p-3">
                                <div className="text-[15px] text-neutral-200">{title || "Member"}</div>
                                {quote && <div className="mt-1 text-[13px] text-neutral-400 italic">“{quote}”</div>}
                                {uurl && (
                                  <div className="mt-1 text-[12px]">
                                    <a href={uurl} className="text-neutral-400 hover:text-white">@{handle}</a>
                                  </div>
                                )}
                              </div>
                            );
                          }
                          if (k === "transcripts") {
                            const title = it?.title || it?.name || "Transcript";
                            const quote = trimWords(it?.quote, 14);
                            const url = it?.url;
                            return (
                              <a key={`${k}-${i}`} href={url || "#"} target={url ? "_blank" : "_self"} className="block rounded-lg border border-neutral-800 p-3">
                                <div className="text-[15px] text-neutral-200">{title}</div>
                                {quote && <div className="mt-1 text-[13px] text-neutral-400 italic">“{quote}”</div>}
                              </a>
                            );
                          }
                          if (k === "resources") {
                            const title = it?.title || "Resource";
                            const summary = it?.summary;
                            const url = it?.url;
                            return (
                              <a key={`${k}-${i}`} href={url || "#"} target={url ? "_blank" : "_self"} className="block rounded-lg border border-neutral-800 p-3">
                                <div className="text-[15px] text-neutral-200">{title}</div>
                                {summary && <div className="mt-1 text-[13px] text-neutral-400">{summary}</div>}
                              </a>
                            );
                          }
                          if (k === "partnerships") {
                            const title = it?.title || "Partner";
                            const desc = it?.description;
                            const contact = it?.contact_line;
                            const url = it?.url;
                            return (
                              <a key={`${k}-${i}`} href={url || "#"} target={url ? "_blank" : "_self"} className="block rounded-lg border border-neutral-800 p-3">
                                <div className="text-[15px] text-neutral-200">{title}</div>
                                {desc && <div className="mt-1 text-[13px] text-neutral-400">{desc}</div>}
                                {contact && <div className="mt-1 text-[12px] text-neutral-500">{contact}</div>}
                              </a>
                            );
                          }
                          // events
                          const title = it?.title || "Event";
                          const url = it?.url;
                          return (
                            <a key={`${k}-${i}`} href={url || "#"} target={url ? "_blank" : "_self"} className="block rounded-lg border border-neutral-800 p-3">
                              <div className="text-[15px] text-neutral-200">{title}</div>
                            </a>
                          );
                        })}
                        {items.length > 3 && (
                          <div className="text-right">
                            <Link href={`/${k}`} className="text-xs text-neutral-400 hover:text-white underline">
                              Load more
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}