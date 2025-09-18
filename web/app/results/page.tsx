import "../search.css";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import ResultsClient from "./ResultsClient";
import { fetchCustomGPTResults } from "../lib/fetchCustomGPTResults";

type Member = { name: string; industry?: string; quote?: string };
type Category = { title: string; subtitle?: string; quote?: string; url?: string };
type ResultsData = {
  members: Member[];
  categories: Category[];
};

export default function ResultsPage() {
  const searchParams = useSearchParams();
  const q = searchParams.get("query") || "";
  const [data, setData] = useState<ResultsData | null>(null);
  const [gptResult, setGptResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!q) return;
    setLoading(true);
    setError(null);
    // Replace with your actual API endpoint for results
    fetch(`/api/results?query=${encodeURIComponent(q)}`)
      .then((res) => res.json())
      .then(setData)
      .catch(() => setData(null));
    // Fetch from CustomGPT
    fetchCustomGPTResults(q)
      .then((res) => {
        setGptResult(res);
        setLoading(false);
      })
      .catch((err) => {
        setGptResult(null);
        setLoading(false);
        setError("CustomGPT error: " + (err?.message || err));
        console.error("CustomGPT error:", err);
        console.error("Fetch error:", err);
      });
  }, [q]);

  const members = data?.members ?? [];
  const categories = data?.categories ?? [];

  return (
    <div
      style={{
        minHeight: "100vh",
        minWidth: "100vw",
        backgroundImage: "url('/res+cat_back.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
        backgroundRepeat: "no-repeat",
      }}
    >
      <ResultsClient
        members={members}
        categories={categories}
        q={q}
        gptResult={gptResult}
      />
      {loading && <div style={{color: 'white', textAlign: 'center', marginTop: 32}}>Loading...</div>}
      {error && <div style={{color: 'red', textAlign: 'center', marginTop: 32}}>{error}</div>}
    </div>
  );
}
