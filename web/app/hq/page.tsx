"use client";
import { useState } from "react";

export default function HQ(){
  const [callRecordingsOpen, setCallRecordingsOpen] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const [partnershipsOpen, setPartnershipsOpen] = useState(false);
  const [eventsOpen, setEventsOpen] = useState(false);

  // Function to handle exclusive dropdown behavior
  const toggleCategory = (category: string) => {
    setCallRecordingsOpen(category === 'callRecordings' ? !callRecordingsOpen : false);
    setResourcesOpen(category === 'resources' ? !resourcesOpen : false);
    setPartnershipsOpen(category === 'partnerships' ? !partnershipsOpen : false);
    setEventsOpen(category === 'events' ? !eventsOpen : false);
  };

  // Check if any dropdown is open
  const isAnyDropdownOpen = callRecordingsOpen || resourcesOpen || partnershipsOpen || eventsOpen;

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
    <main className="hq-container">
      <section className={`hq-content-wrapper ${isAnyDropdownOpen ? 'hq-content-wrapper--compact' : ''}`}>
        <div className="hq-category">
          <div className="hq-category-header">
            <a href="https://www.notion.so/call-recordings-apc" target="_blank" rel="noopener noreferrer" className="hq-title-link">
              <h1 className="hq-title">CALL RECORDINGS</h1>
            </a>
            <div className="hq-dropdown-trigger" onClick={() => toggleCategory('callRecordings')}>
              <span className={`hq-dropdown-arrow ${callRecordingsOpen ? 'open' : ''}`}>▼</span>
            </div>
          </div>
        </div>
        {callRecordingsOpen && (
          <div className="hq-dropdown">
            {callRecordingsAssets.map((asset, index) => (
              <div key={index} className="hq-asset-item">
                <a href={asset.url} className="hq-asset-link">{asset.title}</a>
                <div className="hq-asset-subtitle">{asset.subtitle}</div>
              </div>
            ))}
          </div>
        )}
        
        <div className="hq-category">
          <div className="hq-category-header">
            <a href="https://www.notion.so/resources-apc" target="_blank" rel="noopener noreferrer" className="hq-title-link">
              <h1 className="hq-title">RESOURCES</h1>
            </a>
            <div className="hq-dropdown-trigger" onClick={() => toggleCategory('resources')}>
              <span className={`hq-dropdown-arrow ${resourcesOpen ? 'open' : ''}`}>▼</span>
            </div>
          </div>
        </div>
        {resourcesOpen && (
          <div className="hq-dropdown">
            {resourcessAssets.map((asset, index) => (
              <div key={index} className="hq-asset-item">
                <a href={asset.url} className="hq-asset-link">{asset.title}</a>
                <div className="hq-asset-subtitle">{asset.subtitle}</div>
              </div>
            ))}
          </div>
        )}
        
        <div className="hq-category">
          <div className="hq-category-header">
            <a href="https://www.notion.so/partnerships-apc" target="_blank" rel="noopener noreferrer" className="hq-title-link">
              <h1 className="hq-title">PARTNERSHIPS</h1>
            </a>
            <div className="hq-dropdown-trigger" onClick={() => toggleCategory('partnerships')}>
              <span className={`hq-dropdown-arrow ${partnershipsOpen ? 'open' : ''}`}>▼</span>
            </div>
          </div>
        </div>
        {partnershipsOpen && (
          <div className="hq-dropdown">
            {partnershipsAssets.map((asset, index) => (
              <div key={index} className="hq-asset-item">
                <a href={asset.url} className="hq-asset-link">{asset.title}</a>
                <div className="hq-asset-subtitle">{asset.subtitle}</div>
              </div>
            ))}
          </div>
        )}
        
        <div className="hq-category">
          <div className="hq-category-header">
            <a href="https://www.notion.so/events-apc" target="_blank" rel="noopener noreferrer" className="hq-title-link">
              <h1 className="hq-title">EVENTS</h1>
            </a>
            <div className="hq-dropdown-trigger" onClick={() => toggleCategory('events')}>
              <span className={`hq-dropdown-arrow ${eventsOpen ? 'open' : ''}`}>▼</span>
            </div>
          </div>
        </div>
        {eventsOpen && (
          <div className="hq-dropdown">
            {eventsAssets.map((asset, index) => (
              <div key={index} className="hq-asset-item">
                <a href={asset.url} className="hq-asset-link">{asset.title}</a>
                <div className="hq-asset-subtitle">{asset.subtitle}</div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
