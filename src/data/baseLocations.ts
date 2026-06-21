export interface BaseLocation {
  id: string;
  label: string;
  address: string;
  lat: number;
  lng: number;
}

/** Home base — Gothic Quarter */
export const HOME_BASE: BaseLocation = {
  id: "home-avinyo",
  label: "Home",
  address: "Carrer d'Avinyó, Gothic Quarter, Barcelona",
  lat: 41.3808,
  lng: 2.1775,
};

/** Language school — Eixample */
export const SCHOOL_BASE: BaseLocation = {
  id: "school-diputacio",
  label: "School",
  address: "Carrer de la Diputació 119, 08015 Barcelona",
  lat: 41.3826,
  lng: 2.1565,
};

export const BASE_PRESETS = [HOME_BASE, SCHOOL_BASE] as const;
