import { useCallback, useEffect, useState } from "react";
import { HOME_BASE, SCHOOL_BASE, type BaseLocation } from "../data/baseLocations";
import { isInBarcelonaRegion } from "../../lib/geo/haversine";
import { mapPlaceSearch } from "../services/mapSearch";

const STORAGE_KEY = "barcelona-location-ref";

export type LocationRefMode = "home" | "school" | "gps" | "custom";

export interface CustomBase {
  address: string;
  lat: number;
  lng: number;
  label: string;
}

interface StoredLocationRef {
  mode: LocationRefMode;
  custom?: CustomBase;
}

function readStored(): StoredLocationRef {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { mode: "home" };

    const parsed = JSON.parse(raw) as Partial<StoredLocationRef> & { mode?: string };
    const mode = parsed.mode;

    if (mode === "home" || mode === "school" || mode === "gps" || mode === "custom") {
      return {
        mode,
        custom: parsed.custom,
      };
    }
    if (mode === "base" || mode === "hotel") {
      return { mode: "home", custom: parsed.custom };
    }
  } catch {
    /* ignore */
  }
  return { mode: "home" };
}

function writeStored(data: StoredLocationRef) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function presetForMode(mode: Exclude<LocationRefMode, "gps" | "custom">): BaseLocation {
  return mode === "school" ? SCHOOL_BASE : HOME_BASE;
}

export function useLocationRef() {
  const [mode, setModeState] = useState<LocationRefMode>("home");
  const [custom, setCustomState] = useState<CustomBase | null>(null);
  const [gps, setGps] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [customLoading, setCustomLoading] = useState(false);
  const [customError, setCustomError] = useState<string | null>(null);

  useEffect(() => {
    const stored = readStored();
    setModeState(stored.mode);
    setCustomState(stored.custom ?? null);
    setLoaded(true);
  }, []);

  const persist = useCallback((nextMode: LocationRefMode, nextCustom: CustomBase | null) => {
    writeStored({
      mode: nextMode,
      custom: nextCustom ?? undefined,
    });
  }, []);

  const setMode = useCallback(
    (next: LocationRefMode) => {
      setModeState(next);
      persist(next, custom);
      if (next !== "gps") {
        setGpsError(null);
      }
      if (next !== "custom") {
        setCustomError(null);
      }
    },
    [custom, persist],
  );

  const setCustomAddress = useCallback(
    async (query: string) => {
      const trimmed = query.trim();
      if (!trimmed) {
        setCustomError("Enter an address or place name");
        return false;
      }

      setCustomLoading(true);
      setCustomError(null);

      try {
        const result = await mapPlaceSearch(trimmed);
        const nextCustom: CustomBase = {
          address: result.address ?? result.notes ?? trimmed,
          lat: result.lat,
          lng: result.lng,
          label: result.name,
        };
        setCustomState(nextCustom);
        setModeState("custom");
        persist("custom", nextCustom);
        return true;
      } catch (e) {
        setCustomError(e instanceof Error ? e.message : "Couldn't find that address");
        return false;
      } finally {
        setCustomLoading(false);
      }
    },
    [persist],
  );

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
          setGpsError("You're outside Barcelona — using home as reference");
          setGps(null);
        } else {
          setGps({ lat, lng });
        }
        setGpsLoading(false);
      },
      () => {
        setGpsError("Couldn't get location — using home instead");
        setGps(null);
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 },
    );
  }, [loaded, mode]);

  const fallback = presetForMode("home");

  const point =
    mode === "gps" && gps
      ? gps
      : mode === "custom" && custom
        ? { lat: custom.lat, lng: custom.lng }
        : mode === "school"
          ? { lat: SCHOOL_BASE.lat, lng: SCHOOL_BASE.lng }
          : { lat: HOME_BASE.lat, lng: HOME_BASE.lng };

  const label =
    mode === "gps" && gps
      ? "your location"
      : mode === "custom" && custom
        ? custom.label
        : mode === "school"
          ? SCHOOL_BASE.label.toLowerCase()
          : HOME_BASE.label.toLowerCase();

  const referenceAddress =
    mode === "gps" && gps
      ? "Current GPS position"
      : mode === "custom" && custom
        ? custom.address
        : mode === "school"
          ? SCHOOL_BASE.address
          : HOME_BASE.address;

  const distanceFromLabel =
    mode === "gps" && gps && !gpsError
      ? "you"
      : mode === "custom" && custom
        ? custom.label.toLowerCase()
        : mode === "school"
          ? "school"
          : "home";

  return {
    mode,
    setMode,
    point,
    label,
    referenceAddress,
    distanceFromLabel,
    custom,
    setCustomAddress,
    customLoading,
    customError,
    gpsLoading,
    gpsError,
    loaded,
    fallback,
  };
}
