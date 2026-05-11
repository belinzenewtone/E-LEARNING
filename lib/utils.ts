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
      return "text-emerald-400 bg-emerald-400/10";
    case "intermediate":
      return "text-amber-400 bg-amber-400/10";
    case "advanced":
      return "text-red-400 bg-red-400/10";
    default:
      return "text-muted-foreground bg-muted";
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "completed":
      return "text-emerald-400 bg-emerald-400/10 border-emerald-400/20";
    case "in-progress":
    case "active":
      return "text-cyan-400 bg-cyan-400/10 border-cyan-400/20";
    case "submitted":
      return "text-blue-400 bg-blue-400/10 border-blue-400/20";
    case "needs-improvement":
      return "text-amber-400 bg-amber-400/10 border-amber-400/20";
    case "locked":
      return "text-muted-foreground bg-muted border-border";
    case "not-started":
      return "text-muted-foreground bg-muted border-border";
    case "overdue":
      return "text-red-400 bg-red-400/10 border-red-400/20";
    default:
      return "text-muted-foreground bg-muted border-border";
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
