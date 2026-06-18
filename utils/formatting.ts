// ── Number formatting ─────────────────────────
export function formatNumber(
  value: number,
  decimals: number = 2
): string {
  return value.toFixed(decimals);
}

export function formatLargeNumber(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toString();
}

// ── Speed formatting ──────────────────────────
export function formatSpeed(kmPerSecond: number, units: "metric" | "imperial" = "metric"): string {
  if (units === "imperial") {
    const mph = kmPerSecond * 2236.94;
    return `${formatLargeNumber(Math.round(mph))} mph`;
  }
  if (kmPerSecond >= 1) {
    return `${kmPerSecond.toFixed(2)} km/s`;
  }
  return `${Math.round(kmPerSecond * 1000)} m/s`;
}

// ── Altitude formatting ───────────────────────
export function formatAltitude(km: number, units: "metric" | "imperial" = "metric"): string {
  if (units === "imperial") {
    const miles = km * 0.621371;
    return `${Math.round(miles).toLocaleString()} mi`;
  }
  return `${Math.round(km).toLocaleString()} km`;
}

// ── Distance formatting ───────────────────────
export function formatDistance(km: number): string {
  if (km >= 1_000_000) return `${(km / 1_000_000).toFixed(2)} M km`;
  if (km >= 1_000) return `${(km / 1_000).toFixed(1)} K km`;
  return `${Math.round(km)} km`;
}

// ── Time formatting ───────────────────────────
export function formatUTC(date: Date = new Date()): string {
  return date.toUTCString().replace(" GMT", " UTC");
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatDateTime(date: Date): string {
  return `${formatDate(date)} ${formatTime(date)}`;
}

// ── Countdown formatter ───────────────────────
export function formatCountdown(targetDate: Date): string {
  const now = Date.now();
  const diff = targetDate.getTime() - now;

  if (diff <= 0) return "Now";

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}

// ── Coordinate formatting ─────────────────────
export function formatCoord(value: number, type: "lat" | "lon"): string {
  const dir =
    type === "lat" ? (value >= 0 ? "N" : "S") : value >= 0 ? "E" : "W";
  return `${Math.abs(value).toFixed(4)}° ${dir}`;
}

// ── Moon phase emoji ──────────────────────────
export function getMoonEmoji(phase: number): string {
  if (phase < 0.03 || phase > 0.97) return "🌑";
  if (phase < 0.22) return "🌒";
  if (phase < 0.28) return "🌓";
  if (phase < 0.47) return "🌔";
  if (phase < 0.53) return "🌕";
  if (phase < 0.72) return "🌖";
  if (phase < 0.78) return "🌗";
  return "🌘";
}

// ── Observability color ───────────────────────
export function getObservabilityColor(score: number): string {
  if (score >= 70) return "#10B981"; // green
  if (score >= 40) return "#F59E0B"; // amber
  return "#EF4444"; // red
}

export function getObservabilityLabel(score: number): "Excellent Viewing" | "Good Conditions" | "Poor Visibility" {
  if (score >= 70) return "Excellent Viewing";
  if (score >= 40) return "Good Conditions";
  return "Poor Visibility";
}

// ── Class name utility ────────────────────────
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

// ── Clamp ─────────────────────────────────────
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

// ── Random from array ─────────────────────────
export function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ── Debounce ──────────────────────────────────
export function debounce<T extends (...args: string[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}
