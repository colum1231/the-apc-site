"use client";

import React from "react";

function cx(...a: Array<string | false | undefined>) {
  return a.filter(Boolean).join(" ");
}

export default function RightSectionClient({
  label,
  items,
  href,
}: {
  label: string;
  items: any[];
  href: string;
}) {
  const [open, setOpen] = React.useState(false); // closed by default
  const [visible, setVisible] = React.useState(1); // show 1 when opened
  const hasMore = (items?.length ?? 0) > visible;
  const scrollMode = visible >= 4; // after first "Load more"

  const onToggle = () => {
    setOpen((o) => {
      if (!o) setVisible(1); // reset on opening
      return !o;
    });
  };

  const onMore = () => setVisible((v) => v + 3);

  const onKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onToggle();
    }
  };

  return (
    <section className={cx("right-acc", scrollMode && "right-acc--scroll")}>
      {/* header: div with role=button -> no native button background */}
      <div
        role="button"
        tabIndex={0}
        className="right-head"
        onClick={onToggle}
        onKeyDown={onKey}
        aria-expanded={open}
        aria-label={`${label} section`}
      >
        <span className="right-title">{label}</span>
        <span className="right-arrow">{open ? "▾" : "▸"}</span>
      </div>

      {open && (
        <div className={cx("right-body", scrollMode && "right-body--scroll")}>
          <ul className="right-list">
            {(items ?? []).slice(0, visible).map((it, i) => {
              const title =
                it?.title || it?.name || (label === "CALL LIBRARY" ? "Call" : "Result");
              const url = it?.url || href || "#";
              const sub =
                it?.quote || it?.summary || it?.description || it?.context || "";
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
    </section>
  );
}