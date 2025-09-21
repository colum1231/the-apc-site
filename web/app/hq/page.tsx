"use client";
import { useState, useRef } from "react";

export default function HQ(){
  const [callRecordingsOpen, setCallRecordingsOpen] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const [partnershipsOpen, setPartnershipsOpen] = useState(false);
  const [eventsOpen, setEventsOpen] = useState(false);
  // Persistent hiding state for categories below the opened dropdown
  const [categoriesHidden, setCategoriesHidden] = useState<string[]>([]);
  const categoryOrder = ['callRecordings', 'resources', 'partnerships', 'events'];
  const getCategoriesBelow = (category: string) => {
    const idx = categoryOrder.indexOf(category);
    return categoryOrder.slice(idx + 1);
  };

  // Function to handle exclusive dropdown behavior with persistent hiding
  const toggleCategory = (category: string) => {
    // If already open, close all and show all categories
    if ((category === 'callRecordings' && callRecordingsOpen) ||
        (category === 'resources' && resourcesOpen) ||
        (category === 'partnerships' && partnershipsOpen) ||
        (category === 'events' && eventsOpen)) {
      setCallRecordingsOpen(false);
      setResourcesOpen(false);
      setPartnershipsOpen(false);
      setEventsOpen(false);
      setCategoriesHidden([]);
      return;
    }
    // Hide categories below
    const below = getCategoriesBelow(category);
    setCategoriesHidden(below);
    setCallRecordingsOpen(category === 'callRecordings');
    setResourcesOpen(category === 'resources');
    setPartnershipsOpen(category === 'partnerships');
    setEventsOpen(category === 'events');
  };

  // Check if any dropdown is open (for potential future use)
  const isAnyDropdownOpen = callRecordingsOpen || resourcesOpen || partnershipsOpen || eventsOpen;
  // Helper: should a category be hidden?
  const isCategoryHidden = (cat: string) => categoriesHidden.includes(cat);

  // Dummy asset arrays
  const callRecordingsAssets = [
    { title: "PAUL DALEY APC MASTERMIND CALL", subtitle: "Money likes mastery. People want specialists.", url: "https://www.youtube.com/watch?v=g7eBdAI5UfI" },
    { title: "CHRISTIAN SHCUTTE APC MASTERMIND CALL", subtitle: "Never complain. Victims don’t scale.", url: "https://www.youtube.com/watch?v=CqUGTemCG6Y" },
    { title: "JEREMY POGUE APC MASTERMIND CALL ", subtitle: "Different is better than better.", url: "https://www.youtube.com/watch?v=6YuMjogHgb4" }
  ];

  const partnershipsAssets = [
    { title: "SIMON - GROW FACTOR | TAX ADVISOR", subtitle: "Everything tax - Bookkeeping, Dubai Setup, etc. Contact +44 7944 089333", url: "www.growfactor.com/theaplayersclub" },
    { title: "AMBRO - NETREVENUE | ROLE PLACEMENT SERVICE", subtitle: "Land a dream-offer. Apply here: https://ors3cjx0acy.typeform.com/to/OKsVOXuN", url: "https://www.netrevenue.io/" },
    { title: "KEVIN - KCCAPITAL | FINANCIAL INVESTMENT ADVISOR", subtitle: "Have your money work for you while you sleep. Contact +44 7832 361375", url: "https://kccapital.co.uk " }
  ];

  const resourcessAssets = [
    { title: "0-900K/pm 130 PAGE DOC", subtitle: "Everything you need. Learn from the best. Implement what works.", url: "https://www.notion.so/0-900K-pm-130-PAGE-DOC-26fa05852924815a8555ecd6bb89e6de" },
    { title: "MEMBER ROLODEX", subtitle: "Find your next business partner. Your next mentor. Your next brother.", url: "https://www.notion.so/MEMBER-ROLODEX-26fa0585292480219de7d18b533976e5" },
    { title: "MONEY LESSONS W/ JAMES", subtitle: "Why being dumb will make you more money.", url: "https://www.notion.so/MONEY-LESSONS-W-JAMES-26fa0585292480018439e25d53deee1e" }
  ];

  const eventsAssets = [
    { title: "MARBELLA MASTERMIND 2025", subtitle: "https://www.youtube.com/watch?v=gc1prRt8jkU&t=1237s", url: "https://www.youtube.com/watch?v=gc1prRt8jkU&t=1237s" },
    { title: "AUSTRIA SKI TRIP 2024", subtitle: "https://www.youtube.com/watch?v=q_-DRVq2ypU&t=33s", url: "https://www.youtube.com/watch?v=q_-DRVq2ypU&t=33s" },
    { title: "MARBELLA MASTERMIND 2024", subtitle: "https://www.youtube.com/watch?v=XLSQ6Pa6l7U&t=845s", url: "https://www.youtube.com/watch?v=XLSQ6Pa6l7U&t=845s" }
  ];

  return (
    <main className="hq-container" style={{ background: "#000 url('/res+cat_back.jpg') center/cover no-repeat fixed", minHeight: "100vh" }}>
      <section className={`hq-content-wrapper ${isAnyDropdownOpen ? 'has-open-dropdown' : ''}`} style={{ paddingTop: 50 }}>
        {/* CALL RECORDINGS CATEGORY */}
  <div className={`hq-category ${callRecordingsOpen ? 'expanded' : ''}`} style={{ marginBottom: 30, marginLeft: -20, position: "relative", left: -20, transform: "translateX(-20px)", opacity: isCategoryHidden('callRecordings') ? 0 : 1, pointerEvents: isCategoryHidden('callRecordings') ? 'none' : undefined }}>
          <div className="hq-category-header" style={{ display: "flex", alignItems: "center", width: "90%" }}>
            <a href="https://www.notion.so/call-recordings-apc" target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", flex: 1 }}>
              <h1 style={{ color: "#8b8989", fontSize: 20, fontWeight: "bold", margin: 0, padding: 0 }}>CALL RECORDINGS</h1>
            </a>
            <div onClick={() => toggleCategory('callRecordings')} style={{ cursor: "pointer", padding: 0, marginLeft: 5 }}>
              <span style={{ color: "#707070", fontSize: 12, transform: callRecordingsOpen ? "rotate(0deg)" : "rotate(-90deg)", transition: "transform 0.6s ease", display: "inline-block" }}>▼</span>
            </div>
          </div>
          <div className={`hq-dropdown ${callRecordingsOpen ? 'open' : ''}`}> 
            {callRecordingsAssets.map((asset, index) => (
              <div key={index} className="hq-asset-item" style={{ marginBottom: 25, width: "100%", borderBottom: "1px solid rgba(255,255,255,0)", paddingBottom: 20 }}>
                <div style={{ color: "#8b8989", fontWeight: 600, fontSize: 15.5, marginBottom: 2 }}>{asset.title}</div>
                <div style={{ color: "#8b8989", fontSize: 14.5, fontStyle: "italic", fontWeight: 400 }}>{asset.subtitle}</div>
                {asset.url && (
                  <div style={{ color: "#6faaff", fontSize: "0.9375rem", marginTop: 2 }}>
                    <a href={asset.url} target="_blank" rel="noopener noreferrer" style={{ color: "#6faaff", textDecoration: "underline" }}>{asset.url}</a>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        
        {/* RESOURCES CATEGORY */}
  <div className={`hq-category ${resourcesOpen ? 'expanded' : ''}`} style={{ marginLeft: -20, position: "relative", left: -20, transform: "translateX(-20px)", opacity: isCategoryHidden('resources') ? 0 : 1, pointerEvents: isCategoryHidden('resources') ? 'none' : undefined }}>
          <div className="hq-category-header" style={{ display: "flex", alignItems: "center", width: "90%" }}>
            <a href="https://www.notion.so/resources-apc" target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", flex: 1 }}>
              <h1 style={{ color: "#8b8989", fontSize: 20, fontWeight: "bold", margin: 0, padding: 0 }}>RESOURCES</h1>
            </a>
            <div onClick={() => toggleCategory('resources')} style={{ cursor: "pointer", padding: 0, marginLeft: 5 }}>
              <span style={{ color: "#707070", fontSize: 12, transform: resourcesOpen ? "rotate(0deg)" : "rotate(-90deg)", transition: "transform 0.6s ease", display: "inline-block" }}>▼</span>
            </div>
          </div>
          <div className={`hq-dropdown ${resourcesOpen ? 'open' : ''}`}> 
            {resourcessAssets.map((asset, index) => (
              <div key={index} className="hq-asset-item" style={{ marginBottom: 25, width: "100%", borderBottom: "1px solid rgba(255,255,255,0)", paddingBottom: 20 }}>
                <div style={{ color: "#8b8989", fontWeight: 600, fontSize: 16.5, marginBottom: 2 }}>
                  <a href={asset.url} target="_blank" rel="noopener noreferrer" style={{ color: "#8b8989", textDecoration: "underline" }}>{asset.title}</a>
                </div>
                <div style={{ color: "#8b8989", fontSize: 15.5, fontStyle: "italic", fontWeight: 400 }}>{asset.subtitle}</div>
                {asset.url && (
                  <div style={{ color: "#6faaff", fontSize: "1.0375rem", marginTop: 2 }}>
                    <a href={asset.url} target="_blank" rel="noopener noreferrer" style={{ color: "#6faaff", textDecoration: "underline" }}>{asset.url}</a>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        
        {/* PARTNERSHIPS CATEGORY */}
  <div className={`hq-category ${partnershipsOpen ? 'expanded' : ''}`} style={{ marginLeft: -20, position: "relative", left: -20, transform: "translateX(-20px)", opacity: isCategoryHidden('partnerships') ? 0 : 1, pointerEvents: isCategoryHidden('partnerships') ? 'none' : undefined }}>
          <div className="hq-category-header" style={{ display: "flex", alignItems: "center", width: "90%" }}>
            <a href="https://www.notion.so/partnerships-apc" target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", flex: 1 }}>
              <h1 style={{ color: "#8b8989", fontSize: 21, fontWeight: "bold", margin: 0, padding: 0 }}>PARTNERSHIPS</h1>
            </a>
            <div onClick={() => toggleCategory('partnerships')} style={{ cursor: "pointer", padding: 0, marginLeft: 5 }}>
              <span style={{ color: "#707070", fontSize: 12, transform: partnershipsOpen ? "rotate(0deg)" : "rotate(-90deg)", transition: "transform 0.6s ease", display: "inline-block" }}>▼</span>
            </div>
          </div>
          <div className={`hq-dropdown ${partnershipsOpen ? 'open' : ''}`}> 
            {partnershipsAssets.map((asset, index) => (
              <div key={index} className="hq-asset-item" style={{ marginBottom: 25, width: "100%", borderBottom: "1px solid rgba(255,255,255,0)", paddingBottom: 20 }}>
                <div style={{ color: "#8b8989", fontWeight: 600, fontSize: 16.5, marginBottom: 2 }}>
                  <a href={asset.url} target="_blank" rel="noopener noreferrer" style={{ color: "#8b8989", textDecoration: "underline" }}>{asset.title}</a>
                </div>
                <div style={{ color: "#8b8989", fontSize: 15.5, fontStyle: "italic", fontWeight: 400 }}>{asset.subtitle}</div>
                {asset.url && (
                  <div style={{ color: "#6faaff", fontSize: "1.0375rem", marginTop: 2 }}>
                    <a href={asset.url} target="_blank" rel="noopener noreferrer" style={{ color: "#6faaff", textDecoration: "underline" }}>{asset.url}</a>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        
        {/* EVENTS CATEGORY */}
  <div className={`hq-category ${eventsOpen ? 'expanded' : ''}`} style={{ marginLeft: -20, position: "relative", left: -20, transform: "translateX(-20px)", opacity: isCategoryHidden('events') ? 0 : 1, pointerEvents: isCategoryHidden('events') ? 'none' : undefined }}>
          <div className="hq-category-header" style={{ display: "flex", alignItems: "center", width: "90%" }}>
            <a href="https://www.notion.so/events-apc" target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", flex: 1 }}>
              <h1 style={{ color: "#8b8989", fontSize: 20, fontWeight: "bold", margin: 0, padding: 0 }}>EVENTS</h1>
            </a>
            <div onClick={() => toggleCategory('events')} style={{ cursor: "pointer", padding: 0, marginLeft: 5 }}>
              <span style={{ color: "#707070", fontSize: 12, transform: eventsOpen ? "rotate(0deg)" : "rotate(-90deg)", transition: "transform 0.6s ease", display: "inline-block" }}>▼</span>
            </div>
          </div>
          <div className={`hq-dropdown ${eventsOpen ? 'open' : ''}`}> 
            {eventsAssets.map((asset, index) => (
              <div key={index} className="hq-asset-item" style={{ marginBottom: 25, width: "100%", borderBottom: "1px solid rgba(255,255,255,0)", paddingBottom: 20 }}>
                <div style={{ color: "#8b8989", fontWeight: 600, fontSize: 16.5, marginBottom: 2 }}>
                  <a href={asset.url} target="_blank" rel="noopener noreferrer" style={{ color: "#8b8989", textDecoration: "underline" }}>{asset.title}</a>
                </div>
                <div style={{ color: "#8b8989", fontSize: 15.5, fontStyle: "italic", fontWeight: 400 }}>{asset.subtitle}</div>
                {asset.url && (
                  <div style={{ color: "#6faaff", fontSize: "1.0375rem", marginTop: 2 }}>
                    <a href={asset.url} target="_blank" rel="noopener noreferrer" style={{ color: "#6faaff", textDecoration: "underline" }}>{asset.url}</a>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
