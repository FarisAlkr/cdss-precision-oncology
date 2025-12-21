"use client";

import { cn, getRiskColor } from "@/lib/utils";
import { RiskCategory } from "@/lib/types";

interface RiskGaugeProps {
  value: number; // 0-100
  category: RiskCategory;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
  className?: string;
}

export function RiskGauge({
  value,
  category,
  size = "md",
  showValue = true,
  className,
}: RiskGaugeProps) {
  const sizes = {
    sm: { container: "w-32 h-32", stroke: 6, text: "text-2xl" },
    md: { container: "w-48 h-48", stroke: 8, text: "text-4xl" },
    lg: { container: "w-64 h-64", stroke: 10, text: "text-5xl" },
  };

  const { container, stroke, text } = sizes[size];
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  const colorClass = getRiskColor(category);
  const strokeColor = {
    LOW: "#10b981",
    INTERMEDIATE: "#f59e0b",
    HIGH: "#ef4444",
  }[category];

  return (
    <div className={cn("relative inline-flex items-center justify-center", container, className)}>
      <svg className="transform -rotate-90" width="100%" height="100%" viewBox="0 0 100 100">
        {/* Background circle */}
        <circle
          cx="50"
          cy="50"
          r={radius}
          stroke="#e5e7eb"
          strokeWidth={stroke}
          fill="none"
        />
        {/* Progress circle */}
        <circle
          cx="50"
          cy="50"
          r={radius}
          stroke={strokeColor}
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
          style={{ filter: `drop-shadow(0 0 6px ${strokeColor}40)` }}
        />
      </svg>
      {showValue && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className={cn("font-bold", text, colorClass)}>{value.toFixed(1)}%</div>
          <div className={cn("text-xs font-medium mt-1", colorClass)}>{category} RISK</div>
        </div>
      )}
    </div>
  );
}
