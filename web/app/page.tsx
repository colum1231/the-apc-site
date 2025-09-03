// web/app/search/page.tsx
import Link from "next/link";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

type SectionKey = "members" | "transcripts" | "resources" | "partnerships" | "events";

async function fetchResults(q: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/search`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ q }),
    cache: "no-store",
  });
  return res.json();
}

function SectionTitle({ children, href, arrow = true }: { children: React.ReactNode; href: string; arrow?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <Link href={href} className="uppercase tracking-wide text-sm text-neutral-300 hover:text-white">
        {children}
      </Link>
      {arrow && <button aria-label="expand" className="text-neutral-400 hover:text-white">▸</button>}
    </div>
  );
}

function Card({ title, subtitle, meta, href }: { title: string; subtitle?: string; meta?: string; href?: string }) {
  const inner = (
    <div className="rounded-xl border border-neutral-700/60 p-4 hover:border-neutral-400/60 transition">
      <div className="text-[15px] text-neutral-200">{title}</div>
      {subtitle && <div className="mt-2 text-[13px] text-neutral-400 italic">“{subtitle}”</div>}
      {meta && <div className="mt-1 text-[12px] text-neutral-500">{meta}</div>}
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams?: { q?: string | string[] };
}) {
  const raw = searchParams?.q;
  const q = Array.isArray(raw) ? raw[0] : raw || "";

  if (!q) {
    return (
      <main className="min-h-screen bg-black text-white p-8">
        <p className="text-neutral-400">No query supplied.</p>
      </main>
    );
  }

  const data = await fetchResults(q);

  if (data?.error) {
    return (
      <main className="min-h-screen bg-black text-white p-8">
        <p className="text-red-400">Error: {data.error}</p>
      </main>
    );
  }

  const priority: SectionKey = data.priority_category ?? "members";
  const ordering: SectionKey[] = data.ordering_right_column ?? ["transcripts","resources","partnerships","events"];
  const sections = data.sections ?? {};

  const rightSections = ordering.filter((k) => k !== priority);

  return (
    <main className="min-h-screen bg-black text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 text-neutral-400">Your search: <span className="text-neutral-200">{q}</span></div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* LEFT: priority category fills the column */}
          <section>
            <div className="mb-3 uppercase tracking-wide text-sm text-neutral-300">{priority.replace(/^\w/, c => c.toUpperCase())}</div>
            <div className="space-y-3">
              {(sections[priority] ?? []).slice(0, 4).map((item: any, i: number) => {
                if (priority === "members") {
                  return (
                    <Card
                      key={i}
                      title={item?.title || "Member"}
                      subtitle={item?.quote}
                      meta={item?.context}
                      href={item?.username_url}
                    />
                  );
                }
                if (priority === "transcripts") {
                  return (
                    <Card
                      key={i}
                      title={`${item?.name || "Speaker"} — ${item?.title || ""}`}
                      subtitle={item?.quote}
                      meta={item?.context}
                      href={item?.url}
                    />
                  );
                }
                // resources, partnerships, events
                return (
                  <Card
                    key={i}
                    title={item?.title || "Item"}
                    subtitle={"summary" in item ? item.summary : item?.description}
                    meta={item?.contact_line || item?.source}
                    href={item?.url}
                  />
                );
              })}
            </div>

            {(data?.page_info?.[priority]?.has_more) && (
              <div className="mt-4">
                <button className="text-sm text-neutral-300 border border-neutral-700 px-3 py-1 rounded-lg">
                  Load more
                </button>
              </div>
            )}
          </section>

          {/* RIGHT: other categories as collapsible rows (simple MVP) */}
          <aside className="space-y-8">
            {rightSections.map((key) => {
              const items = (sections[key] ?? []).slice(0, 4);
              return (
                <div key={key}>
                  <SectionTitle href={`/${key === "transcripts" ? "call-library" : key}`}>
                    {key.replace(/^\w/, c => c.toUpperCase())}
                  </SectionTitle>
                  <div className="mt-3 space-y-3">
                    {items.map((item: any, i: number) => {
                      if (key === "transcripts") {
                        return (
                          <Card
                            key={i}
                            title={`${item?.name || "Speaker"} — ${item?.title || ""}`}
                            subtitle={item?.quote}
                            meta={item?.context}
                            href={item?.url}
                          />
                        );
                      }
                      if (key === "members") {
                        return (
                          <Card
                            key={i}
                            title={item?.title}
                            subtitle={item?.quote}
                            meta={item?.context}
                            href={item?.username_url}
                          />
                        );
                      }
                      return (
                        <Card
                          key={i}
                          title={item?.title || "Item"}
                          subtitle={"summary" in item ? item.summary : item?.description}
                          meta={item?.contact_line || item?.source}
                          href={item?.url}
                        />
                      );
                    })}
                  </div>

                  {(data?.page_info?.[key]?.has_more) && (
                    <div className="mt-2">
                      <button className="text-xs text-neutral-300 border border-neutral-700 px-2 py-1 rounded-lg">
                        Load more
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </aside>
        </div>
      </div>
    </main>
  );
}