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
export function getRiskColor(category: RiskCategory): string {
  const colors: Record<RiskCategory, string> = {
    LOW: "#22c55e", // Green
    INTERMEDIATE: "#f59e0b", // Amber
    HIGH: "#ef4444", // Red
  };
  return colors[category];
}

/**
 * Get color for molecular group
 */
export function getMolecularColor(group: MolecularGroup): string {
  const colors: Record<MolecularGroup, string> = {
    POLEmut: "#10b981", // Emerald
    MMRd: "#3b82f6", // Blue
    NSMP: "#64748b", // Slate
    p53abn: "#ef4444", // Red
  };
  return colors[group];
}

/**
 * Get display name for molecular group
 */
export function getMolecularDisplayName(group: MolecularGroup): string {
  const names: Record<MolecularGroup, string> = {
    POLEmut: "POLE Ultramutated",
    MMRd: "MMR Deficient",
    NSMP: "No Specific Molecular Profile",
    p53abn: "p53 Abnormal",
  };
  return names[group];
}

/**
 * Get icon name for molecular group
 */
export function getMolecularIcon(group: MolecularGroup): string {
  const icons: Record<MolecularGroup, string> = {
    POLEmut: "shield-check",
    MMRd: "dna",
    NSMP: "minus-circle",
    p53abn: "alert-triangle",
  };
  return icons[group];
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
export function getRiskBadgeText(category: RiskCategory): string {
  return category.replace("_", " ");
}

/**
 * Sleep utility for animations
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
