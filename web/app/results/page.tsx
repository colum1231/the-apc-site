import { Suspense } from "react";
import ResultsClient from "./client";

// make sure Next.js doesn't try to prerender with static data
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export default function Page() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-black text-white p-8">Loading…</main>}>
      <ResultsClient />
    </Suspense>
  );
}