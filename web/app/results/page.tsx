"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function Results() {
  const q = useSearchParams().get("q") || "";
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!q) return;
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const r = await fetch("/api/ask", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ prompt: q }),
        });
        const j = await r.json();
        if (!r.ok) throw new Error(j?.error || "Failed");
        setData(j);
      } catch (e: any) {
        setErr(e.message || "Error");
      } finally {
        setLoading(false);
      }
    })();
  }, [q]);

  return (
    <main className="min-h-screen bg-black text-white p-8">
      <h1 className="text-2xl font-bold mb-4">Results</h1>
      <p className="text-neutral-400 mb-6">Your search: {q}</p>

      {loading && <div className="text-neutral-500">Searching…</div>}
      {err && <div className="text-red-400">Error: {err}</div>}

      <pre className="text-xs whitespace-pre-wrap">
        {data ? JSON.stringify(data, null, 2) : "No data yet."}
      </pre>
    </main>
  );
}