import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatDistanceToNow, format, isToday, isYesterday } from "date-fns";

// ── Class merging ─────────────────────────────────────────────

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ── Formatting ────────────────────────────────────────────────

export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function formatDate(date: Date | string): string {
  const d = new Date(date);
  if (isToday(d)) return `Today, ${format(d, "h:mm a")}`;
  if (isYesterday(d)) return `Yesterday, ${format(d, "h:mm a")}`;
  return format(d, "MMM d, yyyy");
}

export function formatRelativeDate(date: Date | string): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function formatTokenCount(count: number): string {
  if (count < 1000) return `${count}`;
  return `${(count / 1000).toFixed(1)}k`;
}

export function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen - 3) + "…";
}

// ── Chat title generation ─────────────────────────────────────

export function generateChatTitle(content: string): string {
  const cleaned = content.trim().replace(/\n+/g, " ");
  return truncate(cleaned, 60);
}

// ── Debounce ──────────────────────────────────────────────────

export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

// ── Copy to clipboard ────────────────────────────────────────

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const el = document.createElement("textarea");
    el.value = text;
    el.style.position = "fixed";
    el.style.opacity = "0";
    document.body.appendChild(el);
    el.select();
    const success = document.execCommand("copy");
    document.body.removeChild(el);
    return success;
  }
}

// ── File helpers ──────────────────────────────────────────────

export function getFileExtension(filename: string): string {
  return filename.slice(((filename.lastIndexOf(".") - 1) >>> 0) + 2);
}

export function getMimeIcon(mimeType: string): string {
  if (mimeType.startsWith("image/")) return "🖼️";
  if (mimeType === "application/pdf") return "📄";
  if (mimeType.startsWith("text/")) return "📝";
  if (mimeType.includes("spreadsheet") || mimeType.includes("excel")) return "📊";
  if (mimeType.includes("word")) return "📃";
  return "📁";
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ── Color utilities ───────────────────────────────────────────

export const AYRA_COLORS = [
  "#7c3aed", // violet
  "#06b6d4", // cyan
  "#10b981", // emerald
  "#f59e0b", // amber
  "#f43f5e", // rose
  "#8b5cf6", // violet-light
  "#0ea5e9", // sky
  "#84cc16", // lime
  "#ec4899", // pink
  "#14b8a6", // teal
] as const;

export function getRandomColor(): string {
  return AYRA_COLORS[Math.floor(Math.random() * AYRA_COLORS.length)];
}

// ── Priority color ────────────────────────────────────────────

export function getPriorityColor(priority: string): string {
  switch (priority) {
    case "URGENT": return "#f43f5e";
    case "HIGH":   return "#f59e0b";
    case "MEDIUM": return "#06b6d4";
    case "LOW":    return "#10b981";
    default:       return "#4a4a62";
  }
}

export function getPriorityLabel(priority: string): string {
  return priority.charAt(0) + priority.slice(1).toLowerCase();
}

// ── Code language detection ───────────────────────────────────

export function detectLanguage(filename: string): string {
  const ext = getFileExtension(filename).toLowerCase();
  const map: Record<string, string> = {
    ts: "typescript", tsx: "typescript",
    js: "javascript", jsx: "javascript",
    py: "python",
    rs: "rust",
    go: "go",
    java: "java",
    cpp: "cpp", cc: "cpp", cxx: "cpp",
    c: "c",
    cs: "csharp",
    css: "css", scss: "scss", sass: "sass",
    html: "html",
    sql: "sql",
    sh: "shell", bash: "shell",
    md: "markdown",
    json: "json",
    yaml: "yaml", yml: "yaml",
    toml: "toml",
    xml: "xml",
    php: "php",
    rb: "ruby",
    swift: "swift",
    kt: "kotlin",
  };
  return map[ext] ?? "plaintext";
}

// ── ID generation ─────────────────────────────────────────────

export function generateId(): string {
  return Math.random().toString(36).slice(2, 11);
}

// ── Sleep ─────────────────────────────────────────────────────

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

// ── Task helpers ──────────────────────────────────────────────

export function isTaskOverdue(dueDate?: Date | null): boolean {
  if (!dueDate) return false;
  return new Date(dueDate) < new Date();
}

export function isDueToday(dueDate?: Date | null): boolean {
  if (!dueDate) return false;
  return isToday(new Date(dueDate));
}
