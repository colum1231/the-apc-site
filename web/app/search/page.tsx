import type { Metadata } from "next";
import "./search.css"; // Add this import for layout styles
export const metadata: Metadata = { title: "Search • APC" };

/** --- Types that match your API shape (keep loose) --- */
type Member = { name: string; industry?: string; quote?: string };
type Item = { title: string; subtitle?: string; quote?: string; url?: string };
type SearchData = {
  members: Member[];
  partnerships: Item[];
  calls: Item[];
  resources: Item[];
  events: Item[];
};

/** Helper: same-origin fetch with no caching */
async function getData(q: string): Promise<SearchData | null> {
  if (!q) return null;
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/api/search?q=${encodeURIComponent(q)}`, {
      cache: "no-store",
      // If NEXT_PUBLIC_BASE_URL isn't set, fall back to relative (works at runtime)
    }).catch(() => fetch(`/api/search?q=${encodeURIComponent(q)}`, { cache: "no-store" } as any));
    if (!res || !res.ok) return null;
    return (await res.json()) as SearchData;
  } catch {
    return null;
  }
}

export default async function Page({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const q = typeof searchParams?.q === "string" ? searchParams.q : "";
  const data = await getData(q);

  const members = data?.members ?? [];
  const partnerships = data?.partnerships ?? [];
  const calls = data?.calls ?? [];
  const resources = data?.resources ?? [];
  const events = data?.events ?? [];

  return (
    <main className="apc-results-main">
      <div className="apc-results-shell">
        {/* LEFT HALF */}
        <section className="apc-results-left">
          {/* Search box at top */}
          <form action="/search" method="get" className="apc-results-search">
            <input
              className="apc-results-input--home"
              type="text"
              name="q"
              defaultValue={q}
              placeholder="Your next move…."
              aria-label="Search"
            />
          </form>
          <div className="left-inner">
            {/* Members box */}
            <div className="members-box">
              <ul className="members-list">
                {(members.length ? members.slice(0, 4) : []).map((m, i) => (
                  <li key={`${m.name}-${i}`} className="member-card">
                    <div className="member-head">
                      <span className="member-name">{m.name}</span>
                      {m.industry ? (
                        <>
                          <span className="sep">|</span>
                          <span className="member-meta">{m.industry}</span>
                        </>
                      ) : null}
                    </div>
                    {m.quote ? <div className="member-quote">“{m.quote}”</div> : null}
                  </li>
                ))}
              </ul>
              {members.length > 4 && (
                <div className="load-more-row">
                  <a className="load-more-btn" href={`/search?q=${encodeURIComponent(q)}&m=members`}>
                    LOAD MORE
                  </a>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* RIGHT HALF */}
        <section className="apc-results-right">
          <div className="right-inner">
            {/* PARTNERSHIPS */}
            <details className="right-acc">
              <summary className="right-head">
                <span className="right-title">PARTNERSHIPS</span>
                <span className="right-arrow">▸</span>
              </summary>
              <div className="right-body">
                <ul className="right-list">
                  {(partnerships.length ? partnerships.slice(0, 1) : []).map((p, i) => (
                    <li key={`p-${i}`}>
                      <div className="right-card-title">{p.title}</div>
                      {p.subtitle ? <div className="right-card-sub">“{p.subtitle}”</div> : null}
                      <div className="asset-sep" />
                    </li>
                  ))}
                </ul>
                {partnerships.length > 1 && (
                  <div className="right-load-more-row">
                    <a className="right-load-more" href={`/search?q=${encodeURIComponent(q)}&m=partnerships`}>
                      Load more
                    </a>
                  </div>
                )}
              </div>
            </details>

            {/* CALL LIBRARY */}
            <details className="right-acc">
              <summary className="right-head">
                <span className="right-title">CALL LIBRARY</span>
                <span className="right-arrow">▸</span>
              </summary>
              <div className="right-body">
                <ul className="right-list">
                  {(calls.length ? calls.slice(0, 1) : []).map((c, i) => (
                    <li key={`c-${i}`}>
                      <div className="right-card-title">{c.title}</div>
                      {c.quote ? <div className="right-card-sub">“{c.quote}”</div> : null}
                      <div className="asset-sep" />
                    </li>
                  ))}
                </ul>
                {calls.length > 1 && (
                  <div className="right-load-more-row">
                    <a className="right-load-more" href={`/search?q=${encodeURIComponent(q)}&m=calls`}>
                      Load more
                    </a>
                  </div>
                )}
              </div>
            </details>

            {/* RESOURCES */}
            <details className="right-acc">
              <summary className="right-head">
                <span className="right-title">RESOURCES</span>
                <span className="right-arrow">▸</span>
              </summary>
              <div className="right-body">
                <ul className="right-list">
                  {(resources.length ? resources.slice(0, 1) : []).map((r, i) => (
                    <li key={`r-${i}`}>
                      <div className="right-card-title">{r.title}</div>
                      {r.subtitle ? <div className="right-card-sub">“{r.subtitle}”</div> : null}
                      <div className="asset-sep" />
                    </li>
                  ))}
                </ul>
                {resources.length > 1 && (
                  <div className="right-load-more-row">
                    <a className="right-load-more" href={`/search?q=${encodeURIComponent(q)}&m=resources`}>
                      Load more
                    </a>
                  </div>
                )}
              </div>
            </details>

            {/* EVENTS */}
            <details className="right-acc">
              <summary className="right-head">
                <span className="right-title">EVENTS</span>
                <span className="right-arrow">▸</span>
              </summary>
              <div className="right-body">
                <ul className="right-list">
                  {(events.length ? events.slice(0, 1) : []).map((e, i) => (
                    <li key={`e-${i}`}>
                      <div className="right-card-title">{e.title}</div>
                      {e.subtitle ? <div className="right-card-sub">“{e.subtitle}”</div> : null}
                      <div className="asset-sep" />
                    </li>
                  ))}
                </ul>
                {events.length > 1 && (
                  <div className="right-load-more-row">
                    <a className="right-load-more" href={`/search?q=${encodeURIComponent(q)}&m=events`}>
                      Load more
                    </a>
                  </div>
                )}
              </div>
            </details>

            {/* OTHER */}
            <div className="other-footer">OTHER</div>
          </div>
        </section>
      </div>
    </main>
  );
}