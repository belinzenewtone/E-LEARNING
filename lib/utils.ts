import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow, isAfter, isBefore, startOfDay } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  return format(new Date(date), "MMM d, yyyy");
}

export function formatDateShort(date: Date | string): string {
  return format(new Date(date), "MMM d");
}

export function formatDateTime(date: Date | string): string {
  return format(new Date(date), "MMM d, yyyy 'at' h:mm a");
}

export function timeAgo(date: Date | string): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function isOverdue(dueDate: Date | string): boolean {
  return isBefore(new Date(dueDate), startOfDay(new Date()));
}

export function isDueSoon(dueDate: Date | string, daysThreshold = 3): boolean {
  const due = new Date(dueDate);
  const threshold = new Date();
  threshold.setDate(threshold.getDate() + daysThreshold);
  return isAfter(due, new Date()) && isBefore(due, threshold);
}

export function minutesToHours(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export function percentOf(value: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + "…";
}

export function getDifficultyColor(difficulty: string): string {
  switch (difficulty) {
    case "beginner":
      return "text-[var(--token-emerald)] bg-[var(--token-emerald)]/10";
    case "intermediate":
      return "text-[var(--token-amber)] bg-[var(--token-amber)]/10";
    case "advanced":
      return "text-[var(--token-red)] bg-[var(--token-red)]/10";
    default:
      return "text-muted-foreground bg-muted";
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "completed":
      return "text-[var(--token-emerald)] bg-[var(--token-emerald)]/10 border-[var(--token-emerald)]/20";
    case "in-progress":
    case "active":
      return "text-[var(--token-cyan)] bg-[var(--token-cyan)]/10 border-[var(--token-cyan)]/20";
    case "submitted":
      return "text-[var(--token-blue)] bg-[var(--token-blue)]/10 border-[var(--token-blue)]/20";
    case "needs-improvement":
      return "text-[var(--token-amber)] bg-[var(--token-amber)]/10 border-[var(--token-amber)]/20";
    case "locked":
      return "text-muted-foreground bg-muted border-border";
    case "not-started":
      return "text-muted-foreground bg-muted border-border";
    case "overdue":
      return "text-[var(--token-red)] bg-[var(--token-red)]/10 border-[var(--token-red)]/20";
    default:
      return "text-muted-foreground bg-muted border-border";
  }
}

/** Return a hex color for a given track slug (for SVG / chart usage) */
export function getTrackColor(slug: string): string {
  switch (slug) {
    case "web":
      return "#22d3ee";
    case "data":
      return "#34d399";
    default:
      return "#94a3b8";
  }
}

/** Return CSS variable–based color class for track progress bars */
export function getTrackColorClass(slug: string): string {
  switch (slug) {
    case "web":
      return "bg-[var(--token-cyan)]";
    case "data":
      return "bg-[var(--token-emerald)]";
    default:
      return "bg-muted-foreground";
  }
}

export function getMoodEmoji(mood: string): string {
  switch (mood) {
    case "great": return "🚀";
    case "good": return "😊";
    case "neutral": return "😐";
    case "tired": return "😴";
    case "frustrated": return "😤";
    default: return "😊";
  }
}
