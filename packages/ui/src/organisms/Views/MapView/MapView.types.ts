import type { BaseViewProps } from '../types.js';

export interface MapViewProps<T extends { id: string }> extends BaseViewProps<T> {
  /** Field for latitude */
  latitudeField: keyof T;
  
  /** Field for longitude */
  longitudeField: keyof T;
  
  /** Field for location name */
  nameField: keyof T;
  
  /** Field for location description */
  descriptionField?: keyof T;
  
  /** Field for location type */
  typeField?: keyof T;
  
  /** Field for location status */
  statusField?: keyof T;
  
  /** Field for location icon */
  iconField?: keyof T;
  
  /** Field for location color */
  colorField?: keyof T;
  
  /** Default map center */
  defaultCenter?: MapCoordinates;
  
  /** Default zoom level */
  defaultZoom?: number;
  
  /** Enable clustering */
  enableClustering?: boolean;
  
  /** Enable heat map */
  enableHeatMap?: boolean;
  
  /** Enable search */
  enableSearch?: boolean;
  
  /** Enable geolocation */
  enableGeolocation?: boolean;
  
  /** Show location details */
  showLocationDetails?: boolean;
  
  /** Show location clusters */
  showClusters?: boolean;
  
  /** Show location markers */
  showMarkers?: boolean;
  
  /** Show location popups */
  showPopups?: boolean;
  
  /** Compact mode */
  compact?: boolean;
  
  /** Map provider */
  mapProvider?: MapProvider;
  
  /** Custom marker renderer */
  markerRenderer?: (location: MapLocation<T>) => React.ReactNode;
  
  /** Custom popup renderer */
  popupRenderer?: (location: MapLocation<T>) => React.ReactNode;
  
  /** Custom cluster renderer */
  clusterRenderer?: (cluster: MapCluster<T>) => React.ReactNode;
  
  /** Location click handler */
  onLocationClick?: (location: T) => void;
  
  /** Location double-click handler */
  onLocationDoubleClick?: (location: T) => void;
  
  /** Location context menu handler */
  onLocationContextMenu?: (location: T, event: React.MouseEvent) => void;
  
  /** Map click handler */
  onMapClick?: (coordinates: MapCoordinates) => void;
  
  /** Search handler */
  onSearch?: (query: string) => void;
  
  /** Geolocation handler */
  onGeolocation?: (position: GeolocationPosition) => void;
  
  /** Map configuration */
  config?: {
    markerSize?: number;
    clusterSize?: number;
    maxZoom?: number;
    minZoom?: number;
    mapStyle?: string;
    tileSize?: number;
  };
}

export type MapProvider = 
  | 'openstreetmap'
  | 'google'
  | 'mapbox'
  | 'leaflet';

export interface MapLocation<T> {
  /** Location data */
  data: T;
  
  /** Location ID */
  id: string;
  
  /** Location name */
  name: string;
  
  /** Location description */
  description?: string;
  
  /** Location coordinates */
  coordinates: MapCoordinates;
  
  /** Location type */
  type?: string;
  
  /** Location status */
  status?: string;
  
  /** Location icon */
  icon?: string;
  
  /** Location color */
  color?: string;
  
  /** Is selected */
  selected?: boolean;
  
  /** Is visible */
  visible?: boolean;
  
  /** Popup content */
  popup?: string;
  
  /** Marker position */
  position?: {
    x: number;
    y: number;
  };
}

export interface MapCluster<T> {
  /** Cluster ID */
  id: string;
  
  /** Cluster center */
  center: MapCoordinates;
  
  /** Cluster locations */
  locations: MapLocation<T>[];
  
  /** Cluster count */
  count: number;
  
  /** Cluster size */
  size: number;
  
  /** Is expanded */
  expanded?: boolean;
  
  /** Cluster color */
  color?: string;
}

export interface MapCoordinates {
  /** Latitude */
  lat: number;
  
  /** Longitude */
  lng: number;
}

export interface MapBounds {
  /** Northeast corner */
  northeast: MapCoordinates;
  
  /** Southwest corner */
  southwest: MapCoordinates;
}

export interface MapViewport {
  /** Center coordinates */
  center: MapCoordinates;
  
  /** Zoom level */
  zoom: number;
  
  /** Map bounds */
  bounds?: MapBounds;
  
  /** Map size */
  size?: {
    width: number;
    height: number;
  };
}

export interface MapSearchResult {
  /** Result ID */
  id: string;
  
  /** Result name */
  name: string;
  
  /** Result coordinates */
  coordinates: MapCoordinates;
  
  /** Result type */
  type: string;
  
  /** Result description */
  description?: string;
}

export interface MapLayer {
  /** Layer ID */
  id: string;
  
  /** Layer name */
  name: string;
  
  /** Layer type */
  type: 'markers' | 'heatmap' | 'polygons' | 'routes';
  
  /** Layer data */
  data: any[];
  
  /** Layer visibility */
  visible: boolean;
  
  /** Layer opacity */
  opacity: number;
  
  /** Layer style */
  style?: MapLayerStyle;
}

export interface MapLayerStyle {
  /** Marker color */
  markerColor?: string;
  
  /** Marker size */
  markerSize?: number;
  
  /** Line color */
  lineColor?: string;
  
  /** Line width */
  lineWidth?: number;
  
  /** Fill color */
  fillColor?: string;
  
  /** Fill opacity */
  fillOpacity?: number;
}

export interface MapRoute {
  /** Route ID */
  id: string;
  
  /** Route name */
  name: string;
  
  /** Route coordinates */
  coordinates: MapCoordinates[];
  
  /** Route distance */
  distance: number;
  
  /** Route duration */
  duration: number;
  
  /** Route color */
  color?: string;
  
  /** Route width */
  width?: number;
  
  /** Is active */
  active?: boolean;
}

export interface MapStats {
  /** Total locations */
  totalLocations: number;
  
  /** Locations by type */
  locationsByType: Record<string, number>;
  
  /** Locations by status */
  locationsByStatus: Record<string, number>;
  
  /** Average location density */
  averageDensity: number;
  
  /** Map bounds */
  bounds: MapBounds;
  
  /** Center point */
  center: MapCoordinates;
}

export interface MapViewState {
  /** Current viewport */
  viewport: MapViewport;
  
  /** Selected locations */
  selectedLocations: Set<string>;
  
  /** Visible layers */
  visibleLayers: Set<string>;
  
  /** Search query */
  searchQuery: string;
  
  /** Search results */
  searchResults: MapSearchResult[];
  
  /** Clusters */
  clusters: MapCluster<any>[];
  
  /** Is loading */
  isLoading: boolean;
  
  /** Error */
  error?: string;
  
  /** Geolocation position */
  geolocationPosition?: GeolocationPosition;
  
  /** Map style */
  mapStyle: string;
}
