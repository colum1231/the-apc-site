"use client";
import dynamic from "next/dynamic";
import React, { useState } from "react";

type Member = { name: string; industry?: string; quote?: string };
type Category = { title: string; subtitle?: string; quote?: string; url?: string };

type Props = {
  members: Member[];
  categories: Category[];
  q: string;
  gptResult?: any;
};

export default function ResultsClient({ members, categories, q, gptResult }: Props) {
  // Parse and flatten CustomGPT results
  let parsed = gptResult?.data || {};
  let parsedSections: any = {};
  if (typeof parsed.openai_response === 'string') {
    try {
      parsedSections = JSON.parse(parsed.openai_response);
      parsed = { ...parsed, ...parsedSections };
    } catch (e) {
      console.error('Failed to parse openai_response:', e);
      parsedSections = {};
    }
  } else {
    parsedSections = parsed;
  }
  // Flatten all items from all sections (fallback to any available structure)
  const sectionKeys = Object.keys(parsedSections).filter(
    (k) => parsedSections[k] && Array.isArray(parsedSections[k].items)
  );
  
  // Simple SectionList component definition
  type SectionListProps = {
    allSections: {
      key: string;
      title: string;
      url?: string;
      items: any[];
    }[];
  };
  
  function SectionList({ allSections }: SectionListProps) {
    return (
      <div>
        {allSections.map((section) => (
          <div key={section.key} style={{ marginBottom: 32 }}>
            <h2 style={{ color: 'white', border: '2px solid red', padding: '4px', borderRadius: '6px', display: 'inline-block' }}>
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
        ))}
      </div>
    );
  }

  // Map of asset type keys to their display titles
  const assetTypeToTitle: Record<string, string> = {
    resources: "Resources",
    events: "Events",
    partnerships: "Partnerships",
    transcripts: "Call Recordings",
    members: "Members"
  };


  // Only show assets under their exact category for right-hand categories
  let allSections: any[] = [];
  Object.entries(assetTypeToTitle).forEach(([key, title]) => {
    if (key === 'members') return; // skip members for right side
    if (
      parsedSections.hasOwnProperty(key) &&
      parsedSections[key] &&
      Array.isArray(parsedSections[key].items) &&
      parsedSections[key].items.length > 0
    ) {
      // Brute-force filter: Only include items that match the section key/type
      // You may need to adjust the property checked below (e.g., item.type, item.category, etc.)
      const filteredItems = parsedSections[key].items.filter((item: any) => {
        // Example: if items have a 'type' property, match it to the key
        if (item.type) return item.type.toLowerCase() === key;
        // If items have a 'category' property, match it to the title
        if (item.category) return item.category.toLowerCase() === title.toLowerCase();
        // If no type info, fallback to including all (remove this line for strict filtering)
        return true;
      });
      if (filteredItems.length > 0) {
        allSections.push({
          key,
          title,
          url: parsedSections[key].section_url,
          items: filteredItems,
        });
      }
    }
  });

  // Debug: Output the parsedSections structure for troubleshooting
  if (typeof window !== 'undefined') {
    // eslint-disable-next-line no-console
    console.log('DEBUG: parsedSections', parsedSections);
    // eslint-disable-next-line no-console
    console.log('DEBUG: allSections', allSections);
  }

  return (
    <main className="apc-results-main">
      <div style={{ color: 'white', marginBottom: 24 }}>
        <pre>{JSON.stringify(gptResult, null, 2)}</pre>
      </div>
      <div className="apc-results-shell">
        {allSections.length > 0 ? (
          <SectionList allSections={allSections} />
        ) : (
          <div style={{ color: 'white', textAlign: 'center', marginTop: 32 }}>
            No results found for this search.
          </div>
        )}
      </div>
          </main>
        );
  }