"use client";

import React from "react";
import { useSearchParams, useRouter } from "next/navigation";

/* ---------- small helpers ---------- */
function cx(...a: Array<string | false | undefined>) {
  return a.filter(Boolean).join(" ");
}
type Sections = {
  members: any[];
  transcripts: any[];
  resources: any[];
  partnerships: any[];
  events: any[];
};
const EMPTY: Sections = {
  members: [],
  transcripts: [],
  resources: [],
  partnerships: [],
  events: [],
};

/* ---------- client fetch with strong guards ---------- */
async function fetchSections(q: string, signal?: AbortSignal): Promise<Sections> {
  if (!q) return EMPTY;
  try {
    const res = await fetch(`/api/ask?q=${encodeURIComponent(q)}`, {
      cache: "no-store",
      signal,
    });

    // Non-200 or non-JSON? return empty safely.
    if (!res.ok) return EMPTY;
    const ct = res.headers.get("content-type") || "";
    if (!ct.includes("application/json")) return EMPTY;

    const data: any = await res.json().catch(() => null);
    if (!data) return EMPTY;
    const maybe = data?.data ?? data;

    // direct structured
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

    // JSON fenced in string
    const block = typeof maybe?.openai_response === "string"
      ? maybe.openai_response.match(/```json\s*([\s\S]*?)\s*```/i)
      : null;

    if (block?.[1]) {
      try {
        const parsed = JSON.parse(block[1]);
        return {
          members: parsed?.community_chats?.items ?? [],
          transcripts: parsed?.transcripts?.items ?? [],
          resources: parsed?.resources?.items ?? [],
          partnerships: parsed?.partnerships?.items ?? [],
          events: parsed?.events?.items ?? [],
        };
      } catch {
        return EMPTY;
      }
    }

    return EMPTY;
  } catch {
    return EMPTY;
  }
}

/* ======================= PAGE (client) ======================= */
export default function SearchPage() {
  const params = useSearchParams();
  const router = useRouter();
  const q = params.get("q") ?? "";

  const [sections, setSections] = React.useState<Sections>(EMPTY);
  const [loading, setLoading] = React.useState<boolean>(!!q);
  const [err, setErr] = React.useState<string | null>(null);

  React.useEffect(() => {
    const ctrl = new AbortController();
    setLoading(!!q);
    setErr(null);
    setSections(EMPTY);
    if (!q) return;

    fetchSections(q, ctrl.signal)
      .then((s) => setSections(s))
      .catch(() => setErr("Failed to load."))
      .finally(() => setLoading(false));

    return () => ctrl.abort();
  }, [q]);

  // ----- members pane local UI state
  const [membersVisible, setMembersVisible] = React.useState(4);
  const [membersExpanded, setMembersExpanded] = React.useState(false);
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

  const shownMembers = (sections.members ?? []).slice(0, membersVisible);

  // ----- right category state
  const [openPartnerships, setOpenPartnerships] = React.useState(false);
  const [openTranscripts, setOpenTranscripts] = React.useState(false);
  const [openResources, setOpenResources] = React.useState(false);
  const [openEvents, setOpenEvents] = React.useState(false);

  const [visPart, setVisPart] = React.useState(1);
  const [visTrans, setVisTrans] = React.useState(1);
  const [visRes, setVisRes] = React.useState(1);
  const [visEvt, setVisEvt] = React.useState(1);

  const loadMoreBtn = (hasMore: boolean, onClick: () => void) =>
    hasMore ? (
      <div className="right-load-more-row">
        <button type="button" className="right-load-more" onClick={onClick}>
          Load more
        </button>
      </div>
    ) : null;

  const onSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const nextQ = String(fd.get("q") || "");
    router.push(`/search?q=${encodeURIComponent(nextQ)}`);
  };

  return (
    <main className="results">
      <div className="results-shell">
        {/* ========== LEFT (search + members) ========== */}
        <div className="results-left">
          <form className="results-search" role="search" onSubmit={onSubmit}>
            <input
              name="q"
              defaultValue={q}
              placeholder="Your next move...."
              className="results-input results-input--home"
            />
          </form>

          <section
            className={cx("members-box", membersExpanded && "members-box--expanded")}
            aria-label="Members"
          >
            <div
              ref={listRef}
              className={cx(
                "members-scroll",
                membersExpanded && "members-scroll--scroll",
                scrolled && "members-scroll--topfade"
              )}
            >
              <ul className="members-list">
                {shownMembers.map((m, i) => {
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
                {!loading && shownMembers.length === 0 && (
                  <li className="member-card member-card--clean">
                    <div className="member-quote">“No results found.”</div>
                  </li>
                )}
              </ul>
            </div>

            {(sections.members?.length ?? 0) > shownMembers.length && (
              <div className="load-more-row">
                <button
                  type="button"
                  className="load-more-btn"
                  onClick={() => {
                    setMembersVisible((v) => v + 3);
                    setMembersExpanded(true);
                  }}
                >
                  LOAD MORE
                </button>
              </div>
            )}
          </section>
        </div>

        {/* ========== RIGHT (categories; closed by default) ========== */}
        <aside className="results-right">
          {/* Partnerships */}
          <details
            className={cx("right-acc", openPartnerships && "right-acc--open")}
            open={openPartnerships}
            onToggle={(e) => setOpenPartnerships((e.target as HTMLDetailsElement).open)}
          >
            <summary className="right-head">
              <span className="right-title">PARTNERSHIPS</span>
              <span className="right-arrow">▸</span>
            </summary>

            {openPartnerships && (
              <div className={cx("right-body", visPart > 3 && "right-body--scroll")}>
                <ul className="right-list">
                  {(sections.partnerships ?? [])
                    .slice(0, visPart)
                    .map((it, i) => {
                      const title = it?.title || it?.name || "Partnership";
                      const sub = it?.description || it?.summary || it?.quote || "";
                      const url = it?.url || "#";
                      return (
                        <li key={`p-${i}`} className="right-card">
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
                {loadMoreBtn(
                  (sections.partnerships?.length ?? 0) > visPart,
                  () => setVisPart((v) => v + 3)
                )}
              </div>
            )}
          </details>

          {/* Call Library */}
          <details
            className={cx("right-acc", openTranscripts && "right-acc--open")}
            open={openTranscripts}
            onToggle={(e) => setOpenTranscripts((e.target as HTMLDetailsElement).open)}
          >
            <summary className="right-head">
              <span className="right-title">CALL LIBRARY</span>
              <span className="right-arrow">▸</span>
            </summary>

            {openTranscripts && (
              <div className={cx("right-body", visTrans > 3 && "right-body--scroll")}>
                <ul className="right-list">
                  {(sections.transcripts ?? [])
                    .slice(0, visTrans)
                    .map((it, i) => {
                      const title = it?.title || it?.name || "Call";
                      const sub = it?.quote || it?.summary || it?.description || "";
                      const url = it?.url || "#";
                      return (
                        <li key={`t-${i}`} className="right-card">
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
                {loadMoreBtn(
                  (sections.transcripts?.length ?? 0) > visTrans,
                  () => setVisTrans((v) => v + 3)
                )}
              </div>
            )}
          </details>

          {/* Resources */}
          <details
            className={cx("right-acc", openResources && "right-acc--open")}
            open={openResources}
            onToggle={(e) => setOpenResources((e.target as HTMLDetailsElement).open)}
          >
            <summary className="right-head">
              <span className="right-title">RESOURCES</span>
              <span className="right-arrow">▸</span>
            </summary>

            {openResources && (
              <div className={cx("right-body", visRes > 3 && "right-body--scroll")}>
                <ul className="right-list">
                  {(sections.resources ?? [])
                    .slice(0, visRes)
                    .map((it, i) => {
                      const title = it?.title || it?.name || "Resource";
                      const sub = it?.description || it?.summary || it?.quote || "";
                      const url = it?.url || "#";
                      return (
                        <li key={`r-${i}`} className="right-card">
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
                {loadMoreBtn(
                  (sections.resources?.length ?? 0) > visRes,
                  () => setVisRes((v) => v + 3)
                )}
              </div>
            )}
          </details>

          {/* Events */}
          <details
            className={cx("right-acc", openEvents && "right-acc--open")}
            open={openEvents}
            onToggle={(e) => setOpenEvents((e.target as HTMLDetailsElement).open)}
          >
            <summary className="right-head">
              <span className="right-title">EVENTS</span>
              <span className="right-arrow">▸</span>
            </summary>

            {openEvents && (
              <div className={cx("right-body", visEvt > 3 && "right-body--scroll")}>
                <ul className="right-list">
                  {(sections.events ?? [])
                    .slice(0, visEvt)
                    .map((it, i) => {
                      const name = it?.title || it?.name || "Event";
                      const meta = [
                        it?.location,
                        it?.dates || it?.date_range,
                      ].filter(Boolean).join(" | ");
                      const url = it?.url || "#";
                      return (
                        <li key={`e-${i}`} className="right-card">
                          <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="right-card-title"
                          >
                            {name}
                          </a>
                          {!!meta && <div className="right-card-sub">{meta}</div>}
                          <div className="asset-sep" />
                        </li>
                      );
                    })}
                </ul>
                {loadMoreBtn(
                  (sections.events?.length ?? 0) > visEvt,
                  () => setVisEvt((v) => v + 3)
                )}
              </div>
            )}
          </details>

          <div className="other-footer">OTHER</div>
        </aside>
      </div>
    </main>
  );
}