import type { ReactNode } from 'react';

export type WidgetType =
  | "kpi_card"
  | "line_chart"
  | "bar_chart"
  | "pie_chart"
  | "table"
  | "list"
  | "calendar"
  | "timeline"
  | "gauge"
  | "progress"
  | "activity_feed"
  | "recent_items";

export type WidgetSize = "small" | "medium" | "large" | "full";

export interface WidgetConfig {
  id: string;
  type: WidgetType;
  title: string;
  size: WidgetSize;
  position: { x: number; y: number };
  dataSource: string;
  filters?: Record<string, unknown>;
  settings?: Record<string, unknown>;
  refreshInterval?: number;
}

export interface DashboardConfig {
  id: string;
  name: string;
  description?: string;
  isDefault: boolean;
  isPublic: boolean;
  layout: "grid" | "flex" | "custom";
  widgets: WidgetConfig[];
}

export interface WidgetPaletteItem {
  type: WidgetType;
  label: string;
  icon: ReactNode;
  description: string;
  defaultSize: WidgetSize;
}

export interface DashboardBuilderProps {
  /** Current dashboard configuration */
  dashboard: DashboardConfig;
  /** Called when dashboard is updated */
  onUpdate: (dashboard: DashboardConfig) => void;
  /** Called when dashboard is saved */
  onSave?: (dashboard: DashboardConfig) => Promise<void>;
  /** Called when dashboard is shared */
  onShare?: (dashboard: DashboardConfig) => void;
  /** Called when dashboard is duplicated */
  onDuplicate?: (dashboard: DashboardConfig) => void;
  /** Called when dashboard is set as default */
  onSetDefault?: (dashboard: DashboardConfig) => void;
  /** Render function for widget content */
  renderWidget?: (widget: WidgetConfig) => ReactNode;
  /** Available data sources */
  dataSources?: Array<{ id: string; label: string }>;
  /** Whether in edit mode */
  editMode?: boolean;
  /** Inverted theme (dark background) */
  inverted?: boolean;
  /** Loading state */
  loading?: boolean;
  /** Additional className */
  className?: string;
}
