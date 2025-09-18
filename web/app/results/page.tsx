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

  useEffect(() => {
    if (!q) return;
    // Replace with your actual API endpoint for results
    fetch(`/api/results?query=${encodeURIComponent(q)}`)
      .then((res) => res.json())
      .then(setData)
      .catch(() => setData(null));
    // Fetch from CustomGPT
    fetchCustomGPTResults(q)
      .then((res) => {
        setGptResult(res);
      })
      .catch((err) => {
        setGptResult(null);
        console.error("CustomGPT error:", err);
        console.error("Fetch error:", err);
      });
  }, [q]);

  const members = data?.members ?? [];
  const categories = data?.categories ?? [];

  if (!q) {
    return <p>No query found</p>;
  }
  if (data) {
    return <pre>{JSON.stringify(data, null, 2)}</pre>;
  }
  // fallback loading
  return <p>Loading or no data yet...</p>;

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
    </div>
  );
}
