"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchCustomGPTResults } from "../lib/fetchCustomGPTResults";

export default function SearchResultsClient() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q");
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!query) return;

    console.log("Query is:", query);
    console.log("Calling API...");
    console.log("Project ID:", 80230);
    // Optionally log API key (not recommended for production)
    // console.log("API KEY:", process.env.NEXT_PUBLIC_CUSTOMGPT_API_KEY);

    fetchCustomGPTResults(query)
      .then((res) => {
        console.log("CustomGPT Response:", res);
        setData(res);
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        console.error("API fetch failed:", err);
      });
  }, [query]);

  console.log("Rendering SearchResultsClient...");

  return (
    <div>
      <h1>Results</h1>
      {query ? (
        data ? (
          <pre>{JSON.stringify(data, null, 2)}</pre>
        ) : (
          <p>Loading...</p>
        )
      ) : (
        <p>No query found</p>
      )}
    </div>
  );
}
