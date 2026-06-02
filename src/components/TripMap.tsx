import { useEffect } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import { PLACES, type Place, type PlaceCategory } from "../data/trip";
import { PlaceActions } from "./PlaceActions";

const CATEGORY_COLORS: Record<PlaceCategory, string> = {
  airport: "#8c857c",
  city: "#5a7d8a",
  hike: "#9c4f3d",
  spa: "#8a7a8e",
  lake: "#5a7d8a",
  activity: "#b8956b",
  restaurant: "#9c4f3d",
  hotel: "#6b8f71",
};

function makeIcon(color: string) {
  return L.divIcon({
    className: "",
    html: `<div style="width:12px;height:12px;border-radius:50%;background:${color};border:2px solid #fff;box-shadow:0 1px 3px rgba(26,24,22,0.25)"></div>`,
    iconSize: [12, 12],
    iconAnchor: [6, 6],
  });
}

const icons = Object.fromEntries(
  (Object.keys(CATEGORY_COLORS) as PlaceCategory[]).map((c) => [
    c,
    makeIcon(CATEGORY_COLORS[c]),
  ]),
) as Record<PlaceCategory, L.DivIcon>;

function FitBounds({ places }: { places: Place[] }) {
  const map = useMap();
  useEffect(() => {
    if (places.length === 0) return;
    const bounds = L.latLngBounds(places.map((p) => [p.lat, p.lng]));
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 10 });
  }, [map, places]);
  return null;
}

export function TripMap() {
  const categories = Object.keys(CATEGORY_COLORS) as PlaceCategory[];

  return (
    <div className="map-section">
      <div className="map-legend">
        {categories.map((c) => (
          <span key={c} className="legend-item">
            <span
              className="legend-dot"
              style={{ background: CATEGORY_COLORS[c] }}
            />
            {c}
          </span>
        ))}
      </div>
      <div className="map-wrap">
        <MapContainer
          center={[14.62, -90.85]}
          zoom={9}
          style={{ height: "100%", width: "100%" }}
          scrollWheelZoom
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          />
          <FitBounds places={PLACES} />
          {PLACES.map((place) => (
            <Marker
              key={place.id}
              position={[place.lat, place.lng]}
              icon={icons[place.category]}
            >
              <Popup>
                <strong>{place.name}</strong>
                {place.day != null && (
                  <>
                    <br />
                    Day {place.day}
                  </>
                )}
                {place.notes && (
                  <>
                    <br />
                    <span style={{ color: "#8c857c" }}>{place.notes}</span>
                  </>
                )}
                <PlaceActions
                  place={{ name: place.name, lat: place.lat, lng: place.lng }}
                  compact
                />
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
