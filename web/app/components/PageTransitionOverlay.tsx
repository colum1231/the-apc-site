"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function PageTransitionOverlay() {
  const [visible, setVisible] = useState(true);
  const [animating, setAnimating] = useState(false);
  const router = useRouter();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fade in from black on mount, after a short delay to ensure layout/background are rendered
  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 500);
    return () => {
      clearTimeout(timer);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // Intercept route changes for fade out
  useEffect(() => {
    const handleRouteChange = (url: string) => {
      setVisible(false); // Start at opacity 0
      setAnimating(true);
      // Wait for next paint to ensure opacity is 0, then fade to 1
      requestAnimationFrame(() => {
        setVisible(true); // Animate to opacity 1
        timeoutRef.current = setTimeout(() => {
          setAnimating(false);
          // Actually navigate after fade out
          router.push(url);
        }, 500);
      });
      // Prevent default navigation
      throw "__FADE_OUT__";
    };

    // Patch router.push to intercept navigation
    const origPush = router.push;
    router.push = (url: string, ...args: any[]) => {
      if (!animating) {
        handleRouteChange(url);
      }
    };
    return () => {
      router.push = origPush;
    };
  }, [router, animating]);

  return (
    <div
      style={{
        pointerEvents: visible ? "auto" : "none",
        position: "fixed",
        zIndex: 9999,
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "#000",
        opacity: visible ? 1 : 0,
        transition: "opacity 0.5s cubic-bezier(.4,0,.2,1)",
      }}
    />
  );
}
