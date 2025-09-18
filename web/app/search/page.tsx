import type { Metadata } from "next";
import "./search.css"; // Add this import for layout styles
export const metadata: Metadata = { title: "Search • APC" };

/** --- Types that match your API shape (keep loose) --- */
type Member = { name: string; industry?: string; quote?: string };
type Item = { title: string; subtitle?: string; quote?: string; url?: string };
type SearchData = {
  members: Member[];
  partnerships: Item[];
  calls: Item[];
  resources: Item[];
  events: Item[];
};

/** Helper: same-origin fetch with no caching */
async function getData(q: string): Promise<SearchData | null> {
  if (!q) return null;
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/api/search?q=${encodeURIComponent(q)}`, {
      cache: "no-store",
      // If NEXT_PUBLIC_BASE_URL isn't set, fall back to relative (works at runtime)
    }).catch(() => fetch(`/api/search?q=${encodeURIComponent(q)}`, { cache: "no-store" } as any));
    if (!res || !res.ok) return null;
    return (await res.json()) as SearchData;
  } catch {
    return null;
  }
}

export default function Search() {
  return <div>Search Page</div>;
}