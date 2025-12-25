/**
 * Utility Functions
 */

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { RiskCategory, MolecularGroup } from "./types";

/**
 * Merge Tailwind classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format percentage
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Format number with commas
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

/**
 * Get color for risk category
 */
export function getRiskColor(category: RiskCategory | string): string {
  const colors: Record<string, string> = {
    LOW: "bg-emerald-500 text-white",
    INTERMEDIATE: "bg-amber-500 text-white",
    HIGH: "bg-rose-500 text-white",
  };
  return colors[category] || colors.INTERMEDIATE;
}

/**
 * Get color for molecular group
 */
export function getMolecularColor(group: MolecularGroup | string): string {
  const colors: Record<string, string> = {
    POLEmut: "bg-emerald-500 text-white",
    MMRd: "bg-blue-500 text-white",
    NSMP: "bg-slate-500 text-white",
    p53abn: "bg-rose-500 text-white",
  };
  return colors[group] || colors.NSMP;
}

/**
 * Get display name for molecular group
 */
export function getMolecularDisplayName(group: MolecularGroup | string): string {
  const names: Record<string, string> = {
    POLEmut: "POLE Ultramutated",
    MMRd: "MMR Deficient",
    NSMP: "No Specific Molecular Profile",
    p53abn: "p53 Abnormal",
  };
  return names[group] || group;
}

/**
 * Get icon name for molecular group
 */
export function getMolecularIcon(group: MolecularGroup | string): string {
  const icons: Record<string, string> = {
    POLEmut: "shield-check",
    MMRd: "dna",
    NSMP: "minus-circle",
    p53abn: "alert-triangle",
  };
  return icons[group] || "minus-circle";
}

/**
 * Calculate risk category from probability
 */
export function calculateRiskCategory(probability: number): RiskCategory {
  if (probability < 0.15) return "LOW";
  if (probability < 0.40) return "INTERMEDIATE";
  return "HIGH";
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Format date
 */
export function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

/**
 * Truncate text
 */
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + "...";
}

/**
 * Check if patient data is complete
 */
export function isPatientDataComplete(data: any): boolean {
  const requiredFields = [
    "age",
    "bmi",
    "stage",
    "histology",
    "grade",
    "myometrial_invasion",
    "lvsi",
    "lymph_nodes",
    "pole_status",
    "mmr_status",
    "p53_status",
    "l1cam_status",
    "ctnnb1_status",
  ];

  return requiredFields.every((field) => data[field] !== undefined && data[field] !== null && data[field] !== "");
}

/**
 * Get risk badge text
 */
export function getRiskBadgeText(category: RiskCategory | string): string {
  return String(category).replace("_", " ");
}

/**
 * Sleep utility for animations
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
