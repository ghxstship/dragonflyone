import type { ReactNode } from "react";

export interface MapLocation<T = unknown> {
  id: string;
  title: string;
  description?: string;
  latitude: number;
  longitude: number;
  address?: string;
  color?: string;
  icon?: ReactNode;
  data?: T;
}

export interface MapViewProps<T> {
  /** Locations to display */
  locations: MapLocation<T>[];
  /** Center coordinates [lat, lng] */
  center?: [number, number];
  /** Initial zoom level (1-20) */
  zoom?: number;
  /** Location click handler */
  onLocationClick?: (location: MapLocation<T>) => void;
  /** Custom marker render */
  renderMarker?: (location: MapLocation<T>) => ReactNode;
  /** Custom popup render */
  renderPopup?: (location: MapLocation<T>) => ReactNode;
  /** Show location list sidebar */
  showList?: boolean;
  /** Inverted theme */
  inverted?: boolean;
  /** Additional className */
  className?: string;
  /** Loading state */
  loading?: boolean;
  /** Empty message */
  emptyMessage?: string;
  /** Map tile provider (for future real map integration) */
  tileProvider?: "openstreetmap" | "mapbox" | "google";
  /** Height of the map */
  height?: string | number;
}
