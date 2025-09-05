// web/app/search/page.tsx
import Link from "next/link";
import * as React from "react";

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

/* Small client helper: add top-fade only when scrolled */
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

export default async function SearchPage({
  // NOTE: this is a plain object in your setup; do NOT Promise/await it
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const rawQ = searchParams?.q;
  const q = Array.isArray(rawQ) ? rawQ[0] : rawQ ?? "";

  // Members: show 4 initially; “Load more” flips to scroll mode
  const mParam = searchParams?.m;
  const membersScroll = (Array.isArray(mParam) ? mParam[0] : mParam) === "all";
  const MEMBERS_INITIAL = 4;
  const membersToShow = membersScroll ? Number.MAX_SAFE_INTEGER : MEMBERS_INITIAL;

  // Fetch results (same-origin)
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

  const moreMembersHref = `/search?${new URLSearchParams({ q, m: "all" }).toString()}#members`;

  return (
    <main className="results">
      {/* Background image like landing, but no dark overlay */}
      <div className="landing-wrap" aria-hidden="true" />

      <div className="results-shell">
        {/* LEFT half */}
        <section className="results-left">
          {/* Home-style prompt; vertical offset handled in CSS (135px) */}
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
            {/* your corner ticks bar */}
            <div className="members-title-row" aria-hidden="true">
              <span className="corner left" />
              <span className="corner right" />
            </div>

            {/* list (no bullets/dividers) */}
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

            {/* Load more (inside the box; button has subtle spinner behind text) */}
            {!membersScroll && (sections.members?.length ?? 0) > MEMBERS_INITIAL ? (
              <div className="load-more-row">
                <Link href={moreMembersHref} className="load-more-btn">LOAD MORE</Link>
              </div>
            ) : null}
          </div>
        </section>

        {/* RIGHT half (we’ll implement full behavior in Chunk B) */}
        <aside className="results-right">
          <RightSection label="PARTNERSHIPS" items={sections.partnerships ?? []} href="/partnerships" />
          <RightSection label="CALL LIBRARY" items={sections.transcripts ?? []} href="/calls" />
          <RightSection label="RESOURCES" items={sections.resources ?? []} href="/resources" />
          <RightSection label="EVENTS" items={sections.events ?? []} href="/events" />
          <div className="other-footer">OTHER</div>
        </aside>
      </div>
    </main>
  );
}

/* Temporary right-side card (Chunk B will overhaul spacing/scrolling etc.) */
function RightSection({ label, items, href }: { label: string; items: any[]; href: string }) {
  const top = (items ?? [])[0];
  return (
    <details className="right-acc" open>
      <summary className="right-head">
        <span className="right-title">{label}</span>
        <span className="right-arrow" aria-hidden>▾</span>
      </summary>
      <div className="right-body">
        {top ? (
          <ul className="right-list">
            <li className="right-card">
              <RightCard item={top} />
            </li>
          </ul>
        ) : (
          <div className="right-empty"><Link href={href}>Explore {label.toLowerCase()}</Link></div>
        )}
      </div>
    </details>
  );
}

function RightCard({ item }: { item: any }) {
  const title = item?.title || item?.name || "Untitled";
  const quote = item?.quote || item?.summary || item?.description;
  const url = item?.url;
  return (
    <div className="right-card-inner">
      {url ? (
        <a href={url} target="_blank" rel="noreferrer" className="right-card-title">{title}</a>
      ) : (
        <div className="right-card-title">{title}</div>
      )}
      {quote && <div className="right-card-sub">“{quote}”</div>}
    </div>
  );
}