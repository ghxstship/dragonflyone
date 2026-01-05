"use client";

import React, { useMemo, useState } from "react";
import clsx from "clsx";
import { MapPin, ZoomIn, ZoomOut, Maximize2, List } from "lucide-react";
import { mapViewVariants } from "./MapView.variants.js";
import type { MapViewProps, MapLocation } from "./MapView.types.js";

// =============================================================================
// CONSTANTS
// =============================================================================

const DEFAULT_COLORS = [
  "#6366f1",
  "#8b5cf6",
  "#f59e0b",
  "#10b981",
  "#3b82f6",
  "#ec4899",
];

// =============================================================================
// PLACEHOLDER MAP COMPONENT
// This is a visual placeholder. For production, integrate with:
// - Leaflet + react-leaflet
// - Mapbox GL JS
// - Google Maps API
// =============================================================================

interface PlaceholderMapProps {
  locations: MapLocation[];
  center: [number, number];
  zoom: number;
  inverted: boolean;
  onLocationClick?: (location: MapLocation) => void;
  selectedId?: string;
}

function PlaceholderMap({
  locations,
  center,
  zoom,
  inverted,
  onLocationClick,
  selectedId,
}: PlaceholderMapProps) {
  // Calculate bounds
  const bounds = useMemo(() => {
    if (locations.length === 0) {
      return { minLat: center[0] - 1, maxLat: center[0] + 1, minLng: center[1] - 1, maxLng: center[1] + 1 };
    }

    let minLat = locations[0].latitude;
    let maxLat = locations[0].latitude;
    let minLng = locations[0].longitude;
    let maxLng = locations[0].longitude;

    locations.forEach((loc) => {
      if (loc.latitude < minLat) minLat = loc.latitude;
      if (loc.latitude > maxLat) maxLat = loc.latitude;
      if (loc.longitude < minLng) minLng = loc.longitude;
      if (loc.longitude > maxLng) maxLng = loc.longitude;
    });

    // Add padding
    const latPadding = (maxLat - minLat) * 0.1 || 0.5;
    const lngPadding = (maxLng - minLng) * 0.1 || 0.5;

    return {
      minLat: minLat - latPadding,
      maxLat: maxLat + latPadding,
      minLng: minLng - lngPadding,
      maxLng: maxLng + lngPadding,
    };
  }, [locations, center]);

  // Convert lat/lng to pixel position
  const getPosition = (lat: number, lng: number) => {
    const x = ((lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * 100;
    const y = ((bounds.maxLat - lat) / (bounds.maxLat - bounds.minLat)) * 100;
    return { x: Math.max(5, Math.min(95, x)), y: Math.max(5, Math.min(95, y)) };
  };

  return (
    <div
      className={clsx(
        "relative w-full h-full overflow-hidden rounded-lg",
        inverted ? "bg-[var(--color-surface-elevated)]" : "bg-[var(--color-surface-muted)]"
      )}
    >
      {/* Grid pattern to simulate map */}
      <div
        className={clsx(
          "absolute inset-0 opacity-20",
          inverted ? "bg-[var(--color-surface-elevated)]" : "bg-[var(--color-surface-muted)]"
        )}
        style={{
          backgroundImage: `
            linear-gradient(${inverted ? "#374151" : "#d1d5db"} 1px, transparent 1px),
            linear-gradient(90deg, ${inverted ? "#374151" : "#d1d5db"} 1px, transparent 1px)
          `,
          backgroundSize: `${20 * zoom}px ${20 * zoom}px`,
        }}
      />

      {/* Map placeholder text */}
      <div
        className={clsx(
          "absolute inset-0 flex items-center justify-center pointer-events-none",
          inverted ? "text-[var(--color-text-disabled)]" : "text-[var(--color-text-disabled)]"
        )}
      >
        <div className="text-center">
          <MapPin size={48} className="mx-auto mb-2 opacity-50" />
          <p className="text-sm font-medium">Map View</p>
          <p className="text-xs opacity-75">
            {locations.length} location{locations.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Location markers */}
      {locations.map((location, index) => {
        const pos = getPosition(location.latitude, location.longitude);
        const color = location.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length];
        const isSelected = selectedId === location.id;

        return (
          <button
            key={location.id}
            type="button"
            onClick={() => onLocationClick?.(location)}
            className={clsx(
              "absolute transform -translate-x-1/2 -translate-y-full transition-all z-content-overlay",
              isSelected && "z-content-controls scale-125"
            )}
            style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
          >
            <div
              className={clsx(
                "flex flex-col items-center",
                isSelected && "animate-bounce"
              )}
            >
              {/* Marker */}
              <div
                className="w-8 h-8 rounded-full border-3 flex items-center justify-center shadow-lg"
                style={{
                  backgroundColor: color,
                  borderColor: inverted ? "#1f2937" : "#ffffff",
                }}
              >
                {location.icon || <MapPin size={14} className="text-white" />}
              </div>

              {/* Pin point */}
              <div
                className="w-0 h-0 border-l-4 border-r-4 border-t-8 border-transparent -mt-1"
                style={{ borderTopColor: color }}
              />

              {/* Label */}
              {isSelected && (
                <div
                  className={clsx(
                    "absolute top-full mt-2 px-2 py-1 rounded text-xs font-medium whitespace-nowrap shadow-lg",
                    inverted ? "bg-[var(--color-surface-primary)] text-[var(--color-text-primary)]" : "bg-[var(--color-surface-inverse)] text-[var(--color-text-primary)]"
                  )}
                >
                  {location.title}
                </div>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}

// =============================================================================
// LOCATION LIST COMPONENT
// =============================================================================

interface LocationListProps<T> {
  locations: MapLocation<T>[];
  selectedId?: string;
  onSelect: (location: MapLocation<T>) => void;
  inverted: boolean;
}

function LocationList<T>({
  locations,
  selectedId,
  onSelect,
  inverted,
}: LocationListProps<T>) {
  return (
    <div className="space-y-2 overflow-y-auto max-h-full">
      {locations.map((location, index) => {
        const color = location.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length];
        const isSelected = selectedId === location.id;

        return (
          <button
            key={location.id}
            type="button"
            onClick={() => onSelect(location)}
            className={clsx(
              "w-full text-left p-3 rounded-lg border-2 transition-all",
              isSelected
                ? "border-primary-500 shadow-md"
                : inverted
                ? "border-[var(--color-border-default)] hover:border-[var(--color-primary-500)]"
                : "border-[var(--color-border-default)] hover:border-[var(--color-primary-500)]",
              inverted ? "bg-[var(--color-surface-elevated)]" : "bg-[var(--color-surface-primary)]"
            )}
          >
            <div className="flex items-start gap-3">
              <div
                className="w-3 h-3 rounded-full mt-1 flex-shrink-0"
                style={{ backgroundColor: color }}
              />
              <div className="flex-1 min-w-0">
                <h4
                  className={clsx(
                    "font-semibold text-sm truncate",
                    inverted ? "text-[var(--color-text-primary)]" : "text-[var(--color-text-primary)]"
                  )}
                >
                  {location.title}
                </h4>
                {location.address && (
                  <p
                    className={clsx(
                      "text-xs truncate mt-0.5",
                      inverted ? "text-[var(--color-text-muted)]" : "text-[var(--color-text-muted)]"
                    )}
                  >
                    {location.address}
                  </p>
                )}
                {location.description && (
                  <p
                    className={clsx(
                      "text-xs mt-1 line-clamp-2",
                      inverted ? "text-[var(--color-text-disabled)]" : "text-[var(--color-text-disabled)]"
                    )}
                  >
                    {location.description}
                  </p>
                )}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function MapView<T>({
  locations,
  center = [40.7128, -74.006], // Default: NYC
  zoom = 10,
  onLocationClick,
  renderMarker: _renderMarker,
  renderPopup: _renderPopup,
  showList = true,
  inverted = true,
  className,
  loading = false,
  emptyMessage = "No locations to display",
  tileProvider: _tileProvider = "openstreetmap",
  height = 500,
}: MapViewProps<T>) {
  const [selectedId, setSelectedId] = useState<string | undefined>();
  const [currentZoom, setCurrentZoom] = useState(zoom);
  const [listVisible, setListVisible] = useState(showList);

  // Calculate center from locations if not provided
  const mapCenter = useMemo<[number, number]>(() => {
    if (locations.length === 0) return center;

    const avgLat = locations.reduce((sum, loc) => sum + loc.latitude, 0) / locations.length;
    const avgLng = locations.reduce((sum, loc) => sum + loc.longitude, 0) / locations.length;

    return [avgLat, avgLng];
  }, [locations, center]);

  const handleLocationClick = (location: MapLocation<T>) => {
    setSelectedId(location.id);
    onLocationClick?.(location);
  };

  if (loading) {
    return (
      <div
        className={clsx(
          "flex items-center justify-center rounded-lg border-2",
          inverted ? "bg-[var(--color-surface-inverse)] border-[var(--color-border-default)]" : "bg-[var(--color-surface-primary)] border-[var(--color-border-default)]",
          className
        )}
        style={{ height }}
      >
        <div
          className={clsx(
            "w-8 h-8 border-3 rounded-full animate-spin",
            inverted ? "border-[var(--color-border-default)] border-t-[var(--color-primary-500)]" : "border-[var(--color-border-default)] border-t-[var(--color-primary-500)]"
          )}
        />
      </div>
    );
  }

  if (locations.length === 0) {
    return (
      <div
        className={clsx(
          "flex items-center justify-center rounded-lg border-2 border-dashed",
          inverted ? "border-[var(--color-border-default)] text-[var(--color-text-disabled)]" : "border-[var(--color-border-default)] text-[var(--color-text-disabled)]",
          className
        )}
        style={{ height }}
      >
        <div className="text-center">
          <MapPin size={32} className="mx-auto mb-2 opacity-50" />
          <p>{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={clsx(mapViewVariants({ inverted, loading }), className)}
      style={{ height }}
    >
      {/* Location list sidebar */}
      {listVisible && (
        <div
          className={clsx(
            "w-72 flex-shrink-0 border-r-2 p-3 overflow-hidden",
            inverted ? "border-[var(--color-border-default)]" : "border-[var(--color-border-default)]"
          )}
        >
          <div className="flex items-center justify-between mb-3">
            <h3
              className={clsx(
                "font-semibold text-sm",
                inverted ? "text-[var(--color-text-primary)]" : "text-[var(--color-text-primary)]"
              )}
            >
              Locations ({locations.length})
            </h3>
          </div>
          <LocationList
            locations={locations}
            selectedId={selectedId}
            onSelect={(loc) => handleLocationClick(loc as MapLocation<T>)}
            inverted={inverted}
          />
        </div>
      )}

      {/* Map area */}
      <div className="flex-1 relative">
        {/* Map controls */}
        <div className="absolute top-3 right-3 z-content-controls flex flex-col gap-1">
          <button
            type="button"
            onClick={() => setCurrentZoom((z) => Math.min(z + 1, 20))}
            className={clsx(
              "p-2 rounded-lg border-2 transition-colors",
              inverted
                ? "bg-[var(--color-surface-elevated)] border-[var(--color-border-default)] text-[var(--color-text-primary)] hover:bg-[var(--color-surface-inverse)]"
                : "bg-[var(--color-surface-primary)] border-[var(--color-border-default)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-muted)]"
            )}
          >
            <ZoomIn size={16} />
          </button>
          <button
            type="button"
            onClick={() => setCurrentZoom((z) => Math.max(z - 1, 1))}
            className={clsx(
              "p-2 rounded-lg border-2 transition-colors",
              inverted
                ? "bg-[var(--color-surface-elevated)] border-[var(--color-border-default)] text-[var(--color-text-primary)] hover:bg-[var(--color-surface-inverse)]"
                : "bg-[var(--color-surface-primary)] border-[var(--color-border-default)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-muted)]"
            )}
          >
            <ZoomOut size={16} />
          </button>
          <button
            type="button"
            onClick={() => setListVisible((v) => !v)}
            className={clsx(
              "p-2 rounded-lg border-2 transition-colors",
              inverted
                ? "bg-[var(--color-surface-elevated)] border-[var(--color-border-default)] text-[var(--color-text-primary)] hover:bg-[var(--color-surface-inverse)]"
                : "bg-[var(--color-surface-primary)] border-[var(--color-border-default)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-muted)]"
            )}
          >
            {listVisible ? <Maximize2 size={16} /> : <List size={16} />}
          </button>
        </div>

        {/* Map */}
        <PlaceholderMap
          locations={locations}
          center={mapCenter}
          zoom={currentZoom}
          inverted={inverted}
          onLocationClick={(loc) => handleLocationClick(loc as MapLocation<T>)}
          selectedId={selectedId}
        />
      </div>
    </div>
  );
}

export default MapView;
