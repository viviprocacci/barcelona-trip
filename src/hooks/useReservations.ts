import { useCallback, useEffect, useState } from "react";
import type { Reservation } from "../types";

const STORAGE_KEY = "guatemala-trip-reservations";

export function useReservations() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setReservations(JSON.parse(raw) as Reservation[]);
    } catch {
      /* ignore */
    }
    setLoaded(true);
  }, []);

  const persist = useCallback((next: Reservation[]) => {
    setReservations(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  const add = useCallback(
    (data: Omit<Reservation, "id" | "createdAt">) => {
      const entry: Reservation = {
        ...data,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
      };
      persist([...reservations, entry].sort((a, b) => a.date.localeCompare(b.date)));
      return entry;
    },
    [reservations, persist],
  );

  const update = useCallback(
    (id: string, data: Partial<Omit<Reservation, "id" | "createdAt">>) => {
      persist(
        reservations
          .map((r) => (r.id === id ? { ...r, ...data } : r))
          .sort((a, b) => a.date.localeCompare(b.date)),
      );
    },
    [reservations, persist],
  );

  const remove = useCallback(
    (id: string) => {
      persist(reservations.filter((r) => r.id !== id));
    },
    [reservations, persist],
  );

  return { reservations, loaded, add, update, remove };
}
