'use client';

import { useRef } from 'react';

function getColor(score: number) {
  if (score < 5) {
    const pct = score / 5;
    const r = 220 + pct * (250 - 220);
    const g = 38 + pct * (204 - 38);
    const b = 38 + pct * (21 - 38);
    return `rgb(${r}, ${g}, ${b})`;
  } else if (score < 9) {
    const pct = (score - 5) / 4;
    const r = 250 - pct * (250 - 22);
    const g = 204 - pct * (204 - 163);
    const b = 21 + pct * (74 - 21);
    return `rgb(${r}, ${g}, ${b})`;
  } else {
    const pct = (score - 9) / 1;
    const r = 22 + pct * (147 - 22);
    const g = 163 - pct * (163 - 51);
    const b = 74 + pct * (234 - 74);
    return `rgb(${r}, ${g}, ${b})`;
  }
}

export default function ScoreMeterPill({
  value,
  onChange,
}: {
  value: number;
  onChange: (val: number) => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);

  const score = value;
  const scorePercent = score / 10;

  return (
    <div className="relative w-full h-14" ref={trackRef}>
      {/* Track */}
      <div
        className="w-full h-14 rounded-full"
        style={{ backgroundColor: getColor(score) }}
      />

      {/* Invisible range input */}
      <input
        type="range"
        min={0}
        max={10}
        step={0.1}
        value={score}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="absolute top-0 left-0 w-full h-14 opacity-0 z-10 cursor-pointer"
      />

      {/* Score bubble */}
      <div
        className="absolute top-0 text-black font-bold flex items-center justify-center pointer-events-none transition-[left] duration-100 ease-out"
        style={{
          left: `calc(${scorePercent * 100}% - ${scorePercent * 48}px)`,
          width: '56px',
          height: '56px',
          backgroundColor: '#ffffff',
          borderRadius: '9999px',
          pointerEvents: 'none',
        }}
      >
        {score.toFixed(1)}
      </div>
    </div>
  );
}
