// app/search/page.tsx
import Link from "next/link";

// ------- server settings -------
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

function getBaseUrl() {
  if (process.env.NEXT_PUBLIC_BASE_URL) return process.env.NEXT_PUBLIC_BASE_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

/* eslint-disable @next/next/no-img-element */
import React from "react";
function cx(...a: Array<string | false | undefined>) {
  return a.filter(Boolean).join(" ");
}

/* ===========================
   MEMBERS (client) 
   - 4 shown by default
   - clicking LOAD MORE switches to scroll mode (+3 each click)
   - when scroll mode is active, wrapper gets .members-box--scroll to flip bottom corners to grey
=========================== */
function MembersPaneClient({
  initialItems,
  q,
}: {
  initialItems: any[];
  q: string;
}) {
  "use client";

  const INITIAL = 4;
  const [visible, setVisible] = React.useState(INITIAL);
  const [scrollMode, setScrollMode] = React.useState(false);
  const listRef = React.useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const onScroll = () => setScrolled(el.scrollTop > 2);
    el.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  const items = initialItems ?? [];
  const shown = items.slice(0, visible);

  const onMore = () => {
    if (!scrollMode) setScrollMode(true); // flips bottom corners grey via CSS (.members-box--scroll)
    setVisible((v) => v + 3);
  };

  return (
    <div className="results-left">
      {/* search box – same look/size as landing */}
      <form action="/search" method="get" className="results-search" role="search">
        <input
          name="q"
          defaultValue={q}
          placeholder="Your next move...."
          className="input results-input results-input--home"
          autoFocus
        />
      </form>

      {/* MEMBERS BOX (centered within left half) */}
      <section className={cx("members-box", scrollMode && "members-box--scroll")}>
        {/* tiny corner ticks belong to this header only (global CSS hides all other .corner on results) */}
        <div className="members-title-row" aria-hidden>
          <div className="corner" />
          <div className="corner right" />
        </div>

        <div
          ref={listRef}
          className={cx(
            "members-scroll",
            scrollMode && "members-box--scroll members-scroll", // keep same class when scrollMode on
            scrollMode && "members-scroll", // ensure class remains
            scrollMode && "members-scroll--scroll", // overflow + fades top/bottom
            scrollMode && scrolled && "members-scroll--topfade"
          )}
          style={scrollMode ? undefined : undefined}
        >
          <ul className="members-list">
            {shown.map((m, i) => {
              const name = m?.name || m?.title || "Member";
              const role = m?.role || m?.industry || m?.subtitle || "";
              const quote = m?.quote || m?.context || "";
              return (
                <li key={`m-${i}`} className="member-card member-card--clean">
                  <div className="member-head">
                    <span className="member-name">{name}</span>
                    {role && (
                      <>
                        <span className="sep">|</span>
                        <span className="member-meta">{role}</span>
                      </>
                    )}
                  </div>
                  {quote && <div className="member-quote">“{quote}”</div>}
                </li>
              );
            })}
          </ul>
        </div>

        {/* Members "LOAD MORE" (centered). Appears if there are more items than shown. */}
        {items.length > shown.length && (
          <div className="load-more-row load-more-row--members">
            <button
              className="load-more-btn"
              type="button"
              onClick={onMore}
              aria-label="Load more members"
            >
              LOAD MORE
            </button>
          </div>
        )}
      </section>
    </div>
  );
}

/* ===========================
   RIGHT CATEGORY (client)
   - default CLOSED
   - when opened: show 1 asset (10px gap, 25px indent via CSS)
   - clicking "Load more" => visible += 3; once visible >= 4, body becomes scrollable with fades and spacing shrinks (CSS handles .right-acc--scroll)
=========================== */
function RightSectionClient({
  label,
  items,
  href,
}: {
  label: string;
  items: any[];
  href: string;
}) {
  "use client";

  const [open, setOpen] = React.useState(false); // CLOSED by default per spec
  const [visible, setVisible] = React.useState(1); // preview 1 when opened
  const hasMore = items.length > visible;
  const scrollMode = visible >= 4; // 1 preview + at least one "load more" click

  const onToggle = () => {
    setOpen((o) => {
      // when opening, reset to preview 1
      if (!o) setVisible(1);
      return !o;
    });
  };

  const onMore = () => setVisible((v) => v + 3);

  return (
    <details className={cx("right-acc", scrollMode && "right-acc--scroll")} open={open}>
      <summary className="right-head" onClick={onToggle}>
        <span className="right-title">{label}</span>
        <span className="right-arrow">{open ? "▾" : "▸"}</span>
      </summary>

      {open && (
        <div className={cx("right-body", scrollMode && "right-body--scroll")}>
          <ul className="right-list">
            {items.slice(0, visible).map((it, i) => {
              const title =
                it?.title ||
                it?.name ||
                (label === "CALL LIBRARY" ? "Call" : "Result");
              const url = it?.url || href || "#";
              const sub =
                it?.quote ||
                it?.summary ||
                it?.description ||
                it?.context ||
                "";
              return (
                <li key={`${label}-${i}`}>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="right-card-title"
                  >
                    {title}
                  </a>
                  <div className={cx("right-card-sub", !sub && "right-card-sub--empty")}>
                    {sub ? `“${sub}”` : " "}
                  </div>
                </li>
              );
            })}
          </ul>

          {hasMore && (
            <div className="right-load-more-row">
              <button
                type="button"
                className="right-load-more"
                onClick={onMore}
                aria-label={`Load more ${label.toLowerCase()}`}
              >
                Load more
              </button>
            </div>
          )}
        </div>
      )}
    </details>
  );
}

// ------- server page -------
export default async function SearchPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const raw = searchParams?.q;
  const q = Array.isArray(raw) ? raw[0] : raw ?? "";

  if (!q) {
    return (
      <main className="min-h-screen bg-black text-white p-8">
        <Link href="/" className="text-neutral-400 hover:text-white">← Back</Link>
        <h1 className="text-2xl mt-6">Search</h1>
        <p className="mt-2 text-neutral-400">Type something on the landing page.</p>
      </main>
    );
  }

  // call our API
  const url = `${getBaseUrl()}/api/ask?q=${encodeURIComponent(q)}`;
  const res = await fetch(url, { cache: "no-store" });

  let data: any;
  try {
    data = await res.json();
  } catch {
    data = { ok: false as const, status: res.status, body: await res.text() };
  }

  // Accept either structured JSON or openai_response with ```json block
  let sections = {
    members: [] as any[],
    transcripts: [] as any[],
    resources: [] as any[],
    partnerships: [] as any[],
    events: [] as any[],
  };

  const maybe = data?.data || data;

  const tryParseBlock = (s: string) => {
    const m = s.match(/```json\s*([\s\S]*?)\s*```/i);
    if (!m) return null;
    try { return JSON.parse(m[1]); } catch { return null; }
  };

  if (maybe?.transcripts || maybe?.resources || maybe?.partnerships || maybe?.events || maybe?.community_chats) {
    sections = {
      members: maybe?.community_chats ?? [],
      transcripts: maybe?.transcripts?.items ?? maybe?.transcripts ?? [],
      resources: maybe?.resources?.items ?? maybe?.resources ?? [],
      partnerships: maybe?.partnerships?.items ?? maybe?.partnerships ?? [],
      events: maybe?.events?.items ?? maybe?.events ?? [],
    };
  } else if (typeof maybe?.openai_response === "string") {
    const parsed = tryParseBlock(maybe.openai_response);
    if (parsed) {
      sections = {
        members: parsed?.community_chats?.items ?? [],
        transcripts: parsed?.transcripts?.items ?? [],
        resources: parsed?.resources?.items ?? [],
        partnerships: parsed?.partnerships?.items ?? [],
        events: parsed?.events?.items ?? [],
      };
    }
  }

  const rightOrder = (["partnerships", "transcripts", "resources", "events"] as const);

  return (
    <main className="results">
      <div className="results-shell">
        {/* LEFT (search + members) */}
        <MembersPaneClient initialItems={sections.members ?? []} q={q} />

        {/* RIGHT (categories; CLOSED by default; open to preview first card, then Load more) */}
        <aside className="results-right">
          {rightOrder.map((k) => (
            <RightSectionClient
              key={k}
              label={
                k === "transcripts"
                  ? "CALL LIBRARY"
                  : k === "resources"
                  ? "RESOURCES"
                  : k === "partnerships"
                  ? "PARTNERSHIPS"
                  : "EVENTS"
              }
              items={(sections as any)[k] ?? []}
              href={`/${k}`}
            />
          ))}
          <div className="other-footer">OTHER</div>
        </aside>
      </div>
    </main>
  );
}