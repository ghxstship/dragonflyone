"use client";

import React, { useState, useCallback, useMemo, useEffect } from "react";
import clsx from "clsx";
import { Upload, Download, Search, List, LayoutGrid, Columns3, Calendar as CalendarIcon, GanttChart as GanttIcon, Table, Clock, MapPin, Image, Filter, Save, Trash2, ChevronDown, RefreshCw, Settings2, GripVertical, X } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { DataGrid } from "../organisms/data-grid.js";
import { ImportExportDialog, type ExportFormat, type ColumnConfig, type ImportTemplate } from "../organisms/import-export-dialog.js";
import { BulkEditModal } from "../organisms/bulk-edit-modal.js";
import { BulkActionBar, type BulkAction } from "../molecules/bulk-action-bar.js";
import { KanbanBoard, type KanbanColumn as KanbanBoardColumn } from "../organisms/kanban-board.js";
import { Calendar } from "../organisms/calendar.js";
import { GanttChart, type GanttTask } from "../organisms/gantt-chart.js";
import { TimelineView, type TimelineItem } from "../organisms/timeline-view.js";
import { MapView, type MapLocation } from "../organisms/map-view.js";
import { GalleryView, type GalleryItem } from "../organisms/gallery-view.js";
import { Tooltip } from "../atoms/tooltip.js";
import { QrCode, Barcode, Radio, Nfc } from "lucide-react";

// Re-export view types for consumers
export type { GanttTask, TimelineItem, MapLocation, GalleryItem };

// =============================================================================
// SMART VIEW DETECTION
// =============================================================================

type ViewIconType = "list" | "grid" | "kanban" | "calendar" | "gantt" | "table" | "timeline" | "map" | "gallery";

interface ViewConfig {
  id: string;
  label: string;
  icon: ViewIconType;
}

interface SmartViewDetection {
  views: ViewConfig[];
  kanbanGroupBy: string | undefined;
  calendarDateField: string | undefined;
  calendarTitleField: string | undefined;
  ganttStartField: string | undefined;
  ganttEndField: string | undefined;
  ganttProgressField: string | undefined;
  timelineDateField: string | undefined;
  timelineDescriptionField: string | undefined;
  mapLatitudeField: string | undefined;
  mapLongitudeField: string | undefined;
  mapAddressField: string | undefined;
  galleryImageField: string | undefined;
  galleryThumbnailField: string | undefined;
}

/** Patterns to detect status/category fields for Kanban view */
const STATUS_PATTERNS = [
  /^status$/i, /^state$/i, /^stage$/i, /^phase$/i, /^category$/i, /^type$/i, /^priority$/i,
  /^pipeline_stage$/i, /^workflow_status$/i, /^deal_stage$/i, /^project_status$/i,
  /_status$/i, /_stage$/i, /_state$/i,
];

/** Patterns to detect date fields */
const DATE_PATTERNS = [
  /^date$/i, /^created_at$/i, /^updated_at$/i, /^due_date$/i, /^start_date$/i, /^end_date$/i,
  /^event_date$/i, /^scheduled_date$/i, /^deadline$/i, /^timestamp$/i, /_date$/i, /_at$/i,
];

/** Patterns to detect start date fields for Gantt */
const START_DATE_PATTERNS = [
  /^start_date$/i, /^start$/i, /^begin_date$/i, /^from_date$/i, /^scheduled_start$/i, /^planned_start$/i,
];

/** Patterns to detect end date fields for Gantt */
const END_DATE_PATTERNS = [
  /^end_date$/i, /^end$/i, /^finish_date$/i, /^to_date$/i, /^due_date$/i, /^deadline$/i,
  /^scheduled_end$/i, /^planned_end$/i, /^completion_date$/i,
];

/** Patterns to detect progress fields */
const PROGRESS_PATTERNS = [/^progress$/i, /^completion$/i, /^percent_complete$/i, /^percentage$/i];

/** Patterns to detect latitude fields */
const LAT_PATTERNS = [/^latitude$/i, /^lat$/i, /^geo_lat$/i, /^location_lat$/i];

/** Patterns to detect longitude fields */
const LNG_PATTERNS = [/^longitude$/i, /^lng$/i, /^lon$/i, /^geo_lng$/i, /^location_lng$/i];

/** Patterns to detect address fields */
const ADDRESS_PATTERNS = [/^address$/i, /^location$/i, /^venue$/i, /^place$/i, /^street_address$/i];

/** Patterns to detect image fields */
const IMAGE_PATTERNS = [
  /^image$/i, /^image_url$/i, /^photo$/i, /^photo_url$/i, /^thumbnail$/i, /^thumbnail_url$/i,
  /^avatar$/i, /^avatar_url$/i, /^cover$/i, /^cover_url$/i, /^poster$/i, /^media_url$/i,
  /_image$/i, /_photo$/i, /_thumbnail$/i,
];

/** Patterns to detect thumbnail fields */
const THUMBNAIL_PATTERNS = [/^thumbnail$/i, /^thumbnail_url$/i, /^thumb$/i, /^preview$/i, /^preview_url$/i];

/** Patterns to detect title/name fields */
const TITLE_PATTERNS = [/^title$/i, /^name$/i, /^subject$/i, /^heading$/i, /^label$/i, /^display_name$/i];

/** Patterns to detect description fields */
const DESC_PATTERNS = [/^description$/i, /^desc$/i, /^summary$/i, /^notes$/i, /^details$/i, /^content$/i];

function findByPattern(keys: string[], patterns: RegExp[]): string | undefined {
  for (const pattern of patterns) {
    const match = keys.find((key) => pattern.test(key));
    if (match) return match;
  }
  return undefined;
}

function detectSmartViews<T>(columns: ListPageColumn<T>[]): SmartViewDetection {
  const keys = columns.map((c) => c.key);
  const views: ViewConfig[] = [];

  // Always available
  views.push({ id: "list", label: "List", icon: "list" });
  views.push({ id: "grid", label: "Grid", icon: "grid" });
  views.push({ id: "table", label: "Table", icon: "table" });

  // Kanban
  const kanbanGroupBy = findByPattern(keys, STATUS_PATTERNS);
  if (kanbanGroupBy) views.push({ id: "kanban", label: "Board", icon: "kanban" });

  // Calendar
  const calendarDateField = findByPattern(keys, DATE_PATTERNS);
  const calendarTitleField = findByPattern(keys, TITLE_PATTERNS) || keys[0];
  if (calendarDateField) views.push({ id: "calendar", label: "Calendar", icon: "calendar" });

  // Gantt
  const ganttStartField = findByPattern(keys, START_DATE_PATTERNS);
  const ganttEndField = findByPattern(keys, END_DATE_PATTERNS);
  const ganttProgressField = findByPattern(keys, PROGRESS_PATTERNS);
  if (ganttStartField && ganttEndField) views.push({ id: "gantt", label: "Timeline", icon: "gantt" });

  // Timeline
  const timelineDateField = calendarDateField;
  const timelineDescriptionField = findByPattern(keys, DESC_PATTERNS);
  if (timelineDateField) views.push({ id: "timeline", label: "Activity", icon: "timeline" });

  // Map
  const mapLatitudeField = findByPattern(keys, LAT_PATTERNS);
  const mapLongitudeField = findByPattern(keys, LNG_PATTERNS);
  const mapAddressField = findByPattern(keys, ADDRESS_PATTERNS);
  if ((mapLatitudeField && mapLongitudeField) || mapAddressField) {
    views.push({ id: "map", label: "Map", icon: "map" });
  }

  // Gallery
  const galleryImageField = findByPattern(keys, IMAGE_PATTERNS);
  const galleryThumbnailField = findByPattern(keys, THUMBNAIL_PATTERNS);
  if (galleryImageField) views.push({ id: "gallery", label: "Gallery", icon: "gallery" });

  return {
    views,
    kanbanGroupBy,
    calendarDateField,
    calendarTitleField,
    ganttStartField,
    ganttEndField,
    ganttProgressField,
    timelineDateField,
    timelineDescriptionField,
    mapLatitudeField,
    mapLongitudeField,
    mapAddressField,
    galleryImageField,
    galleryThumbnailField,
  };
}

/** Status variant for badge colors */
export type StatusVariant = 'success' | 'warning' | 'error' | 'info' | 'ghost' | 'outline';

export interface ListPageColumn<T> {
  key: string;
  label: string;
  /** Field accessor - keyof T, string key, or function (compatible with entity registry) */
  accessor: keyof T | string | ((row: T) => React.ReactNode) | ((row: T) => unknown);
  /** Optional computed value for display/sort */
  formula?: (row: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
  minWidth?: string;
  /** Maximum width (for entity registry compatibility) */
  maxWidth?: string;
  align?: "left" | "center" | "right";
  render?: (value: unknown, row: T) => React.ReactNode;
  hidden?: boolean;
  /** Whether column can be hidden by user (for entity registry compatibility) */
  hideable?: boolean;
  /** Column group for organization (for entity registry compatibility) */
  group?: string;
  /** Cell class name (for entity registry compatibility) */
  className?: string;
  /** Header class name (for entity registry compatibility) */
  headerClassName?: string;
  /** Enable inline editing for this column */
  editable?: boolean;
  /** Editor type for inline editing */
  editorType?: "text" | "number" | "select" | "date" | "checkbox" | "linked-record";
  /** Options for select editor */
  editorOptions?: { value: string; label: string }[];
  /** Options for linked-record selector */
  linkedOptions?: { value: string; label: string; subtitle?: string }[];
  /** Validation function - return error message or null */
  validate?: (value: unknown, row: T) => string | null;
  /** Data type for automatic formatting (SSOT) - includes avatar/link for entity registry */
  dataType?: 'string' | 'number' | 'currency' | 'date' | 'datetime' | 'boolean' | 'status' | 'badge' | 'avatar' | 'link';
  /** Format options for dataType */
  formatOptions?: {
    currency?: string;
    dateFormat?: string;
    locale?: string;
    precision?: number;
    prefix?: string;
    suffix?: string;
  };
  /** Status color mapping for status/badge dataType (SSOT) */
  statusColors?: Record<string, StatusVariant>;
}

export interface ListPageFilter {
  key: string;
  label: string;
  /** Filter type (for entity registry compatibility) */
  type?: 'select' | 'multiselect' | 'text' | 'number' | 'date' | 'daterange' | 'boolean';
  /** Filter options - compatible with entity registry FilterOption */
  options?: { value: string; label: string; count?: number; icon?: string; color?: string; disabled?: boolean }[];
  /** Dynamic options loader (for entity registry compatibility) */
  optionsLoader?: () => Promise<{ value: string; label: string }[]>;
  /** Placeholder text (for entity registry compatibility) */
  placeholder?: string;
  /** Default value (for entity registry compatibility) */
  defaultValue?: unknown;
  /** Whether filter is hidden by default (for entity registry compatibility) */
  hidden?: boolean;
  /** Filter group for organization (for entity registry compatibility) */
  group?: string;
  /** Icon for the filter (for entity registry compatibility) */
  icon?: string;
  multiple?: boolean;
}

export interface ListPageAction<T> {
  id: string;
  label: string;
  icon?: React.ReactNode;
  variant?: "default" | "danger";
  onClick: (row: T) => void;
  disabled?: boolean | ((row: T) => boolean);
  hidden?: boolean | ((row: T) => boolean);
}

export interface ListPageBulkAction {
  id: string;
  label: string;
  icon?: React.ReactNode;
  variant?: "default" | "danger";
  disabled?: boolean;
}

// =============================================================================
// SAVED FILTERS DROPDOWN COMPONENT
// =============================================================================

interface SavedFilterPreset {
  id: string;
  name: string;
  filters: Record<string, string | string[]>;
  isDefault?: boolean;
}

interface SavedFiltersDropdownProps {
  presets: SavedFilterPreset[];
  activeFilters: Record<string, string | string[]>;
  onSelect?: (preset: SavedFilterPreset) => void;
  onSave?: (name: string, filters: Record<string, string | string[]>) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  inverted?: boolean;
}

function SavedFiltersDropdown({
  presets,
  activeFilters,
  onSelect,
  onSave,
  onDelete,
  inverted = true,
}: SavedFiltersDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showSaveInput, setShowSaveInput] = useState(false);
  const [newPresetName, setNewPresetName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowSaveInput(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSave = async () => {
    if (!newPresetName.trim() || !onSave) return;
    setIsSaving(true);
    try {
      await onSave(newPresetName.trim(), activeFilters);
      setNewPresetName("");
      setShowSaveInput(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onDelete) return;
    await onDelete(id);
  };

  const hasActiveFilters = Object.keys(activeFilters).length > 0;

  const buttonClass = inverted
    ? "bg-transparent text-text-muted border-2 border-border hover:border-border-primary transition-all duration-100 rounded-[var(--radius-button)]"
    : "bg-transparent text-text-disabled border-2 border-border hover:border-border-primary transition-all duration-100 rounded-[var(--radius-button)]";

  const dropdownClass = inverted
    ? "bg-surface-elevated border-2 border-border shadow-lg"
    : "bg-surface-primary border-2 border-border shadow-lg";

  return (
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={clsx("px-spacing-4 py-spacing-3 font-code text-mono-sm cursor-pointer flex items-center gap-gap-xs", buttonClass)}
      >
        <Filter className="size-4" />
        Saved Filters
        <ChevronDown className={clsx("size-3 transition-transform", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className={clsx("absolute top-full left-0 mt-1 min-w-[200px] z-dropdown rounded-lg overflow-hidden", dropdownClass)}>
          {/* Preset List */}
          {presets.length > 0 ? (
            <div className="max-h-[200px] overflow-y-auto">
              {presets.map((preset) => (
                <div
                  key={preset.id}
                  onClick={() => {
                    onSelect?.(preset);
                    setIsOpen(false);
                  }}
                  className={clsx(
                    "px-spacing-4 py-spacing-3 cursor-pointer flex items-center justify-between group",
                    inverted ? "hover:bg-surface-inverse" : "hover:bg-muted"
                  )}
                >
                  <span className="font-body text-body-sm">{preset.name}</span>
                  {onDelete && (
                    <button
                      type="button"
                      onClick={(e) => handleDelete(preset.id, e)}
                      className={clsx(
                        "opacity-0 group-hover:opacity-100 p-1 rounded transition-opacity",
                        inverted ? "hover:bg-surface-elevated text-text-disabled" : "hover:bg-muted text-text-muted"
                      )}
                    >
                      <Trash2 className="size-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className={clsx("px-spacing-4 py-spacing-3 text-center", inverted ? "text-text-disabled" : "text-text-muted")}>
              <span className="font-body text-body-sm">No saved filters</span>
            </div>
          )}

          {/* Divider */}
          {onSave && (
            <>
              <div className={clsx("border-t", inverted ? "border-border" : "border-border")} />

              {/* Save New Filter */}
              {showSaveInput ? (
                <div className="p-spacing-3 flex gap-gap-xs">
                  <input
                    type="text"
                    value={newPresetName}
                    onChange={(e) => setNewPresetName(e.target.value)}
                    placeholder="Filter name..."
                    className={clsx(
                      "flex-1 px-spacing-2 py-spacing-1 font-body text-body-sm border rounded outline-none",
                      inverted
                        ? "bg-surface-elevated text-text-primary border-border focus:border-border-primary"
                        : "bg-surface-primary text-text-primary border-border focus:border-border-primary"
                    )}
                    onKeyDown={(e) => e.key === "Enter" && handleSave()}
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={!newPresetName.trim() || isSaving}
                    className={clsx(
                      "px-spacing-2 py-spacing-1 rounded font-code text-mono-xs",
                      inverted
                        ? "bg-surface-primary text-text-primary hover:bg-muted disabled:opacity-50"
                        : "bg-surface-inverse text-text-primary hover:bg-surface-elevated disabled:opacity-50"
                    )}
                  >
                    {isSaving ? "..." : "Save"}
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowSaveInput(true)}
                  disabled={!hasActiveFilters}
                  className={clsx(
                    "w-full px-spacing-4 py-spacing-3 font-code text-mono-sm flex items-center gap-gap-xs",
                    hasActiveFilters
                      ? inverted
                        ? "hover:bg-surface-elevated text-text-primary"
                        : "hover:bg-muted text-text-primary"
                      : inverted
                        ? "text-text-disabled cursor-not-allowed"
                        : "text-text-muted cursor-not-allowed"
                  )}
                >
                  <Save className="size-4" />
                  Save Current Filters
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

// =============================================================================
// TABLE SETTINGS POPOVER COMPONENT
// =============================================================================

type DensityMode = "compact" | "default" | "relaxed";

interface SortableColumnItemProps {
  column: { key: string; label: string };
  isVisible: boolean;
  onToggle: (key: string) => void;
  inverted: boolean;
}

function SortableColumnItem({ column, isVisible, onToggle, inverted }: SortableColumnItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: column.key });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={clsx(
        "flex items-center gap-2 px-3 py-2 rounded-button",
        inverted ? "hover:bg-surface-elevated" : "hover:bg-muted",
        isDragging && "z-50"
      )}
    >
      <button
        type="button"
        className={clsx(
          "cursor-grab p-0.5 rounded",
          inverted ? "text-text-disabled hover:text-text-muted" : "text-text-muted hover:text-text-primary"
        )}
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-4" />
      </button>
      <label className="flex items-center gap-2 flex-1 cursor-pointer">
        <input
          type="checkbox"
          checked={isVisible}
          onChange={() => onToggle(column.key)}
          className="cursor-pointer accent-primary"
        />
        <span className={clsx("font-body text-body-sm", inverted ? "text-white" : "text-text-primary")}>
          {column.label}
        </span>
      </label>
    </div>
  );
}

interface TableSettingsPopoverProps<T> {
  columns: ListPageColumn<T>[];
  hiddenColumns: string[];
  onHiddenColumnsChange?: (hiddenColumns: string[]) => void;
  columnOrder?: string[];
  onColumnOrderChange?: (columnOrder: string[]) => void;
  density: DensityMode;
  onDensityChange?: (density: DensityMode) => void;
  inverted: boolean;
}

function TableSettingsPopover<T>({
  columns,
  hiddenColumns,
  onHiddenColumnsChange,
  columnOrder,
  onColumnOrderChange,
  density,
  onDensityChange,
  inverted,
}: TableSettingsPopoverProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = React.useRef<HTMLDivElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const orderedColumns = useMemo(() => {
    if (!columnOrder || columnOrder.length === 0) {
      return columns.map(c => ({ key: c.key, label: c.label }));
    }
    const ordered: { key: string; label: string }[] = [];
    columnOrder.forEach(key => {
      const col = columns.find(c => c.key === key);
      if (col) ordered.push({ key: col.key, label: col.label });
    });
    columns.forEach(col => {
      if (!columnOrder.includes(col.key)) {
        ordered.push({ key: col.key, label: col.label });
      }
    });
    return ordered;
  }, [columns, columnOrder]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id && onColumnOrderChange) {
      const oldIndex = orderedColumns.findIndex((c) => c.key === active.id);
      const newIndex = orderedColumns.findIndex((c) => c.key === over.id);
      const newOrder = arrayMove(orderedColumns, oldIndex, newIndex).map(c => c.key);
      onColumnOrderChange(newOrder);
    }
  };

  const handleToggleColumn = (key: string) => {
    if (!onHiddenColumnsChange) return;
    if (hiddenColumns.includes(key)) {
      onHiddenColumnsChange(hiddenColumns.filter(k => k !== key));
    } else {
      onHiddenColumnsChange([...hiddenColumns, key]);
    }
  };

  const handleResetColumns = () => {
    onHiddenColumnsChange?.([]);
    if (onColumnOrderChange) {
      onColumnOrderChange(columns.map(c => c.key));
    }
  };

  const buttonClass = inverted
    ? "p-2 border-2 border-border text-text-muted hover:border-border-primary hover:text-text-primary rounded-button transition-all duration-100"
    : "p-2 border-2 border-border text-text-muted hover:border-border-primary hover:text-text-primary rounded-button transition-all duration-100";

  const dropdownClass = inverted
    ? "bg-surface-elevated border-2 border-border"
    : "bg-surface-primary border-2 border-border";

  return (
    <div ref={popoverRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={buttonClass}
        aria-label="Table settings"
        aria-expanded={isOpen}
      >
        <Settings2 className="size-4" />
      </button>
      {isOpen && (
        <div
          className={clsx(
            "absolute right-0 top-full mt-2 w-72 rounded-card shadow-lg z-dropdown",
            dropdownClass
          )}
          role="dialog"
          aria-label="Table settings"
        >
          <div className={clsx("px-4 py-3 border-b", inverted ? "border-border" : "border-border")}>
            <div className="flex items-center justify-between">
              <span className={clsx("font-heading text-body-md font-semibold", inverted ? "text-white" : "text-text-primary")}>
                Table Settings
              </span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className={clsx(
                  "p-1 rounded-button",
                  inverted ? "hover:bg-surface-elevated text-text-muted" : "hover:bg-muted text-text-muted"
                )}
              >
                <X className="size-4" />
              </button>
            </div>
          </div>

          {onDensityChange && (
            <div className={clsx("px-4 py-3 border-b", inverted ? "border-border" : "border-border")}>
              <span className={clsx("font-code text-mono-xs uppercase tracking-wider", inverted ? "text-text-disabled" : "text-text-muted")}>
                Row Density
              </span>
              <div className="flex gap-2 mt-2">
                {(["compact", "default", "relaxed"] as DensityMode[]).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => onDensityChange(mode)}
                    className={clsx(
                      "flex-1 px-3 py-2 rounded-button border-2 font-code text-mono-sm capitalize transition-all",
                      density === mode
                        ? inverted
                          ? "border-white bg-white text-black"
                          : "border-black bg-black text-white"
                        : inverted
                          ? "border-border text-text-muted hover:border-border-primary"
                          : "border-border text-text-muted hover:border-border-primary"
                    )}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>
          )}

          {(onHiddenColumnsChange || onColumnOrderChange) && (
            <div className="px-4 py-3">
              <div className="flex items-center justify-between mb-2">
                <span className={clsx("font-code text-mono-xs uppercase tracking-wider", inverted ? "text-text-disabled" : "text-text-muted")}>
                  Columns
                </span>
                <button
                  type="button"
                  onClick={handleResetColumns}
                  className={clsx(
                    "font-code text-mono-xs underline",
                    inverted ? "text-text-muted hover:text-white" : "text-text-muted hover:text-text-primary"
                  )}
                >
                  Reset
                </button>
              </div>
              <div className="max-h-64 overflow-y-auto -mx-1">
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={orderedColumns.map((c) => c.key)}
                    strategy={verticalListSortingStrategy}
                  >
                    {orderedColumns.map((column) => (
                      <SortableColumnItem
                        key={column.key}
                        column={column}
                        isVisible={!hiddenColumns.includes(column.key)}
                        onToggle={handleToggleColumn}
                        inverted={inverted}
                      />
                    ))}
                  </SortableContext>
                </DndContext>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export interface ListPageProps<T> {
  /** Page title */
  title: string;
  /** Page subtitle/description */
  subtitle?: string;
  /** Data array */
  data: T[];
  /** Column definitions */
  columns: ListPageColumn<T>[];
  /** Row key accessor */
  rowKey: keyof T | ((row: T) => string);
  /** Loading state */
  loading?: boolean;
  /** Error state */
  error?: Error | null;
  /** Retry handler */
  onRetry?: () => void;
  /** Search placeholder */
  searchPlaceholder?: string;
  /** Filter definitions */
  filters?: ListPageFilter[];
  /** Row actions */
  rowActions?: ListPageAction<T>[];
  /** Bulk actions */
  bulkActions?: ListPageBulkAction[];
  /** Bulk action handler */
  onBulkAction?: (actionId: string, selectedIds: string[]) => void;
  /** Row click handler */
  onRowClick?: (row: T) => void;
  /** Create button label */
  createLabel?: string;
  /** Create handler */
  onCreate?: () => void;
  /** Entity type for import/export and saved filters (e.g., "crew", "assets") */
  entityType?: string;
  /** Saved filter presets */
  savedFilterPresets?: Array<{ id: string; name: string; filters: Record<string, string | string[]>; isDefault?: boolean }>;
  /** Handler when a saved filter preset is selected */
  onSavedFilterSelect?: (preset: { id: string; name: string; filters: Record<string, string | string[]> }) => void;
  /** Handler to save current filters as a preset */
  onSaveFilterPreset?: (name: string, filters: Record<string, string | string[]>) => Promise<void>;
  /** Handler to delete a saved filter preset */
  onDeleteFilterPreset?: (id: string) => Promise<void>;
  /** Import handler - receives file and field mapping */
  onImport?: (file: File, mapping: Record<string, string>) => Promise<void>;
  /** Import templates for field mapping */
  importTemplates?: ImportTemplate[];
  /** Sample fields for import template download */
  importSampleFields?: string[];
  /** URL to download a pre-formatted import template file */
  templateDownloadUrl?: string;
  /** Export handler - receives format and selected columns */
  onExport?: (format: ExportFormat, selectedColumns: string[]) => Promise<void>;
  /** Available export formats */
  exportFormats?: ExportFormat[];
  /** Stats to display */
  stats?: Array<{ label: string; value: string | number }>;
  /** Empty state message */
  emptyMessage?: string;
  /** Empty state action */
  emptyAction?: { label: string; onClick: () => void };
  /** Header content (navigation, etc.) */
  header?: React.ReactNode;
  /** Inverted theme (dark background) - defaults to true for dark-first design */
  inverted?: boolean;
  /** Custom className */
  className?: string;
  
  // =========================================================================
  // ENTERPRISE LAYOUT PROPS (ClickUp-style)
  // =========================================================================
  
  /** Breadcrumb navigation */
  breadcrumbs?: Array<{ label: string; href?: string }>;
  /** Tab navigation */
  tabs?: Array<{ id: string; label: string; count?: number }>;
  /** Active tab ID */
  activeTab?: string;
  /** Tab change handler */
  onTabChange?: (tabId: string) => void;
  /** View options (list, grid, kanban, etc.) */
  views?: Array<{ id: string; label: string; icon: "list" | "grid" | "kanban" | "calendar" | "gantt" | "table" | "timeline" | "map" | "gallery" }>;
  /** Active view ID */
  activeView?: string;
  /** View change handler */
  onViewChange?: (viewId: string) => void;
  /** Show favorite toggle */
  showFavorite?: boolean;
  /** Is favorited */
  isFavorited?: boolean;
  /** Favorite toggle handler */
  onFavoriteToggle?: () => void;
  /** Show settings button */
  showSettings?: boolean;
  /** Settings handler */
  onSettings?: () => void;
  /** Use enterprise header layout */
  useEnterpriseHeader?: boolean;
  /** Pagination config */
  pagination?: { page: number; pageSize: number; total: number };
  /** Page change handler */
  onPageChange?: (page: number) => void;
  /** Enable striped rows */
  striped?: boolean;
  /** Compact mode */
  compact?: boolean;
  /** Enable column visibility toggle */
  columnVisibility?: boolean;
  /** Quick action buttons displayed in header */
  quickActions?: Array<{ id: string; label: string; icon?: React.ReactNode; onClick: () => void }>;
  /** Enable inline editing (double-click to edit cells marked as editable) */
  inlineEditing?: boolean;
  /** Called when a cell is edited inline */
  onCellEdit?: (row: T, columnKey: string, newValue: unknown) => Promise<void>;
  /** Bulk edit fields configuration */
  bulkEditFields?: Array<{
    key: string;
    label: string;
    type: "text" | "number" | "select" | "date" | "checkbox";
    options?: { value: string; label: string }[];
    placeholder?: string;
  }>;
  /** Bulk edit submit handler */
  onBulkEdit?: (updates: Record<string, unknown>, selectedIds: string[]) => Promise<void>;
  
  // =========================================================================
  // ENHANCED TOOLBAR PROPS
  // =========================================================================
  
  /** Refresh data handler */
  onRefresh?: () => void;
  /** Whether data is currently refreshing */
  isRefreshing?: boolean;
  /** Row density mode */
  density?: "compact" | "default" | "relaxed";
  /** Density change handler */
  onDensityChange?: (density: "compact" | "default" | "relaxed") => void;
  /** Column order (array of column keys in display order) */
  columnOrder?: string[];
  /** Column order change handler */
  onColumnOrderChange?: (columnOrder: string[]) => void;
  /** Hidden columns (array of column keys to hide) */
  hiddenColumns?: string[];
  /** Hidden columns change handler */
  onHiddenColumnsChange?: (hiddenColumns: string[]) => void;
  
  // =========================================================================
  // CAPABILITY DETECTION PROPS
  // =========================================================================
  
  /** Enable automatic capability detection for toolbar actions */
  enableCapabilityDetection?: boolean;
  /** Handler for scan actions detected from capabilities */
  onScanAction?: (capability: string, route: string) => void;
  /** Base path for capability-generated routes */
  capabilityBasePath?: string;
}

export function ListPage<T>({
  title,
  subtitle,
  data,
  columns,
  rowKey,
  loading = false,
  error,
  onRetry,
  searchPlaceholder = "Search...",
  filters = [],
  rowActions = [],
  bulkActions = [],
  onBulkAction,
  onRowClick,
  createLabel = "Create New",
  onCreate,
  entityType,
  savedFilterPresets = [],
  onSavedFilterSelect,
  onSaveFilterPreset,
  onDeleteFilterPreset,
  onImport,
  importTemplates = [],
  importSampleFields = [],
  templateDownloadUrl,
  onExport,
  exportFormats = ["csv", "json", "excel"],
  stats = [],
  emptyMessage = "No records found",
  emptyAction,
  header,
  inverted = true,
  className = "",
  pagination,
  onPageChange,
  striped = false,
  compact = false,
  columnVisibility = false,
  quickActions = [],
  // Inline editing props
  inlineEditing = false,
  onCellEdit,
  // Bulk edit props
  bulkEditFields,
  onBulkEdit,
  // View toggle props
  views = [],
  activeView = "list",
  onViewChange,
  // Enhanced toolbar props
  onRefresh,
  isRefreshing = false,
  density = "default",
  onDensityChange,
  columnOrder,
  onColumnOrderChange,
  hiddenColumns: hiddenColumnsProp,
  onHiddenColumnsChange,
  // Kanban-specific props
  kanbanGroupBy,
  kanbanColumns,
  kanbanCardRender,
  onKanbanDragEnd,
  // Calendar-specific props
  calendarDateField,
  calendarTitleField,
  onCalendarEventClick,
  // Gantt-specific props
  ganttStartField,
  ganttEndField,
  ganttProgressField,
  onGanttTaskClick,
  // Timeline-specific props
  timelineDateField,
  timelineDescriptionField,
  onTimelineItemClick,
  // Map-specific props
  mapLatitudeField,
  mapLongitudeField,
  mapAddressField,
  onMapLocationClick,
  // Gallery-specific props
  galleryImageField,
  galleryThumbnailField,
  onGalleryItemClick,
  // Capability detection props
  enableCapabilityDetection = false,
  onScanAction,
  capabilityBasePath = '',
}: ListPageProps<T> & {
  kanbanGroupBy?: keyof T;
  kanbanColumns?: KanbanBoardColumn[];
  kanbanCardRender?: (item: T) => React.ReactNode;
  onKanbanDragEnd?: (item: T, newColumnId: string, newIndex: number) => void;
  calendarDateField?: keyof T;
  calendarTitleField?: keyof T;
  onCalendarEventClick?: (item: T) => void;
  ganttStartField?: keyof T;
  ganttEndField?: keyof T;
  ganttProgressField?: keyof T;
  onGanttTaskClick?: (item: T) => void;
  timelineDateField?: keyof T;
  timelineDescriptionField?: keyof T;
  onTimelineItemClick?: (item: T) => void;
  mapLatitudeField?: keyof T;
  mapLongitudeField?: keyof T;
  mapAddressField?: keyof T;
  onMapLocationClick?: (item: T) => void;
  galleryImageField?: keyof T;
  galleryThumbnailField?: keyof T;
  onGalleryItemClick?: (item: T) => void;
}) {
  const [searchValue, setSearchValue] = useState("");
  const [activeFilters, setActiveFilters] = useState<Record<string, string | string[]>>({});
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc" | null>(null);
  const [internalActiveView, setInternalActiveView] = useState(activeView);
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  // Keyboard shortcuts: Cmd+K (search), R (refresh), Cmd+N (create new)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Cmd/Ctrl + K: Focus search
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        searchInputRef.current?.focus();
      }
      // R: Refresh (only when not in input/textarea)
      if (event.key === "r" && !event.metaKey && !event.ctrlKey && !event.shiftKey) {
        const target = event.target as HTMLElement;
        if (target.tagName !== "INPUT" && target.tagName !== "TEXTAREA" && !target.isContentEditable) {
          event.preventDefault();
          onRefresh?.();
        }
      }
      // Cmd/Ctrl + N: Create new
      if ((event.metaKey || event.ctrlKey) && event.key === "n") {
        event.preventDefault();
        onCreate?.();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onRefresh, onCreate]);
  
  // Smart view detection - auto-detect available views from column definitions
  const smartViews = useMemo(() => detectSmartViews(columns), [columns]);
  
  // Use provided views if available, otherwise use smart-detected views
  const effectiveViews = views.length > 0 ? views : smartViews.views;
  
  // Capability detection - auto-detect scan actions from column definitions
  // Uses pattern matching similar to smart view detection
  const capabilityScanActions = useMemo(() => {
    if (!enableCapabilityDetection || !onScanAction) return [];
    
    const keys = columns.map(c => c.key);
    const actions: Array<{ id: string; label: string; icon: React.ReactNode; onClick: () => void }> = [];
    const effectiveEntityType = entityType || title.toLowerCase().replace(/\s+/g, '-');
    
    // QR Code patterns
    const qrPatterns = [/^qr_code$/i, /^qrcode$/i, /qr_id$/i, /^qr$/i];
    const hasQr = keys.some(k => qrPatterns.some(p => p.test(k)));
    if (hasQr) {
      actions.push({
        id: 'scannable-qr',
        label: 'Scan QR',
        icon: <QrCode className="size-4" />,
        onClick: () => onScanAction('scannable:qr', `${capabilityBasePath}/${effectiveEntityType}/scan?mode=qr`),
      });
    }
    
    // Barcode patterns
    const barcodePatterns = [/^barcode$/i, /^upc$/i, /^sku$/i, /^ean$/i, /serial_number/i, /asset_tag/i, /^tag$/i, /badge_id/i, /badge_number/i];
    const hasBarcode = keys.some(k => barcodePatterns.some(p => p.test(k)));
    if (hasBarcode) {
      actions.push({
        id: 'scannable-barcode',
        label: 'Scan Barcode',
        icon: <Barcode className="size-4" />,
        onClick: () => onScanAction('scannable:barcode', `${capabilityBasePath}/${effectiveEntityType}/scan?mode=barcode`),
      });
    }
    
    // RFID patterns
    const rfidPatterns = [/^rfid$/i, /rfid_tag/i, /rfid_id/i, /^rfid_code$/i];
    const hasRfid = keys.some(k => rfidPatterns.some(p => p.test(k)));
    if (hasRfid) {
      actions.push({
        id: 'scannable-rfid',
        label: 'Scan RFID',
        icon: <Radio className="size-4" />,
        onClick: () => onScanAction('scannable:rfid', `${capabilityBasePath}/${effectiveEntityType}/scan?mode=rfid`),
      });
    }
    
    // NFC patterns
    const nfcPatterns = [/^nfc$/i, /^nfc_id$/i, /nfc_tag/i, /^nfc_code$/i];
    const hasNfc = keys.some(k => nfcPatterns.some(p => p.test(k)));
    if (hasNfc) {
      actions.push({
        id: 'scannable-nfc',
        label: 'Scan NFC',
        icon: <Nfc className="size-4" />,
        onClick: () => onScanAction('scannable:nfc', `${capabilityBasePath}/${effectiveEntityType}/scan?mode=nfc`),
      });
    }
    
    return actions;
  }, [enableCapabilityDetection, onScanAction, columns, entityType, title, capabilityBasePath]);
  
  // Merge user-provided quick actions with capability-detected scan actions
  const effectiveQuickActions = useMemo(() => {
    // Filter out capability scan actions that user has already provided
    const userActionIds = new Set(quickActions.map(a => a.id));
    const newScanActions = capabilityScanActions.filter(a => !userActionIds.has(a.id));
    return [...quickActions, ...newScanActions];
  }, [quickActions, capabilityScanActions]);
  
  // Use provided field mappings if available, otherwise use smart-detected fields
  const effectiveKanbanGroupBy = kanbanGroupBy || (smartViews.kanbanGroupBy as keyof T | undefined);
  const effectiveCalendarDateField = calendarDateField || (smartViews.calendarDateField as keyof T | undefined);
  const effectiveCalendarTitleField = calendarTitleField || (smartViews.calendarTitleField as keyof T | undefined);
  const effectiveGanttStartField = ganttStartField || (smartViews.ganttStartField as keyof T | undefined);
  const effectiveGanttEndField = ganttEndField || (smartViews.ganttEndField as keyof T | undefined);
  const effectiveGanttProgressField = ganttProgressField || (smartViews.ganttProgressField as keyof T | undefined);
  const effectiveTimelineDateField = timelineDateField || (smartViews.timelineDateField as keyof T | undefined);
  const effectiveTimelineDescriptionField = timelineDescriptionField || (smartViews.timelineDescriptionField as keyof T | undefined);
  const effectiveMapLatitudeField = mapLatitudeField || (smartViews.mapLatitudeField as keyof T | undefined);
  const effectiveMapLongitudeField = mapLongitudeField || (smartViews.mapLongitudeField as keyof T | undefined);
  const effectiveMapAddressField = mapAddressField || (smartViews.mapAddressField as keyof T | undefined);
  const effectiveGalleryImageField = galleryImageField || (smartViews.galleryImageField as keyof T | undefined);
  const effectiveGalleryThumbnailField = galleryThumbnailField || (smartViews.galleryThumbnailField as keyof T | undefined);
  
  // Handle view change - use provided handler or internal state
  const handleViewChange = useCallback((viewId: string) => {
    if (onViewChange) {
      onViewChange(viewId);
    } else {
      setInternalActiveView(viewId);
    }
  }, [onViewChange]);
  
  // Determine current active view
  const currentActiveView = onViewChange ? activeView : internalActiveView;
  
  // Import/Export dialog state
  const [importExportMode, setImportExportMode] = useState<"import" | "export" | null>(null);
  const [importExportLoading, setImportExportLoading] = useState(false);
  
  // Bulk edit modal state
  const [bulkEditOpen, setBulkEditOpen] = useState(false);

  // Convert columns to ColumnConfig for export dialog
  const exportColumns: ColumnConfig[] = useMemo(() => 
    columns.map(col => ({
      key: col.key,
      label: col.label,
      selected: !col.hidden,
    })), [columns]);

  // Handle import with loading state
  const handleImport = useCallback(async (file: File, mapping: Record<string, string>) => {
    if (!onImport) return;
    setImportExportLoading(true);
    try {
      await onImport(file, mapping);
      setImportExportMode(null);
    } finally {
      setImportExportLoading(false);
    }
  }, [onImport]);

  // Handle export with loading state
  const handleExport = useCallback(async (format: ExportFormat, selectedCols: string[]) => {
    if (!onExport) return;
    setImportExportLoading(true);
    try {
      await onExport(format, selectedCols);
      setImportExportMode(null);
    } finally {
      setImportExportLoading(false);
    }
  }, [onExport]);

  // getRowKey is now handled internally by DataGrid
  const _getRowKey = useCallback((row: T): string => {
    if (typeof rowKey === "function") return rowKey(row);
    return String(row[rowKey]);
  }, [rowKey]);

  // Convert ListPage columns to DataGrid columns
  const dataGridColumns = useMemo(() => columns.map(col => ({
    key: col.key,
    label: col.label,
    accessor: col.accessor,
    formula: col.formula,
    sortable: col.sortable,
    width: col.width,
    minWidth: col.minWidth,
    align: col.align,
    render: col.render,
    hidden: col.hidden,
    editable: col.editable,
    editorType: col.editorType,
    editorOptions: col.editorOptions,
    linkedOptions: col.linkedOptions,
    validate: col.validate,
  })), [columns]);

  // Convert ListPage bulk actions to DataGrid format
  const dataGridBulkActions = useMemo(() => bulkActions.map(action => ({
    id: action.id,
    label: action.label,
    icon: action.icon,
    variant: action.variant,
    disabled: action.disabled,
  })), [bulkActions]);

  // Convert ListPage row actions to DataGrid format
  const dataGridRowActions = useMemo(() => rowActions.map(action => ({
    id: action.id,
    label: action.label,
    icon: action.icon,
    variant: action.variant,
    disabled: action.disabled,
    hidden: action.hidden,
  })), [rowActions]);

  // Handle row action - bridge to ListPage onClick pattern
  const handleRowAction = useCallback((actionId: string, row: T) => {
    const action = rowActions.find(a => a.id === actionId);
    if (action) {
      action.onClick(row);
    }
  }, [rowActions]);

  // Filter and search data
  const filteredData = React.useMemo(() => {
    let result = [...data];

    // Apply search
    if (searchValue) {
      const searchLower = searchValue.toLowerCase();
      result = result.filter(row => {
        return columns.some(col => {
          const value = typeof col.accessor === "function" 
            ? col.accessor(row) 
            : (row as Record<string, unknown>)[col.accessor as string];
          return String(value || "").toLowerCase().includes(searchLower);
        });
      });
    }

    // Apply filters
    Object.entries(activeFilters).forEach(([key, value]) => {
      if (!value || (Array.isArray(value) && value.length === 0)) return;
      result = result.filter(row => {
        const rowValue = (row as Record<string, unknown>)[key];
        if (Array.isArray(value)) {
          return value.includes(String(rowValue));
        }
        return String(rowValue) === value;
      });
    });

    // Apply sorting
    if (sortColumn && sortDirection) {
      const col = columns.find(c => c.key === sortColumn);
      if (col) {
        result.sort((a, b) => {
          const aVal = typeof col.accessor === "function" ? col.accessor(a) : (a as Record<string, unknown>)[col.accessor as string];
          const bVal = typeof col.accessor === "function" ? col.accessor(b) : (b as Record<string, unknown>)[col.accessor as string];
          if (aVal === bVal) return 0;
          if (aVal === null || aVal === undefined) return 1;
          if (bVal === null || bVal === undefined) return -1;
          const cmp = aVal < bVal ? -1 : 1;
          return sortDirection === "asc" ? cmp : -cmp;
        });
      }
    }

    return result;
  }, [data, searchValue, activeFilters, sortColumn, sortDirection, columns]);

  // Note: handleSort, handleSelectAll, handleSelectRow are now handled by DataGrid internally

  const handleFilterChange = (key: string, value: string) => {
    setActiveFilters(prev => ({ ...prev, [key]: value === "All" ? "" : value }));
  };

  const clearFilters = () => {
    setActiveFilters({});
    setSearchValue("");
  };

  const activeFilterCount = Object.values(activeFilters).filter(v => v && (Array.isArray(v) ? v.length > 0 : true)).length;

  // Theme-aware classes - Bold Contemporary Pop Art Adventure
  const bgClass = inverted ? "bg-black text-white" : "bg-white text-black";
  const _borderClass = inverted ? "border-border" : "border-border";
  const mutedTextClass = inverted ? "text-text-muted" : "text-text-muted";
  const primaryBtnClass = inverted
    ? "bg-white text-black border-2 border-white shadow-[3px_3px_0_hsl(var(--primary))] hover:shadow-[4px_4px_0_hsl(var(--primary))] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-100 rounded-[var(--radius-button)]"
    : "bg-black text-white border-2 border-black shadow-[3px_3px_0_hsl(var(--primary))] hover:shadow-[4px_4px_0_hsl(var(--primary))] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-100 rounded-[var(--radius-button)]";
  const secondaryBtnClass = inverted
    ? "bg-transparent text-text-muted border-2 border-border hover:border-border-primary hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-100 rounded-[var(--radius-button)]"
    : "bg-transparent text-text-disabled border-2 border-border hover:border-border-primary hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-100 rounded-[var(--radius-button)]";

  // Error state
  if (error) {
    return (
      <div className={clsx("min-h-screen", bgClass, className)} role="alert" aria-live="assertive">
        {header}
        <div className="px-spacing-8 py-spacing-16 text-center">
          <h2 className="font-heading text-h3-md mb-spacing-4">Error Loading Data</h2>
          <p className={clsx("font-body mb-spacing-8", mutedTextClass)}>{error.message}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              aria-label="Retry loading data"
              className={clsx("px-spacing-6 py-spacing-3 font-heading text-body-md tracking-wider uppercase leading-none cursor-pointer", primaryBtnClass)}
            >
              Retry
            </button>
          )}
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className={clsx("min-h-screen", bgClass, className)} role="status" aria-live="polite" aria-busy="true">
        {header}
        <div className="flex items-center justify-center min-h-screen-60">
          <div className="text-center">
            <div 
              className={clsx(
                "w-spacing-12 h-spacing-12 border-3 rounded-full animate-spin mx-auto mb-spacing-4",
                inverted ? "border-border border-t-on-dark-primary" : "border-border border-t-on-light-primary"
              )} 
              role="progressbar"
              aria-label="Loading content"
            />
            <p className={clsx("font-code text-mono-md", mutedTextClass)}>Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={clsx("min-h-screen", bgClass, className)} role="main">
      {header}
      
      <div className="p-spacing-8 max-w-content mx-auto">
        {/* Page Header */}
        <header className="mb-spacing-8" role="banner">
          <div className="flex items-center justify-between mb-spacing-2">
            <h1 className="font-display text-h1-sm tracking-tight">{title}</h1>
            <div className="flex gap-gap-sm">
              {onImport && (
                <button 
                  onClick={() => setImportExportMode("import")} 
                  className={clsx("px-spacing-4 py-spacing-2 font-code text-mono-sm cursor-pointer", secondaryBtnClass)}
                  aria-label={`Import ${title}`}
                >
                  <Upload className="size-4 inline mr-1" aria-hidden="true" />Import
                </button>
              )}
              {onExport && (
                <button 
                  onClick={() => setImportExportMode("export")} 
                  className={clsx("px-spacing-4 py-spacing-2 font-code text-mono-sm cursor-pointer", secondaryBtnClass)}
                  aria-label={`Export ${title}`}
                >
                  <Download className="size-4 inline mr-1" aria-hidden="true" />Export
                </button>
              )}
              {onCreate && (
                <button 
                  onClick={onCreate} 
                  className={clsx("px-spacing-6 py-spacing-3 font-heading text-body-md tracking-wider uppercase leading-none cursor-pointer", primaryBtnClass)}
                  aria-label={`Create new ${title.toLowerCase()}`}
                >
                  + {createLabel}
                </button>
              )}
              {effectiveQuickActions.length > 0 && effectiveQuickActions.map((action) => (
                <button 
                  key={action.id} 
                  onClick={action.onClick} 
                  className={clsx("px-spacing-4 py-spacing-2 font-code text-mono-sm cursor-pointer flex items-center gap-gap-xs", secondaryBtnClass)}
                >
                  {action.icon}
                  {action.label}
                </button>
              ))}
            </div>
          </div>
          {subtitle && (
            <p className={clsx("font-body text-body-md", mutedTextClass)}>{subtitle}</p>
          )}
        </header>

        {/* Stats */}
        {stats.length > 0 && (
          <section aria-label="Statistics" className={clsx("grid gap-gap-md mb-spacing-8", stats.length <= 2 ? "grid-cols-2" : stats.length === 3 ? "grid-cols-3" : "grid-cols-4")}>
            {stats.map((stat, idx) => (
              <div key={idx} className={clsx("p-spacing-6 border", inverted ? "border-border bg-surface-inverse" : "border-border bg-surface-primary")} role="group" aria-label={stat.label}>
                <div className="font-display text-h2-sm" aria-live="polite">{stat.value}</div>
                <div className={clsx("font-code text-mono-sm uppercase tracking-widest", inverted ? "text-text-disabled" : "text-text-muted")}>{stat.label}</div>
              </div>
            ))}
          </section>
        )}

        {/* Search and Filters */}
        <nav aria-label="Search and filters" className="flex gap-gap-sm mb-spacing-4 flex-wrap">
          <div className="flex-1 min-w-card-sm relative">
            <label htmlFor="list-search" className="sr-only">Search {title}</label>
            <input
              ref={searchInputRef}
              id="list-search"
              type="search"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder={searchPlaceholder}
              aria-label={`Search ${title}`}
              className={clsx(
                "w-full py-spacing-3 px-spacing-4 pl-spacing-10 pr-16 font-body text-body-md border outline-none rounded-button",
                inverted
                  ? "bg-surface-inverse text-text-primary border-border focus:border-border-primary"
                  : "bg-surface-primary text-text-primary border-border focus:border-border-primary"
              )}
            />
            <Search className={clsx("absolute left-spacing-3 top-1/2 -translate-y-1/2 size-4", inverted ? "text-text-disabled" : "text-text-muted")} aria-hidden="true" />
            <kbd
              className={clsx(
                "absolute right-3 top-1/2 -translate-y-1/2 px-2 py-0.5 rounded text-xs font-mono",
                inverted ? "bg-surface-elevated text-text-disabled" : "bg-muted text-text-muted"
              )}
            >
              ⌘K
            </kbd>
          </div>
          {filters.map(filter => (
            <div key={filter.key}>
              <label htmlFor={`filter-${filter.key}`} className="sr-only">Filter by {filter.label}</label>
              <select
                id={`filter-${filter.key}`}
                value={String(activeFilters[filter.key] || "All")}
                onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                aria-label={`Filter by ${filter.label}`}
                className={clsx(
                  "px-spacing-4 py-spacing-3 font-body text-body-md border",
                  inverted ? "bg-surface-inverse text-text-primary border-border" : "bg-surface-primary text-text-primary border-border"
                )}
              >
                <option value="All">{filter.label}: All</option>
                {(filter.options || []).map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          ))}
          {activeFilterCount > 0 && (
            <button 
              onClick={clearFilters} 
              className={clsx("px-spacing-4 py-spacing-3 font-code text-mono-sm bg-transparent border-none cursor-pointer underline", mutedTextClass)}
              aria-label={`Clear ${activeFilterCount} active filters`}
            >
              Clear ({activeFilterCount})
            </button>
          )}
          
          {/* Saved Filter Presets */}
          {(savedFilterPresets.length > 0 || onSaveFilterPreset) && (
            <SavedFiltersDropdown
              presets={savedFilterPresets}
              activeFilters={activeFilters}
              onSelect={onSavedFilterSelect}
              onSave={onSaveFilterPreset}
              onDelete={onDeleteFilterPreset}
              inverted={inverted}
            />
          )}
          
          {/* Right side toolbar actions */}
          <div className="flex items-center gap-2 ml-auto">
            {/* View Toggle - Auto-detected from columns */}
            {effectiveViews.length > 1 && (
              <div 
                className={clsx("flex items-center gap-1 border rounded-lg p-1", inverted ? "border-border bg-surface-elevated" : "border-border bg-muted")}
                role="tablist"
                aria-label="View options"
              >
                {effectiveViews.map((view) => {
                  const isActive = currentActiveView === view.id;
                  const ViewIcon = {
                    list: List,
                    grid: LayoutGrid,
                    kanban: Columns3,
                    calendar: CalendarIcon,
                    gantt: GanttIcon,
                    table: Table,
                    timeline: Clock,
                    map: MapPin,
                    gallery: Image,
                  }[view.icon] || List;
                  
                  return (
                    <Tooltip key={view.id} content={view.label} inverted={!inverted}>
                      <button
                        type="button"
                        role="tab"
                        aria-selected={isActive}
                        aria-label={`${view.label} view`}
                        onClick={() => handleViewChange(view.id)}
                        className={clsx(
                          "p-2 rounded transition-colors",
                          isActive
                            ? inverted
                              ? "bg-surface-elevated text-text-primary"
                              : "bg-surface-primary text-text-primary shadow-sm"
                            : inverted
                              ? "text-text-disabled hover:text-text-primary hover:bg-surface-elevated"
                              : "text-text-muted hover:text-text-primary hover:bg-muted"
                        )}
                      >
                        <ViewIcon size={16} aria-hidden="true" />
                      </button>
                    </Tooltip>
                  );
                })}
              </div>
            )}

            {/* Refresh Button */}
            {onRefresh && (
              <Tooltip content={<span>Refresh <kbd className="ml-1 px-1.5 py-0.5 bg-black/20 rounded text-xs">R</kbd></span>} inverted={!inverted}>
                <button
                  type="button"
                  onClick={onRefresh}
                  disabled={isRefreshing}
                  className={clsx(
                    "p-2 border-2 rounded-button transition-all duration-100",
                    inverted
                      ? "border-border text-text-muted hover:border-border-primary hover:text-text-primary"
                      : "border-border text-text-muted hover:border-border-primary hover:text-text-primary",
                    isRefreshing && "animate-spin"
                  )}
                  aria-label="Refresh data"
                >
                  <RefreshCw className="size-4" />
                </button>
              </Tooltip>
            )}

            {/* Table Settings (Density + Column Visibility) */}
            {(columnVisibility || onDensityChange) && (
              <TableSettingsPopover
                columns={columns}
                hiddenColumns={hiddenColumnsProp || []}
                onHiddenColumnsChange={onHiddenColumnsChange}
                columnOrder={columnOrder}
                onColumnOrderChange={onColumnOrderChange}
                density={density}
                onDensityChange={onDensityChange}
                inverted={inverted}
              />
            )}
          </div>
        </nav>

        {/* Bulk Action Bar - Floating component for better UX */}
        <BulkActionBar
          selectedCount={selectedKeys.length}
          actions={[
            ...(bulkEditFields && onBulkEdit ? [{
              id: "__bulk_edit__",
              label: "Bulk Edit",
              icon: undefined,
              variant: "default" as const,
              disabled: false,
            }] : []),
            ...bulkActions.map((action): BulkAction => ({
              id: action.id,
              label: action.label,
              icon: action.icon,
              variant: action.variant,
              disabled: action.disabled,
            })),
          ]}
          onAction={(actionId) => {
            if (actionId === "__bulk_edit__") {
              setBulkEditOpen(true);
            } else {
              onBulkAction?.(actionId, selectedKeys);
            }
          }}
          onClearSelection={() => setSelectedKeys([])}
          entityName="items"
          position="floating"
        />

        {/* Results count */}
        <div 
          className={clsx("mb-spacing-4 font-code text-mono-sm", inverted ? "text-text-disabled" : "text-text-muted")}
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          {filteredData.length} {filteredData.length === 1 ? "result" : "results"}
        </div>

        {/* View-specific content */}
        {currentActiveView === "kanban" && effectiveKanbanGroupBy && kanbanColumns ? (
          <KanbanBoard
            data={filteredData}
            columns={kanbanColumns}
            groupBy={effectiveKanbanGroupBy}
            rowKey={rowKey}
            cardRender={kanbanCardRender || ((item) => (
              <div className={clsx("text-sm", inverted ? "text-white" : "text-text-primary")}>
                {String(item[columns[0]?.key as keyof T] || "Item")}
              </div>
            ))}
            onDragEnd={onKanbanDragEnd}
            onCardClick={onRowClick}
            inverted={inverted}
            emptyMessage={emptyMessage}
          />
        ) : currentActiveView === "calendar" && effectiveCalendarDateField ? (
          <Calendar
            events={filteredData.map((item) => ({
              id: typeof rowKey === "function" ? rowKey(item) : String(item[rowKey]),
              title: effectiveCalendarTitleField ? String(item[effectiveCalendarTitleField]) : String(item[columns[0]?.key as keyof T] || "Event"),
              date: new Date(String(item[effectiveCalendarDateField])),
            }))}
            onEventClick={(event) => {
              const item = filteredData.find((d) => 
                (typeof rowKey === "function" ? rowKey(d) : String(d[rowKey])) === event.id
              );
              if (item && onCalendarEventClick) {
                onCalendarEventClick(item);
              } else if (item && onRowClick) {
                onRowClick(item);
              }
            }}
            inverted={inverted}
          />
        ) : currentActiveView === "grid" ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredData.map((item) => {
              const itemId = typeof rowKey === "function" ? rowKey(item) : String(item[rowKey]);
              return (
                <div
                  key={itemId}
                  onClick={() => onRowClick?.(item)}
                  className={clsx(
                    "p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md",
                    inverted
                      ? "bg-surface-elevated border-border hover:border-border-primary"
                      : "bg-surface-primary border-border hover:border-border-primary"
                  )}
                >
                  <div className={clsx("font-semibold text-sm mb-2", inverted ? "text-white" : "text-text-primary")}>
                    {String(item[columns[0]?.key as keyof T] || "Item")}
                  </div>
                  {columns.slice(1, 3).map((col) => (
                    <div key={col.key} className={clsx("text-xs", inverted ? "text-text-muted" : "text-text-muted")}>
                      {col.label}: {String(item[col.key as keyof T] || "-")}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        ) : currentActiveView === "gantt" && effectiveGanttStartField && effectiveGanttEndField ? (
          <GanttChart
            tasks={filteredData.map((item): GanttTask<T> => ({
              id: typeof rowKey === "function" ? rowKey(item) : String(item[rowKey]),
              title: String(item[columns[0]?.key as keyof T] || "Task"),
              start: new Date(String(item[effectiveGanttStartField])),
              end: new Date(String(item[effectiveGanttEndField])),
              progress: effectiveGanttProgressField ? Number(item[effectiveGanttProgressField]) || 0 : undefined,
              data: item,
            }))}
            onTaskClick={(task) => {
              if (task.data && onGanttTaskClick) {
                onGanttTaskClick(task.data);
              } else if (task.data && onRowClick) {
                onRowClick(task.data);
              }
            }}
            inverted={inverted}
            emptyMessage={emptyMessage}
          />
        ) : currentActiveView === "timeline" && effectiveTimelineDateField ? (
          <TimelineView
            items={filteredData.map((item): TimelineItem<T> => ({
              id: typeof rowKey === "function" ? rowKey(item) : String(item[rowKey]),
              title: String(item[columns[0]?.key as keyof T] || "Item"),
              description: effectiveTimelineDescriptionField ? String(item[effectiveTimelineDescriptionField]) : undefined,
              date: new Date(String(item[effectiveTimelineDateField])),
              data: item,
            }))}
            onItemClick={(timelineItem) => {
              if (timelineItem.data && onTimelineItemClick) {
                onTimelineItemClick(timelineItem.data);
              } else if (timelineItem.data && onRowClick) {
                onRowClick(timelineItem.data);
              }
            }}
            inverted={inverted}
            emptyMessage={emptyMessage}
          />
        ) : currentActiveView === "map" && effectiveMapLatitudeField && effectiveMapLongitudeField ? (
          <MapView
            locations={filteredData.map((item): MapLocation<T> => ({
              id: typeof rowKey === "function" ? rowKey(item) : String(item[rowKey]),
              title: String(item[columns[0]?.key as keyof T] || "Location"),
              latitude: Number(item[effectiveMapLatitudeField]) || 0,
              longitude: Number(item[effectiveMapLongitudeField]) || 0,
              address: effectiveMapAddressField ? String(item[effectiveMapAddressField]) : undefined,
              data: item,
            }))}
            onLocationClick={(location) => {
              if (location.data && onMapLocationClick) {
                onMapLocationClick(location.data);
              } else if (location.data && onRowClick) {
                onRowClick(location.data);
              }
            }}
            inverted={inverted}
            emptyMessage={emptyMessage}
          />
        ) : currentActiveView === "gallery" && effectiveGalleryImageField ? (
          <GalleryView
            items={filteredData.map((item): GalleryItem<T> => ({
              id: typeof rowKey === "function" ? rowKey(item) : String(item[rowKey]),
              title: String(item[columns[0]?.key as keyof T] || "Item"),
              imageUrl: String(item[effectiveGalleryImageField]),
              thumbnailUrl: effectiveGalleryThumbnailField ? String(item[effectiveGalleryThumbnailField]) : undefined,
              data: item,
            }))}
            onItemClick={(galleryItem) => {
              if (galleryItem.data && onGalleryItemClick) {
                onGalleryItemClick(galleryItem.data);
              } else if (galleryItem.data && onRowClick) {
                onRowClick(galleryItem.data);
              }
            }}
            inverted={inverted}
            emptyMessage={emptyMessage}
          />
        ) : (
          /* Default: DataGrid/List view */
          <DataGrid
            data={filteredData}
            columns={dataGridColumns}
            rowKey={rowKey}
            searchable={false}
            selectable={bulkActions.length > 0}
            selectedKeys={selectedKeys}
            onSelectionChange={setSelectedKeys}
            bulkActions={dataGridBulkActions}
            onBulkAction={onBulkAction}
            rowActions={dataGridRowActions}
            onRowAction={handleRowAction}
            onRowClick={onRowClick}
            sortable={true}
            defaultSort={sortColumn && sortDirection ? { column: sortColumn, direction: sortDirection } : undefined}
            onSortChange={(col: string, dir: "asc" | "desc" | null) => {
              setSortColumn(dir ? col : null);
              setSortDirection(dir);
            }}
            pagination={pagination}
            onPageChange={onPageChange}
            loading={false}
            emptyMessage={emptyMessage}
            striped={striped}
            compact={compact}
            density={density}
            columnVisibility={columnVisibility}
            inlineEditing={inlineEditing}
            onCellEdit={onCellEdit}
          />
        )}
        
        {/* Empty state with action */}
        {filteredData.length === 0 && emptyAction && (
          <div className="text-center mt-spacing-4" role="status" aria-live="polite">
            <button 
              onClick={emptyAction.onClick} 
              className={clsx("px-spacing-6 py-spacing-3 font-heading text-body-md tracking-wider uppercase leading-none cursor-pointer", primaryBtnClass)}
              aria-label={emptyAction.label}
            >
              {emptyAction.label}
            </button>
          </div>
        )}
      </div>

      {/* Import/Export Dialog */}
      {importExportMode && (
        <ImportExportDialog
          open={true}
          onClose={() => setImportExportMode(null)}
          mode={importExportMode}
          entityType={entityType || title.toLowerCase().replace(/\s+/g, "-")}
          entityLabel={title}
          onImport={handleImport}
          importTemplates={importTemplates}
          sampleFields={importSampleFields}
          templateDownloadUrl={templateDownloadUrl}
          exportFormats={exportFormats}
          columns={exportColumns}
          onExport={handleExport}
          totalRecords={data.length}
          loading={importExportLoading}
        />
      )}

      {/* Bulk Edit Modal */}
      {bulkEditOpen && bulkEditFields && onBulkEdit && (
        <BulkEditModal
          open={bulkEditOpen}
          onClose={() => {
            setBulkEditOpen(false);
            setSelectedKeys([]);
          }}
          selectedItems={filteredData.filter((row) => {
            const key = typeof rowKey === "function" ? rowKey(row) : String(row[rowKey]);
            return selectedKeys.includes(key);
          })}
          fields={bulkEditFields}
          onSubmit={onBulkEdit}
          getItemId={(item: T) => typeof rowKey === "function" ? rowKey(item) : String(item[rowKey])}
          getItemLabel={(item: T) => {
            const firstCol = columns[0];
            if (!firstCol) return "Item";
            const val = typeof firstCol.accessor === "function" ? firstCol.accessor(item) : (item as Record<string, unknown>)[firstCol.accessor as string];
            return String(val ?? "Item");
          }}
          title={`Bulk Edit ${title}`}
          description={`Update multiple ${title.toLowerCase()} at once. Select the fields you want to change.`}
        />
      )}
    </div>
  );
}

export default ListPage;
