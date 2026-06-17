import { Car, Cloud, Footprints, MapPin, MessageCircle, Navigation } from "lucide-react";
import type { GeoPlace } from "../utils/links";
import {
  appleMapsUrl,
  googleMapsDirectionsUrl,
  googleMapsWalkingDirectionsUrl,
  inDriveUrl,
  openExternal,
  openRideLink,
  uberUrl,
  weatherUrl,
} from "../utils/links";

interface PlaceActionsProps {
  place: GeoPlace;
  compact?: boolean;
  onAskMateo?: () => void;
}

export function PlaceActions({ place, compact, onAskMateo }: PlaceActionsProps) {
  const mapActions = [
    { label: "Walk", icon: Footprints, url: googleMapsWalkingDirectionsUrl(place), external: true },
    { label: "Maps", icon: MapPin, url: appleMapsUrl(place), external: true },
    { label: "Drive", icon: Navigation, url: googleMapsDirectionsUrl(place), external: true },
    { label: "Weather", icon: Cloud, url: weatherUrl(place), external: true },
  ];

  return (
    <div className={`place-actions ${compact ? "place-actions--compact" : ""}`}>
      {mapActions.map(({ label, icon: Icon, url }) => (
        <button
          key={label}
          type="button"
          className="action-link"
          onClick={() => openExternal(url)}
        >
          <Icon size={14} strokeWidth={1.5} />
          {label}
        </button>
      ))}
      <button
        type="button"
        className="action-link action-link--ride"
        onClick={() => openRideLink(uberUrl(place))}
      >
        <Car size={14} strokeWidth={1.5} />
        Uber
      </button>
      <button
        type="button"
        className="action-link action-link--ride"
        onClick={() => openRideLink(inDriveUrl(place))}
      >
        <Car size={14} strokeWidth={1.5} />
        InDrive
      </button>
      {onAskMateo && (
        <button type="button" className="action-link action-link--mateo" onClick={onAskMateo}>
          <MessageCircle size={14} strokeWidth={1.5} />
          Ask Mateo
        </button>
      )}
    </div>
  );
}
