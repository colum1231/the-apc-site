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

  return (
    <main className="results">
      {/* Background image from landing; sits BEHIND content */}
      <div className="landing-wrap" aria-hidden="true" />

      {/* Shell = two equal halves. Padding-top gives room above the search. */}
      <div className="results-shell">
        {/* ================= LEFT HALF ================= */}
        <section className="results-left">
          {/* SEARCH BAR (same dimensions as home, and forced visible) */}
          <form action="/search" method="get" className="results-search" role="search">
            <input
              name="q"
              defaultValue={q}
              placeholder="What’s your next move?"
              className="results-input results-input--home results-input--force"
              autoFocus
            />
          </form>

          {/* MEMBERS BOX — leave simple sample rows so text is visible while we perfect layout */}
          <div id="members" className="members-box">
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

            <div className="load-more-row">
              <Link href="/search?q=test&m=all" className="load-more-btn">LOAD MORE</Link>
            </div>
          </div>
        </section>

        {/* ================= RIGHT HALF ================= */}
        <aside className="results-right">
          {/* All categories CLOSED by default (only headings visible) */}
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
                <Link href="/search?q=test&np=4" className="right-load-more">Load more</Link>
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
                <Link href="/search?q=test&nt=4" className="right-load-more">Load more</Link>
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
                <Link href="/search?q=test&nr=4" className="right-load-more">Load more</Link>
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
                <Link href="/search?q=test&ne=4" className="right-load-more">Load more</Link>
              </div>
            </div>
          </details>

          <div className="other-footer">OTHER</div>
        </aside>
      </div>

      {/* ====== HARD, SCOPED OVERRIDES (only for the results page) ====== */}
      <style jsx global>{`
        /* Page never scrolls; exactly one viewport tall */
        .results { height: 100vh; overflow: hidden; position: relative; }

        /* Two equal halves, invisible center divide; top/bottom padding for the shell */
        .results-shell {
          height: 100%;
          max-width: 1920px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 1fr; /* TRUE 50/50 */
          gap: 0;
          padding: 135px 0 110px; /* space for search at the top and safe bottom */
          align-items: start;
        }

        /* 110px padding from center & edges on both halves */
        .results-left  { padding: 0 110px; }
        .results-right { padding: 0 110px; }

        /* Search — force visible like home (exact dims & style) */
        .results-search { position: relative; z-index: 5; margin: 0 0 100px 0; }
        .results-input--force {
          width: 350px;
          height: 42.5px;
          border: 2px solid #545454 !important;
          border-radius: 999px;
          background: transparent;
          color: #373737;
          text-align: center;
          font-size: 16.5px;
          padding: 0 28px;
        }
        .results-input--force::placeholder { color: #545454; opacity: .6; }

        /* Members box basic sizing; transparent sides, grey corner runs */
        .members-box { position: relative; width: 740px; margin: 0 auto; padding: 60px; border: 1px solid transparent; }
        .members-box::before{
          content:""; position:absolute; inset:0; pointer-events:none;
          background:
            linear-gradient(#545454,#545454) top left  / 75px 1px no-repeat,
            linear-gradient(#545454,#545454) top right / 75px 1px no-repeat,
            linear-gradient(#545454,#545454) top left  / 1px 75px no-repeat,
            linear-gradient(#545454,#545454) top right / 1px 75px no-repeat;
        }
        .members-title-row { height: 26px; position: relative; margin-bottom: 12px; }
        .members-title-row .corner{
          position:absolute; top:0; width:46px; height:26px; opacity:.6;
          border-top:2px solid #545454; border-left:2px solid #545454;
        }
        .members-title-row .corner.right{ right:0; left:auto; border-left:0; border-right:2px solid #545454; }

        /* Typography to ensure text is visible */
        .member-name { font-weight: 700; color: #8b8989; }
        .member-meta { font-weight: 700; color: #7a7a7a; }
        .member-quote { color: #8b8989; font-style: italic; }
        .sep { opacity: .55; }

        /* Right column — CLOSED by default (only headings visible) */
        .right-acc { margin-bottom: 125px; border: 0; }
        .right-head { display:flex; align-items:center; justify-content:space-between; gap:16px; padding:0 2px; cursor: pointer; }
        .right-title { font-size: 24px; font-weight: 800; letter-spacing: .06em; color: #8b8989; }
        .right-arrow { color: #8b8989; opacity: .85; }

        /* Body content (hidden by <details> when closed) */
        .right-body { padding: 10px 2px 0 2px; }
        .right-list { list-style:none; padding:0; margin:0; display:flex; flex-direction:column; gap:20px; padding-left:25px; }
        .right-card-title { color: #8b8989; }
        .right-card-sub { color: #8b8989; opacity: .9; }

        /* Keep background behind, content above */
        .landing-wrap { z-index: 0; }
        .results-shell, .results-left, .results-right { position: relative; z-index: 1; }
      `}</style>
    </main>
  );
}