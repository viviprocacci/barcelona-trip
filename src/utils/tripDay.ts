const STORAGE_KEY = "guatemala-trip-start";

export function loadTripStart(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function saveTripStart(date: string) {
  localStorage.setItem(STORAGE_KEY, date);
}

export function clearTripStart() {
  localStorage.removeItem(STORAGE_KEY);
}

/** 0 = before trip, 1–5 = trip days, 6+ = after trip */
export function getTripDay(startDate: string | null): number | null {
  if (!startDate) return null;
  const start = new Date(startDate + "T12:00:00");
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  const diff = Math.floor((today.getTime() - start.getTime()) / 86_400_000) + 1;
  if (diff < 1) return 0;
  return diff;
}

export function tripDayLabel(day: number | null): string {
  if (day === null) return "Set trip date";
  if (day === 0) return "Pre-trip";
  if (day > 5) return "Post-trip";
  return `Day ${day}`;
}
