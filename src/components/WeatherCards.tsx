import { useEffect, useState } from "react";
import { Cloud, Droplets, Wind } from "lucide-react";
import type { WeatherForecast } from "../types";
import {
  fetchWeather,
  weatherLabel,
  WEATHER_SPOTS,
  weatherSpotsForDay,
} from "../services/weather";

const weatherCache = new Map<number, WeatherForecast[]>();
const weatherInflight = new Map<number, Promise<WeatherForecast[]>>();

function loadWeatherForDay(tripDay: number): Promise<WeatherForecast[]> {
  const cached = weatherCache.get(tripDay);
  if (cached) return Promise.resolve(cached);

  let inflight = weatherInflight.get(tripDay);
  if (!inflight) {
    const spotIds = weatherSpotsForDay(tripDay);
    const spots = WEATHER_SPOTS.filter((s) => spotIds.includes(s.id));
    inflight = fetchWeather(spots)
      .then((data) => {
        weatherCache.set(tripDay, data);
        return data;
      })
      .finally(() => {
        weatherInflight.delete(tripDay);
      });
    weatherInflight.set(tripDay, inflight);
  }
  return inflight;
}

/** Warm cache for upcoming swipes; resolves when forecast is cached. */
export function prefetchWeatherForDay(tripDay: number): Promise<void> {
  return loadWeatherForDay(tripDay).then(
    () => {},
    () => {},
  );
}

interface WeatherCardsProps {
  tripDay: number | null;
  compact?: boolean;
}

function spotsForTripDay(tripDay: number) {
  const spotIds = weatherSpotsForDay(tripDay);
  return WEATHER_SPOTS.filter((s) => spotIds.includes(s.id));
}

function placeholderCards(tripDay: number | null, compact?: boolean) {
  const spots = WEATHER_SPOTS.filter((s) =>
    weatherSpotsForDay(tripDay ?? 1).includes(s.id),
  );

  return (
    <div
      className={`weather-row weather-row--locked ${compact ? "weather-row--compact" : ""}`}
      aria-label="Weather — set trip start date to load forecast"
    >
      {spots.map((spot) => (
        <article key={spot.id} className="weather-card weather-card--placeholder">
          <span className="weather-card-label">{spot.label}</span>
          <div className="weather-card-temps">
            <strong>—°F</strong>
            <span>—°F</span>
          </div>
          <p className="weather-card-desc">
            <Cloud size={12} strokeWidth={1.5} />
            Set date
          </p>
          <div className="weather-card-meta">
            <span>
              <Wind size={11} /> — mph
            </span>
          </div>
        </article>
      ))}
    </div>
  );
}

/** Same layout as real cards — avoids layout shift while cache warms. */
function weatherSkeleton(tripDay: number, compact?: boolean) {
  const spots = spotsForTripDay(tripDay);

  return (
    <div
      className={`weather-row weather-row--skeleton ${compact ? "weather-row--compact" : ""}`}
      aria-busy="true"
      aria-label="Loading forecast"
    >
      {spots.map((spot) => (
        <article key={spot.id} className="weather-card weather-card--skeleton">
          <span className="weather-card-label">{spot.label}</span>
          <div className="weather-card-temps">
            <strong className="weather-skeleton-bar" />
            <span className="weather-skeleton-bar weather-skeleton-bar--short" />
          </div>
          <p className="weather-card-desc">
            <Cloud size={12} strokeWidth={1.5} />
            <span className="weather-skeleton-bar weather-skeleton-bar--wide" />
          </p>
          <div className="weather-card-meta">
            <span className="weather-skeleton-bar weather-skeleton-bar--short" />
          </div>
        </article>
      ))}
    </div>
  );
}

function WeatherForecastRow({
  forecasts,
  compact,
}: {
  forecasts: WeatherForecast[];
  compact?: boolean;
}) {
  return (
    <div className={`weather-row ${compact ? "weather-row--compact" : ""}`}>
      {forecasts.map((f) => (
        <article key={f.spotId} className="weather-card">
          <span className="weather-card-label">{f.label}</span>
          <div className="weather-card-temps">
            <strong>{f.tempHigh}°F</strong>
            <span>{f.tempLow}°F</span>
          </div>
          <p className="weather-card-desc">
            <Cloud size={12} strokeWidth={1.5} />
            {weatherLabel(f.weatherCode)}
          </p>
          <div className="weather-card-meta">
            <span>
              <Wind size={11} /> {f.windMax} mph
            </span>
            {f.precipProb > 0 && (
              <span>
                <Droplets size={11} /> {f.precipProb}%
              </span>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}

export function WeatherCards({ tripDay, compact }: WeatherCardsProps) {
  const [, setRevision] = useState(0);
  const [errorDay, setErrorDay] = useState<number | null>(null);

  useEffect(() => {
    if (tripDay == null) return;

    setErrorDay(null);
    if (weatherCache.has(tripDay)) return;

    let cancelled = false;
    loadWeatherForDay(tripDay)
      .then(() => {
        if (!cancelled) setRevision((n) => n + 1);
      })
      .catch(() => {
        if (!cancelled) setErrorDay(tripDay);
      });

    return () => {
      cancelled = true;
    };
  }, [tripDay]);

  if (tripDay == null) {
    return placeholderCards(tripDay, compact);
  }

  const cached = weatherCache.get(tripDay);
  if (cached) {
    return <WeatherForecastRow forecasts={cached} compact={compact} />;
  }

  if (errorDay === tripDay) {
    return (
      <div className="weather-row weather-row--error">
        Weather unavailable. Check connection.
      </div>
    );
  }

  return weatherSkeleton(tripDay, compact);
}
