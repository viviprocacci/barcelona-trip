import type { WeatherForecast, WeatherSpot } from "../types";

export const WEATHER_SPOTS: WeatherSpot[] = [
  { id: "barcelona", label: "Barcelona", lat: 41.3874, lng: 2.1686, elevation: 12 },
  { id: "montserrat", label: "Montserrat", lat: 41.5917, lng: 1.8372, elevation: 720 },
  { id: "beach", label: "Barceloneta", lat: 41.3809, lng: 2.189, elevation: 0 },
];

const WMO: Record<number, string> = {
  0: "Clear",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Foggy",
  48: "Foggy",
  51: "Light drizzle",
  53: "Drizzle",
  55: "Heavy drizzle",
  61: "Light rain",
  63: "Rain",
  65: "Heavy rain",
  71: "Snow",
  80: "Showers",
  95: "Thunderstorm",
};

export function weatherLabel(code: number): string {
  return WMO[code] ?? "Variable";
}

export async function fetchWeather(spots: WeatherSpot[]): Promise<WeatherForecast[]> {
  const results = await Promise.all(
    spots.map(async (spot) => {
      const url = new URL("https://api.open-meteo.com/v1/forecast");
      url.searchParams.set("latitude", String(spot.lat));
      url.searchParams.set("longitude", String(spot.lng));
      url.searchParams.set("elevation", String(spot.elevation));
      url.searchParams.set("daily", "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max");
      url.searchParams.set("temperature_unit", "fahrenheit");
      url.searchParams.set("wind_speed_unit", "mph");
      url.searchParams.set("timezone", "Europe/Madrid");
      url.searchParams.set("forecast_days", "3");

      const res = await fetch(url.toString());
      if (!res.ok) throw new Error("Weather unavailable");
      const data = await res.json();

      return {
        spotId: spot.id,
        label: spot.label,
        tempHigh: Math.round(data.daily.temperature_2m_max[0]),
        tempLow: Math.round(data.daily.temperature_2m_min[0]),
        weatherCode: data.daily.weather_code[0],
        windMax: Math.round(data.daily.wind_speed_10m_max[0]),
        precipProb: data.daily.precipitation_probability_max[0] ?? 0,
      } satisfies WeatherForecast;
    }),
  );
  return results;
}

/** Which weather spots matter most for a given trip day */
export function weatherSpotsForDay(tripDay: number): string[] {
  if (tripDay <= 0 || tripDay > 5) return ["barcelona", "montserrat", "beach"];
  if (tripDay === 1) return ["barcelona"];
  if (tripDay === 2) return ["barcelona"];
  if (tripDay === 3) return ["montserrat", "barcelona"];
  if (tripDay === 4) return ["beach", "barcelona"];
  if (tripDay === 5) return ["barcelona"];
  return ["barcelona"];
}
