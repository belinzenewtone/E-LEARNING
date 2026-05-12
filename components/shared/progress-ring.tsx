"use client";

import { useState, useEffect } from "react";

interface ProgressRingProps {
  value: number; // 0–100
  size?: number;
  strokeWidth?: number;
  color?: string;
  label?: string;
}

export function ProgressRing({
  value,
  size = 80,
  strokeWidth = 6,
  color = "var(--token-cyan)", // adaptive token
  label,
}: ProgressRingProps) {
  const clampedValue = Math.min(100, Math.max(0, value));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clampedValue / 100) * circumference;
  const center = size / 2;

  const [animatedOffset, setAnimatedOffset] = useState(circumference);

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      setAnimatedOffset(offset);
    });
    return () => cancelAnimationFrame(raf);
  }, [offset]);

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
        aria-label={`${clampedValue}% progress`}
        role="img"
      >
        {/* Track */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted/30"
        />
        {/* Progress arc */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={animatedOffset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.6s ease-out" }}
        />
      </svg>

      {/* Center label */}
      {label !== undefined ? (
        <span className="absolute text-xs font-semibold text-foreground">
          {label}
        </span>
      ) : (
        <span className="absolute text-xs font-semibold text-foreground">
          {clampedValue}%
        </span>
      )}
    </div>
  );
}
