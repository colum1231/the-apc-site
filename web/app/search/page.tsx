// app/search/page.tsx
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export default function SearchPage() {
  return (
    <main className="min-h-screen bg-black text-white p-8">
      <h1 className="text-2xl font-bold mb-4">Search</h1>
      <p className="text-neutral-400">Route is rendering (no API call yet).</p>
    </main>
  );
}