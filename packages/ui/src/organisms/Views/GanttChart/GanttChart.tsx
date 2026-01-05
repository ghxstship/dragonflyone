"use client";

import React, { useState, useCallback, useMemo, useRef, useEffect } from "react";
import clsx from "clsx";
import { Button, Badge, Icon } from "../../../index.js";
import { ChevronLeft, ChevronRight, Calendar, Users, Flag, MoreHorizontal, Plus, ZoomIn, ZoomOut, Maximize2, Minimize2 } from "lucide-react";
import type { 
  GanttChartProps, 
  GanttViewMode,
  GanttTask,
  GanttMilestone,
  GanttDependency,
  GanttTimeline,
  GanttRow,
  GanttColumn,
  GanttChartState,
  GanttTimelineCell,
  GanttGridLine
} from "./GanttChart.types.js";
import type { BaseViewProps } from "../types.js";

/**
 * GANTT CHART VIEW
 * 
 * CHARACTERISTICS:
 * - Timeline-based task visualization
 * - Drag to reschedule tasks
 * - Drag to extend task duration
 * - Task dependency linking
 * - Critical path highlighting
 * - Progress tracking
 * - Milestone markers
 * - Baseline comparison
 * - Resource allocation view
 */
export function GanttChart<T extends { id: string }>({
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
  startDateField,
  endDateField,
  progressField,
  dependenciesField,
  assigneeField,
  priorityField,
  statusField,
  colorField,
  parentField,
  levelField,
  defaultView = "month",
  enableDragReschedule = true,
  enableDragResize = true,
  enableTaskLinking = true,
  enableTaskCollapse = true,
  enableCriticalPath = false,
  enableBaseline = false,
  enableTodayIndicator = true,
  enableWeekendHighlight = true,
  enableGridLines = true,
  taskRenderer,
  milestoneRenderer,
  dependencyRenderer,
  onTaskClick,
  onTaskDoubleClick,
  onTaskContextMenu,
  onDependencyClick,
  onNavigate,
  onViewChange,
  onZoomChange,
  enableDateSelection = false,
  selectedRange,
  onDateSelect,
  workingHours,
  ...props
}: GanttChartProps<T>) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<GanttViewMode>(defaultView);
  const [zoom, setZoom] = useState(1);
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  const [draggedTask, setDraggedTask] = useState<{ id: string; type: 'move' | 'resize'; edge?: 'start' | 'end' } | null>(null);
  const [hoveredTask, setHoveredTask] = useState<string | null>(null);
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set(selectedIds));
  const [scrollPosition, setScrollPosition] = useState({ left: 0, top: 0 });
  const [isLinking, setIsLinking] = useState(false);
  const [linkingFrom, setLinkingFrom] = useState<string | null>(null);
  const chartRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  // Gantt configuration
  const ganttConfig = useMemo(() => ({
    firstDayOfWeek: 0,
    locale: 'en-US',
    timeZone: 'UTC',
    height: '600px',
    rowHeight: 40,
    barHeight: 24,
    minZoom: 0.5,
    maxZoom: 3,
    snapToGrid: true,
    gridStep: 1, // hours
    ...config,
  }), [config]);

  // Resolve entities from IDs
  const entities = useMemo(() => {
    if (!entitySelector) return [];
    return entityIds.map(id => entitySelector(id)).filter(Boolean) as T[];
  }, [entityIds, entitySelector]);

  // Filter entities
  const filteredEntities = useMemo(() => {
    let filtered = entities;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(entity =>
        Object.values(entity).some(value =>
          String(value).toLowerCase().includes(searchQuery.toLowerCase())
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
  }, [entities, searchQuery, filters]);

  // Convert entities to Gantt tasks
  const ganttTasks = useMemo((): GanttTask<T>[] => {
    const taskMap = new Map<string, GanttTask<T>>();
    
    // First pass: create all tasks
    filteredEntities.forEach(entity => {
      const startDate = new Date(entity[startDateField] as string);
      const endDate = new Date(entity[endDateField] as string);
      const progress = progressField ? Number(entity[progressField]) : 0;
      const dependencies = dependenciesField ? (entity[dependenciesField] as string[]) : [];
      const assignee = assigneeField ? String(entity[assigneeField]) : undefined;
      const priority = priorityField ? String(entity[priorityField]) as any : undefined;
      const status = statusField ? String(entity[statusField]) as any : undefined;
      const color = colorField ? String(entity[colorField]) : undefined;
      const parent = parentField ? String(entity[parentField]) : undefined;
      const level = levelField ? Number(entity[levelField]) : 0;
      
      const task: GanttTask<T> = {
        data: entity,
        id: entity.id,
        name: String((entity as any).name || (entity as any).title || 'Untitled'),
        start: startDate,
        end: endDate,
        progress,
        dependencies,
        assignee,
        priority,
        status,
        color,
        parent,
        level,
        collapsed: !expandedTasks.has(entity.id),
        milestone: startDate.getTime() === endDate.getTime(),
        critical: false, // Would be calculated based on dependencies
        isDragging: draggedTask?.id === entity.id,
        selected: selectedTasks.has(entity.id),
        children: [],
      };
      
      taskMap.set(entity.id, task);
    });
    
    // Second pass: build hierarchy
    taskMap.forEach((task, id) => {
      if (task.parent && taskMap.has(task.parent)) {
        const parent = taskMap.get(task.parent)!;
        parent.children?.push(task);
      }
    });
    
    // Return top-level tasks (those without parents or with collapsed parents)
    return Array.from(taskMap.values()).filter(task => 
      !task.parent || !taskMap.has(task.parent) || expandedTasks.has(task.parent)
    );
  }, [filteredEntities, startDateField, endDateField, progressField, dependenciesField, assigneeField, priorityField, statusField, colorField, parentField, levelField, expandedTasks, draggedTask, selectedTasks]);

  // Generate timeline data
  const timeline = useMemo((): GanttTimeline => {
    const start = new Date(currentDate);
    const end = new Date(currentDate);
    
    // Adjust date range based on view mode and zoom
    switch (viewMode) {
      case 'day':
        start.setDate(start.getDate() - 7);
        end.setDate(end.getDate() + 7);
        break;
      case 'week':
        start.setDate(start.getDate() - 14);
        end.setDate(end.getDate() + 14);
        break;
      case 'month':
        start.setMonth(start.getMonth() - 2);
        end.setMonth(end.getMonth() + 2);
        break;
      case 'quarter':
        start.setMonth(start.getMonth() - 6);
        end.setMonth(end.getMonth() + 6);
        break;
      case 'year':
        start.setFullYear(start.getFullYear() - 2);
        end.setFullYear(end.getFullYear() + 2);
        break;
    }
    
    // Apply zoom
    const duration = end.getTime() - start.getTime();
    const zoomedDuration = duration / zoom;
    const zoomedEnd = new Date(start.getTime() + zoomedDuration);
    
    // Generate timeline cells
    const cells: GanttTimelineCell[] = [];
    const gridLines: GanttGridLine[] = [];
    
    // Generate cells based on view mode
    const cellGenerator = getCellGenerator(viewMode, start, zoomedEnd, ganttConfig);
    cells.push(...cellGenerator.cells);
    gridLines.push(...cellGenerator.gridLines);
    
    // Calculate today position
    const todayPosition = enableTodayIndicator ? calculatePosition(new Date(), start, zoomedEnd) : undefined;
    
    return {
      start,
      end: zoomedEnd,
      zoom,
      viewMode,
      cells,
      todayPosition,
      gridLines,
    };
  }, [currentDate, viewMode, zoom, enableTodayIndicator, ganttConfig]);

  // Generate rows
  const rows = useMemo((): GanttRow[] => {
    const result: GanttRow[] = [];
    let index = 0;
    
    const addTaskRows = (tasks: GanttTask<T>[], level: number = 0) => {
      tasks.forEach(task => {
        result.push({
          index: index++,
          task,
          height: ganttConfig.rowHeight,
          top: index * ganttConfig.rowHeight,
          visible: true,
          expanded: expandedTasks.has(task.id),
          level,
        });
        
        if (task.children && expandedTasks.has(task.id)) {
          addTaskRows(task.children, level + 1);
        }
      });
    };
    
    addTaskRows(ganttTasks);
    return result;
  }, [ganttTasks, expandedTasks, ganttConfig.rowHeight]);

  // Calculate task positions
  const calculateTaskPosition = useCallback((task: GanttTask<T>) => {
    const left = calculatePosition(task.start, timeline.start, timeline.end);
    const width = calculatePosition(task.end, timeline.start, timeline.end) - left;
    return { left, width };
  }, [timeline]);

  // Navigation handlers
  const handleNavigate = useCallback((direction: 'prev' | 'next' | 'today') => {
    const newDate = new Date(currentDate);
    
    switch (direction) {
      case 'prev':
        switch (viewMode) {
          case 'day':
            newDate.setDate(newDate.getDate() - 1);
            break;
          case 'week':
            newDate.setDate(newDate.getDate() - 7);
            break;
          case 'month':
            newDate.setMonth(newDate.getMonth() - 1);
            break;
          case 'quarter':
            newDate.setMonth(newDate.getMonth() - 3);
            break;
          case 'year':
            newDate.setFullYear(newDate.getFullYear() - 1);
            break;
        }
        break;
      case 'next':
        switch (viewMode) {
          case 'day':
            newDate.setDate(newDate.getDate() + 1);
            break;
          case 'week':
            newDate.setDate(newDate.getDate() + 7);
            break;
          case 'month':
            newDate.setMonth(newDate.getMonth() + 1);
            break;
          case 'quarter':
            newDate.setMonth(newDate.getMonth() + 3);
            break;
          case 'year':
            newDate.setFullYear(newDate.getFullYear() + 1);
            break;
        }
        break;
      case 'today':
        newDate.setTime(Date.now());
        break;
    }
    
    setCurrentDate(newDate);
    onNavigate?.(direction);
  }, [currentDate, viewMode, onNavigate]);

  // View mode change handler
  const handleViewChange = useCallback((newViewMode: GanttViewMode) => {
    setViewMode(newViewMode);
    onViewChange?.(newViewMode);
  }, [onViewChange]);

  // Zoom handlers
  const handleZoomIn = useCallback(() => {
    const newZoom = Math.min(zoom * 1.2, ganttConfig.maxZoom);
    setZoom(newZoom);
    onZoomChange?.(newZoom);
  }, [zoom, ganttConfig.maxZoom, onZoomChange]);

  const handleZoomOut = useCallback(() => {
    const newZoom = Math.max(zoom / 1.2, ganttConfig.minZoom);
    setZoom(newZoom);
    onZoomChange?.(newZoom);
  }, [zoom, ganttConfig.minZoom, onZoomChange]);

  // Task collapse/expand handlers
  const toggleTaskCollapse = useCallback((taskId: string) => {
    setExpandedTasks(prev => {
      const next = new Set(prev);
      if (next.has(taskId)) {
        next.delete(taskId);
      } else {
        next.add(taskId);
      }
      return next;
    });
  }, []);

  // Task drag handlers
  const handleTaskDragStart = useCallback((taskId: string, type: 'move' | 'resize', edge?: 'start' | 'end') => {
    if (!enableDragReschedule && type === 'move') return;
    if (!enableDragResize && type === 'resize') return;
    
    setDraggedTask({ id: taskId, type, edge });
  }, [enableDragReschedule, enableDragResize]);

  const handleTaskDrag = useCallback((newDate: Date, edge?: 'start' | 'end') => {
    if (!draggedTask || !onEntityUpdate) return;
    
    const task = ganttTasks.find(t => t.id === draggedTask.id);
    if (!task) return;
    
    const updates: Partial<T> = {};
    
    if (draggedTask.type === 'move') {
      const duration = task.end.getTime() - task.start.getTime();
      (updates as any)[startDateField] = newDate.toISOString();
      (updates as any)[endDateField] = new Date(newDate.getTime() + duration).toISOString();
    } else if (draggedTask.type === 'resize') {
      if (edge === 'start') {
        (updates as any)[startDateField] = newDate.toISOString();
        if (newDate > task.end) {
          (updates as any)[endDateField] = newDate.toISOString();
        }
      } else {
        (updates as any)[endDateField] = newDate.toISOString();
        if (newDate < task.start) {
          (updates as any)[startDateField] = newDate.toISOString();
        }
      }
    }
    
    onEntityUpdate(draggedTask.id, updates);
  }, [draggedTask, ganttTasks, onEntityUpdate, startDateField, endDateField]);

  // Task selection handlers
  const handleTaskClick = useCallback((taskId: string, event: React.MouseEvent) => {
    const task = ganttTasks.find(t => t.id === taskId);
    if (!task) return;
    
    if (event.metaKey || event.ctrlKey) {
      // Multi-select
      setSelectedTasks(prev => {
        const next = new Set(prev);
        if (next.has(taskId)) {
          next.delete(taskId);
        } else {
          next.add(taskId);
        }
        return next;
      });
    } else {
      // Single select
      setSelectedTasks(new Set([taskId]));
    }
    
    onTaskClick?.(task.data);
    onEntityClick?.(taskId);
  }, [ganttTasks, onTaskClick, onEntityClick]);

  // Task linking handlers
  const handleTaskLinkStart = useCallback((taskId: string) => {
    if (!enableTaskLinking) return;
    setIsLinking(true);
    setLinkingFrom(taskId);
  }, [enableTaskLinking]);

  const handleTaskLinkEnd = useCallback((toTaskId: string) => {
    if (!isLinking || !linkingFrom || !onEntityUpdate) return;
    
    const fromTask = ganttTasks.find(t => t.id === linkingFrom);
    const toTask = ganttTasks.find(t => t.id === toTaskId);
    
    if (!fromTask || !toTask) return;
    
    // Add dependency
    const currentDependencies = fromTask.dependencies || [];
    const newDependencies = [...currentDependencies, toTaskId];
    
    const updates = {
      [dependenciesField as string]: newDependencies,
    } as Partial<T>;
    
    onEntityUpdate(linkingFrom, updates);
    
    // Reset linking state
    setIsLinking(false);
    setLinkingFrom(null);
  }, [isLinking, linkingFrom, ganttTasks, onEntityUpdate, dependenciesField]);

  // Render task
  const renderTask = useCallback((task: GanttTask<T>, row: GanttRow) => {
    const position = calculateTaskPosition(task);
    const isHovered = hoveredTask === task.id;
    const isDragging = draggedTask?.id === task.id;
    
    if (taskRenderer) {
      return taskRenderer(task, viewMode);
    }
    
    return (
      <div
        className={clsx(
          "absolute rounded-lg border cursor-pointer transition-all",
          task.color && `border-[${task.color}]`,
          task.selected && "ring-2 ring-[var(--color-brand-primary)]",
          isDragging && "opacity-50 rotate-2",
          isHovered && "shadow-lg",
          task.milestone && "w-2 h-2 rounded-full",
          !task.milestone && "h-6",
          "hover:shadow-md"
        )}
        style={{
          left: `${position.left}px`,
          width: task.milestone ? '8px' : `${position.width}px`,
          top: `${(ganttConfig.barHeight - 6) / 2}px`,
          backgroundColor: task.color ? task.color : 'var(--color-brand-primary)',
        }}
        draggable={enableDragReschedule}
        onDragStart={() => handleTaskDragStart(task.id, 'move')}
        onClick={(e) => handleTaskClick(task.id, e)}
        onDoubleClick={() => onTaskDoubleClick?.(task.data)}
        onContextMenu={(e) => onTaskContextMenu?.(task.data, e)}
        onMouseEnter={() => setHoveredTask(task.id)}
        onMouseLeave={() => setHoveredTask(null)}
      >
        {/* Progress bar */}
        {!task.milestone && task.progress !== undefined && (
          <div
            className="absolute top-0 left-0 h-full bg-[var(--color-success)] rounded-l-lg"
            style={{ width: `${task.progress}%` }}
          />
        )}
        
        {/* Task name */}
        {!task.milestone && position.width > 50 && (
          <div className="absolute inset-0 flex items-center px-2">
            <span className="text-xs text-white font-medium truncate">
              {task.name}
            </span>
          </div>
        )}
        
        {/* Resize handles */}
        {enableDragResize && !task.milestone && (
          <>
            <div
              className="absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-[var(--color-brand-primary)] hover:bg-opacity-50"
              onMouseDown={() => handleTaskDragStart(task.id, 'resize', 'start')}
            />
            <div
              className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-[var(--color-brand-primary)] hover:bg-opacity-50"
              onMouseDown={() => handleTaskDragStart(task.id, 'resize', 'end')}
            />
          </>
        )}
      </div>
    );
  }, [taskRenderer, viewMode, enableDragReschedule, enableDragResize, hoveredTask, draggedTask, calculateTaskPosition, ganttConfig.barHeight, handleTaskDragStart, handleTaskClick, onTaskDoubleClick, onTaskContextMenu]);

  // Empty state
  if (ganttTasks.length === 0 && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="text-[var(--color-text-muted)] mb-4">
          <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium text-[var(--color-text-primary)] mb-2">
            {emptyState?.title || "No tasks found"}
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
        <div className="text-[var(--color-text-muted)]">Loading Gantt chart...</div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center py-16 text-center">
        <div className="text-[var(--color-error-border)] mb-4">
          <h3 className="text-lg font-medium mb-2">Error loading Gantt chart</h3>
          <p className="text-[var(--color-error-border)]">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-hidden" ref={chartRef}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[var(--color-border-input)]">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => handleNavigate('prev')}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          
          <Button variant="outline" size="sm" onClick={() => handleNavigate('today')}>
            Today
          </Button>
          
          <Button variant="outline" size="sm" onClick={() => handleNavigate('next')}>
            <ChevronRight className="w-4 h-4" />
          </Button>
          
          <div className="text-lg font-medium text-[var(--color-text-primary)]">
            {currentDate.toLocaleDateString('en-US', { 
              month: 'long', 
              year: 'numeric',
              ...(viewMode === 'year' && { year: 'numeric' })
            })}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <select
            value={viewMode}
            onChange={(e) => handleViewChange(e.target.value as GanttViewMode)}
            className="px-3 py-2 border border-[var(--color-border-input)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)]"
          >
            <option value="day">Day</option>
            <option value="week">Week</option>
            <option value="month">Month</option>
            <option value="quarter">Quarter</option>
            <option value="year">Year</option>
          </select>
          
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" onClick={handleZoomOut}>
              <ZoomOut className="w-4 h-4" />
            </Button>
            <span className="text-sm text-[var(--color-text-muted)] px-2">
              {Math.round(zoom * 100)}%
            </span>
            <Button variant="outline" size="sm" onClick={handleZoomIn}>
              <ZoomIn className="w-4 h-4" />
            </Button>
          </div>
          
          <Button variant="outline" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Task
          </Button>
        </div>
      </div>

      {/* Gantt Chart */}
      <div className="flex overflow-auto" style={{ height: ganttConfig.height }}>
        {/* Task list */}
        <div className="flex-shrink-0 w-64 border-r border-[var(--color-border-input)]">
          <div className="sticky top-0 bg-[var(--color-surface-primary)] border-b border-[var(--color-border-input)] p-2">
            <div className="font-medium text-sm text-[var(--color-text-primary)]">Tasks</div>
          </div>
          {rows.map((row) => (
            <div
              key={row.task.id}
              className={clsx(
                "flex items-center gap-2 p-2 border-b border-[var(--color-border-input)]",
                row.task.selected && "bg-[var(--color-brand-primary)] bg-opacity-10",
                "hover:bg-[var(--color-surface-elevated)]"
              )}
              style={{ height: `${ganttConfig.rowHeight}px`, paddingLeft: `${(row.level || 0) * 20 + 8}px` }}
              onClick={() => handleTaskClick(row.task.id, {} as any)}
            >
              {row.task.children && row.task.children.length > 0 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleTaskCollapse(row.task.id);
                  }}
                  className="p-1 hover:bg-[var(--color-surface-elevated)] rounded"
                >
                  {row.expanded ? (
                    <ChevronLeft className="w-3 h-3" />
                  ) : (
                    <ChevronRight className="w-3 h-3" />
                  )}
                </button>
              )}
              
              <div className="flex-1">
                <div className="text-sm font-medium text-[var(--color-text-primary)] truncate">
                  {row.task.name}
                </div>
                {row.task.assignee && (
                  <div className="text-xs text-[var(--color-text-muted)]">
                    {row.task.assignee}
                  </div>
                )}
              </div>
              
              {row.task.priority && (
                <Badge
                  variant="outline"
                  size="sm"
                  className={clsx(
                    row.task.priority === 'urgent' && "bg-[var(--color-red-100)] text-[var(--color-red-700)]",
                    row.task.priority === 'high' && "bg-[var(--color-orange-100)] text-[var(--color-orange-700)]",
                    row.task.priority === 'medium' && "bg-[var(--color-yellow-100)] text-[var(--color-yellow-700)]",
                    row.task.priority === 'low' && "bg-[var(--color-gray-100)] text-[var(--color-gray-700)]"
                  )}
                >
                  {row.task.priority}
                </Badge>
              )}
            </div>
          ))}
        </div>

        {/* Timeline */}
        <div className="flex-1 relative" ref={timelineRef}>
          {/* Timeline header */}
          <div className="sticky top-0 bg-[var(--color-surface-primary)] border-b border-[var(--color-border-input)] z-10">
            <div className="flex" style={{ height: '40px' }}>
              {timeline.cells.map((cell, index) => (
                <div
                  key={index}
                  className={clsx(
                    "flex-1 text-center text-xs text-[var(--color-text-primary)] border-r border-[var(--color-border-input)]",
                    cell.isWeekend && enableWeekendHighlight && "bg-[var(--color-surface-elevated)]"
                  )}
                  style={{ width: `${cell.width}px` }}
                >
                  {cell.label}
                </div>
              ))}
            </div>
          </div>
          
          {/* Timeline body */}
          <div className="relative" style={{ minHeight: `${rows.length * ganttConfig.rowHeight}px` }}>
            {/* Grid lines */}
            {enableGridLines && timeline.gridLines.map((line, index) => (
              <div
                key={index}
                className={clsx(
                  "absolute top-0 bottom-0 border-l",
                  line.type === 'major' ? "border-[var(--color-border-input)]" : "border-[var(--color-border-input)] opacity-50"
                )}
                style={{ left: `${line.position}px` }}
              />
            ))}
            
            {/* Today indicator */}
            {enableTodayIndicator && timeline.todayPosition !== undefined && (
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-[var(--color-brand-primary)] z-5"
                style={{ left: `${timeline.todayPosition}px` }}
              >
                <div className="absolute -top-1 -left-1 w-2 h-2 bg-[var(--color-brand-primary)] rounded-full" />
              </div>
            )}
            
            {/* Tasks */}
            {rows.map((row) => (
              <div
                key={row.task.id}
                className="absolute"
                style={{ 
                  top: `${row.top}px`,
                  height: `${ganttConfig.rowHeight}px`,
                  width: '100%'
                }}
              >
                {renderTask(row.task, row)}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper functions
function calculatePosition(date: Date, start: Date, end: Date): number {
  const duration = end.getTime() - start.getTime();
  const offset = date.getTime() - start.getTime();
  return (offset / duration) * 100;
}

function getCellGenerator(viewMode: GanttViewMode, start: Date, end: Date, config: any) {
  const cells: GanttTimelineCell[] = [];
  const gridLines: GanttGridLine[] = [];
  
  switch (viewMode) {
    case 'day':
      // Generate hourly cells
      const dayDuration = 24 * 60 * 60 * 1000;
      for (let i = 0; i < 24; i++) {
        const cellDate = new Date(start.getTime() + (i * dayDuration / 24));
        const position = (i / 24) * 100;
        
        cells.push({
          date: cellDate,
          position,
          width: 100 / 24,
          isWeekend: cellDate.getDay() === 0 || cellDate.getDay() === 6,
          label: cellDate.getHours() + ':00',
        });
        
        if (i % 6 === 0) {
          gridLines.push({
            position,
            type: 'major',
            label: cellDate.toLocaleDateString(),
            date: cellDate,
          });
        }
      }
      break;
      
    case 'week':
      // Generate daily cells
      const weekDuration = 7 * 24 * 60 * 60 * 1000;
      for (let i = 0; i < 7; i++) {
        const cellDate = new Date(start.getTime() + (i * weekDuration / 7));
        const position = (i / 7) * 100;
        
        cells.push({
          date: cellDate,
          position,
          width: 100 / 7,
          isWeekend: cellDate.getDay() === 0 || cellDate.getDay() === 6,
          label: cellDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        });
        
        gridLines.push({
          position,
          type: 'major',
          label: cellDate.toLocaleDateString(),
          date: cellDate,
        });
      }
      break;
      
    case 'month':
      // Generate weekly cells
      const monthDuration = 30 * 24 * 60 * 60 * 1000;
      for (let i = 0; i < 4; i++) {
        const cellDate = new Date(start.getTime() + (i * monthDuration / 4));
        const position = (i / 4) * 100;
        
        cells.push({
          date: cellDate,
          position,
          width: 100 / 4,
          isWeekend: false,
          label: `Week ${i + 1}`,
        });
        
        gridLines.push({
          position,
          type: 'major',
          label: cellDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          date: cellDate,
        });
      }
      break;
      
    default:
      // Default to week view
      return getCellGenerator('week', start, end, config);
  }
  
  return { cells, gridLines };
}
