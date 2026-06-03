import { useEffect, useState } from "react";
import { DAYS } from "../data/trip";
import { useTodaySwipeReady } from "../hooks/useTodaySwipeReady";
import { useTripStart } from "../hooks/useTripStart";
import { DaySwipeCard } from "./DaySwipeCard";
import { TodayDayPage } from "./TodayDayPage";
import { TodayDayPeek } from "./TodayDayPeek";
import { TripStartDateBar } from "./TripStartDateBar";
import { WeatherCards } from "./WeatherCards";

const TRIP_DAYS = 5;

export function TodayView() {
  const { startDate, setStartDate, resetStartDate, tripDay, loaded } = useTripStart();
  const [viewDay, setViewDay] = useState(1);
  const hour = new Date().getHours();

  const calendarDay =
    tripDay !== null && tripDay >= 1 && tripDay <= TRIP_DAYS ? tripDay : 1;

  useEffect(() => {
    setViewDay(calendarDay);
  }, [calendarDay]);

  const { canGoToDay } = useTodaySwipeReady(TRIP_DAYS, startDate);

  if (!loaded) return null;

  const canSwipePrev = viewDay > 1 && canGoToDay(viewDay - 1);
  const canSwipeNext = viewDay < TRIP_DAYS && canGoToDay(viewDay + 1);

  const plan = DAYS.find((d) => d.day === viewDay) ?? DAYS[0];
  const peekPrevPlan = DAYS.find((d) => d.day === viewDay - 1);
  const peekNextPlan = DAYS.find((d) => d.day === viewDay + 1);

  const pageProps = {
    tripDays: TRIP_DAYS,
    tripDay,
    hour,
    startDate,
  };

  return (
    <div className="today-view">
      <TripStartDateBar
        startDate={startDate}
        setStartDate={setStartDate}
        resetStartDate={resetStartDate}
      />
      {startDate && (
        <div className="today-weather-preload" aria-hidden inert>
          {Array.from({ length: TRIP_DAYS }, (_, i) => i + 1).map((d) => (
            <WeatherCards key={`preload-${d}`} tripDay={d} compact />
          ))}
        </div>
      )}

      <DaySwipeCard
        canPrev={canSwipePrev}
        canNext={canSwipeNext}
        showSwipeHint={viewDay === 1 && canSwipeNext}
        onPrev={() => setViewDay((d) => Math.max(1, d - 1))}
        onNext={() => setViewDay((d) => Math.min(TRIP_DAYS, d + 1))}
        peekPrev={
          peekPrevPlan ? (
            <TodayDayPeek
              plan={peekPrevPlan}
              viewDay={viewDay - 1}
              tripDays={TRIP_DAYS}
            />
          ) : undefined
        }
        peekNext={
          peekNextPlan ? (
            <TodayDayPeek
              plan={peekNextPlan}
              viewDay={viewDay + 1}
              tripDays={TRIP_DAYS}
            />
          ) : undefined
        }
      >
        <TodayDayPage plan={plan} viewDay={viewDay} {...pageProps} />
      </DaySwipeCard>

      <div className="day-swipe-dots" role="tablist" aria-label="Trip day">
        {Array.from({ length: TRIP_DAYS }, (_, i) => i + 1).map((d) => (
          <button
            key={d}
            type="button"
            role="tab"
            aria-selected={d === viewDay}
            aria-label={`Day ${d}`}
            className={`day-swipe-dot ${d === viewDay ? "day-swipe-dot--active" : ""}`}
            disabled={d !== viewDay && !canGoToDay(d)}
            onClick={() => canGoToDay(d) && setViewDay(d)}
          />
        ))}
      </div>
    </div>
  );
}
