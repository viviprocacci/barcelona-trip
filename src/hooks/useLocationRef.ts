import { useCallback, useEffect, useState } from "react";
import { getSchoolBase } from "../data/trip";
import { isInBarcelonaRegion } from "../../lib/geo/haversine";

const STORAGE_KEY = "barcelona-location-ref";

export type LocationRefMode = "base" | "gps";

const BASE = getSchoolBase();

function readStoredMode(): LocationRefMode {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === "base" || raw === "gps") return raw;
    if (raw === "hotel") return "base";
  } catch {
    /* ignore */
  }
  return "base";
}

export function useLocationRef() {
  const [mode, setModeState] = useState<LocationRefMode>("base");
  const [gps, setGps] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setModeState(readStoredMode());
    setLoaded(true);
  }, []);

  const setMode = useCallback((next: LocationRefMode) => {
    setModeState(next);
    localStorage.setItem(STORAGE_KEY, next);
    if (next === "base") {
      setGpsError(null);
    }
  }, []);

  useEffect(() => {
    if (!loaded || mode !== "gps") return;

    if (!navigator.geolocation) {
      setGpsError("GPS not available on this device");
      return;
    }

    setGpsLoading(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        if (!isInBarcelonaRegion(lat, lng)) {
          setGpsError("You're outside Barcelona — using the school as reference");
          setGps(null);
        } else {
          setGps({ lat, lng });
        }
        setGpsLoading(false);
      },
      () => {
        setGpsError("Couldn't get location — using the school instead");
        setGps(null);
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 },
    );
  }, [loaded, mode]);

  const point =
    mode === "gps" && gps
      ? gps
      : { lat: BASE.lat, lng: BASE.lng };

  const label =
    mode === "gps" && gps ? "your location" : "language school";

  return {
    mode,
    setMode,
    point,
    label,
    gpsLoading,
    gpsError,
    loaded,
  };
}
