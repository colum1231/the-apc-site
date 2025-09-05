// web/app/search/page.tsx
import Link from "next/link";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export default function SearchPage({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const sp = searchParams ?? {};
  const get = (k: string) => {
    const v = (sp as any)[k];
    return Array.isArray(v) ? v[0] : v;
  };

  const q = get("q") ?? "";
  const m = get("m");           // members scroll toggle
  const np = get("np");         // partnerships scroll toggle
  const nt = get("nt");         // transcripts scroll toggle
  const nr = get("nr");         // resources scroll toggle
  const ne = get("ne");         // events scroll toggle

  const membersScroll = m === "all";
  const npScroll = np === "all";
  const ntScroll = nt === "all";
  const nrScroll = nr === "all";
  const neScroll = ne === "all";

  return (
    <main className="results">
      {/* background from landing, behind content */}
      <div className="landing-wrap" aria-hidden="true" />

      <div className="results-shell">
        {/* ================= LEFT HALF ================= */}
        <section className="results-left">
          {/* SEARCH BAR (same look as home) */}
          <form action="/search" method="get" className="results-search" role="search">
            <input
              name="q"
              defaultValue={q}
              placeholder="What’s your next move?"
              className="results-input results-input--home"
              autoFocus
            />
          </form>

          {/* MEMBERS BOX (unchanged from last step) */}
          <div
            id="members"
            className={`members-box ${membersScroll ? "members-box--scroll" : ""}`}
          >
            <div className="members-title-row" aria-hidden="true">
              <span className="corner left" />
              <span className="corner right" />
            </div>

            <div className="members-scroll">
              <ul className="members-list">
                <li className="member-card member-card--clean">
                  <div className="member-head">
                    <span className="member-name member-name--bold">Sample Member</span>
                    <span className="sep">|</span>
                    <span className="member-meta member-meta--bold">Recruiting</span>
                  </div>
                  <div className="member-quote">“I interviewed 12 candidates and found 2 A-players.”</div>
                </li>
                <li className="member-card member-card--clean">
                  <div className="member-head">
                    <span className="member-name member-name--bold">Jordan Lee</span>
                    <span className="sep">|</span>
                    <span className="member-meta member-meta--bold">Sales Ops</span>
                  </div>
                  <div className="member-quote">“Referrals beat cold every time.”</div>
                </li>
                <li className="member-card member-card--clean">
                  <div className="member-head">
                    <span className="member-name member-name--bold">Maya Chen</span>
                    <span className="sep">|</span>
                    <span className="member-meta member-meta--bold">Talent</span>
                  </div>
                  <div className="member-quote">“Always screen for coachability.”</div>
                </li>
                <li className="member-card member-card--clean">
                  <div className="member-head">
                    <span className="member-name member-name--bold">Chris P.</span>
                    <span className="sep">|</span>
                    <span className="member-meta member-meta--bold">Hiring</span>
                  </div>
                  <div className="member-quote">“Keep the bar high; move fast.”</div>
                </li>
              </ul>
            </div>
          </div>

          {/* Members Load more (enables scroll via ?m=all) */}
          {!membersScroll && (
            <div className="load-more-row load-more-row--members">
              <Link
                href={`/search?${new URLSearchParams({ q: q || "test", m: "all" }).toString()}`}
                className="load-more-btn"
              >
                LOAD MORE
              </Link>
            </div>
          )}
        </section>

        {/* ================= RIGHT HALF ================= */}
        <aside className="results-right">
          {/* PARTNERSHIPS */}
          <details className={`right-acc ${npScroll ? "right-acc--scroll" : ""}`} id="np">
            <summary className="right-head">
              <span className="right-title">PARTNERSHIPS</span>
              <span className="right-arrow" aria-hidden>▸</span>
            </summary>
            <div className={`right-body ${npScroll ? "right-body--scroll" : ""}`}>
              <ul className="right-list">
                <li className="right-card">
                  <div className="right-card-inner">
                    <div className="right-card-title">NetRevenue</div>
                    <div className="right-card-sub">“Specializes in recruiting setters for remote sales teams.”</div>
                  </div>
                </li>
                {npScroll && (
                  <>
                    <li className="right-card">
                      <div className="right-card-inner">
                        <div className="right-card-title">TopCloser</div>
                        <div className="right-card-sub">“Commission-only setter placement at scale.”</div>
                      </div>
                    </li>
                    <li className="right-card">
                      <div className="right-card-inner">
                        <div className="right-card-title">RevForge</div>
                        <div className="right-card-sub">“On-demand interview pipeline for outbound teams.”</div>
                      </div>
                    </li>
                  </>
                )}
              </ul>
              {!npScroll && (
                <div className="right-load-more-row">
                  <Link
                    href={`/search?${new URLSearchParams({ q: q || "test", np: "all" }).toString()}`}
                    className="right-load-more"
                  >
                    Load more
                  </Link>
                </div>
              )}
            </div>
          </details>

          {/* CALL LIBRARY */}
          <details className={`right-acc ${ntScroll ? "right-acc--scroll" : ""}`} id="nt">
            <summary className="right-head">
              <span className="right-title">CALL LIBRARY</span>
              <span className="right-arrow" aria-hidden>▸</span>
            </summary>
            <div className={`right-body ${ntScroll ? "right-body--scroll" : ""}`}>
              <ul className="right-list">
                <li className="right-card">
                  <div className="right-card-inner">
                    <div className="right-card-title">Evan Carroll APC Masterclass Call</div>
                    <div className="right-card-sub">“The main bottleneck is actually talent acquisition.”</div>
                  </div>
                </li>
                {ntScroll && (
                  <>
                    <li className="right-card">
                      <div className="right-card-inner">
                        <div className="right-card-title">Outbound Roundtable</div>
                        <div className="right-card-sub">“How to systemize referrals for volume.”</div>
                      </div>
                    </li>
                    <li className="right-card">
                      <div className="right-card-inner">
                        <div className="right-card-title">Setter Hiring Q&A</div>
                        <div className="right-card-sub">“Traits we filter for in the first pass.”</div>
                      </div>
                    </li>
                  </>
                )}
              </ul>
              {!ntScroll && (
                <div className="right-load-more-row">
                  <Link
                    href={`/search?${new URLSearchParams({ q: q || "test", nt: "all" }).toString()}`}
                    className="right-load-more"
                  >
                    Load more
                  </Link>
                </div>
              )}
            </div>
          </details>

          {/* RESOURCES */}
          <details className={`right-acc ${nrScroll ? "right-acc--scroll" : ""}`} id="nr">
            <summary className="right-head">
              <span className="right-title">RESOURCES</span>
              <span className="right-arrow" aria-hidden>▸</span>
            </summary>
            <div className={`right-body ${nrScroll ? "right-body--scroll" : ""}`}>
              <ul className="right-list">
                <li className="right-card">
                  <div className="right-card-inner">
                    <div className="right-card-title">Outbound Interview Scorecard</div>
                    <div className="right-card-sub">“A one-pager to standardize setter interviews.”</div>
                  </div>
                </li>
                {nrScroll && (
                  <>
                    <li className="right-card">
                      <div className="right-card-inner">
                        <div className="right-card-title">Referral Script Pack</div>
                        <div className="right-card-sub">“Short templates for warm intros.”</div>
                      </div>
                    </li>
                    <li className="right-card">
                      <div className="right-card-inner">
                        <div className="right-card-title">Scorecard Rubric</div>
                        <div className="right-card-sub">“Calibrate panel feedback quickly.”</div>
                      </div>
                    </li>
                  </>
                )}
              </ul>
              {!nrScroll && (
                <div className="right-load-more-row">
                  <Link
                    href={`/search?${new URLSearchParams({ q: q || "test", nr: "all" }).toString()}`}
                    className="right-load-more"
                  >
                    Load more
                  </Link>
                </div>
              )}
            </div>
          </details>

          {/* EVENTS */}
          <details className={`right-acc ${neScroll ? "right-acc--scroll" : ""}`} id="ne">
            <summary className="right-head">
              <span className="right-title">EVENTS</span>
              <span className="right-arrow" aria-hidden>▸</span>
            </summary>
            <div className={`right-body ${neScroll ? "right-body--scroll" : ""}`}>
              <ul className="right-list">
                <li className="right-card">
                  <div className="right-card-inner">
                    <div className="right-card-title">APC Hiring Roundtable</div>
                    <div className="right-card-sub">“NYC · Oct 15”</div>
                  </div>
                </li>
                {neScroll && (
                  <>
                    <li className="right-card">
                      <div className="right-card-inner">
                        <div className="right-card-title">APC Open House</div>
                        <div className="right-card-sub">“SF · Nov 3”</div>
                      </div>
                    </li>
                    <li className="right-card">
                      <div className="right-card-inner">
                        <div className="right-card-title">Setter Sprint</div>
                        <div className="right-card-sub">“Remote · Dec 2–6”</div>
                      </div>
                    </li>
                  </>
                )}
              </ul>
              {!neScroll && (
                <div className="right-load-more-row">
                  <Link
                    href={`/search?${new URLSearchParams({ q: q || "test", ne: "all" }).toString()}`}
                    className="right-load-more"
                  >
                    Load more
                  </Link>
                </div>
              )}
            </div>
          </details>

          <div className="other-footer">OTHER</div>
        </aside>
      </div>
    </main>
  );
}