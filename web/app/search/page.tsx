// web/app/search/page.tsx
import Link from "next/link";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

// Build a base URL that works locally & on Vercel
function getBaseUrl() {
  if (process.env.NEXT_PUBLIC_BASE_URL) return process.env.NEXT_PUBLIC_BASE_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

// Pull the CustomGPT response into a structured object
async function getStructured(q: string) {
  const url = `${getBaseUrl()}/api/ask?q=${encodeURIComponent(q)}`;
  const res = await fetch(url, { cache: "no-store" });

  // Try to JSON-parse the response first
  let body: any;
  try {
    body = await res.json();
  } catch {
    return { ok: false, error: `Non-JSON response from /api/ask (status ${res.status})` };
  }

  // 1) If the API already returned structured keys, use them directly.
  if (
    body?.transcripts ||
    body?.community_chats ||
    body?.resources ||
    body?.partnerships ||
    body?.events
  ) {
    return { ok: true, payload: body };
  }

  // 2) CustomGPT often returns an envelope with data.openai_response as a string.
  const maybe = body?.data?.openai_response ?? body?.openai_response ?? body?.message ?? body;

  if (typeof maybe === "object" && maybe !== null) {
    // Already an object; assume structured
    return { ok: true, payload: maybe };
  }

  if (typeof maybe === "string") {
    // Extract ```json ... ``` if present
    const m = maybe.match(/```json\s*([\s\S]*?)```/i);
    const jsonText = m ? m[1] : maybe.trim();

    try {
      const parsed = JSON.parse(jsonText);
      return { ok: true, payload: parsed };
    } catch {
      // Fallthrough to raw view
      return { ok: true, raw: maybe, payload: null };
    }
  }

  // Nothing we can use
  return { ok: true, payload: null, raw: body };
}

// ---- UI helpers ----
function SectionHeader({ label }: { label: string }) {
  return (
    <div className="mb-3 uppercase tracking-wide text-sm text-neutral-400">
      {label}
    </div>
  );
}

function MemberCard({ item }: { item: any }) {
  const title = item?.title || item?.name || "Member";
  const quote = item?.quote;
  const handle =
    item?.username ? `@${String(item.username).replace(/^@/, "")}` : "";
  return (
    <div className="rounded-xl border border-neutral-700/60 p-4 hover:border-neutral-400/60 transition">
      <div className="text-[15px] text-neutral-200">{title}</div>
      {quote && (
        <div className="mt-2 text-[13px] text-neutral-400 italic">“{quote}”</div>
      )}
      {handle && (
        <div className="mt-1 text-[12px] text-neutral-500">{handle}</div>
      )}
    </div>
  );
}

function LinkCard({
  title,
  subtitle,
  url,
}: {
  title: string;
  subtitle?: string;
  url?: string;
}) {
  const inner = (
    <div className="rounded-xl border border-neutral-700/60 p-4 hover:border-neutral-400/60 transition">
      <div className="text-[15px] text-neutral-200">{title}</div>
      {subtitle && (
        <div className="mt-2 text-[13px] text-neutral-400 italic">“{subtitle}”</div>
      )}
    </div>
  );
  return url ? (
    <a href={url} target="_blank" rel="noreferrer">
      {inner}
    </a>
  ) : (
    inner
  );
}

export default async function SearchPage(props: {
  // Next 15: searchParams is async
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await props.searchParams;
  const raw = sp.q;
  const q = Array.isArray(raw) ? raw[0] : raw ?? "";

  if (!q) {
    return (
      <main className="min-h-screen bg-black text-white p-8">
        <Link href="/" className="text-neutral-400 hover:text-white">
          ← Back
        </Link>
        <h1 className="text-2xl mt-6">Search</h1>
        <p className="mt-2 text-neutral-400">Type something on the landing page.</p>
      </main>
    );
  }

  const r = await getStructured(q);

  return (
    <main className="min-h-screen bg-black text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-neutral-400 hover:text-white">
            ← Back
          </Link>
          <div className="text-neutral-400">
            Your search: <span className="text-white">{q}</span>
          </div>
        </div>

        {/* Error state */}
        {!r.ok && (
          <div className="mt-6 text-red-400 text-sm">
            {r.error || "Unknown error"}
          </div>
        )}

        {/* Raw debug (no structured payload) */}
        {r.ok && !r.payload && (
          <pre className="mt-6 text-sm bg-neutral-900/60 rounded-lg p-4 overflow-auto">
{JSON.stringify(r.raw ?? null, null, 2)}
          </pre>
        )}

        {/* Structured rendering */}
        {r.ok && r.payload && (() => {
          const pl = r.payload as any;

          // The bot may return sections as {section_title, section_url, items, load_more_token}
          // Normalize to arrays:
          const transcripts = Array.isArray(pl?.transcripts?.items)
            ? pl.transcripts.items
            : Array.isArray(pl?.transcripts)
            ? pl.transcripts
            : [];
          const community = Array.isArray(pl?.community_chats?.items)
            ? pl.community_chats.items
            : Array.isArray(pl?.community_chats)
            ? pl.community_chats
            : [];
          const resources = Array.isArray(pl?.resources?.items)
            ? pl.resources.items
            : Array.isArray(pl?.resources)
            ? pl.resources
            : [];
          const partnerships = Array.isArray(pl?.partnerships?.items)
            ? pl.partnerships.items
            : Array.isArray(pl?.partnerships)
            ? pl.partnerships
            : [];
          const events = Array.isArray(pl?.events?.items)
            ? pl.events.items
            : Array.isArray(pl?.events)
            ? pl.events
            : [];

          const sections = {
            members: community,
            transcripts,
            resources,
            partnerships,
            events,
          } as const;

          // Priority logic: default members, else first non-empty
          const order: Array<keyof typeof sections> = [
            "members",
            "transcripts",
            "resources",
            "partnerships",
            "events",
          ];
          const chosen =
            sections.members.length > 0
              ? "members"
              : order.find((k) => sections[k].length > 0) || "members";
          const side = order.filter((k) => k !== chosen);

          // Renderers
          const renderCard = (k: keyof typeof sections, item: any, i: number) => {
            if (k === "members") return <MemberCard key={`${k}-${i}`} item={item} />;
            if (k === "transcripts")
              return (
                <LinkCard
                  key={`${k}-${i}`}
                  title={item?.title || item?.name || "Transcript"}
                  subtitle={item?.quote}
                  url={item?.url}
                />
              );
            if (k === "resources")
              return (
                <LinkCard
                  key={`${k}-${i}`}
                  title={item?.title || "Resource"}
                  subtitle={item?.summary}
                  url={item?.url}
                />
              );
            if (k === "partnerships")
              return (
                <LinkCard
                  key={`${k}-${i}`}
                  title={item?.title || "Partner"}
                  subtitle={item?.description || item?.contact_line}
                  url={item?.url}
                />
              );
            if (k === "events")
              return (
                <LinkCard
                  key={`${k}-${i}`}
                  title={item?.title || "Event"}
                  subtitle={undefined}
                  url={item?.url}
                />
              );
            return (
              <div key={`${k}-${i}`} className="rounded-xl border border-neutral-700/60 p-4">
                <div className="text-[13px] text-neutral-400">Unknown item</div>
              </div>
            );
          };

          return (
            <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* LEFT: Priority section (2 cols) */}
              <div className="lg:col-span-2">
                <SectionHeader
                  label={
                    chosen === "members"
                      ? "Members (priority)"
                      : chosen === "transcripts"
                      ? "Call transcripts (priority)"
                      : `${chosen.charAt(0).toUpperCase()}${chosen.slice(1)} (priority)`
                  }
                />
                <div className="space-y-3">
                  {sections[chosen].slice(0, 3).map((it, i) => renderCard(chosen, it, i))}
                  {sections[chosen].length > 3 && (
                    <div className="text-right">
                      <Link
                        href={`/${chosen}`}
                        className="text-xs text-neutral-400 hover:text-white underline"
                      >
                        Load more
                      </Link>
                    </div>
                  )}
                </div>
              </div>

              {/* RIGHT: Other sections as collapsibles */}
              <div className="lg:col-span-1">
                <div className="space-y-2">
                  {side
                    .filter((k) => sections[k].length > 0)
                    .map((k) => {
                      const label =
                        k === "members"
                          ? "Members"
                          : k === "transcripts"
                          ? "Call transcripts"
                          : k.charAt(0).toUpperCase() + k.slice(1);
                      return (
                        <details key={k} className="group border-b border-neutral-800 py-3">
                          <summary className="list-none flex items-center justify-between cursor-pointer">
                            <span className="uppercase tracking-wide text-sm text-neutral-300 group-open:text-white">
                              {label}
                            </span>
                            <span className="text-neutral-400 group-open:rotate-90 transition">▸</span>
                          </summary>
                          <div className="mt-3 space-y-3">
                            {sections[k].slice(0, 3).map((it, i) => renderCard(k, it, i))}
                            {sections[k].length > 3 && (
                              <div className="text-right">
                                <Link
                                  href={`/${k}`}
                                  className="text-xs text-neutral-400 hover:text-white underline"
                                >
                                  Load more
                                </Link>
                              </div>
                            )}
                          </div>
                        </details>
                      );
                    })}
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </main>
  );
}