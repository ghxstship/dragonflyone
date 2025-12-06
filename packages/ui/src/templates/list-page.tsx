"use client";

import React, { useState, useCallback, useMemo } from "react";
import clsx from "clsx";
import { Upload, Download, Search, List, LayoutGrid, Columns3, Calendar as CalendarIcon, GanttChart as GanttIcon, Table, Clock, MapPin, Image } from "lucide-react";
import { DataGrid } from "../organisms/data-grid.js";
import { ImportExportDialog, type ExportFormat, type ColumnConfig, type ImportTemplate } from "../organisms/import-export-dialog.js";
import { BulkActionBar, type BulkAction } from "../molecules/bulk-action-bar.js";
import { KanbanBoard, type KanbanColumn as KanbanBoardColumn } from "../organisms/kanban-board.js";
import { Calendar } from "../organisms/calendar.js";
import { GanttChart, type GanttTask } from "../organisms/gantt-chart.js";
import { TimelineView, type TimelineItem } from "../organisms/timeline-view.js";
import { MapView, type MapLocation } from "../organisms/map-view.js";
import { GalleryView, type GalleryItem } from "../organisms/gallery-view.js";

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

export interface ListPageColumn<T> {
  key: string;
  label: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
  sortable?: boolean;
  width?: string;
  minWidth?: string;
  align?: "left" | "center" | "right";
  render?: (value: unknown, row: T) => React.ReactNode;
  hidden?: boolean;
}

export interface ListPageFilter {
  key: string;
  label: string;
  options: { value: string; label: string; count?: number }[];
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
  /** Entity type for import/export (e.g., "crew", "assets") */
  entityType?: string;
  /** Import handler - receives file and field mapping */
  onImport?: (file: File, mapping: Record<string, string>) => Promise<void>;
  /** Import templates for field mapping */
  importTemplates?: ImportTemplate[];
  /** Sample fields for import template download */
  importSampleFields?: string[];
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
  onImport,
  importTemplates = [],
  importSampleFields = [],
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
  // View toggle props
  views = [],
  activeView = "list",
  onViewChange,
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
  
  // Smart view detection - auto-detect available views from column definitions
  const smartViews = useMemo(() => detectSmartViews(columns), [columns]);
  
  // Use provided views if available, otherwise use smart-detected views
  const effectiveViews = views.length > 0 ? views : smartViews.views;
  
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
    sortable: col.sortable,
    width: col.width,
    minWidth: col.minWidth,
    align: col.align,
    render: col.render,
    hidden: col.hidden,
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
            : row[col.accessor];
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
          const aVal = typeof col.accessor === "function" ? col.accessor(a) : a[col.accessor];
          const bVal = typeof col.accessor === "function" ? col.accessor(b) : b[col.accessor];
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
  const _borderClass = inverted ? "border-grey-700" : "border-grey-300";
  const mutedTextClass = inverted ? "text-grey-400" : "text-grey-600";
  const primaryBtnClass = inverted
    ? "bg-white text-black border-2 border-white shadow-[3px_3px_0_hsl(var(--primary))] hover:shadow-[4px_4px_0_hsl(var(--primary))] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-100 rounded-[var(--radius-button)]"
    : "bg-black text-white border-2 border-black shadow-[3px_3px_0_hsl(var(--primary))] hover:shadow-[4px_4px_0_hsl(var(--primary))] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-100 rounded-[var(--radius-button)]";
  const secondaryBtnClass = inverted
    ? "bg-transparent text-grey-400 border-2 border-grey-700 hover:border-grey-500 hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-100 rounded-[var(--radius-button)]"
    : "bg-transparent text-grey-600 border-2 border-grey-300 hover:border-grey-500 hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-100 rounded-[var(--radius-button)]";

  // Error state
  if (error) {
    return (
      <div className={clsx("min-h-screen", bgClass, className)}>
        {header}
        <div className="px-spacing-8 py-spacing-16 text-center">
          <h2 className="font-heading text-h3-md mb-spacing-4">Error Loading Data</h2>
          <p className={clsx("font-body mb-spacing-8", mutedTextClass)}>{error.message}</p>
          {onRetry && (
            <button
              onClick={onRetry}
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
      <div className={clsx("min-h-screen", bgClass, className)}>
        {header}
        <div className="flex items-center justify-center min-h-screen-60">
          <div className="text-center">
            <div className={clsx(
              "w-spacing-12 h-spacing-12 border-3 rounded-full animate-spin mx-auto mb-spacing-4",
              inverted ? "border-grey-700 border-t-white" : "border-grey-300 border-t-black"
            )} />
            <p className={clsx("font-code text-mono-md", mutedTextClass)}>Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={clsx("min-h-screen", bgClass, className)}>
      {header}
      
      <div className="p-spacing-8 max-w-content mx-auto">
        {/* Page Header */}
        <div className="mb-spacing-8">
          <div className="flex items-center justify-between mb-spacing-2">
            <h1 className="font-display text-h1-sm tracking-tight">{title}</h1>
            <div className="flex gap-gap-sm">
              {onImport && (
                <button onClick={() => setImportExportMode("import")} className={clsx("px-spacing-4 py-spacing-2 font-code text-mono-sm cursor-pointer", secondaryBtnClass)}>
                  <Upload className="size-4 inline mr-1" />Import
                </button>
              )}
              {onExport && (
                <button 
                  onClick={() => setImportExportMode("export")} 
                  className={clsx("px-spacing-4 py-spacing-2 font-code text-mono-sm cursor-pointer", secondaryBtnClass)}
                >
                  <Download className="size-4 inline mr-1" />Export
                </button>
              )}
              {onCreate && (
                <button onClick={onCreate} className={clsx("px-spacing-6 py-spacing-3 font-heading text-body-md tracking-wider uppercase leading-none cursor-pointer", primaryBtnClass)}>
                  + {createLabel}
                </button>
              )}
              {quickActions.length > 0 && quickActions.map((action) => (
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
        </div>

        {/* Stats */}
        {stats.length > 0 && (
          <div className={clsx("grid gap-gap-md mb-spacing-8", stats.length <= 2 ? "grid-cols-2" : stats.length === 3 ? "grid-cols-3" : "grid-cols-4")}>
            {stats.map((stat, idx) => (
              <div key={idx} className={clsx("p-spacing-6 border", inverted ? "border-grey-800 bg-black" : "border-grey-200 bg-white")}>
                <div className="font-display text-h2-sm">{stat.value}</div>
                <div className={clsx("font-code text-mono-sm uppercase tracking-widest", inverted ? "text-grey-500" : "text-grey-400")}>{stat.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Search and Filters */}
        <div className="flex gap-gap-sm mb-spacing-4 flex-wrap">
          <div className="flex-1 min-w-card-sm relative">
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder={searchPlaceholder}
              className={clsx(
                "w-full py-spacing-3 px-spacing-4 pl-spacing-10 font-body text-body-md border outline-none",
                inverted
                  ? "bg-black text-white border-grey-700 focus:border-grey-500"
                  : "bg-white text-black border-grey-300 focus:border-grey-500"
              )}
            />
            <span className={clsx("absolute left-spacing-3 top-1/2 -translate-y-1/2", inverted ? "text-grey-500" : "text-grey-400")}><Search className="size-4" /></span>
          </div>
          {filters.map(filter => (
            <select
              key={filter.key}
              value={String(activeFilters[filter.key] || "All")}
              onChange={(e) => handleFilterChange(filter.key, e.target.value)}
              className={clsx(
                "px-spacing-4 py-spacing-3 font-body text-body-md border",
                inverted ? "bg-black text-white border-grey-700" : "bg-white text-black border-grey-300"
              )}
            >
              <option value="All">{filter.label}: All</option>
              {filter.options.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          ))}
          {activeFilterCount > 0 && (
            <button onClick={clearFilters} className={clsx("px-spacing-4 py-spacing-3 font-code text-mono-sm bg-transparent border-none cursor-pointer underline", mutedTextClass)}>
              Clear ({activeFilterCount})
            </button>
          )}
          
          {/* View Toggle - Auto-detected from columns */}
          {effectiveViews.length > 1 && (
            <div className={clsx("flex items-center gap-1 ml-auto border rounded-lg p-1", inverted ? "border-grey-700 bg-grey-900" : "border-grey-200 bg-grey-50")}>
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
                  <button
                    key={view.id}
                    type="button"
                    onClick={() => handleViewChange(view.id)}
                    title={view.label}
                    className={clsx(
                      "p-2 rounded transition-colors",
                      isActive
                        ? inverted
                          ? "bg-grey-700 text-white"
                          : "bg-white text-grey-900 shadow-sm"
                        : inverted
                          ? "text-grey-500 hover:text-white hover:bg-grey-800"
                          : "text-grey-400 hover:text-grey-900 hover:bg-grey-100"
                    )}
                  >
                    <ViewIcon size={16} />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Bulk Action Bar - Floating component for better UX */}
        <BulkActionBar
          selectedCount={selectedKeys.length}
          actions={bulkActions.map((action): BulkAction => ({
            id: action.id,
            label: action.label,
            icon: action.icon,
            variant: action.variant,
            disabled: action.disabled,
          }))}
          onAction={(actionId) => onBulkAction?.(actionId, selectedKeys)}
          onClearSelection={() => setSelectedKeys([])}
          entityName="items"
          position="floating"
        />

        {/* Results count */}
        <div className={clsx("mb-spacing-4 font-code text-mono-sm", inverted ? "text-grey-500" : "text-grey-400")}>
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
              <div className={clsx("text-sm", inverted ? "text-white" : "text-grey-900")}>
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
                      ? "bg-grey-900 border-grey-800 hover:border-grey-700"
                      : "bg-white border-grey-200 hover:border-grey-300"
                  )}
                >
                  <div className={clsx("font-semibold text-sm mb-2", inverted ? "text-white" : "text-grey-900")}>
                    {String(item[columns[0]?.key as keyof T] || "Item")}
                  </div>
                  {columns.slice(1, 3).map((col) => (
                    <div key={col.key} className={clsx("text-xs", inverted ? "text-grey-400" : "text-grey-500")}>
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
            columnVisibility={columnVisibility}
          />
        )}
        
        {/* Empty state with action */}
        {filteredData.length === 0 && emptyAction && (
          <div className="text-center mt-spacing-4">
            <button onClick={emptyAction.onClick} className={clsx("px-spacing-6 py-spacing-3 font-heading text-body-md tracking-wider uppercase leading-none cursor-pointer", primaryBtnClass)}>
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
          exportFormats={exportFormats}
          columns={exportColumns}
          onExport={handleExport}
          totalRecords={data.length}
          loading={importExportLoading}
        />
      )}
    </div>
  );
}

export default ListPage;
