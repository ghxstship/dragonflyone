"use client";

import React, { useState, useCallback, useMemo } from "react";
import clsx from "clsx";
import { Upload, Download, Search } from "lucide-react";
import { DataGrid } from "../organisms/data-grid.js";
import { ImportExportDialog, type ExportFormat, type ColumnConfig, type ImportTemplate } from "../organisms/import-export-dialog.js";

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
  views?: Array<{ id: string; label: string; icon: "list" | "grid" | "kanban" | "calendar" | "gantt" | "table" }>;
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
}: ListPageProps<T>) {
  const [searchValue, setSearchValue] = useState("");
  const [activeFilters, setActiveFilters] = useState<Record<string, string | string[]>>({});
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc" | null>(null);
  
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
        </div>

        {/* Bulk Action Bar */}
        {selectedKeys.length > 0 && bulkActions.length > 0 && (
          <div className={clsx(
            "flex items-center justify-between px-spacing-4 py-spacing-3 mb-spacing-4",
            inverted ? "bg-white text-black" : "bg-black text-white"
          )}>
            <span className="font-code text-mono-md">
              <strong>{selectedKeys.length}</strong> selected
              <button onClick={() => setSelectedKeys([])} className={clsx("ml-spacing-4 bg-transparent border-none cursor-pointer underline", inverted ? "text-grey-600" : "text-grey-400")}>Clear</button>
            </span>
            <div className="flex gap-gap-xs">
              {bulkActions.map(action => (
                <button
                  key={action.id}
                  onClick={() => onBulkAction?.(action.id, selectedKeys)}
                  className={clsx(
                    "px-spacing-3 py-spacing-2 font-code text-mono-sm border-none cursor-pointer",
                    action.variant === "danger"
                      ? inverted ? "bg-grey-100 text-grey-700" : "bg-grey-800 text-grey-300"
                      : inverted ? "bg-grey-800 text-white" : "bg-grey-200 text-black"
                  )}
                >
                  {action.icon} {action.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Results count */}
        <div className={clsx("mb-spacing-4 font-code text-mono-sm", inverted ? "text-grey-500" : "text-grey-400")}>
          {filteredData.length} {filteredData.length === 1 ? "result" : "results"}
        </div>

        {/* DataGrid - Composing the feature-rich data grid component */}
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
