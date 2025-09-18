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
  const LOAD_COUNT = 4;
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

  // Sort members by priority if a 'priority' field exists, otherwise as-is
  const items = Array.isArray(initialItems) ? [...initialItems] : [];
  items.sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));
  const shown = items.slice(0, visible);

  const onMore = () => {
    setVisible((v) => v + LOAD_COUNT);
    setScrollMode(true);
  };

  // Make the list scrollable if height exceeds viewport
  const scrollableStyle: React.CSSProperties = scrollMode
    ? {
        maxHeight: "60vh",
        overflowY: "auto" as "auto",
      }
    : {};

  return (
    <div
      style={{
        minHeight: "100vh",
        minWidth: "100vw",
        backgroundImage: "url('/res+cat_back.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
        backgroundRepeat: "no-repeat",
        zIndex: 0,
        position: "relative",
        backgroundColor: "#000", // fallback
      }}
    >
      <div className="results-left">
        <form action="/search" method="get" className="results-search" role="search">
          <input
            name="q"
            defaultValue={q}
            placeholder="Your next move...."
            className="input results-input results-input--home"
            autoFocus
          />
        </form>
        <section className={cx("members-box", scrollMode && "members-box--scroll")}>
          <div
            ref={listRef}
            className={cx(
              "members-scroll",
              scrollMode && "members-scroll--scroll",
              scrollMode && scrolled && "members-scroll--topfade"
            )}
            style={scrollableStyle}
          >
            <ul className="members-list" style={{ listStyle: "none", paddingLeft: 0 }}>
              {shown.map((m, i) => {
                const name = m?.name || m?.title || "Member";
                const role = m?.role || m?.industry || m?.subtitle || "";
                const quote = m?.quote || m?.context || "";
                return (
                  <li key={`m-${i}`} className="member-card member-card--clean" style={{ border: "none", padding: 0 }}>
                    <div className="member-head">
                      <span className="member-name" style={{ fontWeight: 700, fontSize: "120%" }}>{name}</span>
                      {role && (
                        <span className="member-meta" style={{ fontWeight: 700, fontSize: "120%", marginLeft: 8 }}>{role}</span>
                      )}
                    </div>
                    {quote && <div className="member-quote" style={{ fontSize: "80%" }}>“{quote}”</div>}
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
                Load More
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}