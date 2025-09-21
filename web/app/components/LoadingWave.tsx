"use client";
import { useEffect, useState } from "react";

const WAVE_COLORS = ["#232323", "#353535", "#181818"];
const BASE_COLOR = "#181818";
const TEXT = "Loading...";
const WAVE_LENGTH = 3;
const STEP_DURATION = 200; // ms per wave step (2x slower)
const LOOP_DURATION = 2000; // ms for full loop

export default function LoadingWave() {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const totalSteps = TEXT.length + WAVE_LENGTH;
    let frame = 0;
    const interval = setInterval(() => {
      setStep(frame % totalSteps);
      frame++;
    }, STEP_DURATION);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ color: BASE_COLOR, fontWeight: 600, fontSize: "1.1rem", letterSpacing: 1, fontFamily: "inherit", display: "flex", justifyContent: "center", alignItems: "center", height: 60 }}>
      {TEXT.split("").map((char, i) => {
        // Determine color for this letter based on wave position
        let color = BASE_COLOR;
        for (let w = 0; w < WAVE_LENGTH; w++) {
          if (i === step - w) color = WAVE_COLORS[w];
        }
        return (
          <span key={i} style={{ color, transition: "color 0.3s cubic-bezier(.4,0,.2,1)" }}>{char}</span>
        );
      })}
    </div>
  );
}
