import dynamic from "next/dynamic";
import "../search.css";

export const metadata = { title: "Search • APC" };

const MembersPaneClient = dynamic(() => import("./MembersPaneClient"), { ssr: false });
const RightSectionClient = dynamic(() => import("./RightSectionClient"), { ssr: false });

type Member = { name: string; industry?: string; quote?: string };
type Item = { title: string; subtitle?: string; quote?: string; url?: string };
type SearchData = {
  members: Member[];
  partnerships: Item[];
  calls: Item[];
  resources: Item[];
  events: Item[];
};

async function getData(q: string): Promise<SearchData | null> {
  if (!q) return null;
  try {
    const baseUrl = typeof window === "undefined" ? process.env.NEXT_PUBLIC_BASE_URL ?? "" : "";
    const res = await fetch(`${baseUrl}/api/search?q=${encodeURIComponent(q)}`, {
      cache: "no-store",
    });
    if (!res || !res.ok) return null;
    return (await res.json()) as SearchData;
  } catch {
    return null;
  }
}

export default async function SearchPage({ searchParams }: { searchParams: { q?: string } }) {
  const q = typeof searchParams?.q === "string" ? searchParams.q : "";
  const data = await getData(q);

  const members = data?.members ?? [];
  const partnerships = data?.partnerships ?? [];
  const calls = data?.calls ?? [];
  const resources = data?.resources ?? [];
  const events = data?.events ?? [];

  return (
    <main className="apc-results-main">
      <div className="apc-results-shell">
        <section className="apc-results-left">
          <MembersPaneClient initialItems={members} q={q} />
        </section>
        <section className="apc-results-right">
          <div className="right-inner">
            <RightSectionClient label="PARTNERSHIPS" items={partnerships} href="/partnerships" />
            <RightSectionClient label="CALL LIBRARY" items={calls} href="/calls" />
            <RightSectionClient label="RESOURCES" items={resources} href="/resources" />
            <RightSectionClient label="EVENTS" items={events} href="/events" />
            <div className="other-footer">OTHER</div>
          </div>
        </section>
      </div>
    </main>
  );
}