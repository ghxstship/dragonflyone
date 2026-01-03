"use client";

import React, { useState, useEffect, useRef } from "react";
import clsx from "clsx";
import {
  Search,
  Upload,
  Download,
  RefreshCw,
  Settings2,
  Filter,
  ChevronDown,
  X,
  List,
  LayoutGrid,
  Columns3,
  Calendar as CalendarIcon,
  GanttChart as GanttIcon,
  Table,
  Clock,
  MapPin,
  Image,
  MoreHorizontal,
  Keyboard,
  GripVertical,
} from "lucide-react";
import { Tooltip } from "../atoms/tooltip.js";
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

export type DensityMode = "compact" | "default" | "relaxed";

export type ViewIconType = "list" | "grid" | "kanban" | "calendar" | "gantt" | "table" | "timeline" | "map" | "gallery";

export interface ViewConfig {
  id: string;
  label: string;
  icon: ViewIconType;
}

export interface ColumnConfig {
  key: string;
  label: string;
  visible: boolean;
  locked?: boolean;
}

export interface ListPageToolbarProps {
  title: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filters?: Array<{
    key: string;
    label: string;
    options: { value: string; label: string }[];
  }>;
  activeFilters?: Record<string, string | string[]>;
  onFilterChange?: (key: string, value: string) => void;
  activeFilterCount?: number;
  onClearFilters?: () => void;
  views?: ViewConfig[];
  activeView?: string;
  onViewChange?: (viewId: string) => void;
  columns?: ColumnConfig[];
  onColumnsChange?: (columns: ColumnConfig[]) => void;
  density?: DensityMode;
  onDensityChange?: (density: DensityMode) => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  onImport?: () => void;
  onExport?: () => void;
  onCreate?: () => void;
  createLabel?: string;
  quickActions?: Array<{ id: string; label: string; icon?: React.ReactNode; onClick: () => void }>;
  savedFiltersSlot?: React.ReactNode;
  inverted?: boolean;
  className?: string;
}

const VIEW_ICONS = {
  list: List,
  grid: LayoutGrid,
  kanban: Columns3,
  calendar: CalendarIcon,
  gantt: GanttIcon,
  table: Table,
  timeline: Clock,
  map: MapPin,
  gallery: Image,
} as const;

interface SortableColumnItemProps {
  column: ColumnConfig;
  onToggle: (key: string) => void;
  inverted: boolean;
}

function SortableColumnItem({ column, onToggle, inverted }: SortableColumnItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: column.key, disabled: column.locked });

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
      {!column.locked && (
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
      )}
      {column.locked && <div className="w-5" />}
      <label className="flex items-center gap-2 flex-1 cursor-pointer">
        <input
          type="checkbox"
          checked={column.visible}
          onChange={() => onToggle(column.key)}
          disabled={column.locked}
          className="cursor-pointer accent-primary"
        />
        <span className={clsx("font-body text-body-sm", inverted ? "text-text-primary" : "text-text-primary")}>
          {column.label}
        </span>
      </label>
      {column.locked && (
        <span className={clsx("text-xs", inverted ? "text-text-disabled" : "text-text-muted")}>
          Locked
        </span>
      )}
    </div>
  );
}

interface TableSettingsPopoverProps {
  columns: ColumnConfig[];
  onColumnsChange: (columns: ColumnConfig[]) => void;
  density: DensityMode;
  onDensityChange: (density: DensityMode) => void;
  inverted: boolean;
  onClose: () => void;
}

function TableSettingsPopover({
  columns,
  onColumnsChange,
  density,
  onDensityChange,
  inverted,
  onClose,
}: TableSettingsPopoverProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = columns.findIndex((c) => c.key === active.id);
      const newIndex = columns.findIndex((c) => c.key === over.id);
      onColumnsChange(arrayMove(columns, oldIndex, newIndex));
    }
  };

  const handleToggle = (key: string) => {
    onColumnsChange(
      columns.map((c) => (c.key === key ? { ...c, visible: !c.visible } : c))
    );
  };

  const handleResetColumns = () => {
    onColumnsChange(columns.map((c) => ({ ...c, visible: true })));
  };

  const dropdownClass = inverted
    ? "bg-surface-inverse border-2 border-border"
    : "bg-surface-primary border-2 border-border";

  return (
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
          <span className={clsx("font-heading text-body-md font-semibold", inverted ? "text-text-primary" : "text-text-primary")}>
            Table Settings
          </span>
          <button
            type="button"
            onClick={onClose}
            className={clsx(
              "p-1 rounded-button",
              inverted ? "hover:bg-surface-elevated text-text-muted" : "hover:bg-muted text-text-muted"
            )}
          >
            <X className="size-4" />
          </button>
        </div>
      </div>

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
                    ? "border-on-dark-primary bg-surface-primary text-text-primary"
                    : "border-border-primary bg-surface-inverse text-text-primary"
                  : inverted
                    ? "border-border text-text-muted hover:border-on-dark-muted"
                    : "border-border text-text-muted hover:border-border-primary"
              )}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

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
              inverted ? "text-text-muted hover:text-text-primary" : "text-text-muted hover:text-text-primary"
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
              items={columns.map((c) => c.key)}
              strategy={verticalListSortingStrategy}
            >
              {columns.map((column) => (
                <SortableColumnItem
                  key={column.key}
                  column={column}
                  onToggle={handleToggle}
                  inverted={inverted}
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>
      </div>
    </div>
  );
}

interface OverflowMenuProps {
  items: Array<{ id: string; label: string; icon?: React.ReactNode; onClick: () => void }>;
  inverted: boolean;
}

function OverflowMenu({ items, inverted }: OverflowMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (items.length === 0) return null;

  const buttonClass = inverted
    ? "bg-transparent text-text-muted border-2 border-border hover:border-on-dark-muted"
    : "bg-transparent text-text-muted border-2 border-border hover:border-border-primary";

  const dropdownClass = inverted
    ? "bg-surface-inverse border-2 border-border"
    : "bg-surface-primary border-2 border-border";

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={clsx(
          "p-2 rounded-button transition-all duration-100",
          buttonClass
        )}
        aria-label="More actions"
        aria-expanded={isOpen}
      >
        <MoreHorizontal className="size-4" />
      </button>
      {isOpen && (
        <div
          className={clsx(
            "absolute right-0 top-full mt-2 min-w-48 rounded-card shadow-lg z-dropdown",
            dropdownClass
          )}
          role="menu"
        >
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              role="menuitem"
              onClick={() => {
                item.onClick();
                setIsOpen(false);
              }}
              className={clsx(
                "w-full px-4 py-3 flex items-center gap-3 text-left font-body text-body-sm",
                inverted
                  ? "hover:bg-surface-elevated text-text-primary"
                  : "hover:bg-muted text-text-primary"
              )}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function ListPageToolbar({
  title,
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search...",
  filters = [],
  activeFilters = {},
  onFilterChange,
  activeFilterCount = 0,
  onClearFilters,
  views = [],
  activeView = "list",
  onViewChange,
  columns = [],
  onColumnsChange,
  density = "default",
  onDensityChange,
  onRefresh,
  isRefreshing = false,
  onImport,
  onExport,
  onCreate,
  createLabel = "Create New",
  quickActions = [],
  savedFiltersSlot,
  inverted = true,
  className = "",
}: ListPageToolbarProps) {
  const [showSettings, setShowSettings] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);
  const filtersRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setShowSettings(false);
      }
      if (filtersRef.current && !filtersRef.current.contains(event.target as Node)) {
        setShowFilters(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        searchInputRef.current?.focus();
      }
      if (event.key === "r" && !event.metaKey && !event.ctrlKey && !event.shiftKey) {
        const target = event.target as HTMLElement;
        if (target.tagName !== "INPUT" && target.tagName !== "TEXTAREA" && !target.isContentEditable) {
          event.preventDefault();
          onRefresh?.();
        }
      }
      if ((event.metaKey || event.ctrlKey) && event.key === "n") {
        event.preventDefault();
        onCreate?.();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onRefresh, onCreate]);

  const primaryBtnClass = inverted
    ? "bg-surface-primary text-text-primary border-2 border-on-dark-primary shadow-primary hover:shadow-primary hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-100 rounded-button"
    : "bg-surface-inverse text-text-primary border-2 border-border-primary shadow-primary hover:shadow-primary hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-100 rounded-button";

  const secondaryBtnClass = inverted
    ? "bg-transparent text-text-muted border-2 border-border hover:border-on-dark-muted hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-100 rounded-button"
    : "bg-transparent text-text-muted border-2 border-border hover:border-border-primary hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-100 rounded-button";

  const iconBtnClass = inverted
    ? "p-2 bg-transparent text-text-muted border-2 border-border hover:border-on-dark-muted transition-all duration-100 rounded-button"
    : "p-2 bg-transparent text-text-muted border-2 border-border hover:border-border-primary transition-all duration-100 rounded-button";

  const overflowItems: Array<{ id: string; label: string; icon?: React.ReactNode; onClick: () => void }> = [];
  
  if (onImport) {
    overflowItems.push({
      id: "import",
      label: "Import",
      icon: <Upload className="size-4" />,
      onClick: onImport,
    });
  }
  if (onExport) {
    overflowItems.push({
      id: "export",
      label: "Export",
      icon: <Download className="size-4" />,
      onClick: onExport,
    });
  }
  overflowItems.push({
    id: "keyboard",
    label: "Keyboard Shortcuts",
    icon: <Keyboard className="size-4" />,
    onClick: () => {
      alert("Keyboard Shortcuts:\n\nCmd/Ctrl + K: Focus search\nCmd/Ctrl + N: Create new\nR: Refresh data");
    },
  });

  return (
    <div className={clsx("flex flex-col gap-4", className)}>
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex-1 min-w-64 relative">
          <label htmlFor="toolbar-search" className="sr-only">Search {title}</label>
          <input
            ref={searchInputRef}
            id="toolbar-search"
            type="search"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className={clsx(
              "w-full py-3 px-4 pl-10 pr-16 font-body text-body-md border-2 outline-none rounded-button",
              inverted
                ? "bg-surface-inverse text-text-primary border-border focus:border-on-dark-muted placeholder:text-text-disabled"
                : "bg-surface-primary text-text-primary border-border focus:border-border-primary placeholder:text-text-muted"
            )}
          />
          <Search
            className={clsx(
              "absolute left-3 top-1/2 -translate-y-1/2 size-4",
              inverted ? "text-text-disabled" : "text-text-muted"
            )}
          />
          <kbd
            className={clsx(
              "absolute right-3 top-1/2 -translate-y-1/2 px-2 py-0.5 rounded text-xs font-mono",
              inverted ? "bg-surface-elevated text-text-disabled" : "bg-muted text-text-muted"
            )}
          >
            ⌘K
          </kbd>
        </div>

        {filters.length > 0 && (
          <div ref={filtersRef} className="relative">
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={clsx(
                "flex items-center gap-2 px-4 py-3 font-code text-mono-sm",
                secondaryBtnClass,
                activeFilterCount > 0 && "border-primary text-primary"
              )}
            >
              <Filter className="size-4" />
              Filters
              {activeFilterCount > 0 && (
                <span className="px-1.5 py-0.5 text-xs font-bold bg-primary text-white rounded-full">
                  {activeFilterCount}
                </span>
              )}
              <ChevronDown className={clsx("size-3 transition-transform", showFilters && "rotate-180")} />
            </button>
            {showFilters && (
              <div
                className={clsx(
                  "absolute left-0 top-full mt-2 min-w-64 rounded-card shadow-lg z-dropdown p-4",
                  inverted ? "bg-surface-inverse border-2 border-border" : "bg-surface-primary border-2 border-border"
                )}
              >
                {filters.map((filter) => (
                  <div key={filter.key} className="mb-4 last:mb-0">
                    <label
                      htmlFor={`filter-${filter.key}`}
                      className={clsx(
                        "block font-code text-mono-xs uppercase tracking-wider mb-2",
                        inverted ? "text-text-disabled" : "text-text-muted"
                      )}
                    >
                      {filter.label}
                    </label>
                    <select
                      id={`filter-${filter.key}`}
                      value={String(activeFilters[filter.key] || "")}
                      onChange={(e) => onFilterChange?.(filter.key, e.target.value)}
                      className={clsx(
                        "w-full px-3 py-2 font-body text-body-sm border-2 rounded-button outline-none",
                        inverted
                          ? "bg-surface-elevated text-text-primary border-border focus:border-on-dark-muted"
                          : "bg-surface-primary text-text-primary border-border focus:border-border-primary"
                      )}
                    >
                      <option value="">All</option>
                      {filter.options.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
                {activeFilterCount > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      onClearFilters?.();
                      setShowFilters(false);
                    }}
                    className={clsx(
                      "w-full mt-2 px-3 py-2 font-code text-mono-sm rounded-button border-2",
                      inverted
                        ? "border-border text-text-muted hover:border-on-dark-muted"
                        : "border-border text-text-muted hover:border-border-primary"
                    )}
                  >
                    Clear All Filters
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {savedFiltersSlot}

        <div className="flex items-center gap-2 ml-auto">
          {views.length > 1 && (
            <div
              className={clsx(
                "flex items-center gap-1 border-2 rounded-lg p-1",
                inverted ? "border-border bg-surface-inverse" : "border-border bg-muted"
              )}
              role="tablist"
              aria-label="View options"
            >
              {views.map((view) => {
                const isActive = activeView === view.id;
                const ViewIcon = VIEW_ICONS[view.icon] || List;
                return (
                  <Tooltip key={view.id} content={view.label} inverted={!inverted}>
                    <button
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      aria-label={`${view.label} view`}
                      onClick={() => onViewChange?.(view.id)}
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
                      <ViewIcon size={16} />
                    </button>
                  </Tooltip>
                );
              })}
            </div>
          )}

          {onRefresh && (
            <Tooltip content={<span>Refresh <kbd className="ml-1 px-1 py-0.5 bg-surface-overlay rounded text-xs">R</kbd></span>} inverted={!inverted}>
              <button
                type="button"
                onClick={onRefresh}
                disabled={isRefreshing}
                className={clsx(iconBtnClass, isRefreshing && "animate-spin")}
                aria-label="Refresh data"
              >
                <RefreshCw className="size-4" />
              </button>
            </Tooltip>
          )}

          {(columns.length > 0 || onDensityChange) && (
            <div ref={settingsRef} className="relative">
              <button
                type="button"
                onClick={() => setShowSettings(!showSettings)}
                className={iconBtnClass}
                aria-label="Table settings"
                aria-expanded={showSettings}
              >
                <Settings2 className="size-4" />
              </button>
              {showSettings && onColumnsChange && onDensityChange && (
                <TableSettingsPopover
                  columns={columns}
                  onColumnsChange={onColumnsChange}
                  density={density}
                  onDensityChange={onDensityChange}
                  inverted={inverted}
                  onClose={() => setShowSettings(false)}
                />
              )}
            </div>
          )}

          <div className="hidden md:flex items-center gap-2">
            {onImport && (
              <button
                type="button"
                onClick={onImport}
                className={clsx("px-4 py-2 font-code text-mono-sm flex items-center gap-2", secondaryBtnClass)}
                aria-label={`Import ${title}`}
              >
                <Upload className="size-4" />
                Import
              </button>
            )}
            {onExport && (
              <button
                type="button"
                onClick={onExport}
                className={clsx("px-4 py-2 font-code text-mono-sm flex items-center gap-2", secondaryBtnClass)}
                aria-label={`Export ${title}`}
              >
                <Download className="size-4" />
                Export
              </button>
            )}
          </div>

          <div className="md:hidden">
            <OverflowMenu items={overflowItems} inverted={inverted} />
          </div>

          {quickActions.map((action) => (
            <button
              key={action.id}
              type="button"
              onClick={action.onClick}
              className={clsx("px-4 py-2 font-code text-mono-sm flex items-center gap-2", secondaryBtnClass)}
            >
              {action.icon}
              {action.label}
            </button>
          ))}

          {onCreate && (
            <Tooltip content={<span>Create <kbd className="ml-1 px-1 py-0.5 bg-surface-overlay rounded text-xs">⌘N</kbd></span>} inverted={!inverted}>
              <button
                type="button"
                onClick={onCreate}
                className={clsx(
                  "px-6 py-3 font-heading text-body-md tracking-wider uppercase leading-none flex items-center gap-2",
                  primaryBtnClass
                )}
                aria-label={`Create new ${title.toLowerCase()}`}
              >
                + {createLabel}
              </button>
            </Tooltip>
          )}
        </div>
      </div>
    </div>
  );
}

export default ListPageToolbar;
