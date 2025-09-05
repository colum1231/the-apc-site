// app/search/page.tsx
import Link from "next/link";
import React from "react";

/* ------- server settings ------- */
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

/* ------- helpers ------- */
function cx(...a: Array<string | false | undefined>) {
  return a.filter(Boolean).join(" ");
}
function getBaseUrl() {
  if (process.env.NEXT_PUBLIC_BASE_URL) return process.env.NEXT_PUBLIC_BASE_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

/* ================== CLIENT: Members (left) ================== */
function MembersPaneClient({
  initialItems,
  q,
}: {
  initialItems: any[];
  q: string;
}) {
  "use client";
  const [visible, setVisible] = React.useState(4);
  const [expanded, setExpanded] = React.useState(false);
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

  const items = Array.isArray(initialItems) ? initialItems : [];
  const shown = items.slice(0, visible);

  return (
    <div className="results-left">
      <form action="/search" method="get" className="results-search" role="search">
        <input
          name="q"
          defaultValue={q}
          placeholder="Your next move...."
          className="results-input results-input--home"
        />
      </form>

      <section
        className={cx("members-box", expanded && "members-box--expanded")}
        aria-label="Members"
      >
        <div
          ref={listRef}
          className={cx(
            "members-scroll",
            expanded && "members-scroll--scroll",
            scrolled && "members-scroll--topfade"
          )}
        >
          <ul className="members-list">
            {shown.map((m, i) => {
              const name = m?.name || m?.title || "Sample Member";
              const industry = m?.role || m?.industry || m?.subtitle || "";
              const quote = m?.quote || m?.context || m?.summary || "";
              return (
                <li key={`m-${i}`} className="member-card member-card--clean">
                  <div className="member-head">
                    <div className="member-name">{name}</div>
                    {industry && <span className="sep">|</span>}
                    {industry && <div className="member-meta">{industry}</div>}
                  </div>
                  {quote && <div className="member-quote">“{quote}”</div>}
                </li>
              );
            })}
          </ul>
        </div>

        {items.length > shown.length && (
          <div className="load-more-row">
            <button
              type="button"
              className="load-more-btn"
              onClick={() => {
                setVisible((v) => v + 3);
                setExpanded(true);
              }}
            >
              LOAD MORE
            </button>
          </div>
        )}
      </section>
    </div>
  );
}

/* ================== CLIENT: Right categories ================== */
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
  const [open, setOpen] = React.useState(false);
  const [visible, setVisible] = React.useState(1);
  const hasMore = (items?.length ?? 0) > visible;

  return (
    <details className={cx("right-acc", open && "right-acc--open")} open={open}>
      <summary
        className="right-head"
        onClick={(e) => {
          e.preventDefault();
          setOpen((o) => !o);
        }}
        aria-expanded={open}
      >
        <span className="right-title">{label}</span>
        <span className="right-arrow">▸</span>
      </summary>

      {open && (
        <div className={cx("right-body", visible > 3 && "right-body--scroll")}>
          <ul className="right-list">
            {(items ?? []).slice(0, visible).map((it, i) => {
              const title =
                it?.title ||
                it?.name ||
                (label.toUpperCase() === "CALL LIBRARY" ? "Transcript" : "Result");
              const url = it?.url || href || "#";
              const sub =
                it?.quote || it?.summary || it?.description || it?.context || "";
              return (
                <li key={`${label}-${i}`} className="right-card">
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="right-card-title"
                  >
                    {title}
                  </a>
                  {!!sub && <div className="right-card-sub">“{sub}”</div>}
                  <div className="asset-sep" />
                </li>
              );
            })}
          </ul>

          {hasMore && (
            <div className="right-load-more-row">
              <button
                type="button"
                className="right-load-more"
                onClick={() => setVisible((v) => v + 3)}
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

/* ================== SERVER: safe fetch & normalize ================== */
async function safeFetchSections(q: string) {
  const sections = {
    members: [] as any[],
    transcripts: [] as any[],
    resources: [] as any[],
    partnerships: [] as any[],
    events: [] as any[],
  };

  try {
    const url = `${getBaseUrl()}/api/ask?q=${encodeURIComponent(q)}`;
    const res = await fetch(url, { cache: "no-store" });

    if (!res) return sections;

    const ct = res.headers.get("content-type") || "";
    if (!ct.includes("application/json")) {
      // non-JSON reply: don’t parse, just bail to empty sections
      return sections;
    }

    const data = await res.json().catch(() => null);
    if (!data) return sections;

    // Common shapes we’ve seen
    const maybe = data?.data ?? data;

    const tryParseBlock = (s: string) => {
      const m = s?.match?.(/```json\s*([\s\S]*?)\s*```/i);
      if (!m) return null;
      try {
        return JSON.parse(m[1]);
      } catch {
        return null;
      }
    };

    if (
      maybe?.transcripts ||
      maybe?.resources ||
      maybe?.partnerships ||
      maybe?.events ||
      maybe?.community_chats
    ) {
      return {
        members: maybe?.community_chats ?? [],
        transcripts: maybe?.transcripts?.items ?? maybe?.transcripts ?? [],
        resources: maybe?.resources?.items ?? maybe?.resources ?? [],
        partnerships: maybe?.partnerships?.items ?? maybe?.partnerships ?? [],
        events: maybe?.events?.items ?? maybe?.events ?? [],
      };
    }

    if (typeof maybe?.openai_response === "string") {
      const parsed = tryParseBlock(maybe.openai_response);
      if (parsed) {
        return {
          members: parsed?.community_chats?.items ?? [],
          transcripts: parsed?.transcripts?.items ?? [],
          resources: parsed?.resources?.items ?? [],
          partnerships: parsed?.partnerships?.items ?? [],
          events: parsed?.events?.items ?? [],
        };
      }
    }

    return sections;
  } catch {
    // Any throw — return safe empties
    return sections;
  }
}

/* ================== PAGE ================== */
export default async function SearchPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const raw = searchParams?.q;
  const q = Array.isArray(raw) ? raw[0] : raw ?? "";

  if (!q) {
    return (
      <main className="results">
        <div className="results-shell">
          <div className="results-left">
            <form action="/search" method="get" className="results-search" role="search">
              <input
                name="q"
                placeholder="Your next move...."
                className="results-input results-input--home"
                autoFocus
              />
            </form>
          </div>
          <aside className="results-right">
            <div className="other-footer">OTHER</div>
          </aside>
        </div>
      </main>
    );
  }

  const sections = await safeFetchSections(q);

  return (
    <main className="results">
      <div className="results-shell">
        {/* LEFT: search + members */}
        <MembersPaneClient initialItems={sections.members ?? []} q={q} />

        {/* RIGHT: categories (closed by default) */}
        <aside className="results-right">
          <RightSectionClient
            label="PARTNERSHIPS"
            items={sections.partnerships ?? []}
            href="/partnerships"
          />
          <RightSectionClient
            label="CALL LIBRARY"
            items={sections.transcripts ?? []}
            href="/transcripts"
          />
          <RightSectionClient
            label="RESOURCES"
            items={sections.resources ?? []}
            href="/resources"
          />
          <RightSectionClient
            label="EVENTS"
            items={sections.events ?? []}
            href="/events"
          />

          <div className="other-footer">OTHER</div>
        </aside>
      </div>
    </main>
  );
}