/**
 * Table Component
 * Data table with sorting, selection, and custom rendering
 */

'use client';

import React, { forwardRef } from 'react';
import { Box } from '../../primitives/box';
import { Checkbox } from '../../primitives/checkbox';
import { Spinner } from '../../primitives/spinner';
import { Text } from '../../primitives/text';
import { cn } from '../../utils/cn';

export interface TableColumn<T = any> {
  /**
   * Column key
   */
  key: string;

  /**
   * Column header label
   */
  label: string;

  /**
   * Custom render function
   */
  render?: (value: any, row: T, index: number) => React.ReactNode;

  /**
   * Column width
   */
  width?: string;

  /**
   * Column alignment
   */
  align?: 'left' | 'center' | 'right';

  /**
   * Whether column is sortable
   */
  sortable?: boolean;
}

export interface TableProps<T = any> {
  /**
   * Table columns
   */
  columns: TableColumn<T>[];

  /**
   * Table data
   */
  data: T[];

  /**
   * Row key accessor
   */
  rowKey?: string | ((row: T) => string);

  /**
   * Whether table has striped rows
   */
  striped?: boolean;

  /**
   * Whether table has hover effect
   */
  hoverable?: boolean;

  /**
   * Whether table is loading
   */
  loading?: boolean;

  /**
   * Empty state message
   */
  emptyMessage?: string;

  /**
   * Whether table supports row selection
   */
  selectable?: boolean;

  /**
   * Selected row keys
   */
  selectedRowKeys?: string[];

  /**
   * Selection change handler
   */
  onSelectionChange?: (selectedKeys: string[]) => void;

  /**
   * Sort configuration
   */
  sortBy?: { key: string; direction: 'asc' | 'desc' };

  /**
   * Sort change handler
   */
  onSortChange?: (key: string, direction: 'asc' | 'desc') => void;

  /**
   * Row click handler
   */
  onRowClick?: (row: T, index: number) => void;

  /**
   * Size variant
   */
  size?: 'sm' | 'md' | 'lg';

  /**
   * Additional class names
   */
  className?: string;
}

const sizeStyles = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
};

const cellPaddingStyles = {
  sm: 'px-3 py-2',
  md: 'px-4 py-3',
  lg: 'px-6 py-4',
};

export const Table = forwardRef(function Table<T = any>(
  {
    columns,
    data,
    rowKey = 'id',
    striped = false,
    hoverable = true,
    loading = false,
    emptyMessage = 'No data',
    selectable = false,
    selectedRowKeys = [],
    onSelectionChange,
    sortBy,
    onSortChange,
    onRowClick,
    size = 'md',
    className,
  }: TableProps<T>,
  ref: React.ForwardedRef<HTMLTableElement>
) {
  const getRowKey = (row: T, index: number): string => {
    if (typeof rowKey === 'function') {
      return rowKey(row);
    }
    return (row as any)[rowKey] || String(index);
  };

  const isRowSelected = (row: T, index: number): boolean => {
    const key = getRowKey(row, index);
    return selectedRowKeys.includes(key);
  };

  const handleSelectAll = (checked: boolean) => {
    if (!onSelectionChange) return;

    if (checked) {
      const allKeys = data.map((row, index) => getRowKey(row, index));
      onSelectionChange(allKeys);
    } else {
      onSelectionChange([]);
    }
  };

  const handleSelectRow = (row: T, index: number, checked: boolean) => {
    if (!onSelectionChange) return;

    const key = getRowKey(row, index);
    if (checked) {
      onSelectionChange([...selectedRowKeys, key]);
    } else {
      onSelectionChange(selectedRowKeys.filter((k) => k !== key));
    }
  };

  const handleSort = (columnKey: string) => {
    if (!onSortChange) return;

    if (sortBy?.key === columnKey) {
      const newDirection = sortBy.direction === 'asc' ? 'desc' : 'asc';
      onSortChange(columnKey, newDirection);
    } else {
      onSortChange(columnKey, 'asc');
    }
  };

  const allSelected = data.length > 0 && selectedRowKeys.length === data.length;
  const someSelected = selectedRowKeys.length > 0 && !allSelected;

  return (
    <Box className={cn('w-full overflow-x-auto', className)}>
      <table ref={ref} className={cn('w-full border-collapse', sizeStyles[size])}>
        <thead className="bg-surface-secondary border-b border-border-primary">
          <tr>
            {selectable && (
              <th className={cn('text-left', cellPaddingStyles[size])}>
                <Checkbox
                  checked={allSelected}
                  indeterminate={someSelected}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  aria-label="Select all rows"
                />
              </th>
            )}
            {columns.map((column) => (
              <th
                key={column.key}
                className={cn(
                  'text-left font-semibold text-text-primary',
                  cellPaddingStyles[size],
                  column.align === 'center' && 'text-center',
                  column.align === 'right' && 'text-right',
                  column.sortable && 'cursor-pointer select-none hover:bg-surface-hover'
                )}
                style={{ width: column.width }}
                onClick={column.sortable ? () => handleSort(column.key) : undefined}
              >
                <div className="flex items-center gap-2">
                  <span>{column.label}</span>
                  {column.sortable && sortBy?.key === column.key && (
                    <span className="text-text-secondary">
                      {sortBy.direction === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td
                colSpan={columns.length + (selectable ? 1 : 0)}
                className={cn('text-center', cellPaddingStyles[size])}
              >
                <div className="flex items-center justify-center gap-2 py-8">
                  <Spinner size="md" />
                  <Text size="sm" className="text-text-secondary">
                    Loading...
                  </Text>
                </div>
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length + (selectable ? 1 : 0)}
                className={cn('text-center', cellPaddingStyles[size])}
              >
                <Text size="sm" className="text-text-secondary py-8">
                  {emptyMessage}
                </Text>
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => {
              const isSelected = isRowSelected(row, rowIndex);
              return (
                <tr
                  key={getRowKey(row, rowIndex)}
                  className={cn(
                    'border-b border-border-primary',
                    striped && rowIndex % 2 === 1 && 'bg-surface-secondary',
                    hoverable && 'hover:bg-surface-hover transition-colors',
                    onRowClick && 'cursor-pointer',
                    isSelected && 'bg-surface-selected'
                  )}
                  onClick={() => onRowClick?.(row, rowIndex)}
                >
                  {selectable && (
                    <td className={cellPaddingStyles[size]}>
                      <Checkbox
                        checked={isSelected}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleSelectRow(row, rowIndex, e.target.checked);
                        }}
                        aria-label={`Select row ${rowIndex + 1}`}
                      />
                    </td>
                  )}
                  {columns.map((column) => {
                    const value = (row as any)[column.key];
                    const content = column.render
                      ? column.render(value, row, rowIndex)
                      : value;

                    return (
                      <td
                        key={column.key}
                        className={cn(
                          'text-text-primary',
                          cellPaddingStyles[size],
                          column.align === 'center' && 'text-center',
                          column.align === 'right' && 'text-right'
                        )}
                      >
                        {content}
                      </td>
                    );
                  })}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </Box>
  );
}) as <T = any>(props: TableProps<T> & { ref?: React.ForwardedRef<HTMLTableElement> }) => React.ReactElement | null;
