import { useEffect, useState } from "react";
import { Calendar, Car, ChevronLeft, ChevronRight, MapPin, RotateCcw } from "lucide-react";
import { DAY_IMAGE_FOCUS } from "../../lib/images";
import { DAYS } from "../data/trip";
import { useTripStart } from "../hooks/useTripStart";
import { inDriveUrl, uberUrl } from "../utils/links";
import { getNudges } from "../utils/nudges";
import { ActivityRow } from "./ActivityRow";
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

  if (!loaded) return null;

  const plan = DAYS.find((d) => d.day === viewDay) ?? DAYS[0];
  const isLiveToday =
    tripDay !== null && tripDay >= 1 && tripDay <= TRIP_DAYS && viewDay === tripDay;
  const nudges =
    startDate && tripDay !== null && tripDay >= 1 && tripDay <= TRIP_DAYS
      ? isLiveToday
        ? getNudges(tripDay, hour)
        : []
      : [{ id: "set-date", text: "Set your trip start date above to unlock day-specific nudges & weather.", urgency: "normal" as const }];

  const nextActivity = plan.activities.find((a) => {
    if (!a.time) return true;
    const t = a.time.toLowerCase();
    if (hour < 12 && (t.includes("morning") || t.includes("early") || t.includes("dawn"))) return true;
    if (hour >= 12 && hour < 17 && (t.includes("afternoon") || t.includes("mid"))) return true;
    if (hour >= 17 && t.includes("evening")) return true;
    return false;
  }) ?? plan.activities[0];

  const goPrev = () => setViewDay((d) => Math.max(1, d - 1));
  const goNext = () => setViewDay((d) => Math.min(TRIP_DAYS, d + 1));

  return (
    <div className="today-view">
      <div className="today-day-carousel">
        {viewDay > 1 && (
          <button
            type="button"
            className="today-day-nav"
            onClick={goPrev}
            aria-label="Previous day"
          >
            <ChevronLeft size={22} strokeWidth={1.5} />
          </button>
        )}

        <section className="today-hero" aria-label={`Day ${viewDay} itinerary`}>
        {plan.image && (
          <div
            key={viewDay}
            className="today-hero-media"
            style={
              {
                "--focus": DAY_IMAGE_FOCUS[viewDay as 1 | 2 | 3 | 4 | 5],
              } as React.CSSProperties
            }
          >
            <img
              src={plan.image}
              alt={plan.imageAlt ?? plan.title}
              className="today-hero-img"
              loading="eager"
              decoding="async"
            />
          </div>
        )}
        <div className="today-hero-body">
        <div className="today-hero-top">
          <div>
            <span className="today-eyebrow">
              Day {viewDay} of {TRIP_DAYS}
              {isLiveToday && <span className="today-eyebrow-today"> · Today</span>}
            </span>
            <h2 className="today-title">{plan.title}</h2>
            {plan.subtitle && <p className="today-subtitle">{plan.subtitle}</p>}
          </div>
          <div className="today-date-actions">
            <label className="today-date-picker">
              <Calendar size={14} strokeWidth={1.5} />
              <input
                type="date"
                value={startDate ?? ""}
                onChange={(e) => e.target.value && setStartDate(e.target.value)}
                aria-label="Trip start date"
              />
            </label>
            {startDate && (
              <button
                type="button"
                className="today-reset-btn"
                onClick={resetStartDate}
                aria-label="Reset trip start date"
              >
                <RotateCcw size={14} strokeWidth={1.5} />
                Reset
              </button>
            )}
          </div>
        </div>

        {isLiveToday && nextActivity && (
          <div className="next-up-card">
            <span className="next-up-label">Next up</span>
            <p className="next-up-text">
              {nextActivity.time && (
                <strong>{nextActivity.time} · </strong>
              )}
              {nextActivity.text}
            </p>
            {nextActivity.rideTo && (
              <div className="ride-actions ride-actions--inline">
                <a href={uberUrl(nextActivity.rideTo)} className="ride-btn">
                  <Car size={12} strokeWidth={1.5} />
                  Uber
                </a>
                <a href={inDriveUrl(nextActivity.rideTo)} className="ride-btn ride-btn--alt">
                  InDrive
                </a>
              </div>
            )}
          </div>
        )}

        {plan.stay && (
          <div className="today-stay">
            <MapPin size={14} strokeWidth={1.5} />
            <span>{plan.stay}</span>
          </div>
        )}
        </div>
      </section>

        {viewDay < TRIP_DAYS && (
          <button
            type="button"
            className="today-day-nav"
            onClick={goNext}
            aria-label="Next day"
          >
            <ChevronRight size={22} strokeWidth={1.5} />
          </button>
        )}
      </div>

      {nudges.length > 0 && (
        <section className="nudge-stack">
          {nudges.map((n) => (
            <div
              key={n.id}
              className={`nudge-card ${n.urgency === "high" ? "nudge-card--urgent" : ""}`}
            >
              {n.text}
            </div>
          ))}
        </section>
      )}

      <section className="today-section">
        <h3 className="section-title">
          {isLiveToday ? "Weather today" : `Weather · Day ${viewDay}`}
        </h3>
        <WeatherCards tripDay={startDate ? viewDay : null} compact />
      </section>

      <section className="today-section">
        <h3 className="section-title">
          {isLiveToday ? "Today's plan" : `Day ${viewDay} plan`}
        </h3>
        <ul className="activity-list today-activities">
          {plan.activities.map((a, i) => (
            <ActivityRow key={i} activity={a} />
          ))}
        </ul>
      </section>

      {isLiveToday && tripDay !== null && tripDay < TRIP_DAYS && (
        <p className="today-footer-hint">
          Tomorrow: {DAYS[tripDay]?.title}
          <ChevronRight size={12} style={{ verticalAlign: "middle" }} />
        </p>
      )}
    </div>
  );
}
