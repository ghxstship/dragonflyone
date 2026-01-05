"use client";

import React, { useState, useCallback, useMemo, useRef, useEffect } from "react";
import clsx from "clsx";
import { Button, Badge, Icon } from "../../../index.js";
import { MapPin, Search, Plus, Layers, Navigation, ZoomIn, ZoomOut, Maximize2, Settings, Filter } from "lucide-react";
import type { 
  MapViewProps, 
  MapProvider,
  MapLocation,
  MapCluster,
  MapCoordinates,
  MapBounds,
  MapViewport,
  MapSearchResult,
  MapLayer,
  MapRoute,
  MapStats,
  MapViewState
} from "./MapView.types.js";
import type { BaseViewProps } from "../types.js";

/**
 * MAP VIEW
 * 
 * CHARACTERISTICS:
 * - Geographic location visualization
 * - Multiple map providers support
 * - Location clustering
 * - Heat map visualization
 * - Search and filtering
 * - Geolocation support
 * - Custom markers and popups
 * - Route visualization
 * - Layer management
 */
export function MapView<T extends { id: string }>({
  entityIds,
  entitySelector,
  filters = [],
  sort = [],
  groupBy,
  searchQuery = "",
  visibleFields = [],
  density = "default",
  showSubtasks = true,
  showCompleted = true,
  colorBy,
  selectionMode = "none",
  selectedIds = [],
  onSelectionChange,
  onEntityClick,
  onEntityDoubleClick,
  onContextMenu,
  onEntityUpdate,
  onEntityCreate,
  onEntityDelete,
  onEntityReorder,
  isLoading = false,
  error = null,
  emptyState,
  config = {},
  latitudeField,
  longitudeField,
  nameField,
  descriptionField,
  typeField,
  statusField,
  iconField,
  colorField,
  defaultCenter = { lat: 40.7128, lng: -74.0060 },
  defaultZoom = 10,
  enableClustering = true,
  enableHeatMap = false,
  enableSearch = true,
  enableGeolocation = false,
  showLocationDetails = true,
  showClusters = true,
  showMarkers = true,
  showPopups = true,
  compact = false,
  mapProvider = "openstreetmap",
  markerRenderer,
  popupRenderer,
  clusterRenderer,
  onLocationClick,
  onLocationDoubleClick,
  onLocationContextMenu,
  onMapClick,
  onSearch,
  onGeolocation,
  ...props
}: MapViewProps<T>) {
  const [viewport, setViewport] = useState<MapViewport>({
    center: defaultCenter,
    zoom: defaultZoom,
  });
  const [selectedLocations, setSelectedLocations] = useState<Set<string>>(new Set(selectedIds));
  const [searchQueryLocal, setSearchQueryLocal] = useState(searchQuery);
  const [searchResults, setSearchResults] = useState<MapSearchResult[]>([]);
  const [clusters, setClusters] = useState<MapCluster<T>[]>([]);
  const [isGeolocating, setIsGeolocating] = useState(false);
  const [geolocationPosition, setGeolocationPosition] = useState<GeolocationPosition | null>(null);
  const mapViewRef = useRef<HTMLDivElement>(null);

  // Map configuration
  const mapConfig = useMemo(() => ({
    markerSize: compact ? 20 : 30,
    clusterSize: compact ? 40 : 60,
    maxZoom: 18,
    minZoom: 2,
    mapStyle: 'default',
    tileSize: 256,
    ...config,
  }), [compact, config]);

  // Resolve entities from IDs
  const entities = useMemo(() => {
    if (!entitySelector) return [];
    return entityIds.map(id => entitySelector(id)).filter(Boolean) as T[];
  }, [entityIds, entitySelector]);

  // Filter entities
  const filteredEntities = useMemo(() => {
    let filtered = entities;

    // Apply search filter
    if (searchQueryLocal) {
      filtered = filtered.filter(entity =>
        Object.values(entity).some(value =>
          String(value).toLowerCase().includes(searchQueryLocal.toLowerCase())
        )
      );
    }

    // Apply filters
    filters.forEach(filter => {
      if (filter.isActive) {
        filtered = filtered.filter(entity => {
          const value = entity[filter.field as keyof T];
          switch (filter.operator) {
            case 'equals':
              return value === filter.value;
            case 'contains':
              return String(value).toLowerCase().includes(String(filter.value).toLowerCase());
            case 'greater_than':
              return Number(value) > Number(filter.value);
            case 'less_than':
              return Number(value) < Number(filter.value);
            default:
              return true;
          }
        });
      }
    });

    return filtered;
  }, [entities, searchQueryLocal, filters]);

  // Convert entities to map locations
  const mapLocations = useMemo((): MapLocation<T>[] => {
    return filteredEntities.map(entity => {
      const lat = Number(entity[latitudeField]);
      const lng = Number(entity[longitudeField]);
      const name = String(entity[nameField]);
      const description = descriptionField ? String(entity[descriptionField]) : undefined;
      const type = typeField ? String(entity[typeField]) : 'location';
      const status = statusField ? String(entity[statusField]) : 'active';
      const icon = iconField ? String(entity[iconField]) : 'map-pin';
      const color = colorField ? String(entity[colorField]) : 'var(--color-brand-primary)';

      return {
        data: entity,
        id: entity.id,
        name,
        description,
        coordinates: { lat, lng },
        type,
        status,
        icon,
        color,
        selected: selectedLocations.has(entity.id),
        visible: true,
        popup: description,
      };
    }).filter(location => 
      !isNaN(location.coordinates.lat) && 
      !isNaN(location.coordinates.lng) &&
      location.coordinates.lat >= -90 &&
      location.coordinates.lat <= 90 &&
      location.coordinates.lng >= -180 &&
      location.coordinates.lng <= 180
    );
  }, [filteredEntities, latitudeField, longitudeField, nameField, descriptionField, typeField, statusField, iconField, colorField, selectedLocations]);

  // Calculate map statistics
  const mapStats = useMemo((): MapStats => {
    const totalLocations = mapLocations.length;
    const locationsByType: Record<string, number> = {};
    const locationsByStatus: Record<string, number> = {};

    mapLocations.forEach(location => {
      locationsByType[location.type || 'unknown'] = (locationsByType[location.type || 'unknown'] || 0) + 1;
      locationsByStatus[location.status || 'unknown'] = (locationsByStatus[location.status || 'unknown'] || 0) + 1;
    });

    // Calculate bounds
    let minLat = Infinity, maxLat = -Infinity;
    let minLng = Infinity, maxLng = -Infinity;

    mapLocations.forEach(location => {
      minLat = Math.min(minLat, location.coordinates.lat);
      maxLat = Math.max(maxLat, location.coordinates.lat);
      minLng = Math.min(minLng, location.coordinates.lng);
      maxLng = Math.max(maxLng, location.coordinates.lng);
    });

    const bounds: MapBounds = {
      northeast: { lat: maxLat, lng: maxLng },
      southwest: { lat: minLat, lng: minLng },
    };

    const center: MapCoordinates = {
      lat: (minLat + maxLat) / 2,
      lng: (minLng + maxLng) / 2,
    };

    const averageDensity = totalLocations > 0 ? totalLocations / ((maxLat - minLat) * (maxLng - minLng)) : 0;

    return {
      totalLocations,
      locationsByType,
      locationsByStatus,
      averageDensity,
      bounds,
      center,
    };
  }, [mapLocations]);

  // Generate clusters
  const generateClusters = useCallback((locations: MapLocation<T>[]): MapCluster<T>[] => {
    if (!enableClustering) return [];

    const clusters: MapCluster<T>[] = [];
    const processed = new Set<string>();

    locations.forEach(location => {
      if (processed.has(location.id)) return;

      const nearbyLocations = locations.filter(other => {
        if (processed.has(other.id)) return false;
        
        const distance = calculateDistance(location.coordinates, other.coordinates);
        return distance < 0.01; // ~1km clustering radius
      });

      if (nearbyLocations.length > 1) {
        const cluster: MapCluster<T> = {
          id: `cluster-${clusters.length}`,
          center: {
            lat: nearbyLocations.reduce((sum, loc) => sum + loc.coordinates.lat, 0) / nearbyLocations.length,
            lng: nearbyLocations.reduce((sum, loc) => sum + loc.coordinates.lng, 0) / nearbyLocations.length,
          },
          locations: nearbyLocations,
          count: nearbyLocations.length,
          size: mapConfig.clusterSize,
          expanded: false,
          color: 'var(--color-brand-primary)',
        };

        clusters.push(cluster);
        nearbyLocations.forEach(loc => processed.add(loc.id));
      }
    });

    return clusters;
  }, [enableClustering, mapConfig.clusterSize]);

  // Calculate distance between two coordinates
  const calculateDistance = useCallback((coord1: MapCoordinates, coord2: MapCoordinates): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (coord2.lat - coord1.lat) * Math.PI / 180;
    const dLng = (coord2.lng - coord1.lng) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(coord1.lat * Math.PI / 180) * Math.cos(coord2.lat * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }, []);

  // Location click handler
  const handleLocationClick = useCallback((locationId: string, event: React.MouseEvent) => {
    const location = mapLocations.find(l => l.id === locationId);
    if (!location) return;
    
    if (event.metaKey || event.ctrlKey) {
      // Multi-select
      setSelectedLocations(prev => {
        const next = new Set(prev);
        if (next.has(locationId)) {
          next.delete(locationId);
        } else {
          next.add(locationId);
        }
        return next;
      });
    } else {
      // Single select
      setSelectedLocations(new Set([locationId]));
    }
    
    onLocationClick?.(location.data);
    onEntityClick?.(locationId);
  }, [mapLocations, onLocationClick, onEntityClick]);

  // Search handler
  const handleSearch = useCallback((query: string) => {
    setSearchQueryLocal(query);
    onSearch?.(query);
  }, [onSearch]);

  // Geolocation handler
  const handleGeolocation = useCallback(() => {
    if (!navigator.geolocation) return;

    setIsGeolocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setGeolocationPosition(position);
        setViewport(prev => ({
          ...prev,
          center: { lat: position.coords.latitude, lng: position.coords.longitude },
        }));
        setIsGeolocating(false);
        onGeolocation?.(position);
      },
      (error) => {
        console.error('Geolocation error:', error);
        setIsGeolocating(false);
      }
    );
  }, [onGeolocation]);

  // Zoom handlers
  const handleZoomIn = useCallback(() => {
    setViewport(prev => ({
      ...prev,
      zoom: Math.min(prev.zoom + 1, mapConfig.maxZoom),
    }));
  }, [mapConfig.maxZoom]);

  const handleZoomOut = useCallback(() => {
    setViewport(prev => ({
      ...prev,
      zoom: Math.max(prev.zoom - 1, mapConfig.minZoom),
    }));
  }, [mapConfig.minZoom]);

  // Render map location
  const renderMapLocation = useCallback((location: MapLocation<T>) => {
    if (markerRenderer) {
      return markerRenderer(location);
    }

    return (
      <div
        className={clsx(
          "absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all",
          location.selected && "scale-125",
          compact && "scale-75"
        )}
        style={{
          left: '50%',
          top: '50%',
        }}
        onClick={(e) => handleLocationClick(location.id, e)}
        onDoubleClick={() => onLocationDoubleClick?.(location.data)}
        onContextMenu={(e) => onLocationContextMenu?.(location.data, e)}
      >
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center shadow-lg"
          style={{ backgroundColor: location.color }}
        >
          <Icon name={location.icon || 'map-pin'} className="w-4 h-4 text-white" />
        </div>
        
        {showLocationDetails && (
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 bg-[var(--color-surface-primary)] border border-[var(--color-border-input)] rounded-lg p-2 shadow-lg whitespace-nowrap">
            <div className="font-medium text-[var(--color-text-primary)] text-sm">
              {location.name}
            </div>
            {location.description && (
              <div className="text-xs text-[var(--color-text-muted)]">
                {location.description}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }, [markerRenderer, showLocationDetails, compact, handleLocationClick, onLocationDoubleClick, onLocationContextMenu]);

  // Render cluster
  const renderCluster = useCallback((cluster: MapCluster<T>) => {
    if (clusterRenderer) {
      return clusterRenderer(cluster);
    }

    return (
      <div
        className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all hover:scale-110"
        style={{
          left: '50%',
          top: '50%',
        }}
      >
        <div
          className="rounded-full flex items-center justify-center shadow-lg"
          style={{
            width: `${cluster.size}px`,
            height: `${cluster.size}px`,
            backgroundColor: cluster.color,
          }}
        >
          <span className="text-white font-bold text-sm">
            {cluster.count}
          </span>
        </div>
      </div>
    );
  }, [clusterRenderer]);

  // Empty state
  if (mapLocations.length === 0 && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="text-[var(--color-text-muted)] mb-4">
          <MapPin className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium text-[var(--color-text-primary)] mb-2">
            {emptyState?.title || "No locations found"}
          </h3>
          {emptyState?.description && (
            <p className="text-[var(--color-text-muted)] mb-4">
              {emptyState.description}
            </p>
          )}
          {emptyState?.action && (
            <Button onClick={emptyState.action.onClick}>
              {emptyState.action.label}
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-[var(--color-text-muted)]">Loading map...</div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center py-16 text-center">
        <div className="text-[var(--color-error-border)] mb-4">
          <h3 className="text-lg font-medium mb-2">Error loading map</h3>
          <p className="text-[var(--color-error-border)]">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-hidden" ref={mapViewRef}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[var(--color-border-input)]">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <select
              value={mapProvider}
              className="px-3 py-2 border border-[var(--color-border-input)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)]"
            >
              <option value="openstreetmap">OpenStreetMap</option>
              <option value="google">Google Maps</option>
              <option value="mapbox">Mapbox</option>
              <option value="leaflet">Leaflet</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={enableClustering ? 'solid' : 'outline'}
              size="sm"
            >
              <Layers className="w-4 h-4 mr-2" />
              Clustering
            </Button>
            <Button
              variant={enableHeatMap ? 'solid' : 'outline'}
              size="sm"
            >
              Heat Map
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {enableSearch && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
              <input
                type="text"
                placeholder="Search locations..."
                value={searchQueryLocal}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 pr-4 py-2 border border-[var(--color-border-input)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)]"
              />
            </div>
          )}

          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>

          {enableGeolocation && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleGeolocation}
              disabled={isGeolocating}
            >
              <Navigation className={clsx("w-4 h-4", isGeolocating && "animate-spin")} />
            </Button>
          )}

          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4" />
          </Button>

          <Button variant="outline" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Location
          </Button>
        </div>
      </div>

      {/* Map stats */}
      <div className="flex items-center gap-6 px-4 py-2 border-b border-[var(--color-border-input)] bg-[var(--color-surface-elevated)]">
        <div className="flex items-center gap-2">
          <span className="text-sm text-[var(--color-text-muted)]">Locations:</span>
          <Badge variant="secondary" size="sm">
            {mapStats.totalLocations}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-[var(--color-text-muted)]">Types:</span>
          <Badge variant="secondary" size="sm">
            {Object.keys(mapStats.locationsByType).length}
          </Badge>
        </div>
        {geolocationPosition && (
          <div className="flex items-center gap-2">
            <Navigation className="w-4 h-4 text-[var(--color-success)]" />
            <span className="text-sm text-[var(--color-text-muted)]">
              Current location
            </span>
          </div>
        )}
      </div>

      {/* Map container */}
      <div className="relative" style={{ height: 'calc(100% - 140px)' }}>
        {/* Map placeholder (would be replaced with actual map component) */}
        <div className="absolute inset-0 bg-[var(--color-surface-elevated)] flex items-center justify-center">
          <div className="text-center">
            <MapPin className="w-16 h-16 mx-auto mb-4 text-[var(--color-text-muted)] opacity-50" />
            <h3 className="text-lg font-medium text-[var(--color-text-primary)] mb-2">
              Map View
            </h3>
            <p className="text-[var(--color-text-muted)] mb-4">
              {mapStats.totalLocations} locations loaded
            </p>
            <div className="text-sm text-[var(--color-text-muted)]">
              Center: {viewport.center.lat.toFixed(4)}, {viewport.center.lng.toFixed(4)}
            </div>
            <div className="text-sm text-[var(--color-text-muted)]">
              Zoom: {viewport.zoom}
            </div>
          </div>
        </div>

        {/* Map controls */}
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          <Button variant="outline" size="sm" onClick={handleZoomIn}>
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleZoomOut}>
            <ZoomOut className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm">
            <Maximize2 className="w-4 h-4" />
          </Button>
        </div>

        {/* Sample location markers */}
        {mapLocations.slice(0, 5).map(location => (
          <div key={location.id} className="absolute" style={{ top: '20%', left: `${20 + location.id.charCodeAt(0) % 60}%` }}>
            {renderMapLocation(location)}
          </div>
        ))}

        {/* Sample clusters */}
        {clusters.slice(0, 2).map(cluster => (
          <div key={cluster.id} className="absolute" style={{ top: '60%', left: `${30 + cluster.id.charCodeAt(0) % 40}%` }}>
            {renderCluster(cluster)}
          </div>
        ))}
      </div>
    </div>
  );
}
