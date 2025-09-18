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
  const [sections, setSections] = useState<any[]>([]);
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
        // Parse openai_response if present
        let parsed = res?.data || {};
        let parsedSections: any = {};
        if (typeof parsed.openai_response === 'string') {
          let raw = parsed.openai_response;
          console.log('Raw openai_response:', raw);
          try {
            // Try direct parse
            parsedSections = JSON.parse(raw);
            parsed = { ...parsed, ...parsedSections };
          } catch (e1) {
            // Try to fix common issues: trim, remove trailing non-JSON
            try {
              let fixed = raw.trim();
              // Remove anything after the last closing brace/bracket
              let lastCurly = fixed.lastIndexOf('}');
              let lastSquare = fixed.lastIndexOf(']');
              let cut = Math.max(lastCurly, lastSquare);
              if (cut !== -1) fixed = fixed.slice(0, cut + 1);
              parsedSections = JSON.parse(fixed);
              parsed = { ...parsed, ...parsedSections };
              console.warn('openai_response needed fixing before parse');
            } catch (e2) {
              // Try double-parse (if double-encoded)
              try {
                parsedSections = JSON.parse(JSON.parse(raw));
                parsed = { ...parsed, ...parsedSections };
                console.warn('openai_response was double-encoded');
              } catch (e3) {
                console.error('Failed to parse openai_response:', e1, e2, e3);
                parsedSections = { _raw_openai_response: raw };
              }
            }
          }
        } else {
          parsedSections = parsed;
        }
        // Flatten all items from all sections (fallback to any available structure)
        const sectionKeys = Object.keys(parsedSections).filter(
          (k) => parsedSections[k] && Array.isArray(parsedSections[k].items)
        );
        let allItems: any[] = [];
        let allSections: any[] = [];
        sectionKeys.forEach((key) => {
          const section = parsedSections[key];
          if (Array.isArray(section.items) && section.items.length > 0) {
            allSections.push({
              key,
              title: section.section_title || key,
              url: section.section_url,
              items: section.items,
            });
            allItems = allItems.concat(
              section.items.map((item: any) => ({ ...item, _section: section.section_title || key, _sectionUrl: section.section_url }))
            );
          }
        });
        setResults(allItems);
        setSections(allSections);
        setError(null);
      } catch (err: any) {
        setError("Failed to fetch results.");
        setResults([]);
        setSections([]);
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
  if (sections && sections.length > 0) {
    return (
      <div>
        {sections.map((section, sIdx) => (
          <div key={section.key} style={{ marginBottom: 32 }}>
            <h2 style={{ color: '#ffd700', marginBottom: 8 }}>
              {section.title}
              {section.url && (
                <a href={section.url} target="_blank" rel="noopener noreferrer" style={{ marginLeft: 8, fontSize: 14, color: '#fff' }}>
                  [link]
                </a>
              )}
            </h2>
            {section.items.map((item: any, idx: number) => (
              <div key={idx} style={{ padding: 16, borderBottom: '1px solid #444', color: 'white', marginBottom: 8 }}>
                <strong>{item.title || item.name || 'No Title'}</strong>
                {item.quote && <blockquote style={{ margin: '8px 0', fontStyle: 'italic', color: '#b3b3b3' }}>{item.quote}</blockquote>}
                {item.summary && <p>{item.summary}</p>}
                {item.description && <p>{item.description}</p>}
                {item.context && <p style={{ fontSize: 13, opacity: 0.8 }}>{item.context}</p>}
                {item.url && (
                  <div>
                    <a href={item.url} target="_blank" rel="noopener noreferrer" style={{ color: '#61dafb', fontSize: 13 }}>
                      {item.url}
                    </a>
                  </div>
                )}
                {item.username && (
                  <div style={{ fontSize: 13, opacity: 0.8 }}>User: {item.username}</div>
                )}
                {item.source && (
                  <div style={{ fontSize: 12, opacity: 0.6 }}>Source: {item.source}</div>
                )}
              </div>
            ))}
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
