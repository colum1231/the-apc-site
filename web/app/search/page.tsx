// web/app/search/page.tsx
import Link from "next/link";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

type RawAPI = {
  ok?: boolean;
  data?: any;
  openai_response?: string;
  [k: string]: any;
};

type Sections = {
  members: any[];
  transcripts: any[];
  resources: any[];
  partnerships: any[];
  events: any[];
};

/* Parse either a structured payload or a ```json fenced block */
function parseSections(data: any): Sections {
  const body = data?.data ?? data ?? {};
  const fence = (t: unknown) => {
    if (typeof t !== "string") return null;
    const m = t.match(/```json\s*([\s\S]*?)```/i) ?? t.match(/```\s*([\s\S]*?)```/i);
    if (!m) return null;
    try { return JSON.parse((m[1] || "").trim()); } catch { return null; }
  };

  if (body?.transcripts || body?.resources || body?.partnerships || body?.events || body?.community_chats) {
    return {
      members: body?.community_chats?.items ?? body?.community_chats ?? [],
      transcripts: body?.transcripts?.items ?? body?.transcripts ?? [],
      resources: body?.resources?.items ?? body?.resources ?? [],
      partnerships: body?.partnerships?.items ?? body?.partnerships ?? [],
      events: body?.events?.items ?? body?.events ?? [],
    };
  }

  const parsed = fence(body?.openai_response ?? body?.message);
  return {
    members: parsed?.community_chats?.items ?? [],
    transcripts: parsed?.transcripts?.items ?? [],
    resources: parsed?.resources?.items ?? [],
    partnerships: parsed?.partnerships?.items ?? [],
    events: parsed?.events?.items ?? [],
  };
}

export default async function SearchPage({
  // IMPORTANT: treat as plain object (not a Promise)
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const rawQ = searchParams?.q;
  const q = Array.isArray(rawQ) ? rawQ[0] : rawQ ?? "";

  // ===== Right-side counts via query params (default preview = 1; +3 per click) =====
  const numFrom = (k: string, def: number) => {
    const v = searchParams?.[k];
    const s = Array.isArray(v) ? v[0] : v;
    const n = Number(s);
    return Number.isFinite(n) && n > 0 ? n : def;
  };
  const nPartnerships = numFrom("np", 1);
  const nTranscripts  = numFrom("nt", 1);
  const nResources    = numFrom("nr", 1);
  const nEvents       = numFrom("ne", 1);

  // “scroll mode” for a given category begins after the first Load more (>= 4 items)
  const scrollMode = {
    partnerships: nPartnerships >= 4,
    transcripts:  nTranscripts  >= 4,
    resources:    nResources    >= 4,
    events:       nEvents       >= 4,
  };

  // ===== Members (unchanged here – handled in previous chunk later if needed) =====
  const LEFT_COUNT = 5; // keep your existing count for now

  // Fetch results (same-origin)
  let json: RawAPI | null = null;
  if (q) {
    try {
      const res = await fetch(`/api/ask?q=${encodeURIComponent(q)}`, { cache: "no-store" });
      try { json = (await res.json()) as RawAPI; }
      catch { json = { ok: false, status: res.status, body: await res.text() } as any; }
    } catch {
      json = { ok: false, error: "fetch failed" } as any;
    }
  }
  const sections = json ? parseSections(json) : { members: [], transcripts: [], resources: [], partnerships: [], events: [] };

  // Build +3 links (preserve q and other counts)
  const withParam = (key: string, val: number) => {
    const sp = new URLSearchParams();
    sp.set("q", q);
    sp.set("np", String(nPartnerships));
    sp.set("nt", String(nTranscripts));
    sp.set("nr", String(nResources));
    sp.set("ne", String(nEvents));
    sp.set(key, String(val));
    return `/search?${sp.toString()}#${key}`;
  };

  const moreHref = {
    partnerships: withParam("np", nPartnerships + 3),
    transcripts:  withParam("nt", nTranscripts + 3),
    resources:    withParam("nr", nResources + 3),
    events:       withParam("ne", nEvents + 3),
  };

  return (
    <main className="results">
      {/* Background like landing */}
      <div className="landing-wrap" aria-hidden="true" />

      <div className="results-shell">
        {/* LEFT: Search + Members (unchanged markup) */}
        <section className="results-left">
          <form action="/search" method="get" className="results-search" role="search">
            <input
              name="q"
              defaultValue={q}
              placeholder="What’s your next move?"
              className="input results-input"
              autoFocus
            />
          </form>

          <div className="members-wrap">
            <div className="members-title-row" aria-hidden="true">
              <span className="corner left" />
              <span className="corner right" />
            </div>

            <h2 className="members-title">Members</h2>

            {!sections?.members?.length && (
              <p className="muted">Type a search above to see relevant members.</p>
            )}

            {!!sections?.members?.length && (
              <>
                <ul className="members-list">
                  {(sections.members ?? []).slice(0, LEFT_COUNT).map((m, i) => {
                    const name =
                      m?.title || m?.name || m?.display_name || "Member";
                    const quote = m?.quote || m?.line || m?.excerpt;
                    const meta =
                      m?.role || m?.industry || m?.expertise || m?.username || "";
                    return (
                      <li key={`member-${i}`} className="member-card">
                        <div className="member-head">
                          <span className="member-name">{name}</span>
                          {meta && (
                            <>
                              <span className="sep">|</span>
                              <span className="member-meta">{String(meta).toUpperCase()}</span>
                            </>
                          )}
                        </div>
                        {quote && <div className="member-quote">“{quote}”</div>}
                        <div className="member-contact">CONTACT</div>
                      </li>
                    );
                  })}
                </ul>

                {(sections.members ?? []).length > LEFT_COUNT && (
                  <div className="load-more-row">
                    <button className="load-more-btn" type="button" disabled>
                      LOAD MORE
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </section>

        {/* RIGHT: categories */}
        <aside className="results-right">
          <RightSection
            id="np"
            label="PARTNERSHIPS"
            items={sections.partnerships ?? []}
            count={nPartnerships}
            scroll={scrollMode.partnerships}
            moreHref={moreHref.partnerships}
          />
          <RightSection
            id="nt"
            label="CALL LIBRARY"
            items={sections.transcripts ?? []}
            count={nTranscripts}
            scroll={scrollMode.transcripts}
            moreHref={moreHref.transcripts}
          />
          <RightSection
            id="nr"
            label="RESOURCES"
            items={sections.resources ?? []}
            count={nResources}
            scroll={scrollMode.resources}
            moreHref={moreHref.resources}
          />
          <RightSection
            id="ne"
            label="EVENTS"
            items={sections.events ?? []}
            count={nEvents}
            scroll={scrollMode.events}
            moreHref={moreHref.events}
          />

          <div className="other-footer">OTHER</div>
        </aside>
      </div>
    </main>
  );
}

/** Right-side section:
 *  - default: header 24px font; 125px gap to next section
 *  - open view: first asset 10px under header, indented 25px, then Load more
 *  - after Load more (count>=4): convert to scroll box (3 visible), gap to next = 25px
 */
function RightSection({
  id,
  label,
  items,
  count,
  scroll,
  moreHref,
}: {
  id: "np" | "nt" | "nr" | "ne";
  label: string;
  items: any[];
  count: number;   // number of items to show (1 default, +3 per click)
  scroll: boolean; // becomes true when count >= 4
  moreHref: string;
}) {
  const all = items ?? [];
  const open = true; // keep auto-open to show preview; you can flip to false if you prefer collapsed by default
  const shown = all.slice(0, Math.max(1, count));
  const hasMore = all.length > shown.length;

  // Choose per-type label to render asset lines + quotes + separators
  const render = (it: any) => {
    const title = it?.title || it?.name || it?.display_name || "Untitled";
    const sub =
      it?.quote || it?.summary || it?.description || it?.context || "";
    const url = it?.url;

    return (
      <div className="right-card-inner">
        {url ? (
          <a href={url} target="_blank" rel="noreferrer" className="right-card-title">
            {title}
          </a>
        ) : (
          <div className="right-card-title">{title}</div>
        )}
        <div className="asset-sep" />
        {sub ? <div className="right-card-sub">“{sub}”</div> : null}
        <div className="asset-sep" />
      </div>
    );
  };

  return (
    <details className={["right-acc", scroll ? "right-acc--scroll" : ""].join(" ")} open={open} id={id}>
      <summary className="right-head">
        <span className="right-title">{label}</span>
        <span className="right-arrow" aria-hidden>▾</span>
      </summary>

      <div className={["right-body", scroll ? "right-body--scroll" : ""].join(" ")}>
        <ul className="right-list">
          {shown.map((it, i) => (
            <li key={`${label}-${i}`} className="right-card">
              {render(it)}
            </li>
          ))}
        </ul>

        {hasMore && (
          <div className="right-load-more-row">
            <Link href={moreHref} className="right-load-more">Load more</Link>
          </div>
        )}
      </div>
    </details>
  );
}