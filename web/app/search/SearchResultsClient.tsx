"use client";
// SectionList component for rendering API results sections
type SectionListProps = {
  allSections: {
    key: string;
    title: string;
    url?: string;
    items: any[];
  }[];
};

function SectionList({ allSections }: SectionListProps) {
  // Map section keys to asset filenames (add more as needed)
  const assetMap: Record<string, string> = {
    transcripts: '/file.svg',
    community_chats: '/globe.svg',
    partnerships: '/aplayers-mark.png',
    resources: '/window.svg',
    events: '/vercel.svg',
    // fallback icon
    default: '/next.svg',
  };
  return (
    <div>
      {allSections.map((section) => {
        // Pick asset by key, fallback to default
        const asset = assetMap[section.key] || assetMap.default;
        return (
          <div key={section.key} style={{ marginBottom: 32 }}>
            <h2 style={{ color: 'white', border: '2px solid red', padding: '4px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <img src={asset} alt={section.key + ' icon'} style={{ width: 28, height: 28, objectFit: 'contain', marginRight: 6 }} />
              {section.url ? (
                <a href={section.url} target="_blank" rel="noopener noreferrer" style={{ color: 'lightblue' }}>
                  {section.title}
                </a>
              ) : (
                section.title
              )}
            </h2>
            <ul>
              {section.items.map((item: any, idx: number) => (
                <li key={idx} style={{ color: 'white' }}>
                  {typeof item === 'string' ? item : JSON.stringify(item)}
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { fetchCustomGPTResults } from "../lib/fetchCustomGPTResults";

const MembersPaneClient = dynamic(() => import("./MembersPaneClient"), { ssr: false });
const RightSectionClient = dynamic(() => import("./RightSectionClient"), { ssr: false });

type Member = { name: string; industry?: string; quote?: string };
type Item = { title: string; subtitle?: string; quote?: string; url?: string };

type SearchResultsClientProps = {
  members: Member[];
  partnerships: Item[];
  calls: Item[];
  resources: Item[];
  events: Item[];
  q: string;
};

export default function SearchResultsClient({ members, partnerships, calls, resources, events, q }: SearchResultsClientProps) {
  const router = useRouter();
  const [inputValue, setInputValue] = useState(q || "");
  const [loading, setLoading] = useState(false);
  const [resultsData, setResultsData] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Debug: log API response and mapped results
  useEffect(() => {
    if (resultsData !== null) {
      // Log the raw API response
      console.log("[SearchResultsClient] API response:", resultsData);
      // Log the mapped categories
      console.log("[SearchResultsClient] callsResults:", resultsData?.calls || resultsData?.call_recordings || []);
      console.log("[SearchResultsClient] community:", resultsData?.community || resultsData?.community_chats || []);
      console.log("[SearchResultsClient] partners:", resultsData?.partners || resultsData?.partnerships || []);
      console.log("[SearchResultsClient] resourcesResults:", resultsData?.resources || []);
    }
  }, [resultsData]);

  useEffect(() => {
    setInputValue(q || "");
    setLoading(true);
    setErrorMsg(null);
    fetchCustomGPTResults(q)
      .then((res) => {
        setResultsData(res?.data || {});
        setLoading(false);
      })
      .catch((err) => {
        setErrorMsg("Failed to fetch results.");
        setResultsData(null);
        setLoading(false);
      });
  }, [q]);

  // Extract categories from correct API keys
  const callsResults = resultsData?.transcripts?.items || [];
  const community = resultsData?.community_chats?.items || [];
  const partners = resultsData?.partnerships?.items || [];
  const resourcesResults = resultsData?.resources?.items || [];

  // Card style
  const cardStyle: React.CSSProperties = {
    marginBottom: 24,
    padding: 16,
    border: "1px solid #eee",
    borderRadius: 8,
    background: "rgba(0,0,0,0.55)",
    color: "#fff",
    boxShadow: "0 2px 8px 0 rgba(0,0,0,0.12)",
  };
  const fadedStyle: React.CSSProperties = {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 8,
    display: "block",
  };

  // Render category
  const renderCategory = (items: any[], type: string, label: string) => {
    if (!Array.isArray(items) || items.length === 0) return null;
    return (
      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontWeight: 700, fontSize: 20, marginBottom: 12 }}>{label}</h2>
        {items.map((item, idx) => {
          if (type === "calls") {
            return (
              <div key={idx} style={cardStyle}>
                <h3 style={{ fontWeight: 600, fontSize: 17 }}>{item.title || "Untitled"}</h3>
                {item.quote && <p><i>{item.quote}</i></p>}
                {item.context && <p>{item.context}</p>}
                {item.url && <a href={item.url} target="_blank" rel="noopener noreferrer">{item.url}</a>}
                {item.source && <span style={fadedStyle}>Source: {item.source}</span>}
              </div>
            );
          } else if (type === "community") {
            return (
              <div key={idx} style={cardStyle}>
                <h3 style={{ fontWeight: 600, fontSize: 17 }}>{item.title || "Untitled"}</h3>
                {item.quote && <p><i>{item.quote}</i></p>}
                {item.context && <p>{item.context}</p>}
                {item.username && item.username_url && (
                  <p>User: <a href={item.username_url} target="_blank" rel="noopener noreferrer">{item.username}</a></p>
                )}
                {item.source && <span style={fadedStyle}>Source: {item.source}</span>}
              </div>
            );
          } else if (type === "partners") {
            return (
              <div key={idx} style={cardStyle}>
                <h3 style={{ fontWeight: 600, fontSize: 17 }}>{item.title || "Untitled"}</h3>
                {item.description && <p>{item.description}</p>}
                {item.contact_line && <p>{item.contact_line}</p>}
                {item.url && <a href={item.url} target="_blank" rel="noopener noreferrer">{item.url}</a>}
                {item.source && <span style={fadedStyle}>Source: {item.source}</span>}
              </div>
            );
          } else if (type === "resources") {
            return (
              <div key={idx} style={cardStyle}>
                <h3 style={{ fontWeight: 600, fontSize: 17 }}>{item.title || "Untitled"}</h3>
                {item.summary && <p>{item.summary}</p>}
                {item.url && <a href={item.url} target="_blank" rel="noopener noreferrer">{item.url}</a>}
                {item.source && <span style={fadedStyle}>Source: {item.source}</span>}
              </div>
            );
          }
          // fallback
          return (
            <div key={idx} style={cardStyle}>
              <pre>{JSON.stringify(item, null, 2)}</pre>
            </div>
          );
        })}
      </section>
    );
  };

  // --- Layout ---
  const noResults =
    !loading &&
    !errorMsg &&
    (!callsResults.length && !community.length && !partners.length && !resourcesResults.length);

  return (
    <div key={q} style={{ display: "flex", height: "100vh", width: "100vw", background: "#18181b" }}>
      {/* Left: Search Box */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: 48, minWidth: 0, borderRight: "1px solid #222" }}>
        <form
          onSubmit={e => {
            e.preventDefault();
            if (inputValue.trim()) router.push(`/search?q=${encodeURIComponent(inputValue)}`);
          }}
          style={{ width: "100%", maxWidth: 400 }}
        >
          <input
            type="text"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            placeholder="What’s your next move?"
            style={{
              width: "100%",
              padding: "16px 24px",
              borderRadius: 999,
              border: "1px solid #444",
              fontSize: 18,
              background: "#23232a",
              color: "#fff",
              outline: "none",
              marginBottom: 8,
              boxShadow: "0 2px 8px 0 rgba(0,0,0,0.10)",
            }}
            autoFocus
          />
        </form>
        {errorMsg && <div style={{ color: "#f44", marginTop: 12 }}>{errorMsg}</div>}
      </div>
      {/* Right: Results */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>
        <div style={{ flex: 1, overflowY: "auto", padding: 48 }}>
          {loading ? (
            <div style={{ color: "#fff" }}>Loading...</div>
          ) : (
            <>
              {renderCategory(callsResults, "calls", "Call Recordings")}
              {renderCategory(community, "community", "Community Chats")}
              {renderCategory(partners, "partners", "Partnerships")}
              {renderCategory(resourcesResults, "resources", "Resources")}
              {noResults && (
                <p style={{ color: '#fff' }}>No results found for this query.</p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
