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
    }
  });

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