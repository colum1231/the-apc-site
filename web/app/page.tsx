// web/app/search/page.tsx
import Link from "next/link";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

type SectionKey = "members" | "transcripts" | "resources" | "partnerships" | "events";

type MemberItem = {
  title: string; // "Name | Role | TG: @handle // +353 ..."
  username_url?: string;
  quote?: string;
  context?: string;
};
type TranscriptItem = {
  title: string; // "Speaker APC Mastermind Call"
  url?: string;
  quote?: string;
  context?: string;
};
type ResourceItem = {
  title: string; // "Short Name | APC Sourced Asset"
  url?: string;
  summary?: string;
};
type PartnershipItem = {
  title: string; // "Name at Business"
  url?: string;
  description?: string;
  contact_line?: string;
};
type EventItem = {
  title: string; // "Category | Location | Dates | Enquire: 123"
  url?: string;
};

type SearchResponse = {
  priority?: SectionKey;
  members?: MemberItem[];
  transcripts?: TranscriptItem[];
  resources?: ResourceItem[];
  partnerships?: PartnershipItem[];
  events?: EventItem[];
  error?: string;
};

async function fetchResults(q: string): Promise<SearchResponse> {
  const base =
    process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/+$/, "") || "";
  const res = await fetch(`${base}/api/search`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ q }),
    cache: "no-store",
  });
  // If the API returns non-200, still try to read its body
  let payload: any = null;
  try {
    payload = await res.json();
  } catch {
    payload = { error: `HTTP ${res.status}` };
  }
  return payload as SearchResponse;
}

function SectionTitle({
  children,
  href,
  arrow = true,
}: {
  children: React.ReactNode;
  href: string;
  arrow?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <Link
        href={href}
        className="uppercase tracking-wide text-sm text-neutral-300 hover:text-white"
      >
        {children}
      </Link>
      {arrow && (
        <span
          aria-hidden
          className="text-neutral-400"
          title="Expand in-place (UI-only placeholder)"
        >
          ▸
        </span>
      )}
    </div>
  );
}

function Card({
  title,
  subtitle,
  meta,
  href,
}: {
  title: string;
  subtitle?: string;
  meta?: string;
  href?: string;
}) {
  const inner = (
    <div className="rounded-xl border border-neutral-700/60 p-4 hover:border-neutral-400/60 transition">
      <div className="text-[15px] text-neutral-200">{title}</div>
      {subtitle && (
        <div className="mt-2 text-[13px] text-neutral-400 italic">“{subtitle}”</div>
      )}
      {meta && <div className="mt-1 text-[12px] text-neutral-500">{meta}</div>}
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}

function SectionBlock({
  title,
  href,
  children,
}: {
  title: string;
  href: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-8">
      <SectionTitle href={href}>{title}</SectionTitle>
      <div className="mt-3 space-y-3">{children}</div>
      <div className="mt-3">
        <Link
          href={href}
          className="text-xs text-neutral-400 hover:text-white underline underline-offset-4"
        >
          Load more
        </Link>
      </div>
    </section>
  );
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  const sp = await searchParams;
  const raw = sp?.q;
  const q = Array.isArray(raw) ? raw[0] : raw || "";

  if (!q) {
    return (
      <main className="min-h-screen bg-black text-white px-6 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <Link href="/" className="text-xs text-neutral-400 hover:text-white">
              ← Back
            </Link>
          </div>
          <h1 className="text-2xl font-semibold">Search</h1>
          <p className="mt-2 text-neutral-400">Type something on the landing page.</p>
        </div>
      </main>
    );
  }

  const data = await fetchResults(q);

  // Decide priority section (default to members)
  const order: SectionKey[] = ["members", "transcripts", "resources", "partnerships", "events"];
  const priority: SectionKey =
    (data.priority && order.includes(data.priority) ? data.priority : "members");

  // Helper to map renderers
  const renderers: Record<SectionKey, () => React.ReactNode> = {
    members: () => {
      const items = data.members?.slice(0, 4) || [];
      if (!items.length) return <div className="text-sm text-neutral-500">No matches yet.</div>;
      return items.map((m, i) => (
        <Card
          key={`m-${i}`}
          title={m.title}
          subtitle={m.quote}
          meta={m.context}
          href={m.username_url}
        />
      ));
    },
    transcripts: () => {
      const items = data.transcripts?.slice(0, 4) || [];
      if (!items.length) return <div className="text-sm text-neutral-500">No matches yet.</div>;
      return items.map((t, i) => (
        <Card
          key={`t-${i}`}
          title={t.title}
          subtitle={t.quote}
          meta={t.context}
          href={t.url}
        />
      ));
    },
    resources: () => {
      const items = data.resources?.slice(0, 4) || [];
      if (!items.length) return <div className="text-sm text-neutral-500">No matches yet.</div>;
      return items.map((r, i) => (
        <Card
          key={`r-${i}`}
          title={r.title}
          subtitle={r.summary}
          href={r.url}
        />
      ));
    },
    partnerships: () => {
      const items = data.partnerships?.slice(0, 4) || [];
      if (!items.length) return <div className="text-sm text-neutral-500">No matches yet.</div>;
      return items.map((p, i) => (
        <Card
          key={`p-${i}`}
          title={p.title}
          subtitle={p.description}
          meta={p.contact_line}
          href={p.url}
        />
      ));
    },
    events: () => {
      const items = data.events?.slice(0, 4) || [];
      if (!items.length) return <div className="text-sm text-neutral-500">No matches yet.</div>;
      return items.map((e, i) => (
        <Card key={`e-${i}`} title={e.title} href={e.url} />
      ));
    },
  };

  // Build list of the *other* sections in descending order of relevance
  const others = order.filter((k) => k !== priority);

  // Friendly titles for headers + hrefs
  const titles: Record<SectionKey, string> = {
    members: "Members",
    transcripts: "Call Transcripts",
    resources: "Resources",
    partnerships: "Partnerships",
    events: "Events",
  };
  const hrefs: Record<SectionKey, string> = {
    members: "/members",
    transcripts: "/calls",
    resources: "/resources",
    partnerships: "/partners",
    events: "/events",
  };

  return (
    <main className="min-h-screen bg-black text-white px-6 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <Link href="/" className="text-xs text-neutral-400 hover:text-white">
            ← Back
          </Link>
          <div className="text-neutral-400 text-sm">Query: <span className="text-white">{q}</span></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* LEFT: priority category */}
          <div>
            <h2 className="mb-3 uppercase tracking-wide text-sm text-neutral-300">
              {titles[priority]}
            </h2>
            <div className="space-y-3">{renderers[priority]()}</div>
            <div className="mt-3">
              <Link
                href={`${hrefs[priority]}?q=${encodeURIComponent(q)}`}
                className="text-xs text-neutral-400 hover:text-white underline underline-offset-4"
              >
                Load more
              </Link>
            </div>
          </div>

          {/* RIGHT: other categories as headers with quick previews */}
          <div>
            {others.map((k) => (
              <SectionBlock key={k} title={titles[k]} href={`${hrefs[k]}?q=${encodeURIComponent(q)}`}>
                {renderers[k]()}
              </SectionBlock>
            ))}
          </div>
        </div>

        {/* Errors (if any) */}
        {data?.error && (
          <div className="mt-8 text-red-400 text-sm">
            Error: {data.error}
          </div>
        )}
      </div>
    </main>
  );
}