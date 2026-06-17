import { MapPin } from "lucide-react";
import { FileDown } from "lucide-react";
import { MONTserrat_ESSENTIALS, DAYS, EXTRA_IDEAS, PACK_LIST } from "../data/trip";
import { exportItineraryPdf } from "../utils/exportItineraryPdf";
import { ActivityRow } from "./ActivityRow";

export function ItineraryView() {
  return (
    <div>
      <div className="itinerary-toolbar">
        <button type="button" className="btn-ghost" onClick={() => exportItineraryPdf()}>
          <FileDown size={15} strokeWidth={1.5} />
          Export full itinerary PDF
        </button>
      </div>

      <div className="timeline">
        {DAYS.map((day) => (
          <article key={day.day} className="day-card">
            <div className="day-marker">
              <span className="day-num">{day.day}</span>
              <span className="day-label">Day</span>
            </div>
            <div className="day-card-inner">
              <h3 className="day-title">{day.title}</h3>
              {day.subtitle && <p className="day-subtitle">{day.subtitle}</p>}
              <ul className="activity-list">
                {day.activities.map((a, i) => (
                  <ActivityRow key={i} activity={a} />
                ))}
              </ul>
              {day.stay && (
                <div className="stay-pill">
                  <MapPin size={13} strokeWidth={1.5} />
                  <span>
                    <strong>Stay · </strong>
                    {day.stay}
                  </span>
                </div>
              )}
              {day.tips?.map((t, i) => (
                <p key={i} className="tip-note">{t}</p>
              ))}
            </div>
          </article>
        ))}
      </div>

      <p className="section-label">Essentials</p>
      <div className="info-card">
        <h3>Montserrat day trip</h3>
        <ul className="pack-list">
          {MONTserrat_ESSENTIALS.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
      <div className="info-card">
        <h3>Full pack list</h3>
        <div className="pack-tags">
          {PACK_LIST.map((p) => (
            <span key={p.item} className="pack-tag">{p.item}</span>
          ))}
        </div>
      </div>
      <p className="section-label">If you have time</p>
      <div className="info-card">
        <ul className="ideas-list">
          {EXTRA_IDEAS.map((idea) => (
            <li key={idea}>{idea}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
