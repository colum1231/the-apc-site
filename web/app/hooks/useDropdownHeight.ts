import { useRef, useEffect, useState } from 'react';

interface UseDropdownHeightReturn {
  dropdownRef: React.RefObject<HTMLDivElement>;
  categoryRef: React.RefObject<HTMLDivElement>;
  dropdownClassName: string;
  categoryClassName: string;
  dropdownStyle: React.CSSProperties;
  categoryStyle: React.CSSProperties;
  isAnimationComplete: boolean;
  hasTransitionEnded: boolean;
}

export const useDropdownHeight = (isOpen: boolean): UseDropdownHeightReturn => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const categoryRef = useRef<HTMLDivElement>(null);
  const [animationState, setAnimationState] = useState<'idle' | 'entering' | 'exiting'>('idle');
  const [dropdownHeight, setDropdownHeight] = useState<number>(0);
  const [isAnimationComplete, setIsAnimationComplete] = useState<boolean>(false);
  const [hasTransitionEnded, setHasTransitionEnded] = useState<boolean>(false);

  // Simple height management
  useEffect(() => {
    if (dropdownRef.current) {
      if (isOpen) {
        // Measure content height
        dropdownRef.current.style.height = 'auto';
        const scrollHeight = dropdownRef.current.scrollHeight;
        setDropdownHeight(Math.min(scrollHeight, 120)); // Cap at 120px
        dropdownRef.current.style.height = `${Math.min(scrollHeight, 120)}px`;
      } else {
        dropdownRef.current.style.height = '0px';
        setDropdownHeight(0);
      }
    }
  }, [isOpen]);

  // Handle animation state changes with transition event tracking
  useEffect(() => {
    const dropdown = dropdownRef.current;
    if (!dropdown) return;

    let fallbackTimeoutId: NodeJS.Timeout;

    const handleTransitionEnd = (event: TransitionEvent) => {
      // Only handle height transitions (not other CSS properties)
      if (event.target === dropdown && event.propertyName === 'height') {
        clearTimeout(fallbackTimeoutId);
        setIsAnimationComplete(true);
        setHasTransitionEnded(true);
        setAnimationState('idle');
      }
    };

    // Add transition end listener
    dropdown.addEventListener('transitionend', handleTransitionEnd);

    if (isOpen) {
      setAnimationState('entering');
      setIsAnimationComplete(false);
      setHasTransitionEnded(false);
      
      // Fallback timeout in case transitionend doesn't fire
      fallbackTimeoutId = setTimeout(() => {
        setIsAnimationComplete(true);
        setHasTransitionEnded(true);
        setAnimationState('idle');
      }, 350); // 300ms transition + 50ms buffer
    } else {
      setAnimationState('exiting');
      setIsAnimationComplete(false);
      setHasTransitionEnded(false);
      
      // Fallback for closing animation
      fallbackTimeoutId = setTimeout(() => {
        setAnimationState('idle');
      }, 350);
    }

    return () => {
      dropdown.removeEventListener('transitionend', handleTransitionEnd);
      clearTimeout(fallbackTimeoutId);
    };
  }, [isOpen]);

  // Handle window resize to recalculate height
  useEffect(() => {
    const handleResize = () => {
      if (dropdownRef.current) {
        dropdownRef.current.style.height = 'auto';
        const scrollHeight = dropdownRef.current.scrollHeight;
        setDropdownHeight(scrollHeight);
        dropdownRef.current.style.height = isOpen ? `${scrollHeight}px` : '0px';
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isOpen]);

  // Generate class names for stable container states
  const dropdownClassName = isOpen ? 'dropdown-open' : 'dropdown-closed';
  
  const categoryClassName = animationState === 'entering' 
    ? 'dropdown-enter' 
    : animationState === 'exiting' 
    ? 'dropdown-exit' 
    : '';

  // CSS custom properties for dynamic height and space reservation
  const dropdownStyle: React.CSSProperties = {
    '--dropdown-height': `${dropdownHeight}px`,
  } as React.CSSProperties;

  const categoryStyle: React.CSSProperties = {
    '--reserved-dropdown-space': `${dropdownHeight + 20}px`, // Add 20px buffer for spacing
  } as React.CSSProperties;

  return { 
    dropdownRef, 
    categoryRef, 
    dropdownClassName,
    categoryClassName,
    dropdownStyle,
    categoryStyle,
    isAnimationComplete,
    hasTransitionEnded
  };
};