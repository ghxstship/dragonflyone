"use client";

import React, { useState, useMemo, ReactNode } from "react";
import clsx from "clsx";
import { Image as ImageIcon, Grid, LayoutGrid, Maximize2, X } from "lucide-react";
import type { 
  GalleryViewProps, 
  GalleryItem, 
  GalleryLayout, 
  GallerySize 
} from "./GalleryView.types.js";

// =============================================================================
// CONSTANTS
// =============================================================================

const SIZE_COLUMNS: Record<GallerySize, number> = {
  small: 6,
  medium: 4,
  large: 3,
};

const SIZE_HEIGHTS: Record<GallerySize, string> = {
  small: "h-32",
  medium: "h-48",
  large: "h-64",
};

// =============================================================================
// LIGHTBOX COMPONENT
// =============================================================================

interface LightboxProps<T> {
  item: GalleryItem<T>;
  onClose: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
  hasPrevious: boolean;
  hasNext: boolean;
  inverted?: boolean;
}

function Lightbox<T>({
  item,
  onClose,
  onPrevious,
  onNext,
  hasPrevious,
  hasNext,
  inverted: _inverted,
}: LightboxProps<T>) {
  // Handle keyboard navigation
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && hasPrevious) onPrevious?.();
      if (e.key === "ArrowRight" && hasNext) onNext?.();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, onPrevious, onNext, hasPrevious, hasNext]);

  return (
    <div className="fixed inset-0 z-modal flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/90 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Close button */}
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 z-content-controls p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
      >
        <X size={24} />
      </button>

      {/* Navigation */}
      {hasPrevious && (
        <button
          type="button"
          onClick={onPrevious}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-content-controls p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}
      {hasNext && (
        <button
          type="button"
          onClick={onNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-content-controls p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}

      {/* Image */}
      <div className="relative max-w-[90vw] max-h-[90vh]">
        <img
          src={item.imageUrl}
          alt={item.title}
          className="max-w-full max-h-[80vh] object-contain rounded-lg"
        />

        {/* Info */}
        <div
          className={clsx(
            "absolute bottom-0 left-0 right-0 p-4 rounded-b-lg",
            "bg-gradient-to-t from-black/80 to-transparent"
          )}
        >
          <h3 className="text-white font-semibold text-lg">{item.title}</h3>
          {item.description && (
            <p className="text-white/80 text-sm mt-1">{item.description}</p>
          )}
          {item.tags && item.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {item.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded text-xs bg-white/20 text-white"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// GALLERY ITEM COMPONENT
// =============================================================================

interface GalleryItemComponentProps<T> {
  item: GalleryItem<T>;
  size: GallerySize;
  showTitle: boolean;
  showMetadata: boolean;
  inverted: boolean;
  onClick?: () => void;
  renderItem?: (item: GalleryItem<T>) => ReactNode;
}

function GalleryItemComponent<T>({
  item,
  size,
  showTitle,
  showMetadata,
  inverted,
  onClick,
  renderItem,
}: GalleryItemComponentProps<T>) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  if (renderItem) {
    return (
      <div onClick={onClick} className="cursor-pointer">
        {renderItem(item)}
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={clsx(
        "group relative rounded-lg border-2 overflow-hidden cursor-pointer transition-all",
        "hover:shadow-lg hover:-translate-y-0.5",
        inverted
          ? "bg-surface-elevated border-border hover:border-border-primary"
          : "bg-surface-primary border-border hover:border-border-primary"
      )}
    >
      {/* Image container */}
      <div className={clsx("relative overflow-hidden", SIZE_HEIGHTS[size])}>
        {/* Loading skeleton */}
        {!imageLoaded && !imageError && (
          <div
            className={clsx(
              "absolute inset-0 animate-pulse",
              inverted ? "bg-surface-elevated" : "bg-muted"
            )}
          />
        )}

        {/* Image or placeholder */}
        {imageError ? (
          <div
            className={clsx(
              "absolute inset-0 flex items-center justify-center",
              inverted ? "bg-surface-elevated text-text-disabled" : "bg-muted text-text-disabled"
            )}
          >
            <ImageIcon size={32} />
          </div>
        ) : (
          <img
            src={item.thumbnailUrl || item.imageUrl}
            alt={item.title}
            className={clsx(
              "w-full h-full object-cover transition-transform duration-300",
              "group-hover:scale-105",
              !imageLoaded && "opacity-0"
            )}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
          />
        )}

        {/* Hover overlay */}
        <div
          className={clsx(
            "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity",
            "bg-gradient-to-t from-black/60 to-transparent",
            "flex items-end p-3"
          )}
        >
          <Maximize2 size={20} className="text-white" />
        </div>
      </div>

      {/* Info */}
      {(showTitle || showMetadata) && (
        <div className="p-3">
          {showTitle && (
            <h4
              className={clsx(
                "font-semibold text-sm truncate",
                inverted ? "text-text-primary" : "text-text-primary"
              )}
            >
              {item.title}
            </h4>
          )}

          {showMetadata && item.metadata && (
            <div className="mt-1 space-y-0.5">
              {Object.entries(item.metadata).slice(0, 2).map(([key, value]) => (
                <div
                  key={key}
                  className={clsx(
                    "text-xs flex justify-between",
                    inverted ? "text-text-muted" : "text-text-muted"
                  )}
                >
                  <span className="truncate">{key}</span>
                  <span className="font-medium ml-2">{value}</span>
                </div>
              ))}
            </div>
          )}

          {item.tags && item.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {item.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className={clsx(
                    "px-1.5 py-0.5 rounded text-xs",
                    inverted
                      ? "bg-surface-elevated text-text-secondary"
                      : "bg-muted text-text-secondary"
                  )}
                >
                  {tag}
                </span>
              ))}
              {item.tags.length > 3 && (
                <span
                  className={clsx(
                    "px-1.5 py-0.5 rounded text-xs",
                    inverted
                      ? "bg-surface-elevated text-text-muted"
                      : "bg-muted text-text-muted"
                  )}
                >
                  +{item.tags.length - 3}
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

/**
 * GalleryView component - Bold Contemporary Pop Art Adventure
 * 
 * Features:
 * - Multiple layout modes (grid, masonry, list)
 * - Responsive grid with size variants
 * - Lightbox with keyboard navigation
 * - Loading states and empty states
 * - Custom item rendering
 * - Bold hover effects and transitions
 */
export function GalleryView<T>({
  items,
  layout = "grid",
  size = "medium",
  onItemClick,
  renderItem,
  enableLightbox = true,
  showTitles = true,
  showMetadata = false,
  inverted = true,
  className,
  loading = false,
  emptyMessage = "No items to display",
  columns: columnsOverride,
}: GalleryViewProps<T>) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [currentLayout, setCurrentLayout] = useState<GalleryLayout>(layout);
  const [currentSize, setCurrentSize] = useState<GallerySize>(size);

  const columns = columnsOverride || SIZE_COLUMNS[currentSize];

  const gridClasses = useMemo(() => {
    if (currentLayout === "list") {
      return "grid grid-cols-1 gap-4";
    }
    return clsx(
      "grid gap-4",
      columns === 2 && "grid-cols-2",
      columns === 3 && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
      columns === 4 && "grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
      columns === 5 && "grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5",
      columns === 6 && "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
    );
  }, [currentLayout, columns]);

  const handleItemClick = (item: GalleryItem<T>, index: number) => {
    if (enableLightbox) {
      setLightboxIndex(index);
    }
    onItemClick?.(item);
  };

  if (loading) {
    return (
      <div className={clsx(gridClasses, className)}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className={clsx(
              "rounded-lg animate-pulse",
              SIZE_HEIGHTS[currentSize],
              inverted ? "bg-surface-elevated" : "bg-muted"
            )}
          />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div
        className={clsx(
          "flex flex-col items-center justify-center h-64 rounded-lg border-2 border-dashed",
          inverted ? "border-border text-text-muted" : "border-border text-text-muted",
          className
        )}
      >
        <ImageIcon size={32} className="mb-2 opacity-50" />
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Toolbar */}
      <div
        className={clsx(
          "flex items-center justify-between mb-4 pb-3 border-b-2",
          inverted ? "border-border" : "border-border"
        )}
      >
        <span
          className={clsx(
            "text-sm",
            inverted ? "text-text-muted" : "text-text-muted"
          )}
        >
          {items.length} item{items.length !== 1 ? "s" : ""}
        </span>

        <div className="flex items-center gap-2">
          {/* Layout toggle */}
          <div
            className={clsx(
              "flex items-center gap-1 p-1 rounded-lg border",
              inverted ? "border-border bg-surface-elevated" : "border-border bg-muted"
            )}
          >
            <button
              type="button"
              onClick={() => setCurrentLayout("grid")}
              className={clsx(
                "p-1.5 rounded transition-colors",
                currentLayout === "grid"
                  ? inverted
                    ? "bg-surface-inverse text-text-primary"
                    : "bg-surface-primary text-text-primary shadow-sm"
                  : inverted
                  ? "text-text-muted hover:text-text-primary"
                  : "text-text-muted hover:text-text-primary"
              )}
            >
              <Grid size={16} />
            </button>
            <button
              type="button"
              onClick={() => setCurrentLayout("list")}
              className={clsx(
                "p-1.5 rounded transition-colors",
                currentLayout === "list"
                  ? inverted
                    ? "bg-surface-inverse text-text-primary"
                    : "bg-surface-primary text-text-primary shadow-sm"
                  : inverted
                  ? "text-text-muted hover:text-text-primary"
                  : "text-text-muted hover:text-text-primary"
              )}
            >
              <LayoutGrid size={16} />
            </button>
          </div>

          {/* Size toggle */}
          {currentLayout !== "list" && (
            <select
              value={currentSize}
              onChange={(e) => setCurrentSize(e.target.value as GallerySize)}
              className={clsx(
                "px-2 py-1.5 rounded-lg border text-sm",
                inverted
                  ? "bg-surface-elevated border-border text-text-primary"
                  : "bg-surface-primary border-border text-text-primary"
              )}
            >
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
            </select>
          )}
        </div>
      </div>

      {/* Gallery grid */}
      <div className={gridClasses}>
        {items.map((item, index) => (
          <GalleryItemComponent
            key={item.id}
            item={item}
            size={currentLayout === "list" ? "small" : currentSize}
            showTitle={showTitles}
            showMetadata={showMetadata}
            inverted={inverted}
            onClick={() => handleItemClick(item, index)}
            renderItem={renderItem}
          />
        ))}
      </div>

      {/* Lightbox */}
      {enableLightbox && lightboxIndex !== null && items[lightboxIndex] && (
        <Lightbox
          item={items[lightboxIndex]}
          onClose={() => setLightboxIndex(null)}
          onPrevious={lightboxIndex > 0 ? () => setLightboxIndex(lightboxIndex - 1) : undefined}
          onNext={lightboxIndex < items.length - 1 ? () => setLightboxIndex(lightboxIndex + 1) : undefined}
          hasPrevious={lightboxIndex > 0}
          hasNext={lightboxIndex < items.length - 1}
          inverted={inverted}
        />
      )}
    </div>
  );
}

export default GalleryView;
