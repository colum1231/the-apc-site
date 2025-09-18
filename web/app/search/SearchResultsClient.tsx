"use client";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { fetchCustomGPTResults } from "../lib/fetchCustomGPTResults";

const MembersPaneClient = dynamic(() => import("./MembersPaneClient"), { ssr: false });
const RightSectionClient = dynamic(() => import("./RightSectionClient"), { ssr: false });

type Member = { name: string; industry?: string; quote?: string };
type Item = { title: string; subtitle?: string; quote?: string; url?: string };

type Props = {
  members: Member[];
  partnerships: Item[];
  calls: Item[];
  resources: Item[];
  events: Item[];
  q: string;
};

export default function SearchResultsClient({ members, partnerships, calls, resources, events, q }: Props) {
  console.log("✅ SearchResultsClient mounted");
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [data, setData] = useState<any>(null);
  const [results, setResults] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchResults() {
      try {
        console.log("Query is:", q);
        console.log("Calling CustomGPT API...");
        const res = await fetchCustomGPTResults(q);
        console.log("✅ CustomGPT response:", res);
        setData(res);
        console.log("CustomGPT Response:", res);
        console.log("✅ FULL API response:", res);
        if (res && Array.isArray(res.results)) {
          setResults(res.results);
        } else {
          setResults([]);
        }
        setError(null);
      } catch (err: any) {
        setError("Failed to fetch results.");
        setResults([]);
        console.error("API fetch failed:", err);
      }
    }
    fetchResults();
  }, [q]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const value = inputRef.current?.value || "";
    if (value.trim()) {
      router.push(`/results?query=${encodeURIComponent(value)}`);
    }
  }

  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!Array.isArray(results)) return <p style={{ color: 'white' }}>No valid results</p>;
  if (results && results.length > 0) {
    return (
      <div>
        {results.map((item, index) => (
          <div key={index} style={{ padding: 20, borderBottom: '1px solid white', color: 'white' }}>
            <strong>{item?.title || 'No Title'}</strong>
            <p>{item?.description || 'No Description'}</p>
            <span style={{ opacity: 0.6 }}>{item?.type || 'No Type'}</span>
          </div>
        ))}
      </div>
    );
  }
  if (results && results.length === 0) return <p style={{ color: 'white' }}>No results found for this search.</p>;
  if (!data) return <p style={{ color: 'white' }}>Loading...</p>;

  return (
    <div style={{ color: 'white' }}>
      <h2>SearchResultsClient Rendering</h2>
      <pre>{JSON.stringify(data, null, 2)}</pre>
      {Array.isArray(data?.answers) && data.answers.length > 0 ? (
        data.answers.map((item, index) => (
          <div
            key={index}
            style={{
              marginBottom: 24,
              padding: 16,
              border: '1px solid white',
              borderRadius: 6,
              color: 'white',
            }}
          >
            <h3>{item.title || "Untitled"}</h3>
            <p>{item.answer}</p>
            <span style={{ fontSize: 12, opacity: 0.7 }}>
              {item.metadata?.type || "Other"}
            </span>
          </div>
        ))
      ) : (
        <p style={{ color: 'white' }}>No results found for this query.</p>
      )}
    </div>
  );
}
