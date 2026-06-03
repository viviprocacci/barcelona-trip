import { useEffect, useState } from "react";
import { preloadDayImage } from "../../lib/images/preload";
import { prefetchWeatherForDay } from "../components/WeatherCards";

/** Preload all trip day cards (hero + weather) and gate swipes until each day is ready. */
export function useTodaySwipeReady(
  tripDays: number,
  startDate: string | null,
) {
  const [readyDays, setReadyDays] = useState<Set<number>>(() => new Set());

  useEffect(() => {
    let cancelled = false;
    const days = Array.from({ length: tripDays }, (_, i) => i + 1);
    const ready = new Set<number>();

    const markReady = (day: number) => {
      if (cancelled) return;
      ready.add(day);
      setReadyDays(new Set(ready));
    };

    for (const day of days) {
      Promise.all([
        preloadDayImage(day),
        startDate ? prefetchWeatherForDay(day) : Promise.resolve(),
      ]).then(() => markReady(day));
    }

    return () => {
      cancelled = true;
    };
  }, [tripDays, startDate]);

  const canGoToDay = (day: number) => readyDays.has(day);

  return { readyDays, canGoToDay };
}
