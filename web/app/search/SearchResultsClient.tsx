"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { fetchCustomGPTResults } from "../lib/fetchCustomGPTResults";
import LoadingWave from "../components/LoadingWave";

type SearchResultsClientProps = {
  members: any[];
  partnerships: any[];
  calls: any[];
  resources: any[];
  events: any[];
  q: string;
};

export default function SearchResultsClient({ q }: SearchResultsClientProps) {
  const router = useRouter();
  
  // Capitalize first letter of each word
  const capitalizeWords = (str: string) => {
    return str.replace(/\b\w/g, (char) => char.toUpperCase());
  };
  
  // State management
  const [inputValue, setInputValue] = useState(q ? capitalizeWords(q) : "");
  const [loading, setLoading] = useState(false);
  const [resultsData, setResultsData] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  // Store quote cutoff for each member result (set once per result set)
  const [memberQuoteCutoffs, setMemberQuoteCutoffs] = useState<number[]>([]);

  // Right column category states (HQ-style dropdowns)
  const [callRecordingsOpen, setCallRecordingsOpen] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const [partnershipsOpen, setPartnershipsOpen] = useState(false);
  const [eventsOpen, setEventsOpen] = useState(false);
  // Animation state for fade/move of categories below the clicked one
  const [fadingCategories, setFadingCategories] = useState<string[]>([]);
  // Track which categories should be hidden (fully invisible)
  const [categoriesHidden, setCategoriesHidden] = useState<string[]>([]);
  // Track if a dropdown is animating (to delay fade-in)
  const animatingRef = useRef(false);

  // Helper: get categories below the clicked one, in bottom-up order
  const categoryOrder = ['callRecordings', 'resources', 'partnerships', 'events'];
  const getCategoriesBelow = (category: string) => {
    const idx = categoryOrder.indexOf(category);
    return categoryOrder.slice(idx + 1).reverse();
  };

  // Exclusive dropdown behavior with sequential fade-out and persistent hiding
  const toggleCategory = (category: string) => {
    // If already open, just close all
    if ((category === 'callRecordings' && callRecordingsOpen) ||
        (category === 'resources' && resourcesOpen) ||
        (category === 'partnerships' && partnershipsOpen) ||
        (category === 'events' && eventsOpen)) {
      // Start fade-in for hidden categories after dropdown closes
      setCallRecordingsOpen(false);
      setResourcesOpen(false);
      setPartnershipsOpen(false);
      setEventsOpen(false);
      animatingRef.current = true;
      // Wait for dropdown collapse animation (600ms), then fade in
      setTimeout(() => {
        setCategoriesHidden([]);
        animatingRef.current = false;
      }, 600);
      setFadingCategories([]);
      return;
    }
    // Start fade-out for categories below
    const below = getCategoriesBelow(category);
    if (below.length === 0) {
      // No fade needed, just open
      setCallRecordingsOpen(category === 'callRecordings');
      setResourcesOpen(category === 'resources');
      setPartnershipsOpen(category === 'partnerships');
      setEventsOpen(category === 'events');
      setFadingCategories([]);
      setCategoriesHidden([]);
      return;
    }
    // Sequentially fade out each below category
    setFadingCategories([]);
    animatingRef.current = true;
    below.forEach((cat, i) => {
      setTimeout(() => {
        setFadingCategories(prev => [...prev, cat]);
        // After fade-out, hide the category
        setTimeout(() => {
          setCategoriesHidden(prev => Array.from(new Set([...prev, cat])));
        }, 500); // match fade duration
      }, i * 600);
    });
    // After all fades, open the dropdown and clear fades
    setTimeout(() => {
      setCallRecordingsOpen(category === 'callRecordings');
      setResourcesOpen(category === 'resources');
      setPartnershipsOpen(category === 'partnerships');
      setEventsOpen(category === 'events');
      setFadingCategories([]);
      animatingRef.current = false;
    }, below.length * 600 + 50);
  };

  const isAnyDropdownOpen = callRecordingsOpen || resourcesOpen || partnershipsOpen || eventsOpen;

  // Fetch search results
  useEffect(() => {
    if (!q) return;
    setInputValue(q ? capitalizeWords(q) : "");
    setLoading(true);
    setErrorMsg(null);
    console.log("🔍 Starting search for query:", q);
    fetchCustomGPTResults(q)
      .then((res) => {
        console.log("✅ Full API response received:", res);
        console.log("📊 Response data structure:", res?.data);
        // Parse the openai_response JSON string to get the actual structured data
        let parsedData = {};
        if (res?.data?.openai_response) {
          try {
            // Split by "— APC Almanac" to get just the JSON part
            const jsonPart = res.data.openai_response.split('— APC Almanac')[0].trim();
            console.log("🔍 Raw openai_response:", res.data.openai_response);
            console.log("🔍 Extracted JSON part:", jsonPart);
            parsedData = JSON.parse(jsonPart);
            console.log("🎯 Parsed structured data:", parsedData);
            console.log("🎯 Sections found:", Object.keys(parsedData));
          } catch (err) {
            console.error("Failed to parse openai_response:", err);
            console.error("Raw response was:", res.data.openai_response);
            parsedData = {};
          }
        } else {
          console.log("🚨 No openai_response found in:", res?.data);
        }
        // Set the parsed structured data
        setResultsData(parsedData);
        // Set quote cutoffs for each member result (8-12, fixed per result set)
        const pd: any = parsedData;
        const memberList = (pd && pd.transcripts && pd.transcripts.items ? pd.transcripts.items : [])
          .concat(pd && pd.community_chats && pd.community_chats.items ? pd.community_chats.items : []);
        setMemberQuoteCutoffs(memberList.map(() => Math.floor(Math.random() * 5) + 8));
        setLoading(false);
      })
      .catch((err) => {
        console.error("❌ Search failed with error:", err);
        setErrorMsg(`Search failed: ${err.message || 'Unknown error'}`);
        setResultsData(null);
        setLoading(false);
      });
  }, [q]);

  // Extract structured data from CustomGPT response only if resultsData exists
  const transcripts = (resultsData && resultsData.transcripts && resultsData.transcripts.items) ? resultsData.transcripts.items : [];
  const communityChats = (resultsData && resultsData.community_chats && resultsData.community_chats.items) ? resultsData.community_chats.items : [];
  const partnerships = (resultsData && resultsData.partnerships && resultsData.partnerships.items) ? resultsData.partnerships.items : [];
  const resources = (resultsData && resultsData.resources && resultsData.resources.items) ? resultsData.resources.items : [];
  const events = (resultsData && resultsData.events && resultsData.events.items) ? resultsData.events.items : [];
  
  // Combine all member-related content (community chats + transcripts)
  const memberResults = [...communityChats, ...transcripts];
  
  // Categories for right side
  const callResults = transcripts;
  const resourceResults = resources;
  const partnerResults = partnerships;
  const eventResults = events;

  // Debug logging for categories
  console.log("🎯 Category Data Debug:");
  console.log("transcripts:", transcripts.length, transcripts);
  console.log("resources:", resources.length, resources);
  console.log("partnerships:", partnerships.length, partnerships);
  console.log("events:", events.length, events);

  // Helper: should a category be hidden?
  const isCategoryHidden = (cat: string) => categoriesHidden.includes(cat);

  // BRUTE FORCE RENDER FUNCTION
  return (
    <div 
      key={q} 
      style={{ 
        display: "flex", 
        height: "100vh", 
        width: "100vw", 
        background: "#000 url('/res+cat_back.jpg') center/cover no-repeat fixed"
      }}
    >
      {/* ===== LEFT COLUMN: SEARCH BOX + RESULTS ===== */}
      <div className="left-column" style={{ 
        flex: 1, 
        display: "flex", 
        flexDirection: "column", 
        alignItems: "center", 
        minWidth: 0, 
        borderRight: "1px solid #000", 
        position: "relative" 
      }}>
        
        {/* SEARCH BOX - Fixed at top center of left half */}
        <div style={{ 
          position: "absolute",
          top: "100px",
          left: "50%",
          width: "400.5px", // 10% less than 445px
          height: "43.85px", // 17.5% less than 53.125px
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: "translateX(-50%) translateX(2.5px)", // 80px right from center
          zIndex: 3
        }}>
            <form
            onSubmit={e => {
              e.preventDefault();
              if (inputValue.trim()) router.push(`/search?q=${encodeURIComponent(inputValue)}`);
            }}
            style={{ width: "100%", height: "100%" }}
          >
            <input
              type="text"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              placeholder="What's your next move?"
              className="search-results-input"
              style={{
                width: "100%",
                height: "100%",
                border: "1px solid #545454",
                borderRadius: 999,
                background: "transparent",
                color: "#545454",
                textAlign: "center",
                fontSize: "16.125px",
                outline: "none",
                padding: "0 35px"
              }}
              autoFocus
            />
          </form>
        </div>

        {/* ERROR MESSAGE */}
        {errorMsg && (
          <div style={{ 
            color: "#f44", 
            position: "absolute", 
            top: "140px", 
            textAlign: "center",
            left: "50%",
            transform: "translateX(-50%)"
          }}>
            {errorMsg}
          </div>
        )}

        {/* RESULTS SECTION */}
        <div style={{ 
          position: "absolute",
          top: "222.5px", // 80px + 42.5px + 100px padding
          left: 0,
          right: 0,
          bottom: 0,
          overflowY: "auto",
          padding: "0 62.5px 48px 125px"
        }}>
          {loading ? (
            <LoadingWave />
          ) : (
            <>
              {/* MEMBER CARDS */}
              {memberResults && memberResults.length > 0 ? (
                memberResults.map((member: any, index: number) => (
                  <div key={index} className="hq-asset-item" style={{
                    marginBottom: "30px",
                    width: "100%",
                    borderBottom: "1px solid rgba(255,255,255,0)",
                    paddingBottom: "20px"
                  }}>
                    {/* Line 1: display_title */}
                    <div style={{
                      color: "#8b8989",
                    fontWeight: 600,
                    fontSize: "18.5px",
                    marginBottom: "5px"
                    }}>{member.display_title || member.name || member.title || "Unknown Member"}</div>
                    {/* Line 2: Relevant quote */}
                    {member.quote && (
                      <div style={{
                        color: "#8b8989",
                        fontSize: "16.5px",
                        fontStyle: "italic",
                        fontWeight: 400,
                        marginBottom: "20px"
                      }}>
                        {(() => {
                          const words = member.quote.split(" ");
                          // Use fixed cutoff for this member result
                          const maxWords = memberQuoteCutoffs[index] || 10;
                          const truncated = words.length > maxWords ? words.slice(0, maxWords).join(" ") + "..." : member.quote;
                          return `"${truncated}"`;
                        })()}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div style={{ 
                  color: '#707070', 
                  textAlign: 'center', 
                  fontStyle: 'italic',
                  marginTop: "50px",
                  fontSize: "0.875rem",
                }}>
                  No results found for this query.
                </div>
              )}
            </>
          )}
        </div>
      </div>
      
      {/* ===== RIGHT COLUMN: CATEGORIES (HQ STYLE) ===== */}
      <div className="right-column" style={{ 
        flex: 1, 
        display: "flex", 
        flexDirection: "column", 
        minHeight: "100vh", 
        overflow: "visible",
        paddingTop: "50px"
      }}>
        <div style={{ 
          flex: 1, 
          overflowY: "visible", 
          padding: 0, // Set to 0 to eliminate gap from separator
          minHeight: "auto"
        }}>
          
          <div className={`hq-content-wrapper ${isAnyDropdownOpen ? 'has-open-dropdown' : ''}`}>
            
            {/* CALL RECORDINGS CATEGORY */}
            <div
              className={`hq-category ${callRecordingsOpen ? 'expanded' : ''}`}
              style={{
                marginBottom: "30px",
                marginLeft: "-20px",
                position: "relative",
                left: "-20px",
                transform: "translateX(-20px)",
                opacity: isCategoryHidden('callRecordings') ? 0 : 1,
                pointerEvents: isCategoryHidden('callRecordings') ? 'none' : undefined,
                transition: "transform 0.5s ease, opacity 0.5s ease"
              }}
            >
              <div className="hq-category-header" style={{ display: "flex", alignItems: "center", width: "90%" }}>
                <a href="https://www.notion.so/call-recordings-apc" target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", flex: "1" }}>
                  <h1 style={{ color: "#8b8989", fontSize: "20px", fontWeight: "bold", margin: "0", padding: "0" }}>CALL RECORDINGS</h1>
                </a>
                <div onClick={() => toggleCategory('callRecordings')} style={{ cursor: "pointer", padding: "0", marginLeft: "5px" }}>
                  <span style={{ 
                    color: "#707070", 
                    fontSize: "12px", 
                    transform: callRecordingsOpen ? "rotate(0deg)" : "rotate(-90deg)",
                    transition: "transform 0.6s ease",
                    display: "inline-block"
                  }}>▼</span>
                </div>
              </div>
              <div className={`hq-dropdown ${callRecordingsOpen ? 'open' : ''}`}>
                {callResults && callResults.length > 0 ? (
                  callResults.map((asset: any, index: number) => (
                    <div key={index} className="hq-asset-item" style={{
                      marginBottom: "25px",
                      width: "100%",
                      borderBottom: "1px solid rgba(255,255,255,0)",
                      paddingBottom: "20px"
                    }}>
                      {/* Line 1: display_title (Column B) */}
                      <div style={{
                        color: "#8b8989",
                        fontWeight: 600,
                        fontSize: "15.5px",
                        marginBottom: "2px"
                      }}>{asset.display_title || asset.title || asset.name || "Untitled Call"}</div>
                      {/* Line 2: Relevant quote (max 10 words) */}
                      {asset.quote && (
                        <div style={{
                          color: "#8b8989",
                          fontSize: "14.5px",
                          fontStyle: "italic",
                          fontWeight: 400
                        }}>
                          {(() => {
                            const words = asset.quote.split(" ");
                            return words.length > 10 ? words.slice(0, 10).join(" ") + "..." : asset.quote;
                          })()}
                        </div>
                      )}
                      {/* Line 3: URL for call (Column C / resource_title) */}
                      {asset.resource_title || asset.url ? (
                        <div style={{
                          color: "#6faaff",
                          fontSize: "0.9375rem",
                          marginTop: "2px"
                        }}>
                          <a href={asset.url || "#"} target="_blank" rel="noopener noreferrer" style={{ color: "#6faaff", textDecoration: "underline" }}>
                            {asset.resource_title || asset.url}
                          </a>
                        </div>
                      ) : null}
                    </div>
                  ))
                ) : (
                  <div className="hq-asset-item">
                    <div className="hq-asset-subtitle" style={{ color: "#707070", fontStyle: "italic" }}>
                      No call recording results found for this query.
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* RESOURCES CATEGORY */}
            <div
              className={`hq-category ${resourcesOpen ? 'expanded' : ''}`}
              style={{
                marginLeft: "-20px",
                position: "relative",
                left: "-20px",
                transform: fadingCategories.includes('resources') ? "translateX(125px)" : "translateX(-20px)",
                opacity: isCategoryHidden('resources') || fadingCategories.includes('resources') ? 0 : 1,
                pointerEvents: isCategoryHidden('resources') ? 'none' : undefined,
                transition: "transform 0.5s ease, opacity 0.5s ease"
              }}
            >
              <div className="hq-category-header" style={{ display: "flex", alignItems: "center", width: "90%" }}>
                <a href="https://www.notion.so/resources-apc" target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", flex: "1" }}>
                  <h1 style={{ color: "#8b8989", fontSize: "20px", fontWeight: "bold", margin: "0", padding: "0" }}>RESOURCES</h1>
                </a>
                <div onClick={() => toggleCategory('resources')} style={{ cursor: "pointer", padding: "0", marginLeft: "5px" }}>
                  <span style={{ 
                    color: "#707070", 
                    fontSize: "12px", 
                    transform: resourcesOpen ? "rotate(0deg)" : "rotate(-90deg)",
                    transition: "transform 0.6s ease",
                    display: "inline-block"
                  }}>▼</span>
                </div>
              </div>
              <div className={`hq-dropdown ${resourcesOpen ? 'open' : ''}`}>
                {resourceResults && resourceResults.length > 0 ? (
                  resourceResults.map((asset: any, index: number) => (
                    <div key={index} className="hq-asset-item" style={{
                      marginBottom: "25px",
                      width: "100%",
                      borderBottom: "1px solid rgba(255,255,255,0)",
                      paddingBottom: "20px"
                    }}>
                      {/* Line 1: display_title (Column B) as hyperlink */}
                      <div style={{
                        color: "#8b8989",
                        fontWeight: 600,
                        fontSize: "16.5px",
                        marginBottom: "2px"
                      }}>
                        <a href={asset.url || "#"} target="_blank" rel="noopener noreferrer" style={{ color: "#8b8989", textDecoration: "underline" }}>
                          {asset.display_title || asset.title || asset.filename?.replace(/\.[^/.]+$/, "") || "Untitled"}
                        </a>
                      </div>
                      {/* Line 2: Quick sentence of relevance (quote/summary/description) */}
                      {asset.summary || asset.description || asset.content ? (
                        <div style={{
                          color: "#8b8989",
                          fontSize: "15.5px",
                          fontStyle: "italic",
                          fontWeight: 400
                        }}>
                          {(asset.summary || asset.description || asset.content).length > 200 ?
                            (asset.summary || asset.description || asset.content).substring(0, 200) + '...'
                            : (asset.summary || asset.description || asset.content)}
                        </div>
                      ) : null}
                      {/* Line 3: URL for resource (Column C / resource_title) */}
                      {asset.resource_title || asset.url ? (
                        <div style={{
                          color: "#6faaff",
                          fontSize: "1.0375rem",
                          marginTop: "2px"
                        }}>
                          <a href={asset.url || "#"} target="_blank" rel="noopener noreferrer" style={{ color: "#6faaff", textDecoration: "underline" }}>
                            {asset.resource_title || asset.url}
                          </a>
                        </div>
                      ) : null}
                    </div>
                  ))
                ) : (
                  <div className="hq-asset-item">
                    <div className="hq-asset-subtitle" style={{ color: "#707070", fontStyle: "italic" }}>
                      No resource results found for this query.
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* PARTNERSHIPS CATEGORY */}
            <div
              className={`hq-category ${partnershipsOpen ? 'expanded' : ''}`}
              style={{
                marginLeft: "-20px",
                position: "relative",
                left: "-20px",
                transform: fadingCategories.includes('partnerships') ? "translateX(125px)" : "translateX(-20px)",
                opacity: isCategoryHidden('partnerships') || fadingCategories.includes('partnerships') ? 0 : 1,
                pointerEvents: isCategoryHidden('partnerships') ? 'none' : undefined,
                transition: "transform 0.5s ease, opacity 0.5s ease"
              }}
            >
              <div className="hq-category-header" style={{ display: "flex", alignItems: "center", width: "90%" }}>
                <a href="https://www.notion.so/partnerships-apc" target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", flex: "1" }}>
                  <h1 style={{ color: "#8b8989", fontSize: "21px", fontWeight: "bold", margin: "0", padding: "0" }}>PARTNERSHIPS</h1>
                </a>
                <div onClick={() => toggleCategory('partnerships')} style={{ cursor: "pointer", padding: "0", marginLeft: "5px" }}>
                  <span style={{ 
                    color: "#707070", 
                    fontSize: "12px", 
                    transform: partnershipsOpen ? "rotate(0deg)" : "rotate(-90deg)",
                    transition: "transform 0.6s ease",
                    display: "inline-block"
                  }}>▼</span>
                </div>
              </div>
              <div className={`hq-dropdown ${partnershipsOpen ? 'open' : ''}`}>
                {partnerResults && partnerResults.length > 0 ? (
                  partnerResults.map((asset: any, index: number) => (
                    <div key={index} className="hq-asset-item">
                      <a 
                        href={asset.url || "#"} 
                        className="hq-asset-link"
                        target={asset.url ? "_blank" : undefined} 
                        rel={asset.url ? "noopener noreferrer" : undefined}
                      >
                        {asset.title || asset.filename?.replace(/\.[^/.]+$/, "") || "Untitled"}
                      </a>
                      <div className="hq-asset-subtitle" style={{ wordWrap: "break-word", overflowWrap: "break-word" }}>
                        {asset.description || asset.content ? 
                          ((asset.description || asset.content).length > 200 ? 
                            (asset.description || asset.content).substring(0, 200) + '...' : 
                            (asset.description || asset.content)) : 
                          "No description available"
                        }
                        {/* CONTACT LINE FOR PARTNERSHIPS */}
                        {asset.contact_line && (
                          <div style={{ 
                            marginTop: "8px", 
                            color: "#949494", 
                            fontSize: "0.875rem",
                            borderTop: "1px solid rgba(255,255,255,0)",
                            paddingTop: "4px"
                          }}>
                            Contact: {asset.contact_line}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="hq-asset-item">
                    <div className="hq-asset-subtitle" style={{ color: "#707070", fontStyle: "italic" }}>
                      No partnership results found for this query.
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* EVENTS CATEGORY */}
            <div
              className={`hq-category ${eventsOpen ? 'expanded' : ''}`}
              style={{
                marginLeft: "-20px",
                position: "relative",
                left: "-20px",
                transform: fadingCategories.includes('events') ? "translateX(125px)" : "translateX(-20px)",
                opacity: isCategoryHidden('events') || fadingCategories.includes('events') ? 0 : 1,
                pointerEvents: isCategoryHidden('events') ? 'none' : undefined,
                transition: "transform 0.5s ease, opacity 0.5s ease"
              }}
            >
              <div className="hq-category-header" style={{ display: "flex", alignItems: "center", width: "90%" }}>
                <a href="https://www.notion.so/events-apc" target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", flex: "1" }}>
                  <h1 style={{ color: "#8b8989", fontSize: "20px", fontWeight: "bold", margin: "0", padding: "0" }}>EVENTS</h1>
                </a>
                <div onClick={() => toggleCategory('events')} style={{ cursor: "pointer", padding: "0", marginLeft: "5px" }}>
                  <span style={{ 
                    color: "#707070", 
                    fontSize: "12px", 
                    transform: eventsOpen ? "rotate(0deg)" : "rotate(-90deg)",
                    transition: "transform 0.6s ease",
                    display: "inline-block"
                  }}>▼</span>
                </div>
              </div>
              <div className={`hq-dropdown ${eventsOpen ? 'open' : ''}`}>
                {eventResults && eventResults.length > 0 ? (
                  eventResults.map((asset: any, index: number) => (
                    <div key={index} className="hq-asset-item">
                      <a 
                        href={asset.url || "#"} 
                        className="hq-asset-link"
                        target={asset.url ? "_blank" : undefined} 
                        rel={asset.url ? "noopener noreferrer" : undefined}
                      >
                        {asset.title || asset.filename?.replace(/\.[^/.]+$/, "") || "Untitled"}
                      </a>
                      <div className="hq-asset-subtitle" style={{ wordWrap: "break-word", overflowWrap: "break-word" }}>
                        {asset.content ? 
                          (asset.content.length > 200 ? asset.content.substring(0, 200) + '...' : asset.content) : 
                          "No description available"
                        }
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="hq-asset-item">
                    <div className="hq-asset-subtitle" style={{ color: "#707070", fontStyle: "italic" }}>
                      No event results found for this query.
                    </div>
                  </div>
                )}
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}
