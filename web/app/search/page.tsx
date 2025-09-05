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
  const rawQ = sp.q;
  const q = Array.isArray(rawQ) ? rawQ[0] : rawQ ?? "";
  const rawM = sp.m;
  const m = Array.isArray(rawM) ? rawM[0] : rawM;
  const membersScroll = m === "all"; // only scroll after "Load more"

  return (
    <main className="results">
      {/* landing background image behind content */}
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

          {/* MEMBERS BOX */}
          <div
            id="members"
            className={`members-box ${membersScroll ? "members-box--scroll" : ""}`}
          >
            {/* small corner ticks motif on the real box only */}
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

          {/* Load more CTA: toggles scroll via ?m=all and stays ~170px from bottom */}
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
          {/* Closed by default; headings only until clicked */}
          <details className="right-acc" id="np">
            <summary className="right-head">
              <span className="right-title">PARTNERSHIPS</span>
              <span className="right-arrow" aria-hidden>▸</span>
            </summary>
            <div className="right-body">
              <ul className="right-list">
                <li className="right-card">
                  <div className="right-card-inner">
                    <div className="right-card-title">NetRevenue</div>
                    <div className="right-card-sub">“Specializes in recruiting setters for remote sales teams.”</div>
                  </div>
                </li>
              </ul>
              <div className="right-load-more-row">
                <Link href={`/search?${new URLSearchParams({ q: q || "test", np: "4" }).toString()}`} className="right-load-more">Load more</Link>
              </div>
            </div>
          </details>

          <details className="right-acc" id="nt">
            <summary className="right-head">
              <span className="right-title">CALL LIBRARY</span>
              <span className="right-arrow" aria-hidden>▸</span>
            </summary>
            <div className="right-body">
              <ul className="right-list">
                <li className="right-card">
                  <div className="right-card-inner">
                    <div className="right-card-title">Evan Carroll APC Masterclass Call</div>
                    <div className="right-card-sub">“The main bottleneck is actually talent acquisition.”</div>
                  </div>
                </li>
              </ul>
              <div className="right-load-more-row">
                <Link href={`/search?${new URLSearchParams({ q: q || "test", nt: "4" }).toString()}`} className="right-load-more">Load more</Link>
              </div>
            </div>
          </details>

          <details className="right-acc" id="nr">
            <summary className="right-head">
              <span className="right-title">RESOURCES</span>
              <span className="right-arrow" aria-hidden>▸</span>
            </summary>
            <div className="right-body">
              <ul className="right-list">
                <li className="right-card">
                  <div className="right-card-inner">
                    <div className="right-card-title">Outbound Interview Scorecard</div>
                    <div className="right-card-sub">“A one-pager to standardize setter interviews.”</div>
                  </div>
                </li>
              </ul>
              <div className="right-load-more-row">
                <Link href={`/search?${new URLSearchParams({ q: q || "test", nr: "4" }).toString()}`} className="right-load-more">Load more</Link>
              </div>
            </div>
          </details>

          <details className="right-acc" id="ne">
            <summary className="right-head">
              <span className="right-title">EVENTS</span>
              <span className="right-arrow" aria-hidden>▸</span>
            </summary>
            <div className="right-body">
              <ul className="right-list">
                <li className="right-card">
                  <div className="right-card-inner">
                    <div className="right-card-title">APC Hiring Roundtable</div>
                    <div className="right-card-sub">“NYC · Oct 15”</div>
                  </div>
                </li>
              </ul>
              <div className="right-load-more-row">
                <Link href={`/search?${new URLSearchParams({ q: q || "test", ne: "4" }).toString()}`} className="right-load-more">Load more</Link>
              </div>
            </div>
          </details>

          <div className="other-footer">OTHER</div>
        </aside>
      </div>
    </main>
  );
}