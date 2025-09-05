// web/app/search/page.tsx
import Link from "next/link";

/* ------- server settings ------- */
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

/* ------- types & helpers ------- */
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

function parseSections(data: any): Sections {
  const body = data?.data ?? data ?? {};
  const fence = (t: unknown) => {
    if (typeof t !== "string") return null;
    const m = t.match(/```json\s*([\s\S]*?)```/i) ?? t.match(/```\s*([\s\S]*?)```/i);
    if (!m) return null;
    try { return JSON.parse((m[1] || "").trim()); } catch { return null; }
  };

  // structured shape
  if (body?.transcripts || body?.resources || body?.partnerships || body?.events || body?.community_chats) {
    return {
      members: body?.community_chats?.items ?? body?.community_chats ?? [],
      transcripts: body?.transcripts?.items ?? body?.transcripts ?? [],
      resources: body?.resources?.items ?? body?.resources ?? [],
      partnerships: body?.partnerships?.items ?? body?.partnerships ?? [],
      events: body?.events?.items ?? body?.events ?? [],
    };
  }

  // fallback: fenced block
  const parsed = fence(body?.openai_response ?? body?.message);
  return {
    members: parsed?.community_chats?.items ?? [],
    transcripts: parsed?.transcripts?.items ?? [],
    resources: parsed?.resources?.items ?? [],
    partnerships: parsed?.partnerships?.items ?? [],
    events: parsed?.events?.items ?? [],
  };
}

/* Small client helper: enable top fade only when scrolled */
function MembersScroller({
  children,
  scrollMode,
}: {
  children: React.ReactNode;
  scrollMode: boolean;
}) {
  "use client";
  const ref = React.useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = React.useState(false);
  React.useEffect(() => {
    const el = ref.current; if (!el) return;
    const onScroll = () => setScrolled(el.scrollTop > 0);
    el.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => el.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <div
      ref={ref}
      className={[
        "members-scroll",
        scrollMode ? "members-scroll--scroll" : "",
        scrolled ? "members-scroll--topfade" : "",
      ].join(" ")}
    >
      {children}
    </div>
  );
}

/* Need React for the client widget */
import * as React from "react";

/* ------- page ------- */
export default async function SearchPage({
  // IMPORTANT: treat as a plain object (do NOT Promise/await it)
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const rawQ = searchParams?.q;
  const q = Array.isArray(rawQ) ? rawQ[0] : rawQ ?? "";

  /* ===== LEFT: Members ===== */
  const mParam = searchParams?.m;
  const membersScroll = (Array.isArray(mParam) ? mParam[0] : mParam) === "all";
  const MEMBERS_INITIAL = 4;
  const membersToShow = membersScroll ? Number.MAX_SAFE_INTEGER : MEMBERS_INITIAL;

  /* ===== RIGHT: counts (+3 per click) ===== */
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

  const scrollMode = {
    partnerships: nPartnerships >= 4,
    transcripts:  nTranscripts  >= 4,
    resources:    nResources    >= 4,
    events:       nEvents       >= 4,
  };

  // fetch (same-origin)
  let json: RawAPI | null = null;
  if (q) {
    try {
      const res = await fetch(`/api/ask?q=${encodeURIComponent(q)}`, { cache: "no-store" });
      try { json = (await res.json()) as RawAPI; }
      catch { json = { ok:false, status:res.status, body:await res.text() } as any; }
    } catch {
      json = { ok:false, error:"fetch failed" } as any;
    }
  }
  const sections = json ? parseSections(json) : { members: [], transcripts: [], resources: [], partnerships: [], events: [] };

  // Build +3 URLs (preserve all counts + q)
  const withParam = (key: "np"|"nt"|"nr"|"ne", val: number) => {
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

  const moreMembersHref = `/search?${new URLSearchParams({ q, m: "all" }).toString()}#members`;

  return (
    <main className="results">
      <div className="landing-wrap" aria-hidden="true" />
      <div className="results-shell">
        {/* LEFT half */}
        <section className="results-left">
          {/* Prompt: match home look, top=135 (via CSS) */}
          <form action="/search" method="get" className="results-search" role="search">
            <input
              name="q"
              defaultValue={q}
              placeholder="What’s your next move?"
              className="results-input results-input--home"
              autoFocus
            />
          </form>

          {/* Members box */}
          <div id="members" className={["members-box", membersScroll ? "members-box--expanded" : ""].join(" ")}>
            {/* corner ticks motif */}
            <div className="members-title-row" aria-hidden="true">
              <span className="corner left" />
              <span className="corner right" />
            </div>

            <MembersScroller scrollMode={membersScroll}>
              <ul className="members-list">
                {(sections.members ?? []).slice(0, membersToShow).map((m, i) => {
                  const name = m?.title || m?.name || m?.display_name || "Member";
                  const industry = m?.industry || m?.role || m?.expertise || "";
                  const quote = m?.quote || m?.line || m?.excerpt;
                  return (
                    <li key={`member-${i}`} className="member-card member-card--clean">
                      <div className="member-head">
                        <span className="member-name member-name--bold">{name}</span>
                        {industry && (<><span className="sep">|</span><span className="member-meta member-meta--bold">{String(industry)}</span></>)}
                      </div>
                      {quote && <div className="member-quote">“{quote}”</div>}
                    </li>
                  );
                })}
              </ul>
            </MembersScroller>

            {/* Load more (before scroll mode) */}
            {!membersScroll && (sections.members?.length ?? 0) > MEMBERS_INITIAL ? (
              <div className="load-more-row">
                <Link href={moreMembersHref} className="load-more-btn">LOAD MORE</Link>
              </div>
            ) : null}
          </div>
        </section>

        {/* RIGHT half */}
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

/* Right-side section
   - default: 24px header; 125px gap to next
   - open preview: first asset 10px below, indented 25px, then Load more
   - after Load more (count>=4): scroll box, ~3 items visible, 20px gaps, fades; gap to next = 25px
   - non-member assets get 85% grey 1px line 5px under title and 5px under sub
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
  count: number;
  scroll: boolean;
  moreHref: string;
}) {
  const all = items ?? [];
  const open = true;
  const shown = all.slice(0, Math.max(1, count));
  const hasMore = all.length > shown.length;

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
              <RightCard item={it} />
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

function RightCard({ item }: { item: any }) {
  const title = item?.title || item?.name || item?.display_name || "Untitled";
  const sub = item?.quote || item?.summary || item?.description || item?.context;
  const url = item?.url;
  return (
    <div className="right-card-inner">
      {url ? (
        <a href={url} target="_blank" rel="noreferrer" className="right-card-title">{title}</a>
      ) : (
        <div className="right-card-title">{title}</div>
      )}
      <div className="asset-sep" />
      {sub ? <div className="right-card-sub">“{sub}”</div> : null}
      <div className="asset-sep" />
    </div>
  );
}