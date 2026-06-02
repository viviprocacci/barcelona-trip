import { Car } from "lucide-react";
import type { Activity } from "../data/trip";
import { inDriveUrl, openExternal, uberUrl } from "../utils/links";

interface ActivityRowProps {
  activity: Activity;
  showRide?: boolean;
}

export function ActivityRow({ activity, showRide = true }: ActivityRowProps) {
  const ride = activity.rideTo;

  return (
    <li className="activity-item">
      {activity.time && <span className="activity-time">{activity.time}</span>}
      <div className="activity-body">
        <span className="activity-text">{activity.text}</span>
        {showRide && ride && (
          <div className="ride-actions">
            <button
              type="button"
              className="ride-btn"
              onClick={() => openExternal(uberUrl(ride))}
            >
              <Car size={12} strokeWidth={1.5} />
              Uber
            </button>
            <button
              type="button"
              className="ride-btn ride-btn--alt"
              onClick={() => openExternal(inDriveUrl(ride))}
            >
              InDrive
            </button>
          </div>
        )}
      </div>
    </li>
  );
}
