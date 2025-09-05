"use client";

import React from "react";

function cx(...a: Array<string | false | undefined>) {
  return a.filter(Boolean).join(" ");
}

export default function MembersPaneClient({
  initialItems,
  q,
}: {
  initialItems: any[];
  q: string;
}) {
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

  const items = Array.isArray(initialItems) ? initialItems : [];
  const shown = items.slice(0, visible);

  const onMore = () => {
    if (!scrollMode) setScrollMode(true); // flips bottom corners to grey via CSS
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

      {/* MEMBERS BOX */}
      <section className={cx("members-box", scrollMode && "members-box--scroll")}>
        <div className="members-title-row" aria-hidden>
          <div className="corner" />
          <div className="corner right" />
        </div>

        <div
          ref={listRef}
          className={cx(
            "members-scroll",
            scrollMode && "members-scroll--scroll",
            scrollMode && scrolled && "members-scroll--topfade"
          )}
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