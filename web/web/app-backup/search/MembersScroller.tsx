// web/app/search/MembersScroller.tsx
"use client";

import * as React from "react";

export default function MembersScroller({
  children,
  scrollMode,
}: {
  children: React.ReactNode;
  scrollMode: boolean;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onScroll = () => setScrolled(el.scrollTop > 0);
    el.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      ref={ref}
      className={[
        "members-scroll",
        scrollMode ? "members-scroll--scroll" : "",
        scrolled ? "members-scroll--topfade" : "",
      ].join(" ")}
    >
      {children}
    </div>
  );
}