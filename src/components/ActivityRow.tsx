import { Car } from "lucide-react";
import type { Activity } from "../data/trip";
import { inDriveUrl, uberUrl } from "../utils/links";

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
            <a href={uberUrl(ride)} className="ride-btn">
              <Car size={12} strokeWidth={1.5} />
              Uber
            </a>
            <a href={inDriveUrl(ride)} className="ride-btn ride-btn--alt">
              InDrive
            </a>
          </div>
        )}
      </div>
    </li>
  );
}
