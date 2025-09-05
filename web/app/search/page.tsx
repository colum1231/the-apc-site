// web/app/search/page.tsx
import Link from "next/link";
import MembersScroller from "./MembersScroller";

/* ------- server settings ------- */
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

/* ------- types & helpers ------- */
type RawAPI = {
  ok?: boolean;
  data?: any;
  openai_response?: string;
  message?: string;
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
    const m =
      t.match(/```json\s*([\s\S]*?)```/i) ??
      t.match(/```\s*([\s\S]*?)```/i);
    if (!m) return null;
    try { return JSON.parse((m[1] || "").trim()); } catch { return null; }
  };

  const norm = (src: any) => ({
    members:
      src?.community_chats?.items ?? src?.community_chats ??
      src?.members?.items ?? src?.members ??
      src?.community ?? [],
    transcripts:
      src?.transcripts?.items ?? src?.transcripts ??
      src?.calls?.items ?? src?.calls ?? [],
    resources: src?.resources?.items ?? src?.resources ?? [],
    partnerships: src?.partnerships?.items ?? src?.partnerships ?? [],
    events: src?.events?.items ?? src?.events ?? [],
  });

  if (
    body?.community_chats || body?.members || body?.community ||
    body?.transcripts || body?.calls ||
    body?.resources || body?.partnerships || body?.events
  ) return norm(body);

  const parsed = fence(body?.openai_response ?? body?.message);
  if (parsed) return norm(parsed);

  return { members: [], transcripts: [], resources: [], partnerships: [], events: [] };
}

/* ------- page (server) ------- */
export default async function SearchPage({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const sp = searchParams ?? {};
  const rawQ = sp.q;
  const q = Array.isArray(rawQ) ? rawQ[0] : rawQ ?? "";

  const debugFlag = (() => {
    const d = sp.debug;
    const s = Array.isArray(d) ? d[0] : d;
    return s === "1" || s === "true";
  })();

  /* ===== LEFT: Members ===== */
  const mParam = sp.m;
  const membersScroll = (Array.isArray(mParam) ? mParam[0] : mParam) === "all";
  const MEMBERS_INITIAL = 4;
  const membersToShow = membersScroll ? Number.MAX_SAFE_INTEGER : MEMBERS_INITIAL;

  /* ===== RIGHT: per-category counts (+3 per click) ===== */
  const numFrom = (k: string, def: number) => {
    const v = sp[k];
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
  let resStatus = 0;
  let resError: string | null = null;
  let json: RawAPI | null = null;
  if (q) {
    try {
      const res = await fetch(`/api/ask?q=${encodeURIComponent(q)}`, { cache: "no-store" });
      resStatus = res.status;
      try {
        json = (await res.json()) as RawAPI;
      } catch {
        const txt = await res.text();
        resError = `Non-JSON: ${txt.slice(0, 400)}`;
        json = { ok: false, status: resStatus, body: txt } as any;
      }
    } catch (err: any) {
      resError = String(err?.message || err || "fetch failed");
      json = { ok: false, error: resError } as any;
    }
  }

  let sections = json ? parseSections(json) : { members: [], transcripts: [], resources: [], partnerships: [], events: [] };

  const counts = {
    members: sections.members?.length ?? 0,
    partnerships: sections.partnerships?.length ?? 0,
    transcripts: sections.transcripts?.length ?? 0,
    resources: sections.resources?.length ?? 0,
    events: sections.events?.length ?? 0,
  };

  // If debug AND everything is empty, inject a tiny sample so we can confirm the UI renders.
  if (debugFlag && Object.values(counts).every((n) => (n ?? 0) === 0)) {
    sections = {
      members: [
        { name: "Sample Member", industry: "Recruiting", quote: "I interviewed 12 candidates and found 2 A-players." },
        { name: "Jordan Lee", industry: "Sales Ops", quote: "Referrals beat cold every time." },
        { name: "Maya Chen", industry: "Talent", quote: "Always screen for coachability." },
        { name: "Chris P.", industry: "Hiring", quote: "Keep the bar high; move fast." },
      ],
      partnerships: [
        { title: "NetRevenue", description: "Specializes in recruiting setters for remote sales teams.", url: "#" },
        { title: "TalentFlow", description: "Fractional recruiters for scaling teams.", url: "#" },
      ],
      transcripts: [
        { title: "Evan Carroll APC Masterclass Call", quote: "The main bottleneck is actually talent acquisition.", url: "#" },
      ],
      resources: [
        { title: "Outbound Interview Scorecard", description: "A one-pager to standardize setter interviews.", url: "#" },
      ],
      events: [
        { title: "APC Hiring Roundtable", description: "NYC · Oct 15", url: "#" },
      ],
    };
  }

  // +3 URLs (preserve counts + q + debug)
  const withParam = (key: "np"|"nt"|"nr"|"ne", val: number) => {
    const p = new URLSearchParams();
    p.set("q", q);
    p.set("np", String(nPartnerships));
    p.set("nt", String(nTranscripts));
    p.set("nr", String(nResources));
    p.set("ne", String(nEvents));
    p.set(key, String(val));
    if (debugFlag) p.set("debug", "1");
    return `/search?${p.toString()}#${key}`;
  };
  const moreHref = {
    partnerships: withParam("np", nPartnerships + 3),
    transcripts:  withParam("nt", nTranscripts + 3),
    resources:    withParam("nr", nResources + 3),
    events:       withParam("ne", nEvents + 3),
  };
  const moreMembersHref = `/search?${new URLSearchParams({ q, m: "all", ...(debugFlag ? { debug: "1" } : {}) }).toString()}#members`;

  return (
    <main className="results">
      {/* landing background underlay (no dark overlay on results) */}
      <div className="landing-wrap" aria-hidden="true" />

      {/* BIG DEBUG BAR when &debug=1 */}
      {debugFlag && (
        <div
          style={{
            position: "fixed",
            top: 12, left: 12,
            zIndex: 2147483647,
            background: "#fff",
            color: "#111",
            borderRadius: 10,
            padding: "12px 14px",
            boxShadow: "0 10px 30px rgba(0,0,0,.45)",
            maxWidth: 560
          }}
        >
          <div style={{fontWeight: 800, marginBottom: 6}}>
            /api/ask status: {resStatus || "—"} {resError ? `· ${resError}` : ""}
          </div>
          <div style={{fontSize: 13, marginBottom: 6, lineHeight: 1.35}}>
            counts — members:{sections.members.length} · partnerships:{sections.partnerships.length} · transcripts:{sections.transcripts.length} · resources:{sections.resources.length} · events:{sections.events.length}
          </div>
          <details open>
            <summary style={{cursor:"pointer"}}>raw payload (first 2k chars)</summary>
            <pre style={{maxHeight: 280, overflow: "auto", fontSize: 12, lineHeight: 1.25, marginTop: 8, whiteSpace:"pre-wrap"}}>
{JSON.stringify(json, null, 2)?.slice(0, 2000)}
            </pre>
          </details>
          <div style={{marginTop:8, fontSize:12, opacity:.75}}>
            Tip: If everything is empty, I injected sample rows so you can verify the UI. Remove &debug=1 to go back to live data.
          </div>
        </div>
      )}

      <div className="results-shell">
        {/* LEFT half */}
        <section className="results-left">
          {/* Prompt (home style) */}
          <form action="/search" method="get" className="results-search" role="search">
            <input
              name="q"
              defaultValue={q}
              placeholder="What’s your next move?"
              className="results-input results-input--home"
              autoFocus
            />
            {debugFlag && <input type="hidden" name="debug" value="1" />}
          </form>

          {/* Members box */}
          <div id="members" className={["members-box", (sp.m === "all" ? "members-box--expanded" : "")].join(" ")}>
            {/* corner ticks motif */}
            <div className="members-title-row" aria-hidden="true">
              <span className="corner left" />
              <span className="corner right" />
            </div>

            <MembersScroller scrollMode={sp.m === "all"}>
              <ul className="members-list">
                {(sections.members ?? []).slice(0, membersToShow).map((m, i) => {
                  const name = m?.title || m?.name || m?.display_name || "Member";
                  const industry = m?.industry || m?.role || m?.expertise || "";
                  const quote = m?.quote || m?.line || m?.excerpt || m?.description || m?.context;
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

            {/* Load more (visible when additional members exist) */}
            {(sp.m !== "all") && (sections.members?.length ?? 0) > MEMBERS_INITIAL ? (
              <div className="load-more-row">
                <Link href={moreMembersHref} className="load-more-btn">LOAD MORE</Link>
              </div>
            ) : null}
          </div>
        </section>

        {/* RIGHT half (open preview; Load more → scroll) */}
        <aside className="results-right">
          <RightSection
            id="np"
            label="PARTNERSHIPS"
            items={sections.partnerships ?? []}
            count={nPartnerships}
            scroll={nPartnerships >= 4}
            moreHref={withParam("np", nPartnerships + 3,)}
          />
          <RightSection
            id="nt"
            label="CALL LIBRARY"
            items={sections.transcripts ?? []}
            count={nTranscripts}
            scroll={nTranscripts >= 4}
            moreHref={withParam("nt", nTranscripts + 3)}
          />
          <RightSection
            id="nr"
            label="RESOURCES"
            items={sections.resources ?? []}
            count={nResources}
            scroll={nResources >= 4}
            moreHref={withParam("nr", nResources + 3)}
          />
          <RightSection
            id="ne"
            label="EVENTS"
            items={sections.events ?? []}
            count={nEvents}
            scroll={nEvents >= 4}
            moreHref={withParam("ne", nEvents + 3)}
          />

          <div className="other-footer">OTHER</div>
        </aside>
      </div>
    </main>
  );
}

/* ---- Right-side UI ---- */
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
  const open = true; // open by default to show preview
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
  const sub = item?.quote || item?.summary || item?.description || item?.context || "";
  const url = item?.url;

  return (
    <div className="right-card-inner">
      {url ? (
        <a href={url} target="_blank" rel="noreferrer" className="right-card-title">{title}</a>
      ) : (
        <div className="right-card-title">{title}</div>
      )}
      {sub ? <div className="right-card-sub">“{sub}”</div> : null}
    </div>
  );
}