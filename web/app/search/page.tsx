// app/search/page.tsx
import Link from "next/link";

// ------- server settings -------
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

function getBaseUrl() {
  if (process.env.NEXT_PUBLIC_BASE_URL) return process.env.NEXT_PUBLIC_BASE_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

import MembersPaneClient from "./MembersPaneClient";
import RightSectionClient from "./RightSectionClient";

/* ------- server page ------- */
export default async function SearchPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const raw = searchParams?.q;
  const q = Array.isArray(raw) ? raw[0] : raw ?? "";

  if (!q) {
    return (
      <main className="min-h-screen bg-black text-white p-8">
        <Link href="/" className="text-neutral-400 hover:text-white">← Back</Link>
        <h1 className="text-2xl mt-6">Search</h1>
        <p className="mt-2 text-neutral-400">Type something on the landing page.</p>
      </main>
    );
  }

  // default empty sections
  let sections = {
    members: [] as any[],
    transcripts: [] as any[],
    resources: [] as any[],
    partnerships: [] as any[],
    events: [] as any[],
  };

  // fetch & normalize
  try {
    const url = `${getBaseUrl()}/api/ask?q=${encodeURIComponent(q)}`;
    const res = await fetch(url, { cache: "no-store" });

    let data: any = {};
    try {
      data = await res.json();
    } catch {
      data = {};
    }

    const maybe = data?.data || data;

    const tryParseBlock = (s: string) => {
      const m = s.match(/```json\s*([\s\S]*?)\s*```/i);
      if (!m) return null;
      try { return JSON.parse(m[1]); } catch { return null; }
    };

    if (
      maybe?.transcripts ||
      maybe?.resources ||
      maybe?.partnerships ||
      maybe?.events ||
      maybe?.community_chats
    ) {
      sections = {
        members: maybe?.community_chats ?? [],
        transcripts: maybe?.transcripts?.items ?? maybe?.transcripts ?? [],
        resources: maybe?.resources?.items ?? maybe?.resources ?? [],
        partnerships: maybe?.partnerships?.items ?? maybe?.partnerships ?? [],
        events: maybe?.events?.items ?? maybe?.events ?? [],
      };
    } else if (typeof maybe?.openai_response === "string") {
      const parsed = tryParseBlock(maybe.openai_response);
      if (parsed) {
        sections = {
          members: parsed?.community_chats?.items ?? [],
          transcripts: parsed?.transcripts?.items ?? [],
          resources: parsed?.resources?.items ?? [],
          partnerships: parsed?.partnerships?.items ?? [],
          events: parsed?.events?.items ?? [],
        };
      }
    }
  } catch {
    // keep sections empty on failure
  }

  const rightOrder = ["partnerships", "transcripts", "resources", "events"] as const;

  return (
    <main className="results">
      <div className="results-shell">
        {/* LEFT (search + members) */}
        <MembersPaneClient initialItems={sections.members ?? []} q={q} />

        {/* RIGHT (headers closed by default; preview→scroll) */}
        <aside className="results-right">
          {rightOrder.map((k) => (
            <RightSectionClient
              key={k}
              label={
                k === "transcripts"
                  ? "CALL LIBRARY"
                  : k === "resources"
                  ? "RESOURCES"
                  : k === "partnerships"
                  ? "PARTNERSHIPS"
                  : "EVENTS"
              }
              items={(sections as any)[k] ?? []}
              href={`/${k}`}
            />
          ))}
          <div className="other-footer">OTHER</div>
        </aside>
      </div>
    </main>
  );
}