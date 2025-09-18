"use client";
import dynamic from "next/dynamic";

const MembersPaneClient = dynamic(() => import("../search/MembersPaneClient"), { ssr: false });
const RightSectionClient = dynamic(() => import("../search/RightSectionClient"), { ssr: false });

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
          allSections.map((section, sIdx) => (
            <div key={section.key} style={{ marginBottom: 32 }}>
              <div style={{ fontWeight: 'bold', fontSize: 20, color: '#ffd700', marginBottom: 8 }}>{section.title}</div>
              {section.items.map((item: any, idx: number) => (
                <div key={idx} style={{ padding: 12, borderBottom: '1px solid #444', color: 'white', marginBottom: 8 }}>
                  {Object.entries(item).map(([k, v]) => (
                    <div key={k} style={{ fontSize: 15, marginBottom: 2 }}>
                      <span style={{ fontWeight: 600 }}>{k}:</span> <span>{String(v)}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ))
        ) : (
          <div style={{ color: 'white', textAlign: 'center', marginTop: 32 }}>No results found for this search.</div>
        )}
      </div>
    </main>
  );
}
