"use client";

import React, { useState, useCallback, ReactNode } from "react";
import clsx from "clsx";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Plus,
  Settings,
  Trash2,
  Move,
  BarChart2,
  PieChart,
  TrendingUp,
  Table,
  List,
  Calendar,
  Activity,
  Clock,
  Gauge,
  X,
  Save,
  Share2,
  Star,
  Copy,
} from "lucide-react";
import { Tooltip } from "../atoms/tooltip.js";
import { OverlayLayout } from "../templates/overlay-layout.js";

// =============================================================================
// TYPES
// =============================================================================

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

// =============================================================================
// CONSTANTS
// =============================================================================

const WIDGET_PALETTE: WidgetPaletteItem[] = [
  { type: "kpi_card", label: "KPI Card", icon: <TrendingUp size={20} />, description: "Single metric with trend", defaultSize: "small" },
  { type: "line_chart", label: "Line Chart", icon: <TrendingUp size={20} />, description: "Time series data", defaultSize: "medium" },
  { type: "bar_chart", label: "Bar Chart", icon: <BarChart2 size={20} />, description: "Categorical comparison", defaultSize: "medium" },
  { type: "pie_chart", label: "Pie Chart", icon: <PieChart size={20} />, description: "Distribution breakdown", defaultSize: "small" },
  { type: "table", label: "Data Table", icon: <Table size={20} />, description: "Tabular data view", defaultSize: "large" },
  { type: "list", label: "List", icon: <List size={20} />, description: "Simple item list", defaultSize: "small" },
  { type: "calendar", label: "Calendar", icon: <Calendar size={20} />, description: "Date-based events", defaultSize: "large" },
  { type: "timeline", label: "Timeline", icon: <Clock size={20} />, description: "Chronological events", defaultSize: "medium" },
  { type: "gauge", label: "Gauge", icon: <Gauge size={20} />, description: "Progress indicator", defaultSize: "small" },
  { type: "progress", label: "Progress", icon: <Activity size={20} />, description: "Goal tracking", defaultSize: "small" },
  { type: "activity_feed", label: "Activity Feed", icon: <Activity size={20} />, description: "Recent activity", defaultSize: "medium" },
  { type: "recent_items", label: "Recent Items", icon: <Clock size={20} />, description: "Recently accessed", defaultSize: "small" },
];

const SIZE_CLASSES: Record<WidgetSize, string> = {
  small: "col-span-1 row-span-1",
  medium: "col-span-2 row-span-1",
  large: "col-span-2 row-span-2",
  full: "col-span-4 row-span-1",
};

// =============================================================================
// SORTABLE WIDGET COMPONENT
// =============================================================================

interface SortableWidgetProps {
  widget: WidgetConfig;
  editMode: boolean;
  inverted: boolean;
  onEdit: () => void;
  onDelete: () => void;
  renderContent?: (widget: WidgetConfig) => ReactNode;
}

function SortableWidget({
  widget,
  editMode,
  inverted,
  onEdit,
  onDelete,
  renderContent,
}: SortableWidgetProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: widget.id, disabled: !editMode });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={clsx(
        "relative rounded-lg border-2 overflow-hidden transition-all",
        SIZE_CLASSES[widget.size],
        isDragging && "opacity-50 z-popover",
        inverted
          ? "bg-surface-elevated border-border"
          : "bg-surface-primary border-border",
        editMode && "hover:border-primary-500"
      )}
    >
      {/* Widget Header */}
      <div
        className={clsx(
          "flex items-center justify-between px-4 py-2 border-b-2",
          inverted ? "border-border" : "border-border"
        )}
      >
        <div className="flex items-center gap-2">
          {editMode && (
            <button
              type="button"
              {...attributes}
              {...listeners}
              className={clsx(
                "p-1 cursor-grab active:cursor-grabbing rounded",
                inverted
                  ? "text-text-muted hover:text-text-primary hover:bg-surface-inverse"
                  : "text-text-muted hover:text-text-primary hover:bg-muted"
              )}
            >
              <Move size={14} />
            </button>
          )}
          <h3
            className={clsx(
              "font-semibold text-sm",
              inverted ? "text-text-primary" : "text-text-primary"
            )}
          >
            {widget.title}
          </h3>
        </div>

        {editMode && (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onEdit}
              className={clsx(
                "p-1 rounded transition-colors",
                inverted
                  ? "text-text-muted hover:text-text-primary hover:bg-surface-inverse"
                  : "text-text-muted hover:text-text-primary hover:bg-muted"
              )}
            >
              <Settings size={14} />
            </button>
            <button
              type="button"
              onClick={onDelete}
              className={clsx(
                "p-1 rounded transition-colors",
                inverted
                  ? "text-text-muted hover:text-error-400 hover:bg-surface-inverse"
                  : "text-text-muted hover:text-error-600 hover:bg-muted"
              )}
            >
              <Trash2 size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Widget Content */}
      <div className="p-4 min-h-[120px]">
        {renderContent ? (
          renderContent(widget)
        ) : (
          <div
            className={clsx(
              "flex items-center justify-center h-full text-sm",
              inverted ? "text-text-disabled" : "text-text-disabled"
            )}
          >
            {widget.type.replace("_", " ")}
          </div>
        )}
      </div>
    </div>
  );
}

// =============================================================================
// WIDGET PALETTE COMPONENT
// =============================================================================

interface WidgetPaletteProps {
  onAddWidget: (type: WidgetType, size: WidgetSize) => void;
  inverted: boolean;
  isOpen: boolean;
  onClose: () => void;
}

function WidgetPalette({ onAddWidget, inverted, isOpen, onClose }: WidgetPaletteProps) {
  if (!isOpen) return null;

  return (
    <div
      className={clsx(
        "fixed inset-y-0 right-0 w-80 z-sidebar-backdrop border-l-2 shadow-xl overflow-y-auto",
        inverted ? "bg-surface-inverse border-border" : "bg-surface-primary border-border"
      )}
    >
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2
            className={clsx(
              "font-semibold text-lg",
              inverted ? "text-text-primary" : "text-text-primary"
            )}
          >
            Add Widget
          </h2>
          <button
            type="button"
            onClick={onClose}
            className={clsx(
              "p-1 rounded transition-colors",
              inverted
                ? "text-text-muted hover:text-text-primary hover:bg-surface-elevated"
                : "text-text-muted hover:text-text-primary hover:bg-muted"
            )}
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-2">
          {WIDGET_PALETTE.map((item) => (
            <button
              key={item.type}
              type="button"
              onClick={() => {
                onAddWidget(item.type, item.defaultSize);
                onClose();
              }}
              className={clsx(
                "w-full flex items-start gap-3 p-3 rounded-lg border-2 text-left transition-all",
                inverted
                  ? "bg-surface-elevated border-border hover:border-primary-500"
                  : "bg-muted border-border hover:border-primary-500"
              )}
            >
              <span
                className={clsx(
                  "p-2 rounded-lg",
                  inverted ? "bg-surface-inverse text-primary-400" : "bg-muted text-primary-600"
                )}
              >
                {item.icon}
              </span>
              <div>
                <div
                  className={clsx(
                    "font-medium text-sm",
                    inverted ? "text-text-primary" : "text-text-primary"
                  )}
                >
                  {item.label}
                </div>
                <div
                  className={clsx(
                    "text-xs",
                    inverted ? "text-text-disabled" : "text-text-disabled"
                  )}
                >
                  {item.description}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// WIDGET SETTINGS MODAL
// =============================================================================

interface WidgetSettingsProps {
  widget: WidgetConfig | null;
  dataSources: Array<{ id: string; label: string }>;
  onSave: (widget: WidgetConfig) => void;
  onClose: () => void;
  inverted: boolean;
}

function WidgetSettings({
  widget,
  dataSources,
  onSave,
  onClose,
  inverted,
}: WidgetSettingsProps) {
  const [title, setTitle] = useState(widget?.title || "");
  const [size, setSize] = useState<WidgetSize>(widget?.size || "medium");
  const [dataSource, setDataSource] = useState(widget?.dataSource || "");
  const [refreshInterval, setRefreshInterval] = useState(widget?.refreshInterval || 0);

  if (!widget) return null;

  const handleSave = () => {
    onSave({
      ...widget,
      title,
      size,
      dataSource,
      refreshInterval: refreshInterval > 0 ? refreshInterval : undefined,
    });
    onClose();
  };

  const footerContent = (
    <div className="flex justify-end gap-2">
      <button
        type="button"
        onClick={onClose}
        className={clsx(
          "px-4 py-2 rounded-lg border-2 font-medium transition-colors",
          inverted
            ? "border-border text-text-secondary hover:bg-surface-elevated"
            : "border-border text-text-muted hover:bg-muted"
        )}
      >
        Cancel
      </button>
      <button
        type="button"
        onClick={handleSave}
        className="px-4 py-2 rounded-lg bg-primary-600 text-white font-medium hover:bg-primary-700 transition-colors"
      >
        Save
      </button>
    </div>
  );

  return (
    <OverlayLayout
      type="modal"
      size="sm"
      open={true}
      onClose={onClose}
      title="Widget Settings"
      closeOnEscape
      closeOnBackdrop
      preventScroll
      animation="scale"
      inverted={inverted}
      showClose
      footerContent={footerContent}
      ariaLabel="Widget Settings"
    >
      <div className="space-y-4">
        {/* Title */}
        <div>
          <label
            className={clsx(
              "block text-sm font-medium mb-1",
              inverted ? "text-text-secondary" : "text-text-secondary"
            )}
          >
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={clsx(
              "w-full px-3 py-2 rounded-lg border-2 outline-none transition-colors",
              inverted
                ? "bg-surface-elevated border-border text-text-primary focus:border-primary-500"
                : "bg-surface-primary border-border text-text-primary focus:border-primary-500"
            )}
          />
        </div>

        {/* Size */}
        <div>
          <label
            className={clsx(
              "block text-sm font-medium mb-1",
              inverted ? "text-text-secondary" : "text-text-secondary"
            )}
          >
            Size
          </label>
          <select
            value={size}
            onChange={(e) => setSize(e.target.value as WidgetSize)}
            className={clsx(
              "w-full px-3 py-2 rounded-lg border-2 outline-none transition-colors",
              inverted
                ? "bg-surface-elevated border-border text-text-primary focus:border-primary-500"
                : "bg-surface-primary border-border text-text-primary focus:border-primary-500"
            )}
          >
            <option value="small">Small (1x1)</option>
            <option value="medium">Medium (2x1)</option>
            <option value="large">Large (2x2)</option>
            <option value="full">Full Width (4x1)</option>
          </select>
        </div>

        {/* Data Source */}
        <div>
          <label
            className={clsx(
              "block text-sm font-medium mb-1",
              inverted ? "text-text-secondary" : "text-text-secondary"
            )}
          >
            Data Source
          </label>
          <select
            value={dataSource}
            onChange={(e) => setDataSource(e.target.value)}
            className={clsx(
              "w-full px-3 py-2 rounded-lg border-2 outline-none transition-colors",
              inverted
                ? "bg-surface-elevated border-border text-text-primary focus:border-primary-500"
                : "bg-surface-primary border-border text-text-primary focus:border-primary-500"
            )}
          >
            <option value="">Select data source...</option>
            {dataSources.map((ds) => (
              <option key={ds.id} value={ds.id}>
                {ds.label}
              </option>
            ))}
          </select>
        </div>

        {/* Refresh Interval */}
        <div>
          <label
            className={clsx(
              "block text-sm font-medium mb-1",
              inverted ? "text-text-secondary" : "text-text-secondary"
            )}
          >
            Auto-refresh (seconds, 0 = disabled)
          </label>
          <input
            type="number"
            min="0"
            value={refreshInterval}
            onChange={(e) => setRefreshInterval(parseInt(e.target.value) || 0)}
            className={clsx(
              "w-full px-3 py-2 rounded-lg border-2 outline-none transition-colors",
              inverted
                ? "bg-surface-elevated border-border text-text-primary focus:border-primary-500"
                : "bg-surface-primary border-border text-text-primary focus:border-primary-500"
            )}
          />
        </div>
      </div>
    </OverlayLayout>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function DashboardBuilder({
  dashboard,
  onUpdate,
  onSave,
  onShare,
  onDuplicate,
  onSetDefault,
  renderWidget,
  dataSources = [],
  editMode = true,
  inverted = true,
  loading = false,
  className,
}: DashboardBuilderProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [editingWidget, setEditingWidget] = useState<WidgetConfig | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle drag start
  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  }, []);

  // Handle drag end
  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveId(null);

      if (!over || active.id === over.id) return;

      const oldIndex = dashboard.widgets.findIndex((w) => w.id === active.id);
      const newIndex = dashboard.widgets.findIndex((w) => w.id === over.id);

      if (oldIndex === -1 || newIndex === -1) return;

      const newWidgets = [...dashboard.widgets];
      const [removed] = newWidgets.splice(oldIndex, 1);
      newWidgets.splice(newIndex, 0, removed);

      onUpdate({ ...dashboard, widgets: newWidgets });
    },
    [dashboard, onUpdate]
  );

  // Add widget
  const handleAddWidget = useCallback(
    (type: WidgetType, size: WidgetSize) => {
      const newWidget: WidgetConfig = {
        id: `widget_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type,
        title: WIDGET_PALETTE.find((w) => w.type === type)?.label || "Widget",
        size,
        position: { x: 0, y: 0 },
        dataSource: "",
      };

      onUpdate({
        ...dashboard,
        widgets: [...dashboard.widgets, newWidget],
      });
    },
    [dashboard, onUpdate]
  );

  // Update widget
  const handleUpdateWidget = useCallback(
    (updatedWidget: WidgetConfig) => {
      const newWidgets = dashboard.widgets.map((w) =>
        w.id === updatedWidget.id ? updatedWidget : w
      );
      onUpdate({ ...dashboard, widgets: newWidgets });
    },
    [dashboard, onUpdate]
  );

  // Delete widget
  const handleDeleteWidget = useCallback(
    (widgetId: string) => {
      const newWidgets = dashboard.widgets.filter((w) => w.id !== widgetId);
      onUpdate({ ...dashboard, widgets: newWidgets });
    },
    [dashboard, onUpdate]
  );

  // Save dashboard
  const handleSave = useCallback(async () => {
    if (!onSave) return;
    setIsSaving(true);
    try {
      await onSave(dashboard);
    } finally {
      setIsSaving(false);
    }
  }, [dashboard, onSave]);

  // Find active widget for drag overlay
  const activeWidget = activeId
    ? dashboard.widgets.find((w) => w.id === activeId)
    : null;

  if (loading) {
    return (
      <div
        className={clsx(
          "flex items-center justify-center min-h-[400px]",
          inverted ? "bg-surface-inverse" : "bg-surface-primary",
          className
        )}
      >
        <div
          className={clsx(
            "w-8 h-8 border-3 rounded-full animate-spin",
            inverted ? "border-border border-t-on-dark-primary" : "border-border border-t-on-light-primary"
          )}
        />
      </div>
    );
  }

  return (
    <div className={clsx("relative", className)}>
      {/* Toolbar */}
      {editMode && (
        <div
          className={clsx(
            "flex items-center justify-between p-4 border-b-2 mb-4",
            inverted ? "border-border" : "border-border"
          )}
        >
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPaletteOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-600 text-white font-medium hover:bg-primary-700 transition-colors"
            >
              <Plus size={16} />
              Add Widget
            </button>
          </div>

          <div className="flex items-center gap-2">
            {onSetDefault && (
              <Tooltip content={dashboard.isDefault ? "Default dashboard" : "Set as default"} inverted={!inverted}>
                <button
                  type="button"
                  onClick={() => onSetDefault(dashboard)}
                  className={clsx(
                    "p-2 rounded-lg border-2 transition-colors",
                    dashboard.isDefault
                      ? "border-warning-500 text-warning-500"
                      : inverted
                      ? "border-border text-text-muted hover:text-warning-400"
                      : "border-border text-text-muted hover:text-warning-600"
                  )}
                  aria-label={dashboard.isDefault ? "Default dashboard" : "Set as default"}
                >
                  <Star size={16} fill={dashboard.isDefault ? "currentColor" : "none"} />
                </button>
              </Tooltip>
            )}
            {onDuplicate && (
              <Tooltip content="Duplicate dashboard" inverted={!inverted}>
                <button
                  type="button"
                  onClick={() => onDuplicate(dashboard)}
                  className={clsx(
                    "p-2 rounded-lg border-2 transition-colors",
                    inverted
                      ? "border-border text-text-muted hover:text-text-primary"
                      : "border-border text-text-muted hover:text-text-primary"
                  )}
                  aria-label="Duplicate dashboard"
                >
                  <Copy size={16} />
                </button>
              </Tooltip>
            )}
            {onShare && (
              <Tooltip content={dashboard.isPublic ? "Shared" : "Share dashboard"} inverted={!inverted}>
                <button
                  type="button"
                  onClick={() => onShare(dashboard)}
                  className={clsx(
                    "p-2 rounded-lg border-2 transition-colors",
                    dashboard.isPublic
                      ? "border-success-500 text-success-500"
                      : inverted
                      ? "border-border text-text-muted hover:text-text-primary"
                      : "border-border text-text-muted hover:text-text-primary"
                  )}
                  aria-label={dashboard.isPublic ? "Shared" : "Share dashboard"}
                >
                  <Share2 size={16} />
                </button>
              </Tooltip>
            )}
            {onSave && (
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-success-600 text-white font-medium hover:bg-success-700 transition-colors disabled:opacity-50"
              >
                <Save size={16} />
                {isSaving ? "Saving..." : "Save"}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Widget Grid */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={dashboard.widgets.map((w) => w.id)}
          strategy={rectSortingStrategy}
        >
          <div
            className={clsx(
              "grid grid-cols-4 gap-4 p-4",
              inverted ? "bg-surface-inverse" : "bg-muted"
            )}
          >
            {dashboard.widgets.length === 0 ? (
              <div
                className={clsx(
                  "col-span-4 flex flex-col items-center justify-center py-16 rounded-lg border-2 border-dashed",
                  inverted ? "border-border text-text-disabled" : "border-border text-text-disabled"
                )}
              >
                <p className="text-lg font-medium mb-2">No widgets yet</p>
                <p className="text-sm mb-4">Click Add Widget to get started</p>
                {editMode && (
                  <button
                    type="button"
                    onClick={() => setPaletteOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-600 text-white font-medium hover:bg-primary-700 transition-colors"
                  >
                    <Plus size={16} />
                    Add Widget
                  </button>
                )}
              </div>
            ) : (
              dashboard.widgets.map((widget) => (
                <SortableWidget
                  key={widget.id}
                  widget={widget}
                  editMode={editMode}
                  inverted={inverted}
                  onEdit={() => setEditingWidget(widget)}
                  onDelete={() => handleDeleteWidget(widget.id)}
                  renderContent={renderWidget}
                />
              ))
            )}
          </div>
        </SortableContext>

        {/* Drag Overlay */}
        <DragOverlay>
          {activeWidget && (
            <div
              className={clsx(
                "p-4 rounded-lg border-2 shadow-xl",
                SIZE_CLASSES[activeWidget.size],
                inverted
                  ? "bg-surface-elevated border-primary-500"
                  : "bg-surface-primary border-primary-500"
              )}
            >
              <div className="font-semibold text-sm">{activeWidget.title}</div>
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {/* Widget Palette */}
      <WidgetPalette
        onAddWidget={handleAddWidget}
        inverted={inverted}
        isOpen={paletteOpen}
        onClose={() => setPaletteOpen(false)}
      />

      {/* Widget Settings Modal */}
      {editingWidget && (
        <WidgetSettings
          widget={editingWidget}
          dataSources={dataSources}
          onSave={handleUpdateWidget}
          onClose={() => setEditingWidget(null)}
          inverted={inverted}
        />
      )}
    </div>
  );
}

export default DashboardBuilder;
