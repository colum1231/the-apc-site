// web/app/search/page.tsx
import Link from "next/link";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

type Sections = {
  members: any[];
  transcripts: any[];
  resources: any[];
  partnerships: any[];
  events: any[];
};

function getBaseUrl() {
  if (process.env.NEXT_PUBLIC_BASE_URL) return process.env.NEXT_PUBLIC_BASE_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

export default async function SearchPage(props: {
  // Next 15: searchParams is a Promise
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await props.searchParams;
  const raw = sp.q;
  const q = Array.isArray(raw) ? raw[0] : raw ?? "";

  if (!q) {
    return (
      <main className="min-h-screen bg-black text-white p-8">
        <Link href="/" className="text-neutral-400 hover:text-white">
          ← Back
        </Link>
        <h1 className="text-2xl mt-6">Search</h1>
        <p className="mt-2 text-neutral-400">Type something on the landing page.</p>
      </main>
    );
  }

  const url = `${getBaseUrl()}/api/ask?q=${encodeURIComponent(q)}`;
  const res = await fetch(url, { cache: "no-store" });

  let data: any;
  try {
    data = await res.json();
  } catch {
    data = { ok: false as const, status: res.status, body: await res.text() };
  }

  // Detect if CustomGPT returned our structured payload
  const isStructured =
    !!(data?.transcripts || data?.community_chats || data?.resources || data?.partnerships || data?.events);

  // Normalize sections
  const sections: Sections = {
    members: data?.community_chats ?? [],
    transcripts: data?.transcripts ?? [],
    resources: data?.resources ?? [],
    partnerships: data?.partnerships ?? [],
    events: data?.events ?? [],
  };

  const priorityOrder: (keyof Sections)[] = ["members", "transcripts", "resources", "partnerships", "events"];
  const chosenPriority =
    sections.members.length > 0 ? "members" : (priorityOrder.find((k) => sections[k]?.length > 0) ?? "members");
  const sideOrder = priorityOrder.filter((k) => k !== chosenPriority);

  const renderCard = (k: keyof Sections, item: any, i: number) => {
    if (k === "members") {
      const title = item?.title || item?.name || "Member";
      const quote = item?.quote;
      const handle = item?.username ? `@${String(item.username).replace(/^@/, "")}` : "";
      const meta = handle || "";
      return (
        <div
          key={`${k}-${i}`}
          className="rounded-xl border border-neutral-700/60 p-4 hover:border-neutral-400/60 transition"
        >
          <div className="text-[15px] text-neutral-200">{title}</div>
          {quote && <div className="mt-2 text-[13px] text-neutral-400 italic">“{quote}”</div>}
          {meta && <div className="mt-1 text-[12px] text-neutral-500">{meta}</div>}
        </div>
      );
    }

    if (k === "transcripts") {
      const title = item?.title || item?.name || "Transcript";
      const quote = item?.quote;
      const href = item?.url || "#";
      return (
        <a
          key={`${k}-${i}`}
          href={href}
          target={item?.url ? "_blank" : "_self"}
          className="block rounded-xl border border-neutral-700/60 p-4 hover:border-neutral-400/60 transition"
        >
          <div className="text-[15px] text-neutral-200">{title}</div>
          {quote && <div className="mt-2 text-[13px] text-neutral-400 italic">“{quote}”</div>}
        </a>
      );
    }

    if (k === "resources") {
      const title = item?.title || "Resource";
      const summary = item?.summary;
      const href = item?.url || "#";
      return (
        <a
          key={`${k}-${i}`}
          href={href}
          target={item?.url ? "_blank" : "_self"}
          className="block rounded-xl border border-neutral-700/60 p-4 hover:border-neutral-400/60 transition"
        >
          <div className="text-[15px] text-neutral-200">{title}</div>
          {summary && <div className="mt-2 text-[13px] text-neutral-400">{summary}</div>}
        </a>
      );
    }

    if (k === "partnerships") {
      const title = item?.title || "Partner";
      const line = item?.description;
      const contact = item?.contact_line;
      const href = item?.url || "#";
      return (
        <a
          key={`${k}-${i}`}
          href={href}
          target={item?.url ? "_blank" : "_self"}
          className="block rounded-xl border border-neutral-700/60 p-4 hover:border-neutral-400/60 transition"
        >
          <div className="text-[15px] text-neutral-200">{title}</div>
          {line && <div className="mt-2 text-[13px] text-neutral-400">{line}</div>}
          {contact && <div className="mt-1 text-[12px] text-neutral-500">{contact}</div>}
        </a>
      );
    }

    if (k === "events") {
      const title = item?.title || "Event";
      const href = item?.url || "#";
      return (
        <a
          key={`${k}-${i}`}
          href={href}
          target={item?.url ? "_blank" : "_self"}
          className="block rounded-xl border border-neutral-700/60 p-4 hover:border-neutral-400/60 transition"
        >
          <div className="text-[15px] text-neutral-200">{title}</div>
        </a>
      );
    }

    return (
      <div key={`${k}-${i}`} className="rounded-xl border border-neutral-700/60 p-4">
        <div className="text-[13px] text-neutral-400">Unknown item</div>
      </div>
    );
  };

  const SectionBlock = ({ k, items }: { k: keyof Sections; items: any[] }) => {
    const label =
      k === "members"
        ? "Members"
        : k === "transcripts"
        ? "Call transcripts"
        : k === "resources"
        ? "Resources"
        : k === "partnerships"
        ? "Partnerships"
        : "Events";

    return (
      <details className="group border-b border-neutral-800 py-3">
        <summary className="list-none flex items-center justify-between cursor-pointer">
          <span className="uppercase tracking-wide text-sm text-neutral-300 group-open:text-white">{label}</span>
          <span className="text-neutral-400 group-open:rotate-90 transition">▸</span>
        </summary>
        <div className="mt-3 space-y-3">
          {items.slice(0, 3).map((it, i) => renderCard(k, it, i))}
          {items.length > 3 && (
            <div className="text-right">
              <Link href={`/${k}`} className="text-xs text-neutral-400 hover:text-white underline">
                Load more
              </Link>
            </div>
          )}
        </div>
      </details>
    );
  };

  return (
    <main className="min-h-screen bg-black text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-neutral-400 hover:text-white">
            ← Back
          </Link>
          <div className="text-neutral-400">
            Your search: <span className="text-white">{q}</span>
          </div>
        </div>

        {!isStructured && (
          <pre className="mt-6 text-sm bg-neutral-900/60 rounded-lg p-4 overflow-auto">
            {JSON.stringify(data, null, 2)}
          </pre>
        )}

        {isStructured && (
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* LEFT: Priority section spans 2 columns */}
            <div className="lg:col-span-2">
              <div className="mb-3 uppercase tracking-wide text-sm text-neutral-300">
                {chosenPriority === "members"
                  ? "Members (priority)"
                  : chosenPriority === "transcripts"
                  ? "Call transcripts (priority)"
                  : `${chosenPriority.charAt(0).toUpperCase()}${chosenPriority.slice(1)} (priority)`}
              </div>
              <div className="space-y-3">
                {sections[chosenPriority].slice(0, 3).map((it, i) => renderCard(chosenPriority, it, i))}
                {sections[chosenPriority].length > 3 && (
                  <div className="text-right">
                    <Link
                      href={`/${chosenPriority}`}
                      className="text-xs text-neutral-400 hover:text-white underline"
                    >
                      Load more
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT: Other sections as collapsible lists */}
            <div className="lg:col-span-1">
              <div className="space-y-2">
                {sideOrder
                  .filter((k) => sections[k]?.length > 0)
                  .map((k) => (
                    <SectionBlock key={k} k={k} items={sections[k]} />
                  ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}