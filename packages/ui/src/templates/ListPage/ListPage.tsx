'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { Upload, Download, Search, Filter, RefreshCw, Settings2 } from 'lucide-react';
import { listPageVariants, listPageHeaderVariants, listPageContentVariants } from './ListPage.variants.js';
import type { ListPageProps } from './ListPage.types.js';

export function ListPage<T = unknown>({
  items,
  columns,
  bulkActions = [],
  loading = false,
  emptyState,
  errorState,
  searchPlaceholder = 'Search...',
  enableSearch = true,
  enableFilters = false,
  enableImportExport = false,
  onSelectionChange,
  onSearch,
  pagination,
  className,
}: ListPageProps<T>) {
  const [selectedItems, setSelectedItems] = useState<T[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Handle selection change
  const handleSelectionChange = useCallback((newSelection: T[]) => {
    setSelectedItems(newSelection);
    onSelectionChange?.(newSelection);
  }, [onSelectionChange]);

  // Handle search
  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
    onSearch?.(query);
  }, [onSearch]);

  // Filter items based on search
  const filteredItems = useMemo(() => {
    if (!searchQuery) return items;
    return items.filter((item) => {
      // Simple search implementation - can be enhanced
      return JSON.stringify(item).toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [items, searchQuery]);

  return (
    <div className={listPageVariants({ className })}>
      {/* Header */}
      <div className={listPageHeaderVariants()}>
        <div className="flex items-center gap-4 flex-1">
          {/* Search */}
          {enableSearch && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSearchChange(e.target.value)}
                className="pl-10 pr-4 py-2 border-2 rounded-[var(--radius-button)] border-border bg-surface-primary text-text-primary placeholder-text-text-muted focus:border-primary focus:outline-none"
              />
            </div>
          )}

          {/* Filters */}
          {enableFilters && (
            <button className="flex items-center gap-2 px-3 py-2 border-2 rounded-[var(--radius-button)] border-border hover:border-primary transition-colors">
              <Filter className="w-4 h-4" />
              Filters
            </button>
          )}

          {/* Import/Export */}
          {enableImportExport && (
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-2 px-3 py-2 border-2 rounded-[var(--radius-button)] border-border hover:border-primary transition-colors">
                <Upload className="w-4 h-4" />
                Import
              </button>
              <button className="flex items-center gap-2 px-3 py-2 border-2 rounded-[var(--radius-button)] border-border hover:border-primary transition-colors">
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Refresh */}
          <button className="p-2 border-2 rounded-[var(--radius-button)] border-border hover:border-primary transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* Settings */}
          <button className="p-2 border-2 rounded-[var(--radius-button)] border-border hover:border-primary transition-colors">
            <Settings2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className={listPageContentVariants()}>
        {/* Bulk Actions Bar */}
        {selectedItems.length > 0 && bulkActions.length > 0 && (
          <div className="flex items-center gap-2 p-4 border-b-2 border-border bg-surface-elevated">
            <span className="text-sm text-text-muted">{selectedItems.length} selected</span>
            {bulkActions.map((action) => (
              <button
                key={action.id}
                onClick={() => action.onClick(selectedItems)}
                disabled={typeof action.disabled === 'function' ? action.disabled(selectedItems) : action.disabled}
                className="px-3 py-1 text-sm border-2 rounded-[var(--radius-button)] border-border hover:border-primary transition-colors disabled:opacity-50"
              >
                {action.label}
              </button>
            ))}
            <button
              onClick={() => handleSelectionChange([])}
              className="px-3 py-1 text-sm border-2 rounded-[var(--radius-button)] border-border hover:border-danger transition-colors"
            >
              Clear
            </button>
          </div>
        )}

        {/* Data Display */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : errorState ? (
          <div className="flex items-center justify-center h-64">
            {errorState}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            {emptyState || <div className="text-text-muted">No items found</div>}
          </div>
        ) : (
          <div className="p-4">
            <div className="text-sm text-text-muted">
              {filteredItems.length} items found
              {pagination && ` (Page ${pagination.page} of ${Math.ceil(pagination.total / pagination.pageSize)})`}
            </div>
            
            {/* Simple table display - can be enhanced with DataGrid */}
            <div className="mt-4 border-2 border-border rounded-[var(--radius-card)]">
              <table className="w-full">
                <thead className="bg-surface-elevated border-b-2 border-border">
                  <tr>
                    {columns.map((col) => (
                      <th key={col.id} className="px-4 py-2 text-left text-sm font-medium text-text-primary border-r border-border">
                        {col.header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.slice(
                    (pagination?.page ? pagination.page - 1 : 0) * (pagination?.pageSize || 10),
                    ((pagination?.page ? pagination.page - 1 : 0) * (pagination?.pageSize || 10)) + (pagination?.pageSize || 10)
                  ).map((item, index) => (
                    <tr key={index} className="border-b border-border hover:bg-surface-elevated">
                      {columns.map((col) => (
                        <td key={col.id} className="px-4 py-2 text-sm text-text-secondary border-r border-border">
                          {col.render ? col.render(item[col.accessor as keyof T], item) : String(item[col.accessor as keyof T] || '')}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ListPage;
