"use client";
import { useState, useRef, useEffect } from "react";
import { useDropdownHeight } from "../hooks/useDropdownHeight";
import DropdownAssets from "../components/DropdownAssets";

export default function HQ(){
  const [callRecordingsOpen, setCallRecordingsOpen] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const [partnershipsOpen, setPartnershipsOpen] = useState(false);
  const [eventsOpen, setEventsOpen] = useState(false);

  // Ref for the last category to ensure it stays visible
  const lastCategoryRef = useRef<HTMLDivElement>(null);

  // Custom hooks for smooth dropdown height animations
  const callRecordingsDropdown = useDropdownHeight(callRecordingsOpen);
  const resourcesDropdown = useDropdownHeight(resourcesOpen);
  const partnershipsDropdown = useDropdownHeight(partnershipsOpen);
  const eventsDropdown = useDropdownHeight(eventsOpen);

  // Function to handle exclusive dropdown behavior with smooth collapse timing
  const toggleCategory = (category: string) => {
    const isCurrentlyOpen = 
      (category === 'callRecordings' && callRecordingsOpen) ||
      (category === 'resources' && resourcesOpen) ||
      (category === 'partnerships' && partnershipsOpen) ||
      (category === 'events' && eventsOpen);

    if (isCurrentlyOpen) {
      // CLOSING: First close the dropdown, let margins animate naturally
      setCallRecordingsOpen(false);
      setResourcesOpen(false);
      setPartnershipsOpen(false);
      setEventsOpen(false);
    } else {
      // OPENING: Close others first, then open the selected one
      setCallRecordingsOpen(category === 'callRecordings');
      setResourcesOpen(category === 'resources');
      setPartnershipsOpen(category === 'partnerships');
      setEventsOpen(category === 'events');
    }
  };

  // Check if any dropdown is open and track which one
  const isAnyDropdownOpen = callRecordingsOpen || resourcesOpen || partnershipsOpen || eventsOpen;
  
  // Effect to ensure last category stays visible when dropdowns open
  useEffect(() => {
    if (isAnyDropdownOpen && lastCategoryRef.current) {
      // Scroll the last category into view if it's hidden
      setTimeout(() => {
        lastCategoryRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'end',
          inline: 'nearest'
        });
      }, 100); // Small delay to let layout settle
    }
  }, [isAnyDropdownOpen]);
  
  // Get the index of the currently active dropdown (-1 if none open)
  const getActiveDropdownIndex = () => {
    if (callRecordingsOpen) return 0;
    if (resourcesOpen) return 1;
    if (partnershipsOpen) return 2;
    if (eventsOpen) return 3;
    return -1;
  };

  const activeDropdownIndex = getActiveDropdownIndex();

  // Calculate dynamic spacing for categories below active dropdown
  const calculateCategorySpacing = (currentIndex: number) => {
    // Base margin between categories (default spacing)
    const baseCategorySpacing = '1.5rem';
    
    // Moderate extra spacing for dropdown content (much smaller)
    const dropdownSpaceNeeded = '3rem';
    
    // Only add extra spacing if:
    // 1. There's an active dropdown (activeDropdownIndex !== -1)
    // 2. Current category is BELOW the active dropdown (currentIndex > activeDropdownIndex)
    const shouldAddExtraSpacing = activeDropdownIndex !== -1 && currentIndex > activeDropdownIndex;
    
    return {
      marginTop: shouldAddExtraSpacing ? dropdownSpaceNeeded : baseCategorySpacing
    };
  };

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

  // Category configuration for clean mapping
  const categories = [
    {
      id: 'callRecordings',
      title: 'CALL RECORDINGS',
      isOpen: callRecordingsOpen,
      assets: callRecordingsAssets,
      dropdown: callRecordingsDropdown,
      notionUrl: 'https://www.notion.so/call-recordings-apc'
    },
    {
      id: 'resources',
      title: 'RESOURCES', 
      isOpen: resourcesOpen,
      assets: resourcessAssets,
      dropdown: resourcesDropdown,
      notionUrl: 'https://www.notion.so/resources-apc'
    },
    {
      id: 'partnerships',
      title: 'PARTNERSHIPS',
      isOpen: partnershipsOpen, 
      assets: partnershipsAssets,
      dropdown: partnershipsDropdown,
      notionUrl: 'https://www.notion.so/partnerships-apc'
    },
    {
      id: 'events',
      title: 'EVENTS',
      isOpen: eventsOpen,
      assets: eventsAssets, 
      dropdown: eventsDropdown,
      notionUrl: 'https://www.notion.so/events-apc'
    }
  ];

  return (
    <main className="hq-container">
      <section className={`hq-content-wrapper ${isAnyDropdownOpen ? 'has-open-dropdown' : ''}`}>
        {categories.map((category, index) => {
          const isLastCategory = index === categories.length - 1;
          
          // Get dynamic spacing for this category based on its position relative to active dropdown
          const dynamicSpacing = calculateCategorySpacing(index);
          
          // Apply spacing normally - no special positioning for last category
          const combinedStyles = {
            ...category.dropdown.categoryStyle,
            ...dynamicSpacing,
          };

          return (
            <div 
              key={category.id}
              ref={(el) => {
                // Set the dropdown ref for animation
                if (category.dropdown.categoryRef) {
                  (category.dropdown.categoryRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
                }
                // Set the last category ref for visibility tracking
                if (isLastCategory) {
                  lastCategoryRef.current = el;
                }
              }}
              className={`hq-category ${category.dropdown.categoryClassName} ${category.isOpen ? 'expanded' : ''} ${isLastCategory ? 'hq-category-last' : ''}`}
              style={combinedStyles}
            >
              <div className="hq-category-header">
                <a href={category.notionUrl} target="_blank" rel="noopener noreferrer" className="hq-title-link">
                  <h1 className="hq-title">{category.title}</h1>
                </a>
                <div className="hq-dropdown-trigger" onClick={() => toggleCategory(category.id)}>
                  <span className={`hq-dropdown-arrow ${category.isOpen ? 'open' : ''}`}>▼</span>
                </div>
              </div>
              <div 
                ref={category.dropdown.dropdownRef} 
                className={`hq-dropdown ${category.dropdown.dropdownClassName}`}
                style={category.dropdown.dropdownStyle}
              >
                <DropdownAssets 
                  assets={category.assets}
                  isOpen={category.isOpen}
                  hasTransitionEnded={category.dropdown.hasTransitionEnded}
                />
              </div>
            </div>
          );
        })}
      </section>
    </main>
  );
}
