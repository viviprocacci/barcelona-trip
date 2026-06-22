import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { Loader2, MapPin, Footprints, Minus, Plus, Radar, Trash2, WifiOff, X } from "lucide-react";
import L from "leaflet";
import { EXCURSIONS } from "../data/excursions";
import {
  NEARBY_CATEGORY_COLORS,
  NEARBY_PLACES,
  type NearbyCategory,
  type NearbyPlace,
} from "../data/nearby";
import { PLACES, SCHOOL_BASE_ID, getSchoolBase, type Place, type PlaceCategory } from "../data/trip";
import { haversineKm, formatDistanceKm } from "../../lib/geo/haversine";
import { useMapPins } from "../hooks/useMapPins";
import { useOnlineStatus } from "../hooks/useOnlineStatus";
import type { SavedMapPin } from "../types";
import { useNavigation } from "../contexts/NavigationContext";
import { mapPlaceSearch } from "../services/mapSearch";
import { PlaceActions } from "./PlaceActions";
import { googleMapsWalkingDirectionsUrl, openExternal } from "../utils/links";

const CITY_CENTER = { lat: 41.3874, lng: 2.1686, name: "Barcelona" };
const MAP_CENTER: L.LatLngExpression = [41.39, 2.17];

const CATEGORY_COLORS: Record<PlaceCategory, string> = {
  airport: "#8c857c",
  city: "#5a7d8a",
  hike: "#9c4f3d",
  spa: "#8a7a8e",
  beach: "#5a7d8a",
  activity: "#b8956b",
  restaurant: "#9c4f3d",
  hotel: "#6b8f71",
};

const SAVED_PIN_COLOR = "#6b5080";

function makeIcon(color: string) {
  return L.divIcon({
    className: "leaflet-pin-icon",
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

const SCHOOL_PIN_COLOR = "#5a6b4a";

const schoolIcon = makeIcon(SCHOOL_PIN_COLOR);

const savedIcon = makeIcon(SAVED_PIN_COLOR);

const nearbyIcons = Object.fromEntries(
  (Object.keys(NEARBY_CATEGORY_COLORS) as NearbyCategory[]).map((c) => [
    c,
    makeIcon(NEARBY_CATEGORY_COLORS[c]),
  ]),
) as Record<NearbyCategory, L.DivIcon>;

const NEARBY_LAYER_LABELS: Record<NearbyCategory, string> = {
  pilates: "pilates",
  markets: "markets",
  shopping: "shopping",
};

type LayerVisibility = {
  itinerary: boolean;
  pilates: boolean;
  markets: boolean;
  shopping: boolean;
  saved: boolean;
};

const DEFAULT_LAYERS: LayerVisibility = {
  itinerary: true,
  pilates: true,
  markets: true,
  shopping: true,
  saved: true,
};

type LeafletContainer = HTMLDivElement & { _leaflet_id?: number };

function clearLeafletContainer(el: LeafletContainer, map: L.Map | null) {
  if (map) {
    map.remove();
  }
  delete el._leaflet_id;
  el.replaceChildren();
}

function addMapTiles(map: L.Map) {
  const tileOpts = {
    maxZoom: 19,
    keepBuffer: 6,
    updateWhenIdle: true,
  };

  const osm = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    ...tileOpts,
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  });

  const carto = L.tileLayer(
    "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
    {
      ...tileOpts,
      maxZoom: 20,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
      subdomains: "abcd",
    },
  );

  const online = typeof navigator === "undefined" || navigator.onLine;

  if (!online) {
    osm.addTo(map);
    return;
  }

  let errors = 0;
  carto.on("tileerror", () => {
    errors += 1;
    if (errors >= 3 && !map.hasLayer(osm)) {
      map.removeLayer(carto);
      osm.addTo(map);
    }
  });

  carto.addTo(map);
}

type Selected =
  | { kind: "place"; place: Place }
  | { kind: "pin"; pin: SavedMapPin }
  | { kind: "nearby"; item: NearbyPlace };

function findKnownPlace(query: string) {
  const q = query.toLowerCase().trim();
  if (!q) return null;

  const place = PLACES.find(
    (p) => p.name.toLowerCase().includes(q) || q.includes(p.name.toLowerCase()),
  );
  if (place) {
    return {
      name: place.name,
      lat: place.lat,
      lng: place.lng,
      notes: place.notes,
      address: place.address,
    };
  }

  const exc = EXCURSIONS.find(
    (e) =>
      e.lat != null &&
      e.lng != null &&
      (e.name.toLowerCase().includes(q) ||
        e.region.toLowerCase().includes(q) ||
        q.split(/\s+/).every((w) => `${e.name} ${e.region}`.toLowerCase().includes(w))),
  );
  if (exc?.lat != null && exc.lng != null) {
    return {
      name: exc.name,
      lat: exc.lat,
      lng: exc.lng,
      notes: exc.tagline,
    };
  }

  return null;
}

export function TripMap() {
  const school = getSchoolBase();
  const online = useOnlineStatus();
  const { pins, loaded, addPin, removePin } = useMapPins();
  const { askMateo, consumeMapFocus } = useNavigation();

  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);

  const [mapStatus, setMapStatus] = useState<"loading" | "ready" | "error">("loading");
  const [mapError, setMapError] = useState<string | null>(null);
  const [mapKey, setMapKey] = useState(0);
  const [selected, setSelected] = useState<Selected | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [layers, setLayers] = useState<LayerVisibility>(DEFAULT_LAYERS);
  const [pendingFocus, setPendingFocus] = useState<ReturnType<typeof consumeMapFocus>>(null);

  const mateoPrompt = (name: string) =>
    `Tell me about ${name} and whether it's worth adding to my Barcelona trip.`;

  const visiblePoints = useMemo(() => {
    const pts: { lat: number; lng: number }[] = [];
    if (layers.itinerary) {
      pts.push(...PLACES.map((p) => ({ lat: p.lat, lng: p.lng })));
    }
    if (layers.saved) {
      pts.push(...pins.map((p) => ({ lat: p.lat, lng: p.lng })));
    }
    for (const cat of Object.keys(NEARBY_CATEGORY_COLORS) as NearbyCategory[]) {
      if (layers[cat]) {
        pts.push(
          ...NEARBY_PLACES.filter((p) => p.category === cat).map((p) => ({
            lat: p.lat,
            lng: p.lng,
          })),
        );
      }
    }
    return pts;
  }, [pins, layers]);

  useEffect(() => {
    const focus = consumeMapFocus();
    if (focus) setPendingFocus(focus);
  }, [consumeMapFocus]);

  useEffect(() => {
    const el = containerRef.current as LeafletContainer | null;
    if (!el) return;

    let cancelled = false;
    let map: L.Map | null = null;
    let resizeObserver: ResizeObserver | null = null;
    let attempts = 0;

    setMapStatus("loading");
    setMapError(null);
    mapRef.current = null;
    markersRef.current = null;

    const finishReady = () => {
      if (cancelled || !map) return;
      map.invalidateSize();
      setMapStatus("ready");
    };

    const init = () => {
      if (cancelled) return;
      attempts += 1;

      if (el.clientWidth < 2 || el.clientHeight < 2) {
        if (attempts < 30) {
          requestAnimationFrame(init);
        } else {
          setMapStatus("error");
          setMapError("Map area has no size — try refreshing.");
        }
        return;
      }

      try {
        clearLeafletContainer(el, mapRef.current);
        mapRef.current = null;
        markersRef.current = null;

        map = L.map(el, {
          center: MAP_CENTER,
          zoom: 12,
          minZoom: 10,
          maxZoom: 18,
          zoomControl: false,
          scrollWheelZoom: true,
          doubleClickZoom: true,
          boxZoom: false,
          keyboard: false,
          touchZoom: true,
        });

        addMapTiles(map);
        markersRef.current = L.layerGroup().addTo(map);
        mapRef.current = map;

        resizeObserver = new ResizeObserver(() => {
          map?.invalidateSize();
        });
        resizeObserver.observe(el);

        requestAnimationFrame(() => requestAnimationFrame(finishReady));
      } catch (err) {
        if (!cancelled) {
          setMapStatus("error");
          setMapError(err instanceof Error ? err.message : "Map failed to load");
        }
      }
    };

    requestAnimationFrame(init);

    return () => {
      cancelled = true;
      resizeObserver?.disconnect();
      clearLeafletContainer(el, mapRef.current);
      mapRef.current = null;
      markersRef.current = null;
      map = null;
    };
  }, [mapKey]);

  useEffect(() => {
    const map = mapRef.current;
    const group = markersRef.current;
    if (!map || !group || mapStatus !== "ready") return;

    group.clearLayers();

    if (layers.itinerary) {
      for (const place of PLACES) {
        const icon =
          place.id === SCHOOL_BASE_ID ? schoolIcon : icons[place.category];
        const marker = L.marker([place.lat, place.lng], { icon });
        marker.on("click", () => setSelected({ kind: "place", place }));
        marker.addTo(group);
      }
    }

    for (const cat of Object.keys(NEARBY_CATEGORY_COLORS) as NearbyCategory[]) {
      if (!layers[cat]) continue;
      for (const item of NEARBY_PLACES.filter((p) => p.category === cat)) {
        const marker = L.marker([item.lat, item.lng], { icon: nearbyIcons[cat] });
        marker.on("click", () => setSelected({ kind: "nearby", item }));
        marker.addTo(group);
      }
    }

    if (layers.saved) {
      for (const pin of pins) {
        const marker = L.marker([pin.lat, pin.lng], { icon: savedIcon });
        marker.on("click", () => setSelected({ kind: "pin", pin }));
        marker.addTo(group);
      }
    }

    if (pendingFocus) {
      const { lat, lng, zoom = 16, nearbyId, placeId } = pendingFocus;
      map.setView([lat, lng], zoom, { animate: true });

      if (nearbyId) {
        const item = NEARBY_PLACES.find((p) => p.id === nearbyId);
        if (item) setSelected({ kind: "nearby", item });
      } else if (placeId) {
        const place = PLACES.find((p) => p.id === placeId);
        if (place) setSelected({ kind: "place", place });
      }

      setPendingFocus(null);
      return;
    }

    if (visiblePoints.length > 0) {
      const bounds = L.latLngBounds(visiblePoints.map((p) => [p.lat, p.lng]));
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 11 });
    }
  }, [pins, visiblePoints, mapStatus, layers, pendingFocus]);

  const toggleLayer = (key: keyof LayerVisibility) => {
    setLayers((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const zoomMap = (delta: 1 | -1) => {
    const map = mapRef.current;
    if (!map) return;
    map.setZoom(Math.min(map.getMaxZoom(), Math.max(map.getMinZoom(), map.getZoom() + delta)));
  };

  const handleAddPlace = async (e: FormEvent) => {
    e.preventDefault();
    if (!online) {
      setSearchError("Map search needs internet — pins and cached tiles still work offline.");
      return;
    }
    const q = searchQuery.trim();
    if (!q || searchLoading) return;

    setSearchError(null);
    setSearchLoading(true);

    try {
      const known = findKnownPlace(q);
      if (known) {
        addPin({
          name: known.name,
          lat: known.lat,
          lng: known.lng,
          notes: known.notes,
          address: known.address,
        });
        setSearchQuery("");
        return;
      }

      const result = await mapPlaceSearch(q);

      addPin({
        name: result.name,
        lat: result.lat,
        lng: result.lng,
        notes: result.notes,
        address: result.address,
        sourceUrl: result.sourceUrl,
      });
      setSearchQuery("");
    } catch (err) {
      setSearchError(err instanceof Error ? err.message : "Couldn't add place");
    } finally {
      setSearchLoading(false);
    }
  };

  const showSchoolOnMap = () => {
    setPendingFocus({
      lat: school.lat,
      lng: school.lng,
      zoom: 17,
      placeId: school.id,
    });
    setSelected({ kind: "place", place: school });
  };

  return (
    <div className="map-section">
      <div className="map-home-card">
        <div className="map-home-card-body">
          <span className="map-home-eyebrow">Language school</span>
          <h3 className="map-home-title">{school.name}</h3>
          <p className="map-home-address">{school.address}</p>
          {school.notes && <p className="map-home-notes">{school.notes}</p>}
        </div>
        <div className="map-home-actions">
          <button type="button" className="map-home-btn" onClick={showSchoolOnMap}>
            <MapPin size={15} strokeWidth={1.5} />
            Show on map
          </button>
          <button
            type="button"
            className="map-home-btn map-home-btn--primary"
            onClick={() => openExternal(googleMapsWalkingDirectionsUrl(school))}
          >
            <Footprints size={15} strokeWidth={1.5} />
            Walk here
          </button>
        </div>
      </div>

      <div className="map-search-panel">
        <form className="map-search-form" onSubmit={handleAddPlace}>
          <Radar size={17} strokeWidth={1.5} className="map-search-icon" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              online
                ? "Add a place (Sagrada Família, Park Güell, La Boqueria…)"
                : "Offline — can't search new places"
            }
            aria-label="Search place to add to map"
            disabled={!online}
          />
          <button
            type="submit"
            className="btn-scan map-search-btn"
            disabled={searchLoading || !searchQuery.trim() || !online}
          >
            {searchLoading ? <Loader2 size={16} className="spin" /> : "Add"}
          </button>
        </form>
        <p className="map-powered-by">
          {online ? (
            <>
              Places geocoded with <strong>OpenStreetMap Nominatim</strong>
            </>
          ) : (
            <>
              <strong>Offline mode</strong> — cached map tiles + saved pins. Browse online first to cache streets.
            </>
          )}
        </p>
        {searchError && <p className="map-search-error">{searchError}</p>}
      </div>

      {!online && (
        <div className="map-offline-banner" role="status">
          <WifiOff size={15} strokeWidth={1.5} aria-hidden />
          <span>
            Offline — showing cached map tiles where available. Pan to areas you've already viewed.
          </span>
        </div>
      )}

      <div className={`map-wrap ${!online ? "map-wrap--offline" : ""}`}>
        {mapStatus === "loading" && <p className="map-loading">Loading map…</p>}
        {mapStatus === "error" && (
          <div className="map-loading map-loading--error">
            <p>{mapError ?? "Map unavailable"}</p>
            <button
              type="button"
              className="map-retry-btn"
              onClick={() => setMapKey((k) => k + 1)}
            >
              Retry map
            </button>
          </div>
        )}
        <div
          key={mapKey}
          ref={containerRef}
          className="leaflet-map-host"
          aria-label="Trip map"
        />
        {mapStatus === "ready" && (
          <div className="map-zoom-controls" aria-label="Map zoom">
            <button
              type="button"
              className="map-zoom-btn"
              onClick={() => zoomMap(1)}
              aria-label="Zoom in"
            >
              <Plus size={18} strokeWidth={2} />
            </button>
            <button
              type="button"
              className="map-zoom-btn"
              onClick={() => zoomMap(-1)}
              aria-label="Zoom out"
            >
              <Minus size={18} strokeWidth={2} />
            </button>
          </div>
        )}
      </div>

      <div className="map-legend map-legend--toggle">
        <span className="map-legend-heading">Layers</span>
        <button
          type="button"
          className={`legend-item legend-item--toggle ${layers.itinerary ? "" : "off"}`}
          onClick={() => toggleLayer("itinerary")}
          aria-pressed={layers.itinerary}
        >
          <span className="legend-dot" style={{ background: SCHOOL_PIN_COLOR }} />
          itinerary + school
        </button>
        {(Object.keys(NEARBY_CATEGORY_COLORS) as NearbyCategory[]).map((cat) => (
          <button
            key={cat}
            type="button"
            className={`legend-item legend-item--toggle ${layers[cat] ? "" : "off"}`}
            onClick={() => toggleLayer(cat)}
            aria-pressed={layers[cat]}
          >
            <span
              className="legend-dot"
              style={{ background: NEARBY_CATEGORY_COLORS[cat] }}
            />
            {NEARBY_LAYER_LABELS[cat]}
          </button>
        ))}
        <button
          type="button"
          className={`legend-item legend-item--toggle ${layers.saved ? "" : "off"}`}
          onClick={() => toggleLayer("saved")}
          aria-pressed={layers.saved}
        >
          <span className="legend-dot" style={{ background: SAVED_PIN_COLOR }} />
          saved
        </button>
      </div>

      {selected && (
        <div className="map-place-card">
          <button
            type="button"
            className="map-place-card-close"
            onClick={() => setSelected(null)}
            aria-label="Close"
          >
            <X size={16} />
          </button>
          <PlaceDetail
            selected={selected}
            onAskMateo={askMateo}
            mateoPrompt={mateoPrompt}
            onRemovePin={(id) => {
              removePin(id);
              setSelected(null);
            }}
          />
        </div>
      )}

      {loaded && pins.length > 0 && (
        <ul className="map-saved-list">
          {pins.map((pin) => {
            const km = haversineKm(CITY_CENTER, pin);
            return (
              <li key={pin.id} className="map-saved-item">
                <button
                  type="button"
                  className="map-saved-item-btn"
                  onClick={() => setSelected({ kind: "pin", pin })}
                >
                  <strong>{pin.name}</strong>
                  <span className="map-saved-dist">{formatDistanceKm(km)} from city center</span>
                </button>
                <button
                  type="button"
                  className="map-saved-remove"
                  onClick={() => removePin(pin.id)}
                  aria-label={`Remove ${pin.name}`}
                >
                  <Trash2 size={14} />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function PlaceDetail({
  selected,
  onAskMateo,
  mateoPrompt,
  onRemovePin,
}: {
  selected: Selected;
  onAskMateo: (msg: string) => void;
  mateoPrompt: (name: string) => string;
  onRemovePin: (id: string) => void;
}) {
  const place =
    selected.kind === "place"
      ? selected.place
      : selected.kind === "nearby"
        ? {
            name: selected.item.name,
            lat: selected.item.lat,
            lng: selected.item.lng,
            address: selected.item.address,
            day: undefined,
            notes: selected.item.notes,
            hours: selected.item.hours,
          }
        : {
            name: selected.pin.name,
            lat: selected.pin.lat,
            lng: selected.pin.lng,
            address: selected.pin.address,
            day: undefined,
            notes: selected.pin.notes,
          };

  const km = haversineKm(CITY_CENTER, place);

  return (
    <>
      <h3 className="map-place-card-title">{place.name}</h3>
      {"day" in place && place.day != null && (
        <p className="map-place-card-meta">Day {place.day}</p>
      )}
      {"hours" in place && place.hours && (
        <p className="map-place-card-meta">{place.hours}</p>
      )}
      {"address" in place && place.address && (
        <p className="map-place-card-meta">{place.address}</p>
      )}
      {place.notes && <p className="map-place-card-notes">{place.notes}</p>}
      <p className="map-distance">
        ≈ {formatDistanceKm(km)} from {CITY_CENTER.name} center (straight line)
      </p>
      <PlaceActions
        place={{ name: place.name, lat: place.lat, lng: place.lng, address: place.address }}
        compact
        onAskMateo={() => onAskMateo(mateoPrompt(place.name))}
      />
      {selected.kind === "pin" && (
        <button type="button" className="map-remove-btn" onClick={() => onRemovePin(selected.pin.id)}>
          Remove pin
        </button>
      )}
    </>
  );
}
