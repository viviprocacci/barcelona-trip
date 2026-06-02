import { useCallback, useEffect, useState } from "react";
import { clearTripStart, getTripDay, loadTripStart, saveTripStart } from "../utils/tripDay";

export function useTripStart() {
  const [startDate, setStartDateState] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setStartDateState(loadTripStart());
    setLoaded(true);
  }, []);

  const setStartDate = useCallback((date: string) => {
    saveTripStart(date);
    setStartDateState(date);
  }, []);

  const resetStartDate = useCallback(() => {
    clearTripStart();
    setStartDateState(null);
  }, []);

  const tripDay = startDate ? getTripDay(startDate) : null;

  return { startDate, setStartDate, resetStartDate, tripDay, loaded };
}
