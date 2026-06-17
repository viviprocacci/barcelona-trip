import { useMemo, useState } from "react";
import { Clock, Loader2, MapPin, Navigation } from "lucide-react";
import {
  NEARBY_CATEGORIES,
  NEARBY_CATEGORY_LABELS,
  NEARBY_PLACES,
  type NearbyCategory,
  type NearbyPlace,
} from "../data/nearby";
import { haversineKm, formatDistanceKm } from "../../lib/geo/haversine";
import { useLocationRef } from "../hooks/useLocationRef";
import { useNavigation } from "../contexts/NavigationContext";

const SECTION_ORDER: NearbyCategory[] = ["pilates", "markets", "shopping"];

function sortByDistance(items: NearbyPlace[], ref: { lat: number; lng: number }) {
  return [...items].sort(
    (a, b) => haversineKm(ref, a) - haversineKm(ref, b),
  );
}

export function NearbyView() {
  const [category, setCategory] = useState<NearbyCategory | "all">("all");
  const { point, label, mode, setMode, gpsLoading, gpsError, loaded } = useLocationRef();
  const { focusMap } = useNavigation();

  const sections = useMemo(() => {
    const cats = category === "all" ? SECTION_ORDER : [category];
    return cats.map((cat) => ({
      category: cat,
      items: sortByDistance(
        NEARBY_PLACES.filter((p) => p.category === cat),
        point,
      ),
    }));
  }, [category, point]);

  if (!loaded) return null;

  const openOnMap = (item: NearbyPlace) => {
    focusMap({ lat: item.lat, lng: item.lng, zoom: 16, nearbyId: item.id });
  };

  return (
    <div className="nearby-view">
      <header className="nearby-hero">
        <p className="nearby-hero-sub">
          Pilates, markets, and shopping near your base — sorted by distance.
        </p>
        <div className="nearby-ref-bar">
          <span className="nearby-ref-label">Distance from</span>
          <div className="nearby-ref-toggle">
            <button
              type="button"
              className={`nearby-ref-btn ${mode === "base" ? "active" : ""}`}
              onClick={() => setMode("base")}
            >
              School
            </button>
            <button
              type="button"
              className={`nearby-ref-btn ${mode === "gps" ? "active" : ""}`}
              onClick={() => setMode("gps")}
              disabled={gpsLoading}
            >
              {gpsLoading ? <Loader2 size={14} className="spin" /> : <Navigation size={14} />}
              GPS
            </button>
          </div>
        </div>
        <p className="nearby-ref-hint">
          {mode === "gps" && gpsError
            ? gpsError
            : `Using ${label} as reference point`}
        </p>
      </header>

      <div className="explore-chip-row" role="tablist" aria-label="Nearby categories">
        {NEARBY_CATEGORIES.map(({ id, label: chipLabel }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={category === id}
            className={`explore-chip ${category === id ? "active" : ""}`}
            onClick={() => setCategory(id)}
          >
            {chipLabel}
          </button>
        ))}
      </div>

      {sections.map(({ category: cat, items }) => (
        <section key={cat} className="nearby-section">
          <h2 className="nearby-section-title">{NEARBY_CATEGORY_LABELS[cat]}</h2>
          <ul className="nearby-list">
            {items.map((item) => {
              const km = haversineKm(point, item);
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    className="nearby-item"
                    onClick={() => openOnMap(item)}
                  >
                    <div className="nearby-item-main">
                      <strong className="nearby-item-name">{item.name}</strong>
                      <span className="nearby-item-dist">
                        <MapPin size={13} strokeWidth={1.5} />
                        {formatDistanceKm(km)} from {mode === "gps" && !gpsError ? "you" : "school"}
                      </span>
                      <span className="nearby-item-hours">
                        <Clock size={13} strokeWidth={1.5} />
                        {item.hours}
                      </span>
                      {item.notes && <span className="nearby-item-notes">{item.notes}</span>}
                      <span className="nearby-item-address">{item.address}</span>
                    </div>
                    <span className="nearby-item-map-link">View on map</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
