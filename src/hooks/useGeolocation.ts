import { useCallback, useEffect, useState } from "react";
import { isInBarcelonaRegion } from "../../lib/geo/haversine";

export interface GeoPosition {
  lat: number;
  lng: number;
  accuracy?: number;
}

export function useGeolocation(enabled = true) {
  const [position, setPosition] = useState<GeoPosition | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(() => {
    if (!navigator.geolocation) {
      setError("GPS not available on this device");
      setPosition(null);
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setPosition({ lat, lng, accuracy: pos.coords.accuracy });
        if (!isInBarcelonaRegion(lat, lng)) {
          setError("You're outside the Barcelona area");
        }
        setLoading(false);
      },
      () => {
        setError("Couldn't get your location");
        setPosition(null);
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 30000 },
    );
  }, []);

  useEffect(() => {
    if (enabled) refresh();
  }, [enabled, refresh]);

  return { position, loading, error, refresh };
}
