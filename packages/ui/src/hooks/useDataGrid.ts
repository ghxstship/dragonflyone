"use client";

import { useState, useCallback, useMemo } from "react";

export interface UseDataGridOptions<T> {
  data: T[];
  rowKey: keyof T | ((row: T) => string);
  defaultSort?: { column: string; direction: "asc" | "desc" };
  defaultPageSize?: number;
  defaultFilters?: Record<string, string | string[]>;
}

export interface UseDataGridReturn<T> {
  // Data
  processedData: T[];
  totalCount: number;
  
  // Search
  searchValue: string;
  setSearchValue: (value: string) => void;
  
  // Sorting
  sortColumn: string | null;
  sortDirection: "asc" | "desc" | null;
  handleSort: (column: string) => void;
  
  // Selection
  selectedKeys: string[];
  setSelectedKeys: (keys: string[]) => void;
  selectAll: () => void;
  clearSelection: () => void;
  toggleSelection: (key: string) => void;
  isSelected: (key: string) => boolean;
  
  // Pagination
  page: number;
  pageSize: number;
  totalPages: number;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  
  // Filters
  filters: Record<string, string | string[]>;
  setFilter: (key: string, value: string | string[]) => void;
  clearFilters: () => void;
  activeFilterCount: number;
  
  // Utilities
  getRowKey: (row: T) => string;
  reset: () => void;
}

export function useDataGrid<T>({
  data,
  rowKey,
  defaultSort,
  defaultPageSize = 10,
  defaultFilters = {},
}: UseDataGridOptions<T>): UseDataGridReturn<T> {
  // State
  const [searchValue, setSearchValue] = useState("");
  const [sortColumn, setSortColumn] = useState<string | null>(defaultSort?.column ?? null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc" | null>(defaultSort?.direction ?? null);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [filters, setFilters] = useState<Record<string, string | string[]>>(defaultFilters);

  // Get row key helper
  const getRowKey = useCallback((row: T): string => {
    if (typeof rowKey === "function") return rowKey(row);
    return String(row[rowKey]);
  }, [rowKey]);

  // Active filter count
  const activeFilterCount = useMemo(() => {
    return Object.values(filters).reduce((count, value) => {
      if (Array.isArray(value)) return count + value.length;
      return count + (value ? 1 : 0);
    }, 0);
  }, [filters]);

  // Processed data (filtered, sorted, paginated)
  const processedData = useMemo(() => {
    let result = [...data];

    // Apply search (basic text search across all string fields)
    if (searchValue) {
      const searchLower = searchValue.toLowerCase();
      result = result.filter(row => {
        return Object.values(row as Record<string, unknown>).some(value => {
          if (typeof value === "string") {
            return value.toLowerCase().includes(searchLower);
          }
          return false;
        });
      });
    }

    // Apply sorting
    if (sortColumn && sortDirection) {
      result.sort((a, b) => {
        const aVal = (a as Record<string, unknown>)[sortColumn];
        const bVal = (b as Record<string, unknown>)[sortColumn];
        
        if (aVal === bVal) return 0;
        if (aVal === null || aVal === undefined) return 1;
        if (bVal === null || bVal === undefined) return -1;
        
        const comparison = aVal < bVal ? -1 : 1;
        return sortDirection === "asc" ? comparison : -comparison;
      });
    }

    return result;
  }, [data, searchValue, sortColumn, sortDirection]);

  // Paginated data
  const paginatedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return processedData.slice(start, start + pageSize);
  }, [processedData, page, pageSize]);

  // Total pages
  const totalPages = useMemo(() => {
    return Math.ceil(processedData.length / pageSize);
  }, [processedData.length, pageSize]);

  // Handlers
  const handleSort = useCallback((column: string) => {
    if (sortColumn === column) {
      if (sortDirection === "asc") {
        setSortDirection("desc");
      } else if (sortDirection === "desc") {
        setSortColumn(null);
        setSortDirection(null);
      }
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  }, [sortColumn, sortDirection]);

  const selectAll = useCallback(() => {
    setSelectedKeys(processedData.map(getRowKey));
  }, [processedData, getRowKey]);

  const clearSelection = useCallback(() => {
    setSelectedKeys([]);
  }, []);

  const toggleSelection = useCallback((key: string) => {
    setSelectedKeys(prev => {
      if (prev.includes(key)) {
        return prev.filter(k => k !== key);
      }
      return [...prev, key];
    });
  }, []);

  const isSelected = useCallback((key: string) => {
    return selectedKeys.includes(key);
  }, [selectedKeys]);

  const setFilter = useCallback((key: string, value: string | string[]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1); // Reset to first page when filtering
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
    setPage(1);
  }, []);

  const nextPage = useCallback(() => {
    if (page < totalPages) setPage(page + 1);
  }, [page, totalPages]);

  const prevPage = useCallback(() => {
    if (page > 1) setPage(page - 1);
  }, [page]);

  const handleSetPageSize = useCallback((size: number) => {
    setPageSize(size);
    setPage(1); // Reset to first page when changing page size
  }, []);

  const reset = useCallback(() => {
    setSearchValue("");
    setSortColumn(defaultSort?.column ?? null);
    setSortDirection(defaultSort?.direction ?? null);
    setSelectedKeys([]);
    setPage(1);
    setPageSize(defaultPageSize);
    setFilters(defaultFilters);
  }, [defaultSort, defaultPageSize, defaultFilters]);

  return {
    processedData: paginatedData,
    totalCount: processedData.length,
    searchValue,
    setSearchValue,
    sortColumn,
    sortDirection,
    handleSort,
    selectedKeys,
    setSelectedKeys,
    selectAll,
    clearSelection,
    toggleSelection,
    isSelected,
    page,
    pageSize,
    totalPages,
    setPage,
    setPageSize: handleSetPageSize,
    nextPage,
    prevPage,
    filters,
    setFilter,
    clearFilters,
    activeFilterCount,
    getRowKey,
    reset,
  };
}

export default useDataGrid;
