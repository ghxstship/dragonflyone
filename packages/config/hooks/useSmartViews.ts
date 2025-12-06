/**
 * Smart View Detection Hook
 * Automatically determines which views are appropriate based on data column types
 */

import { useMemo } from "react";

// =============================================================================
// TYPES
// =============================================================================

export type ViewType = "list" | "grid" | "table" | "kanban" | "calendar" | "gantt" | "timeline" | "map" | "gallery";

export interface ViewConfig {
  id: string;
  label: string;
  icon: ViewType;
}

export interface ColumnDefinition {
  key: string;
  label: string;
  type?: "string" | "number" | "date" | "datetime" | "boolean" | "status" | "image" | "location" | "currency" | "percentage" | "email" | "phone" | "url";
}

export interface SmartViewConfig {
  /** Available views based on column analysis */
  views: ViewConfig[];
  /** Detected status/category field for Kanban */
  kanbanGroupBy: string | undefined;
  /** Detected date field for Calendar */
  calendarDateField: string | undefined;
  /** Detected title field for Calendar events */
  calendarTitleField: string | undefined;
  /** Detected start date field for Gantt */
  ganttStartField: string | undefined;
  /** Detected end date field for Gantt */
  ganttEndField: string | undefined;
  /** Detected progress field for Gantt */
  ganttProgressField: string | undefined;
  /** Detected date field for Timeline */
  timelineDateField: string | undefined;
  /** Detected description field for Timeline */
  timelineDescriptionField: string | undefined;
  /** Detected latitude field for Map */
  mapLatitudeField: string | undefined;
  /** Detected longitude field for Map */
  mapLongitudeField: string | undefined;
  /** Detected address field for Map */
  mapAddressField: string | undefined;
  /** Detected image field for Gallery */
  galleryImageField: string | undefined;
  /** Detected thumbnail field for Gallery */
  galleryThumbnailField: string | undefined;
}

// =============================================================================
// FIELD DETECTION PATTERNS
// =============================================================================

/** Patterns to detect status/category fields for Kanban view */
const STATUS_FIELD_PATTERNS = [
  /^status$/i,
  /^state$/i,
  /^stage$/i,
  /^phase$/i,
  /^category$/i,
  /^type$/i,
  /^priority$/i,
  /^pipeline_stage$/i,
  /^workflow_status$/i,
  /^deal_stage$/i,
  /^project_status$/i,
  /^task_status$/i,
  /^issue_status$/i,
  /^order_status$/i,
  /^booking_status$/i,
  /^payment_status$/i,
  /_status$/i,
  /_stage$/i,
  /_state$/i,
];

/** Patterns to detect date fields */
const DATE_FIELD_PATTERNS = [
  /^date$/i,
  /^created_at$/i,
  /^updated_at$/i,
  /^due_date$/i,
  /^start_date$/i,
  /^end_date$/i,
  /^event_date$/i,
  /^scheduled_date$/i,
  /^deadline$/i,
  /^timestamp$/i,
  /^published_at$/i,
  /^completed_at$/i,
  /^scheduled_at$/i,
  /_date$/i,
  /_at$/i,
];

/** Patterns to detect start date fields for Gantt */
const START_DATE_PATTERNS = [
  /^start_date$/i,
  /^start$/i,
  /^begin_date$/i,
  /^from_date$/i,
  /^scheduled_start$/i,
  /^planned_start$/i,
  /^actual_start$/i,
];

/** Patterns to detect end date fields for Gantt */
const END_DATE_PATTERNS = [
  /^end_date$/i,
  /^end$/i,
  /^finish_date$/i,
  /^to_date$/i,
  /^due_date$/i,
  /^deadline$/i,
  /^scheduled_end$/i,
  /^planned_end$/i,
  /^actual_end$/i,
  /^completion_date$/i,
];

/** Patterns to detect progress fields */
const PROGRESS_FIELD_PATTERNS = [
  /^progress$/i,
  /^completion$/i,
  /^percent_complete$/i,
  /^percentage$/i,
  /^completion_percentage$/i,
];

/** Patterns to detect latitude fields */
const LATITUDE_PATTERNS = [
  /^latitude$/i,
  /^lat$/i,
  /^geo_lat$/i,
  /^location_lat$/i,
];

/** Patterns to detect longitude fields */
const LONGITUDE_PATTERNS = [
  /^longitude$/i,
  /^lng$/i,
  /^lon$/i,
  /^geo_lng$/i,
  /^geo_lon$/i,
  /^location_lng$/i,
  /^location_lon$/i,
];

/** Patterns to detect address fields */
const ADDRESS_PATTERNS = [
  /^address$/i,
  /^location$/i,
  /^venue$/i,
  /^place$/i,
  /^street_address$/i,
  /^full_address$/i,
];

/** Patterns to detect image fields */
const IMAGE_FIELD_PATTERNS = [
  /^image$/i,
  /^image_url$/i,
  /^photo$/i,
  /^photo_url$/i,
  /^thumbnail$/i,
  /^thumbnail_url$/i,
  /^avatar$/i,
  /^avatar_url$/i,
  /^cover$/i,
  /^cover_url$/i,
  /^poster$/i,
  /^poster_url$/i,
  /^picture$/i,
  /^picture_url$/i,
  /^media_url$/i,
  /^asset_url$/i,
  /_image$/i,
  /_photo$/i,
  /_thumbnail$/i,
  /_url$/i,
];

/** Patterns to detect thumbnail fields specifically */
const THUMBNAIL_PATTERNS = [
  /^thumbnail$/i,
  /^thumbnail_url$/i,
  /^thumb$/i,
  /^thumb_url$/i,
  /^small_image$/i,
  /^preview$/i,
  /^preview_url$/i,
];

/** Patterns to detect title/name fields */
const TITLE_FIELD_PATTERNS = [
  /^title$/i,
  /^name$/i,
  /^subject$/i,
  /^heading$/i,
  /^label$/i,
  /^display_name$/i,
  /^full_name$/i,
  /^event_name$/i,
  /^project_name$/i,
  /^task_name$/i,
];

/** Patterns to detect description fields */
const DESCRIPTION_PATTERNS = [
  /^description$/i,
  /^desc$/i,
  /^summary$/i,
  /^notes$/i,
  /^details$/i,
  /^content$/i,
  /^body$/i,
  /^text$/i,
];

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function findFieldByPatterns(columns: ColumnDefinition[], patterns: RegExp[]): string | undefined {
  for (const pattern of patterns) {
    const match = columns.find((col) => pattern.test(col.key));
    if (match) return match.key;
  }
  return undefined;
}

function findFieldByType(columns: ColumnDefinition[], type: string): string | undefined {
  return columns.find((col) => col.type === type)?.key;
}

function _hasFieldMatchingPatterns(columns: ColumnDefinition[], patterns: RegExp[]): boolean {
  return patterns.some((pattern) => columns.some((col) => pattern.test(col.key)));
}

// =============================================================================
// MAIN HOOK
// =============================================================================

export function useSmartViews(columns: ColumnDefinition[]): SmartViewConfig {
  return useMemo(() => {
    const views: ViewConfig[] = [];

    // Always available views
    views.push({ id: "list", label: "List", icon: "list" });
    views.push({ id: "grid", label: "Grid", icon: "grid" });
    views.push({ id: "table", label: "Table", icon: "table" });

    // Detect Kanban (status/category field)
    const kanbanGroupBy = findFieldByType(columns, "status") || findFieldByPatterns(columns, STATUS_FIELD_PATTERNS);
    if (kanbanGroupBy) {
      views.push({ id: "kanban", label: "Board", icon: "kanban" });
    }

    // Detect Calendar (date field)
    const calendarDateField = findFieldByType(columns, "date") || findFieldByType(columns, "datetime") || findFieldByPatterns(columns, DATE_FIELD_PATTERNS);
    const calendarTitleField = findFieldByPatterns(columns, TITLE_FIELD_PATTERNS) || columns[0]?.key;
    if (calendarDateField) {
      views.push({ id: "calendar", label: "Calendar", icon: "calendar" });
    }

    // Detect Gantt (start + end date fields)
    const ganttStartField = findFieldByPatterns(columns, START_DATE_PATTERNS);
    const ganttEndField = findFieldByPatterns(columns, END_DATE_PATTERNS);
    const ganttProgressField = findFieldByType(columns, "percentage") || findFieldByPatterns(columns, PROGRESS_FIELD_PATTERNS);
    if (ganttStartField && ganttEndField) {
      views.push({ id: "gantt", label: "Timeline", icon: "gantt" });
    }

    // Detect Timeline (any date field)
    const timelineDateField = calendarDateField; // Reuse calendar date detection
    const timelineDescriptionField = findFieldByPatterns(columns, DESCRIPTION_PATTERNS);
    if (timelineDateField) {
      views.push({ id: "timeline", label: "Activity", icon: "timeline" });
    }

    // Detect Map (lat/lng or location type)
    const mapLatitudeField = findFieldByType(columns, "location") ? "latitude" : findFieldByPatterns(columns, LATITUDE_PATTERNS);
    const mapLongitudeField = findFieldByType(columns, "location") ? "longitude" : findFieldByPatterns(columns, LONGITUDE_PATTERNS);
    const mapAddressField = findFieldByPatterns(columns, ADDRESS_PATTERNS);
    if ((mapLatitudeField && mapLongitudeField) || mapAddressField) {
      views.push({ id: "map", label: "Map", icon: "map" });
    }

    // Detect Gallery (image field)
    const galleryImageField = findFieldByType(columns, "image") || findFieldByPatterns(columns, IMAGE_FIELD_PATTERNS);
    const galleryThumbnailField = findFieldByPatterns(columns, THUMBNAIL_PATTERNS);
    if (galleryImageField) {
      views.push({ id: "gallery", label: "Gallery", icon: "gallery" });
    }

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
  }, [columns]);
}

/**
 * Utility function to convert ListPageColumn to ColumnDefinition
 * This infers the type from the column key name
 */
export function inferColumnType(key: string): ColumnDefinition["type"] {
  const keyLower = key.toLowerCase();

  // Status/category
  if (STATUS_FIELD_PATTERNS.some((p) => p.test(key))) return "status";

  // Date/datetime
  if (DATE_FIELD_PATTERNS.some((p) => p.test(key))) return "date";

  // Image
  if (IMAGE_FIELD_PATTERNS.some((p) => p.test(key))) return "image";

  // Location
  if (LATITUDE_PATTERNS.some((p) => p.test(key)) || LONGITUDE_PATTERNS.some((p) => p.test(key))) return "location";

  // Currency
  if (/price|cost|amount|total|revenue|budget|fee|rate/i.test(keyLower)) return "currency";

  // Percentage
  if (/percent|progress|completion|ratio/i.test(keyLower)) return "percentage";

  // Email
  if (/email/i.test(keyLower)) return "email";

  // Phone
  if (/phone|mobile|cell|fax/i.test(keyLower)) return "phone";

  // URL
  if (/url|link|website|href/i.test(keyLower)) return "url";

  // Boolean
  if (/^is_|^has_|^can_|^should_|active|enabled|visible|published/i.test(keyLower)) return "boolean";

  // Number
  if (/count|quantity|qty|number|num|id$|_id$/i.test(keyLower)) return "number";

  // Default to string
  return "string";
}

/**
 * Helper to create ColumnDefinition array from ListPage columns
 */
export function columnsToDefinitions(
  columns: Array<{ key: string; label: string }>
): ColumnDefinition[] {
  return columns.map((col) => ({
    key: col.key,
    label: col.label,
    type: inferColumnType(col.key),
  }));
}

export default useSmartViews;
