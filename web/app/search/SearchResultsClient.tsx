"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchCustomGPTResults } from "../lib/fetchCustomGPTResults";

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

  // Right column category states (HQ-style dropdowns)
  const [callRecordingsOpen, setCallRecordingsOpen] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const [partnershipsOpen, setPartnershipsOpen] = useState(false);
  const [eventsOpen, setEventsOpen] = useState(false);

  // Exclusive dropdown behavior
  const toggleCategory = (category: string) => {
    setCallRecordingsOpen(category === 'callRecordings' ? !callRecordingsOpen : false);
    setResourcesOpen(category === 'resources' ? !resourcesOpen : false);
    setPartnershipsOpen(category === 'partnerships' ? !partnershipsOpen : false);
    setEventsOpen(category === 'events' ? !eventsOpen : false);
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
      {/* ===== LEFT COLUMN: SEARCH BOX + MEMBERS ===== */}
      <div className="left-column" style={{ 
        flex: 1, 
        display: "flex", 
        flexDirection: "column", 
        alignItems: "center", 
        minWidth: 0, 
        borderRight: "1px solid #222", 
        position: "relative" 
      }}>
        
        {/* SEARCH BOX - Fixed at top center of left half */}
        <div style={{ 
          position: "absolute",
          top: "80px",
          left: "50%",
          width: "356px", // 25% smaller than 475px
          height: "42.5px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: "translateX(-50%) translateX(-30px)", // 30px left offset
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
                fontSize: "14.5px",
                outline: "none",
                padding: "0 28px"
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

        {/* TEMPORARY DEBUG INFO */}
        <div style={{ 
          position: "absolute", 
          top: "160px", 
          left: "20px", 
          color: "#888", 
          fontSize: "10px",
          background: "rgba(0,0,0,0.9)",
          padding: "10px",
          borderRadius: "4px",
          maxWidth: "400px",
          maxHeight: "200px",
          overflow: "auto",
          zIndex: 1000
        }}>
          <div><strong>Loading:</strong> {loading ? 'YES' : 'NO'}</div>
          <div><strong>Error:</strong> {errorMsg || 'None'}</div>
          <div><strong>Raw Data Keys:</strong> {resultsData ? Object.keys(resultsData).join(', ') : 'null'}</div>
          <div><strong>Transcripts:</strong> {transcripts.length}</div>
          <div><strong>Community:</strong> {communityChats.length}</div>
          <div><strong>Resources:</strong> {resources.length}</div>
          <div><strong>Partnerships:</strong> {partnerships.length}</div>
          <div><strong>Events:</strong> {events.length}</div>
          {resultsData && (
            <div style={{ marginTop: "8px", fontSize: "9px", color: "#666" }}>
              <strong>Sample Keys:</strong> {JSON.stringify(Object.keys(resultsData)).substring(0, 100)}...
            </div>
          )}
        </div>
        
        {/* MEMBERS RESULTS SECTION */}
        <div style={{ 
          position: "absolute",
          top: "222.5px", // 80px + 42.5px + 100px padding
          left: 0,
          right: 0,
          bottom: 0,
          overflowY: "auto",
          padding: "0 48px 48px 48px"
        }}>
          {loading ? (
            <div style={{ color: "#fff", textAlign: "center", marginTop: "50px" }}>
              Loading results...
            </div>
          ) : (
            <>
              {/* MEMBERS TITLE */}
              <h1 className="hq-title" style={{ 
                color: "white", 
                fontSize: "2rem", 
                fontWeight: "700", 
                marginBottom: "25px", 
                textAlign: "center",
                textTransform: "uppercase",
                letterSpacing: "0.1em"
              }}>
                MEMBERS
              </h1>
              
              {/* MEMBERS CARDS */}
              {memberResults && memberResults.length > 0 ? (
                memberResults.map((member: any, index: number) => (
                  <div key={index} className="hq-asset-item" style={{ 
                    marginBottom: "25px", 
                    width: "100%",
                    borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                    paddingBottom: "20px"
                  }}>
                    {/* MEMBER NAME/TITLE */}
                    <a 
                      href={member.url || "#"} 
                      className="hq-asset-link" 
                      target={member.url ? "_blank" : undefined} 
                      rel={member.url ? "noopener noreferrer" : undefined}
                      style={{ 
                        display: "block",
                        color: "#949494",
                        fontSize: "1rem",
                        fontWeight: "500",
                        textDecoration: "none",
                        marginBottom: "4px",
                        letterSpacing: "0.02em",
                        wordWrap: "break-word", 
                        overflowWrap: "break-word"
                      }}
                    >
                      {member.name || member.title || "Unknown Member"}
                    </a>
                    
                    {/* MEMBER DETAILS */}
                    <div className="hq-asset-subtitle" style={{ 
                      color: "#707070",
                      fontSize: "0.875rem",
                      lineHeight: "1.5",
                      fontWeight: "400",
                      wordWrap: "break-word", 
                      overflowWrap: "break-word"
                    }}>
                      {/* QUOTE/CONTENT */}
                      {member.quote && (
                        <div style={{ 
                          fontWeight: "600", 
                          marginBottom: "8px", 
                          fontStyle: "italic",
                          color: "#949494"
                        }}>
                          "{member.quote.length > 150 ? member.quote.substring(0, 150) + '...' : member.quote}"
                        </div>
                      )}
                      
                      {/* CONTEXT */}
                      {member.context && (
                        <div style={{ 
                          marginBottom: "8px", 
                          color: "#808080"
                        }}>
                          {member.context}
                        </div>
                      )}
                      
                      {/* SOURCE INFO */}
                      <div style={{ 
                        fontSize: "12px", 
                        color: "#666", 
                        marginTop: "8px",
                        opacity: 0.8
                      }}>
                        Source: {member.source || "Unknown"}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ 
                  color: '#707070', 
                  textAlign: 'center', 
                  fontStyle: 'italic',
                  marginTop: "50px",
                  fontSize: "0.875rem"
                }}>
                  No member results found for this query.
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
        overflow: "visible" 
      }}>
        <div style={{ 
          flex: 1, 
          overflowY: "visible", 
          padding: 48,
          minHeight: "auto"
        }}>
          
          {/* SUPER VISIBLE DEBUG */}
          <div style={{ background: "red", color: "white", padding: "20px", margin: "10px 0", fontSize: "20px" }}>
            DEBUG: Right column content starts here
          </div>
          
          <div className={`hq-content-wrapper ${isAnyDropdownOpen ? 'has-open-dropdown' : ''}`}>
            
            {/* CALL RECORDINGS CATEGORY */}
            <div className={`hq-category ${callRecordingsOpen ? 'expanded' : ''}`} style={{ marginBottom: "30px" }}>
              <div className="hq-category-header">
                <a href="https://www.notion.so/call-recordings-apc" target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                  <h1 style={{ color: "#ffffff", fontSize: "20px", fontWeight: "bold", margin: "0", padding: "10px", background: "rgba(255,0,0,0.3)" }}>CALL RECORDINGS ({callResults?.length || 0})</h1>
                </a>
                <div onClick={() => toggleCategory('callRecordings')} style={{ cursor: "pointer", padding: "10px" }}>
                  <span style={{ color: "#ffffff", fontSize: "20px", background: "rgba(0,0,0,0.5)", padding: "5px" }}>▼</span>
                </div>
              </div>
              <div className={`hq-dropdown ${callRecordingsOpen ? 'open' : ''}`}>
                {callResults && callResults.length > 0 ? (
                  callResults.map((asset: any, index: number) => (
                    <div key={index} className="hq-asset-item">
                      <a 
                        href={asset.url || "#"} 
                        className="hq-asset-link"
                        target={asset.url ? "_blank" : undefined} 
                        rel={asset.url ? "noopener noreferrer" : undefined}
                      >
                        {asset.title || asset.name || "Untitled Call"}
                      </a>
                      <div className="hq-asset-subtitle" style={{ wordWrap: "break-word", overflowWrap: "break-word" }}>
                        {asset.quote && (
                          <div style={{ fontStyle: "italic", marginBottom: "8px", color: "#949494" }}>
                            "{asset.quote.length > 150 ? asset.quote.substring(0, 150) + '...' : asset.quote}"
                          </div>
                        )}
                        {asset.context && (
                          <div style={{ color: "#808080", marginBottom: "8px" }}>
                            {asset.context}
                          </div>
                        )}
                        <div style={{ fontSize: "12px", color: "#666", opacity: 0.8 }}>
                          Source: {asset.source || "Unknown"}
                        </div>
                      </div>
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
            
            <div style={{ background: "yellow", color: "black", padding: "10px", margin: "20px 0" }}>
              DEBUG: RESOURCES CATEGORY SHOULD BE BELOW THIS
            </div>
            
            {/* RESOURCES CATEGORY */}
            <div className={`hq-category ${resourcesOpen ? 'expanded' : ''}`} style={{ border: "1px solid red", margin: "10px 0", opacity: 1, visibility: "visible" }}>
              <div className="hq-category-header">
                <a href="https://www.notion.so/resources-apc" target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                  <h1 style={{ color: "#ffffff", fontSize: "20px", fontWeight: "bold", margin: "0", padding: "10px", background: "rgba(255,0,0,0.3)" }}>RESOURCES ({resourceResults?.length || 0})</h1>
                </a>
                <div onClick={() => toggleCategory('resources')} style={{ cursor: "pointer", padding: "10px" }}>
                  <span style={{ color: "#ffffff", fontSize: "20px", background: "rgba(0,0,0,0.5)", padding: "5px" }}>▼</span>
                </div>
              </div>
              <div className={`hq-dropdown ${resourcesOpen ? 'open' : ''}`}>
                {resourceResults && resourceResults.length > 0 ? (
                  resourceResults.map((asset: any, index: number) => (
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
                        {asset.summary || asset.description || asset.content ? 
                          ((asset.summary || asset.description || asset.content).length > 200 ? 
                            (asset.summary || asset.description || asset.content).substring(0, 200) + '...' : 
                            (asset.summary || asset.description || asset.content)) : 
                          "No description available"
                        }
                      </div>
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
            
            <div style={{ background: "blue", color: "white", padding: "10px", margin: "20px 0" }}>
              DEBUG: PARTNERSHIPS CATEGORY SHOULD BE BELOW THIS
            </div>
            
            {/* PARTNERSHIPS CATEGORY */}
            <div className={`hq-category ${partnershipsOpen ? 'expanded' : ''}`} style={{ border: "1px solid blue", margin: "10px 0", opacity: 1, visibility: "visible" }}>
              <div className="hq-category-header">
                <a href="https://www.notion.so/partnerships-apc" target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                  <h1 style={{ color: "#ffffff", fontSize: "20px", fontWeight: "bold", margin: "0", padding: "10px", background: "rgba(0,0,255,0.3)" }}>PARTNERSHIPS ({partnerResults?.length || 0})</h1>
                </a>
                <div onClick={() => toggleCategory('partnerships')} style={{ cursor: "pointer", padding: "10px" }}>
                  <span style={{ color: "#ffffff", fontSize: "20px", background: "rgba(0,0,0,0.5)", padding: "5px" }}>▼</span>
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
                            borderTop: "1px solid rgba(255,255,255,0.1)",
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
            
            <div style={{ background: "green", color: "white", padding: "10px", margin: "20px 0" }}>
              DEBUG: EVENTS CATEGORY SHOULD BE BELOW THIS
            </div>
            
            {/* EVENTS CATEGORY */}
            <div className={`hq-category ${eventsOpen ? 'expanded' : ''}`} style={{ border: "1px solid green", margin: "10px 0", opacity: 1, visibility: "visible" }}>
              <div className="hq-category-header">
                <a href="https://www.notion.so/events-apc" target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                  <h1 style={{ color: "#ffffff", fontSize: "20px", fontWeight: "bold", margin: "0", padding: "10px", background: "rgba(0,255,0,0.3)" }}>EVENTS ({eventResults?.length || 0})</h1>
                </a>
                <div onClick={() => toggleCategory('events')} style={{ cursor: "pointer", padding: "10px" }}>
                  <span style={{ color: "#ffffff", fontSize: "20px", background: "rgba(0,0,0,0.5)", padding: "5px" }}>▼</span>
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
