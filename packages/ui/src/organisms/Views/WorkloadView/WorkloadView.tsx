"use client";

import React, { useState, useCallback, useMemo, useRef, useEffect } from "react";
import clsx from "clsx";
import { Button } from "../../../atoms/Button/index.js";
import { Badge } from "../../../atoms/Badge/index.js";
import { Icon } from "../../../atoms/Icon/index.js";
import { Users, Calendar, BarChart3, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, MoreHorizontal, Plus, RefreshCw, Settings, Download, Filter, Search } from "lucide-react";
import type { 
  WorkloadViewProps, 
  WorkloadViewMode,
  WorkloadTimeRange,
  WorkloadUnit,
  WorkloadColorScheme,
  WorkloadItem,
  WorkloadAssignee,
  WorkloadGroup,
  WorkloadForecast,
  WorkloadRecommendation,
  WorkloadBalance,
  WorkloadStats
} from "./WorkloadView.types.js";
import type { BaseViewProps } from "../types.js";

/**
 * WORKLOAD VIEW
 * 
 * CHARACTERISTICS:
 * - Multiple view modes (bars, heatmap, calendar, table)
 * - Capacity visualization and warnings
 * - Workload forecasting
 * - Workload balancing suggestions
 * - Drag to reassign tasks
 * - Time range filtering
 * - Workload statistics and trends
 * - Assignee capacity management
 */
export function WorkloadView<T extends { id: string }>({
  entityIds,
  entitySelector,
  filters = [],
  sort = [],
  groupBy,
  searchQuery = "",
  visibleFields = [],
  density = "default",
  showSubtasks = true,
  showCompleted = true,
  colorBy,
  selectionMode = "none",
  selectedIds = [],
  onSelectionChange,
  onEntityClick,
  onEntityDoubleClick,
  onContextMenu,
  onEntityUpdate,
  onEntityCreate,
  onEntityDelete,
  onEntityReorder,
  isLoading = false,
  error = null,
  emptyState,
  config = {},
  assigneeField,
  nameField,
  workloadField,
  capacityField,
  typeField,
  statusField,
  priorityField,
  dueDateField,
  startDateField,
  endDateField,
  defaultView = "bars",
  defaultTimeRange = "week",
  enableCapacity = true,
  enableForecasting = false,
  enableBalancing = false,
  enableDragReassign = true,
  showPercentages = true,
  showCapacityLimits = true,
  showOverallocationWarnings = true,
  showTrends = false,
  compact = false,
  workloadUnit = "hours",
  assigneeRenderer,
  workloadBarRenderer,
  capacityRenderer,
  onAssigneeClick,
  onWorkloadItemClick,
  onReassign,
  onBalanceWorkloads,
  onTimeRangeChange,
  onViewModeChange,
  ...props
}: WorkloadViewProps<T>) {
  const [viewMode, setViewMode] = useState<WorkloadViewMode>(defaultView);
  const [timeRange, setTimeRange] = useState<WorkloadTimeRange>(defaultTimeRange);
  const [selectedAssignees, setSelectedAssignees] = useState<Set<string>>(new Set());
  const [draggedItem, setDraggedItem] = useState<{ id: string; assigneeId: string } | null>(null);
  const [hoveredAssignee, setHoveredAssignee] = useState<string | null>(null);
  const [searchQueryLocal, setSearchQueryLocal] = useState(searchQuery);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const workloadViewRef = useRef<HTMLDivElement>(null);

  // Workload configuration
  const workloadConfig = useMemo(() => ({
    barHeight: compact ? 24 : 32,
    capacityThreshold: 0.8,
    overallocationThreshold: 1.0,
    forecastDays: 30,
    colorScheme: 'capacity' as WorkloadColorScheme,
    animationDuration: 300,
    ...config,
  }), [compact, config]);

  // Resolve entities from IDs
  const entities = useMemo(() => {
    if (!entitySelector) return [];
    return entityIds.map(id => entitySelector(id)).filter(Boolean) as T[];
  }, [entityIds, entitySelector]);

  // Filter entities
  const filteredEntities = useMemo(() => {
    let filtered = entities;

    // Apply search filter
    if (searchQueryLocal) {
      filtered = filtered.filter(entity =>
        Object.values(entity).some(value =>
          String(value).toLowerCase().includes(searchQueryLocal.toLowerCase())
        )
      );
    }

    // Apply filters
    filters.forEach(filter => {
      if (filter.isActive) {
        filtered = filtered.filter(entity => {
          const value = entity[filter.field as keyof T];
          switch (filter.operator) {
            case 'equals':
              return value === filter.value;
            case 'contains':
              return String(value).toLowerCase().includes(String(filter.value).toLowerCase());
            case 'greater_than':
              return Number(value) > Number(filter.value);
            case 'less_than':
              return Number(value) < Number(filter.value);
            default:
              return true;
          }
        });
      }
    });

    return filtered;
  }, [entities, searchQueryLocal, filters]);

  // Convert entities to workload items
  const workloadItems = useMemo((): WorkloadItem<T>[] => {
    return filteredEntities.map(entity => {
      const assigneeData = entity[assigneeField] as any;
      const name = String(entity[nameField]);
      const workload = Number(entity[workloadField]);
      const capacity = capacityField ? Number(entity[capacityField]) : 40; // Default 40 hours/week
      const type = typeField ? String(entity[typeField]) : 'task';
      const status = statusField ? String(entity[statusField]) : 'active';
      const priority = priorityField ? String(entity[priorityField]) : 'medium';
      const dueDate = dueDateField ? new Date(entity[dueDateField] as string) : undefined;
      const startDate = startDateField ? new Date(entity[startDateField] as string) : undefined;
      const endDate = endDateField ? new Date(entity[endDateField] as string) : undefined;

      const assignee: WorkloadAssignee<T> = {
        data: assigneeData,
        id: assigneeData?.id || 'unknown',
        name: assigneeData?.name || 'Unassigned',
        email: assigneeData?.email,
        avatar: assigneeData?.avatar,
        role: assigneeData?.role,
        department: assigneeData?.department,
        totalWorkload: 0,
        totalCapacity: capacity,
        utilization: 0,
        availableCapacity: capacity,
        workloadItems: [],
        workloadByType: {},
        workloadByPriority: {},
        isAvailable: true,
        isOverallocated: false,
      };

      const isOverallocated = workload > capacity;
      const workloadPercentage = capacity > 0 ? (workload / capacity) * 100 : 0;

      return {
        data: entity,
        id: entity.id,
        name,
        assignee,
        workload,
        capacity,
        type,
        status,
        priority,
        dueDate,
        startDate,
        endDate,
        isOverallocated,
        isForecasted: false,
        workloadPercentage,
        color: getWorkloadColor(workloadPercentage, workloadConfig.colorScheme),
      };
    });
  }, [filteredEntities, assigneeField, nameField, workloadField, capacityField, typeField, statusField, priorityField, dueDateField, startDateField, endDateField, workloadConfig]);

  // Group by assignee
  const workloadAssignees = useMemo((): WorkloadAssignee<T>[] => {
    const assigneeMap = new Map<string, WorkloadAssignee<T>>();
    
    workloadItems.forEach(item => {
      const assigneeId = item.assignee.id;
      
      if (!assigneeMap.has(assigneeId)) {
        assigneeMap.set(assigneeId, { ...item.assignee });
      }
      
      const assignee = assigneeMap.get(assigneeId)!;
      assignee.workloadItems.push(item);
      assignee.totalWorkload += item.workload;
      assignee.workloadByType = assignee.workloadByType || {};
      assignee.workloadByPriority = assignee.workloadByPriority || {};
      assignee.workloadByType[item.type || 'unknown'] = (assignee.workloadByType[item.type || 'unknown'] || 0) + 1;
      assignee.workloadByPriority[item.priority || 'unknown'] = (assignee.workloadByPriority[item.priority || 'unknown'] || 0) + 1;
      
      // Update utilization
      assignee.utilization = (assignee.totalCapacity || 0) > 0 ? (assignee.totalWorkload / (assignee.totalCapacity || 0)) * 100 : 0;
      assignee.availableCapacity = (assignee.totalCapacity || 0) - assignee.totalWorkload;
      assignee.isOverallocated = assignee.totalWorkload > (assignee.totalCapacity || 0);
    });
    
    return Array.from(assigneeMap.values());
  }, [workloadItems]);

  // Calculate workload statistics
  const workloadStats = useMemo((): WorkloadStats => {
    const totalWorkload = workloadItems.reduce((sum, item) => sum + item.workload, 0);
    const totalCapacity = workloadAssignees.reduce((sum, assignee) => sum + (assignee.totalCapacity || 0), 0);
    const averageUtilization = totalCapacity > 0 ? (totalWorkload / totalCapacity) * 100 : 0;
    
    const overallocationCount = workloadAssignees.filter(a => a.isOverallocated).length;
    const underutilizationCount = workloadAssignees.filter(a => (a.utilization || 0) < 0.5).length;
    const optimalUtilizationCount = workloadAssignees.filter(a => (a.utilization || 0) >= 0.7 && (a.utilization || 0) <= 0.9).length;
    
    const distribution: {
      byAssignee: Record<string, number>;
      byType: Record<string, number>;
      byPriority: Record<string, number>;
      byStatus: Record<string, number>;
    } = {
      byAssignee: {},
      byType: {},
      byPriority: {},
      byStatus: {},
    };
    
    workloadItems.forEach(item => {
      distribution.byAssignee[item.assignee.name] = (distribution.byAssignee[item.assignee.name] || 0) + item.workload;
      distribution.byType[item.type || 'unknown'] = (distribution.byType[item.type || 'unknown'] || 0) + item.workload;
      distribution.byPriority[item.priority || 'unknown'] = (distribution.byPriority[item.priority || 'unknown'] || 0) + item.workload;
      distribution.byStatus[item.status || 'unknown'] = (distribution.byStatus[item.status || 'unknown'] || 0) + item.workload;
    });
    
    return {
      totalWorkload,
      totalCapacity,
      averageUtilization,
      overallocationCount,
      underutilizationCount,
      optimalUtilizationCount,
      distribution,
      forecastSummary: {
        nextPeriod: 0,
        trend: 'stable',
        confidence: 0,
      },
    };
  }, [workloadItems, workloadAssignees]);

  // Get workload color based on percentage and color scheme
  const getWorkloadColor = useCallback((percentage: number, scheme: WorkloadColorScheme) => {
    switch (scheme) {
      case 'capacity':
        if (percentage > 100) return 'var(--color-error)';
        if (percentage > 80) return 'var(--color-warning)';
        if (percentage > 60) return 'var(--color-brand-primary)';
        return 'var(--color-success)';
      case 'priority':
        if (percentage > 80) return 'var(--color-error)';
        if (percentage > 60) return 'var(--color-warning)';
        return 'var(--color-brand-primary)';
      case 'status':
        if (percentage > 80) return 'var(--color-error)';
        if (percentage > 60) return 'var(--color-warning)';
        return 'var(--color-brand-primary)';
      default:
        return 'var(--color-brand-primary)';
    }
  }, []);

  // View mode change handler
  const handleViewModeChange = useCallback((newViewMode: WorkloadViewMode) => {
    setViewMode(newViewMode);
    onViewModeChange?.(newViewMode);
  }, [onViewModeChange]);

  // Time range change handler
  const handleTimeRangeChange = useCallback((newTimeRange: WorkloadTimeRange) => {
    setTimeRange(newTimeRange);
    onTimeRangeChange?.(newTimeRange);
  }, [onTimeRangeChange]);

  // Assignee click handler
  const handleAssigneeClick = useCallback((assigneeId: string, event?: MouseEvent) => {
    const assignee = workloadAssignees.find(a => a.id === assigneeId);
    if (!assignee) return;
    
    if (event?.metaKey || event?.ctrlKey) {
      // Multi-select
      setSelectedAssignees(prev => {
        const next = new Set(prev);
        if (next.has(assigneeId)) {
          next.delete(assigneeId);
        } else {
          next.add(assigneeId);
        }
        return next;
      });
    } else {
      // Single select
      setSelectedAssignees(new Set([assigneeId]));
    }
    
    onAssigneeClick?.(assignee.data);
    onEntityClick?.(assigneeId);
  }, [workloadAssignees, onAssigneeClick, onEntityClick]);

  // Search handler
  const handleSearch = useCallback((query: string) => {
    setSearchQueryLocal(query);
  }, []);

  // Refresh handler
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      // Would trigger data refresh
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  // Render workload bar
  const renderWorkloadBar = useCallback((item: WorkloadItem<T>) => {
    if (workloadBarRenderer) {
      return workloadBarRenderer(item);
    }

    const percentage = item.workloadPercentage || 0;
    const isOverallocated = item.isOverallocated;
    const width = Math.min(percentage, 100);

    return (
      <div className="relative">
        <div
          className={clsx(
            "h-full rounded-full transition-all",
            isOverallocated && "bg-[var(--color-error)]",
            !isOverallocated && "bg-[var(--color-brand-primary)]"
          )}
          style={{ width: `${width}%` }}
        >
          {showPercentages && (
            <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white">
              {Math.round(percentage)}%
            </span>
          )}
        </div>
        
        {showCapacityLimits && (
          <div
            className="absolute top-0 right-0 h-full w-0.5 bg-[var(--color-border-input)]"
            style={{ left: `${Math.min(100, percentage)}%` }}
          />
        )}
      </div>
    );
  }, [workloadBarRenderer, showPercentages, showCapacityLimits, workloadConfig]);

  // Render assignee card
  const renderAssigneeCard = useCallback((assignee: WorkloadAssignee<T>) => {
    if (assigneeRenderer) {
      return assigneeRenderer(assignee);
    }

    const isSelected = selectedAssignees.has(assignee.id);
    const isHovered = hoveredAssignee === assignee.id;

    return (
      <div
        className={clsx(
          "bg-[var(--color-surface-primary)] border border-[var(--color-border-input)] rounded-lg p-4 cursor-pointer transition-all",
          isSelected && "ring-2 ring-[var(--color-brand-primary)]",
          isHovered && "shadow-lg",
          compact && "p-2"
        )}
        onClick={() => handleAssigneeClick(assignee.id)}
        onMouseEnter={() => setHoveredAssignee(assignee.id)}
        onMouseLeave={() => setHoveredAssignee(null)}
      >
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="flex-shrink-0">
            {assignee.avatar ? (
              <img
                src={assignee.avatar}
                alt={assignee.name}
                className="w-10 h-10 rounded-full"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-[var(--color-surface-elevated)] flex items-center justify-center">
                <Users className="w-5 h-5 text-[var(--color-text-muted)]" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-medium text-[var(--color-text-primary)] truncate">
                {assignee.name}
              </h3>
              {assignee.role && (
                <Badge variant="outline" size="sm">
                  {assignee.role}
                </Badge>
              )}
              {assignee.department && (
                <Badge variant="secondary" size="sm">
                  {assignee.department}
                </Badge>
              )}
            </div>

            {/* Workload bar */}
            <div className="mb-2">
              <div className="flex items-center justify-between text-xs text-[var(--color-text-muted)] mb-1">
                <span>Workload: {assignee.totalWorkload} {workloadUnit}</span>
                <span>Capacity: {assignee.totalCapacity} {workloadUnit}</span>
              </div>
              <div className="w-full bg-[var(--color-surface-elevated)] rounded-full h-2">
                <div
                  className={clsx(
                    "h-full rounded-full transition-all",
                    assignee.isOverallocated && "bg-[var(--color-error)]",
                    !assignee.isOverallocated && "bg-[var(--color-brand-primary)]"
                  )}
                  style={{ width: `${Math.min(100, assignee.utilization || 0)}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-[var(--color-text-muted)]">
                <span>Utilization: {Math.round(assignee.utilization || 0)}%</span>
                {showCapacityLimits && (
                  <span>Available: {assignee.availableCapacity} {workloadUnit}</span>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 text-xs text-[var(--color-text-muted)]">
              {showTrends && (
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-[var(--color-success)]" />
                  <span>+5%</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <span>Tasks: {assignee.workloadItems.length}</span>
              </div>
              {enableCapacity && (
                <div className="flex items-center gap-1">
                  {assignee.isOverallocated && (
                    <AlertTriangle className="w-3 h-3 text-[var(--color-error)]" />
                  )}
                  {assignee.isAvailable && (
                    <CheckCircle className="w-3 h-3 text-[var(--color-success)]" />
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex-shrink-0">
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }, [assigneeRenderer, showTrends, enableCapacity, showCapacityLimits, workloadUnit, selectedAssignees, hoveredAssignee, handleAssigneeClick]);

  // Empty state
  if (workloadItems.length === 0 && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="text-[var(--color-text-muted)] mb-4">
          <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium text-[var(--color-text-primary)] mb-2">
            {emptyState?.title || "No workload data found"}
          </h3>
          {emptyState?.description && (
            <p className="text-[var(--color-text-muted)] mb-4">
              {emptyState.description}
            </p>
          )}
          {emptyState?.action && (
            <Button onClick={emptyState.action.onClick}>
              {emptyState.action.label}
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-[var(--color-text-muted)]">Loading workload data...</div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center py-16 text-center">
        <div className="text-[var(--color-error-border)] mb-4">
          <h3 className="text-lg font-medium mb-2">Error loading workload data</h3>
          <p className="text-[var(--color-error-border)]">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-hidden" ref={workloadViewRef}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[var(--color-border-input)]">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'bars' ? 'solid' : 'outline'}
              size="sm"
              onClick={() => handleViewModeChange('bars')}
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Bars
            </Button>
            <Button
              variant={viewMode === 'heatmap' ? 'solid' : 'outline'}
              size="sm"
              onClick={() => handleViewModeChange('heatmap')}
            >
              <div className="w-4 h-4 mr-2" />
              Heatmap
            </Button>
            <Button
              variant={viewMode === 'calendar' ? 'solid' : 'outline'}
              size="sm"
              onClick={() => handleViewModeChange('calendar')}
            >
              <Calendar className="w-4 h-4 mr-2" />
              Calendar
            </Button>
            <Button
              variant={viewMode === 'table' ? 'solid' : 'outline'}
              size="sm"
              onClick={() => handleViewModeChange('table')}
            >
              <Settings className="w-4 h-4 mr-2" />
              Table
            </Button>
          </div>

          <select
            value={timeRange}
            onChange={(e) => handleTimeRangeChange(e.target.value as WorkloadTimeRange)}
            className="px-3 py-2 border border-[var(--color-border-input)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)]"
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          {true && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
              <input
                type="text"
                placeholder="Search workload..."
                value={searchQueryLocal}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 pr-4 py-2 border border-[var(--color-border-input)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)]"
              />
            </div>
          )}

          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={clsx("w-4 h-4", isRefreshing && "animate-spin")} />
          </Button>

          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>

          {enableBalancing && (
            <Button variant="solid" size="sm">
              <Users className="w-4 h-4 mr-2" />
              Balance
            </Button>
          )}

          <Button variant="outline" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Task
          </Button>
        </div>
      </div>

      {/* Workload stats */}
      <div className="flex items-center gap-6 px-4 py-2 border-b border-[var(--color-border-input)] bg-[var(--color-surface-elevated)]">
        <div className="flex items-center gap-2">
          <span className="text-sm text-[var(--color-text-muted)]">Total:</span>
          <Badge variant="secondary" size="sm">
            {workloadStats.totalWorkload} {workloadUnit}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-[var(--color-text-muted)]">Capacity:</span>
          <Badge variant="secondary" size="sm">
            {workloadStats.totalCapacity} {workloadUnit}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-[var(--color-text-muted)]">Utilization:</span>
          <Badge 
            variant={workloadStats.averageUtilization > 80 ? 'warning' : 'secondary'} 
            size="sm"
          >
            {Math.round(workloadStats.averageUtilization)}%
          </Badge>
        </div>
        {showOverallocationWarnings && workloadStats.overallocationCount > 0 && (
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-[var(--color-error)]" />
            <span className="text-sm text-[var(--color-error)]">
              {workloadStats.overallocationCount} overallocated
            </span>
          </div>
        )}
      </div>

      {/* Workload content */}
      <div className="overflow-auto" style={{ height: 'calc(100% - 140px)' }}>
        <div className="p-4">
          {viewMode === 'bars' && (
            <div className="space-y-4">
              {workloadAssignees.map(assignee => (
                <div key={assignee.id}>
                  {renderAssigneeCard(assignee)}
                  
                  {/* Workload items */}
                  <div className="ml-12 mt-2 space-y-2">
                    {assignee.workloadItems.map(item => (
                      <div key={item.id} className="flex items-center gap-2 text-sm">
                        <span className="text-[var(--color-text-muted)] w-20 truncate">
                          {item.name}
                        </span>
                        <div className="flex-1">
                          {renderWorkloadBar(item)}
                        </div>
                        <span className="text-xs text-[var(--color-text-muted)]">
                          {item.workload} {workloadUnit}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {viewMode === 'heatmap' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {workloadAssignees.map(assignee => (
                <div key={assignee.id} className="bg-[var(--color-surface-primary)] border border-[var(--color-border-input)] rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-4">
                    {assignee.avatar ? (
                      <img
                        src={assignee.avatar}
                        alt={assignee.name}
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-[var(--color-surface-elevated)] flex items-center justify-center">
                        <Users className="w-4 h-4 text-[var(--color-text-muted)]" />
                      </div>
                    )}
                    <div>
                      <h4 className="font-medium text-[var(--color-text-primary)]">
                        {assignee.name}
                      </h4>
                      <div className="text-sm text-[var(--color-text-muted)]">
                        {Math.round(assignee.utilization || 0)}% utilized
                      </div>
                    </div>
                  </div>

                  {/* Heatmap visualization */}
                  <div className="space-y-2">
                    {Object.entries(assignee.workloadByType || {}).map(([type, count]) => (
                      <div key={type} className="flex items-center gap-2">
                        <span className="text-xs text-[var(--color-text-muted)] w-20">
                          {type}
                        </span>
                        <div className="flex-1">
                          <div
                            className="h-2 rounded-full bg-[var(--color-brand-primary)]"
                            style={{ width: `${Math.min(100, (count / Math.max(...Object.values(assignee.workloadByType || {}))) * 100)}%` }}
                          />
                        </div>
                        <span className="text-xs text-[var(--color-text-muted)]">
                          {count} items
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {viewMode === 'table' && (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-medium text-[var(--color-text-primary)]">
                      Assignee
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-[var(--color-text-primary)]">
                      Workload
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-[var(--color-text-primary)]">
                      Capacity
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-[var(--color-text-primary)]">
                      Utilization
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-[var(--color-text-primary)]">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {workloadAssignees.map(assignee => (
                    <tr key={assignee.id}>
                      <td className="px-4 py-2">
                        <div className="flex items-center gap-2">
                          {assignee.avatar ? (
                            <img
                              src={assignee.avatar}
                              alt={assignee.name}
                              className="w-6 h-6 rounded-full"
                            />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-[var(--color-surface-elevated)] flex items-center justify-center">
                              <Users className="w-3 h-3 text-[var(--color-text-muted)]" />
                            </div>
                          )}
                          <div>
                            <div className="font-medium text-[var(--color-text-primary)]">
                              {assignee.name}
                            </div>
                            {assignee.role && (
                              <div className="text-xs text-[var(--color-text-muted)]">
                                {assignee.role}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-2">
                        <span className="text-sm text-[var(--color-text-primary)]">
                          {assignee.totalWorkload} {workloadUnit}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        <span className="text-sm text-[var(--color-text-primary)]">
                          {assignee.totalCapacity} {workloadUnit}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        <span className={clsx(
                          "text-sm font-medium",
                          assignee.utilization && assignee.utilization > 80 && "text-[var(--color-error)]",
                          assignee.utilization && assignee.utilization >= 60 && assignee.utilization <= 80 && "text-[var(--color-warning)]",
                          assignee.utilization && assignee.utilization < 60 && "text-[var(--color-success)]"
                        )}>
                          {Math.round(assignee.utilization || 0)}%
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        <Badge
                          variant={assignee.isOverallocated ? 'destructive' : 'secondary'}
                          size="sm"
                        >
                          {assignee.isOverallocated ? 'Overallocated' : 'Available'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {viewMode === 'calendar' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg: grid-cols-3 gap-4">
              {workloadAssignees.map(assignee => (
                <div key={assignee.id} className="bg-[var(--color-surface-primary)] border border-[var(--color-border-input)] rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-4">
                    {assignee.avatar ? (
                      <img
                        src={assignee.avatar}
                        alt={assignee.name}
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-[var(--color-surface-elevated)] flex items-center justify-center">
                        <Users className="w-4 h-4 text-[var(--color-text-muted)]" />
                      </div>
                    )}
                    <div>
                      <h4 className="font-medium text-[var(--color-text-primary)]">
                        {assignee.name}
                      </h4>
                      <div className="text-sm text-[var(--color-text-muted)]">
                        {Math.round(assignee.utilization || 0)}% utilized
                      </div>
                    </div>
                  </div>

                  {/* Calendar view */}
                  <div className="text-sm text-[var(--color-text-muted)]">
                    Calendar view would show daily/weekly workload distribution
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper function to get workload color based on percentage and color scheme
function getWorkloadColor(percentage: number, scheme: WorkloadColorScheme): string {
  switch (scheme) {
    case 'capacity':
      if (percentage > 100) return 'var(--color-error)';
      if (percentage > 80) return 'var(--color-warning)';
      if (percentage > 60) return 'var(--color-brand-primary)';
      return 'var(--color-success)';
    case 'priority':
      if (percentage > 80) return 'var(--color-error)';
      if (percentage > 60) return 'var(--color-warning)';
      return 'var(--color-brand-primary)';
    case 'status':
      if (percentage > 80) return 'var(--color-error)';
      if (percentage > 60) return 'var(--color-warning)';
      return 'var(--color-brand-primary)';
    default:
      return 'var(--color-brand-primary)';
  }
}
