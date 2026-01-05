"use client";

import React, { useState, useCallback, useMemo, useRef, useEffect } from "react";
import clsx from "clsx";
import { Button } from "../../../atoms/Button/index.js";
import { Badge } from "../../../atoms/Badge/index.js";
import { Icon } from "../../../atoms/Icon/index.js";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, MapPin, Users, Plus, MoreHorizontal } from "lucide-react";
import type { 
  CalendarViewProps, 
  CalendarViewMode,
  CalendarEvent,
  CalendarDay,
  CalendarWeek,
  CalendarMonth,
  TimeSlot
} from "./CalendarView.types.js";
import type { BaseViewProps } from "../types.js";

/**
 * CALENDAR VIEW
 * 
 * CHARACTERISTICS:
 * - Month/Week/Day views
 * - Drag to reschedule
 * - Drag to extend duration
 * - Multi-day events
 * - Event color by status/priority/project
 * - Mini calendar for navigation
 * - Today indicator
 * - Weekend highlighting
 */
export function CalendarView<T extends { id: string }>({
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
  dueDateField,
  allDayField,
  colorField,
  titleField,
  descriptionField,
  locationField,
  attendeesField,
  defaultView = "month",
  enableDragReschedule = true,
  enableDragResize = true,
  enableMultiDay = true,
  enableMiniCalendar = true,
  enableTodayIndicator = true,
  enableWeekendHighlight = true,
  enableWeekNumbers = false,
  eventRenderer,
  dayRenderer,
  headerRenderer,
  onEventClick,
  onEventDoubleClick,
  onDayClick,
  onNavigate,
  onViewChange,
  enableDateSelection = false,
  selectedRange,
  onDateSelect,
  workingHours,
  timeSlots,
  ...props
}: CalendarViewProps<T>) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<CalendarViewMode>(defaultView);
  const [draggedEvent, setDraggedEvent] = useState<{ id: string; startDate: Date; endDate?: Date } | null>(null);
  const [dragOverDay, setDragOverDay] = useState<Date | null>(null);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState<'start' | 'end' | null>(null);
  const [selectedDateRange, setSelectedDateRange] = useState<{ start: Date; end: Date } | null>(selectedRange || null);
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);
  const calendarRef = useRef<HTMLDivElement>(null);

  // Calendar configuration
  const calendarConfig = useMemo(() => ({
    firstDayOfWeek: 0,
    locale: 'en-US',
    timeZone: 'UTC',
    height: '600px',
    eventLimit: 3,
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

  // Convert entities to calendar events
  const calendarEvents = useMemo((): CalendarEvent<T>[] => {
    return filteredEntities.map(entity => {
      const startDate = new Date(entity[startDateField] as string);
      const endDate = endDateField ? new Date(entity[endDateField] as string) : undefined;
      const allDay = allDayField ? Boolean(entity[allDayField]) : false;
      const color = colorField ? String(entity[colorField]) : undefined;
      const title = titleField ? String(entity[titleField]) : '';
      const description = descriptionField ? String(entity[descriptionField]) : '';
      const location = locationField ? String(entity[locationField]) : '';
      const attendees = attendeesField ? (entity[attendeesField] as string[]) : [];

      return {
        data: entity,
        id: entity.id,
        title,
        start: startDate,
        end: endDate,
        allDay,
        color,
        location,
        description,
        attendees,
        isDragging: draggedEvent?.id === entity.id,
        selected: selectedIds.includes(entity.id),
      };
    });
  }, [filteredEntities, startDateField, endDateField, allDayField, colorField, titleField, descriptionField, locationField, attendeesField, draggedEvent, selectedIds]);

  // Generate calendar data based on view mode
  const calendarData = useMemo(() => {
    switch (viewMode) {
      case 'month':
        return generateMonthData(currentDate, calendarEvents, calendarConfig);
      case 'week':
        return generateWeekData(currentDate, calendarEvents, calendarConfig);
      case 'day':
        return generateDayData(currentDate, calendarEvents, calendarConfig);
      case 'agenda':
        return generateAgendaData(currentDate, calendarEvents, calendarConfig);
      case 'year':
        return generateYearData(currentDate, calendarEvents, calendarConfig);
      default:
        return generateMonthData(currentDate, calendarEvents, calendarConfig);
    }
  }, [currentDate, viewMode, calendarEvents, calendarConfig]);

  // Navigation handlers
  const handleNavigate = useCallback((direction: 'prev' | 'next' | 'today') => {
    const newDate = new Date(currentDate);
    
    switch (direction) {
      case 'prev':
        switch (viewMode) {
          case 'month':
            newDate.setMonth(newDate.getMonth() - 1);
            break;
          case 'week':
            newDate.setDate(newDate.getDate() - 7);
            break;
          case 'day':
            newDate.setDate(newDate.getDate() - 1);
            break;
          case 'year':
            newDate.setFullYear(newDate.getFullYear() - 1);
            break;
        }
        break;
      case 'next':
        switch (viewMode) {
          case 'month':
            newDate.setMonth(newDate.getMonth() + 1);
            break;
          case 'week':
            newDate.setDate(newDate.getDate() + 7);
            break;
          case 'day':
            newDate.setDate(newDate.getDate() + 1);
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
  const handleViewChange = useCallback((newViewMode: CalendarViewMode) => {
    setViewMode(newViewMode);
    onViewChange?.(newViewMode);
  }, [onViewChange]);

  // Event drag handlers
  const handleEventDragStart = useCallback((event: CalendarEvent<T>) => {
    if (!enableDragReschedule) return;
    setDraggedEvent({
      id: event.id,
      startDate: event.start,
      endDate: event.end,
    });
  }, [enableDragReschedule]);

  const handleEventDragOver = useCallback((date: Date) => {
    if (!enableDragReschedule) return;
    setDragOverDay(date);
  }, [enableDragReschedule]);

  const handleEventDrop = useCallback(async (date: Date) => {
    if (!enableDragReschedule || !draggedEvent) return;
    
    const event = calendarEvents.find(e => e.id === draggedEvent.id);
    if (!event || !onEntityUpdate) return;

    const duration = event.end ? event.end.getTime() - event.start.getTime() : 0;
    const newEndDate = new Date(date.getTime() + duration);
    
    const updates = {
      [String(startDateField)]: date.toISOString(),
      [String(endDateField)]: newEndDate.toISOString(),
    } as Partial<T>;

    await onEntityUpdate(event.id, updates);
    
    setDraggedEvent(null);
    setDragOverDay(null);
  }, [enableDragReschedule, draggedEvent, calendarEvents, onEntityUpdate, startDateField, endDateField]);

  // Event resize handlers
  const handleEventResizeStart = useCallback((event: CalendarEvent<T>, direction: 'start' | 'end') => {
    if (!enableDragResize) return;
    setDraggedEvent({
      id: event.id,
      startDate: event.start,
      endDate: event.end,
    });
    setIsResizing(true);
    setResizeDirection(direction);
  }, [enableDragResize]);

  const handleEventResize = useCallback(async (newDate: Date) => {
    if (!isResizing || !draggedEvent || !onEntityUpdate) return;

    const event = calendarEvents.find(e => e.id === draggedEvent.id);
    if (!event) return;

    const updates: any = {};

    if (resizeDirection === 'end' && event.end) {
      if (newDate > event.start) {
        (updates as any)[endDateField] = newDate.toISOString();
      }
    } else if (resizeDirection === 'start' && event.start) {
      if (newDate < (event.end || event.start)) {
        (updates as any)[startDateField] = newDate.toISOString();
      }
    }

    await onEntityUpdate(event.id, updates);
  }, [isResizing, draggedEvent, calendarEvents, onEntityUpdate, startDateField, endDateField, resizeDirection]);

  const handleEventResizeEnd = useCallback(() => {
    setIsResizing(false);
    setResizeDirection(null);
  }, []);

  // Date selection handlers
  const handleDayClick = useCallback((date: Date) => {
    if (enableDateSelection) {
      if (!selectedDateRange) {
        // Start new selection
        setSelectedDateRange({ start: date, end: date });
      } else {
        // Complete selection
        const start = selectedDateRange.start;
        const end = date;
        setSelectedDateRange({ start: start < end ? start : end, end: start < end ? end : start });
        onDateSelect?.({ start: start < end ? start : end, end: start < end ? end : start });
      }
    }
    onDayClick?.(date);
  }, [enableDateSelection, selectedDateRange, onDayClick, onDateSelect]);

  // Render event
  const renderEvent = useCallback((event: CalendarEvent<T>) => {
    if (eventRenderer) {
      return eventRenderer(event.data, viewMode);
    }

    const isMultiDay = event.end && !event.allDay && (
      event.start.toDateString() !== event.end.toDateString()
    );

    return (
      <div
        className={clsx(
          "p-2 rounded-lg border cursor-pointer transition-all",
          event.color && `border-[${event.color}]`,
          event.selected && "ring-2 ring-[var(--color-brand-primary)]",
          event.isDragging && "opacity-50 rotate-2",
          !event.allDay && "text-xs",
          "hover:shadow-md"
        )}
        draggable={enableDragReschedule}
        onDragStart={() => handleEventDragStart(event)}
        onClick={() => onEventClick?.(event.data)}
        onDoubleClick={() => onEventDoubleClick?.(event.data)}
        onContextMenu={(e) => onContextMenu?.(event.id, e)}
      >
        <div className="flex items-center gap-2">
          {event.location && (
            <MapPin className="w-3 h-3 text-[var(--color-text-muted)]" />
          )}
          <span className="font-medium truncate">{event.title}</span>
          {event.attendees && event.attendees.length > 0 && (
            <Users className="w-3 h-3 text-[var(--color-text-muted)]" />
          )}
        </div>
        {event.description && !event.allDay && (
          <p className="text-xs text-text-muted mt-1 truncate">
            {event.description}
          </p>
        )}
      </div>
    );
  }, [eventRenderer, enableDragReschedule, onEventClick, onEventDoubleClick, onContextMenu, handleEventDragStart]);

  // Render day cell
  const renderDay = useCallback((day: CalendarDay) => {
    if (dayRenderer) {
      return dayRenderer(day.date, day.events as unknown as T[]);
    }

    const isToday = day.isToday;
    const isWeekend = day.isWeekend;
    const isCurrentMonth = day.isCurrentMonth;
    const isSelected = selectedDateRange && (
      (day.date >= selectedDateRange.start && day.date <= selectedDateRange.end) ||
      (day.date <= selectedDateRange.start && day.date >= selectedDateRange.end)
    );
    const isDragOver = dragOverDay && day.date.toDateString() === dragOverDay.toDateString();

    return (
      <div
        className={clsx(
          "relative p-2 border border-[var(--color-border-input)] min-h-[80px]",
          isToday && enableTodayIndicator && "bg-[var(--color-brand-primary)] bg-opacity-10",
          isWeekend && enableWeekendHighlight && "bg-[var(--color-surface-elevated)]",
          !isCurrentMonth && "text-[var(--color-text-muted)]",
          isSelected && "ring-2 ring-[var(--color-brand-primary)]",
          isDragOver && "ring-2 ring-[var(--color-brand-primary)]",
          "hover:bg-[var(--color-surface-elevated)] cursor-pointer"
        )}
        onClick={() => handleDayClick(day.date)}
        onMouseEnter={() => setHoveredDate(day.date)}
        onMouseLeave={() => setHoveredDate(null)}
        onDragOver={() => handleEventDragOver(day.date)}
        onDrop={() => handleEventDrop(day.date)}
      >
        <div className="text-sm font-medium mb-1">
          {day.dayNumber}
        </div>
        
        {/* Events */}
        <div className="space-y-1">
          {day.events.slice(0, 3).map((event) => (
            <div key={event.id}>
              {renderEvent(event as unknown as CalendarEvent<T>)}
            </div>
          ))}
          {day.events.length > 3 && (
            <div className="text-xs text-[var(--color-text-muted)]">
              +{day.events.length - 3} more
            </div>
          )}
        </div>
      </div>
    );
  }, [dayRenderer, enableTodayIndicator, enableWeekendHighlight, selectedDateRange, dragOverDay, handleDayClick, handleEventDragOver, handleEventDrop, renderEvent, setHoveredDate]);

  // Empty state
  if (calendarEvents.length === 0 && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="text-[var(--color-text-muted)] mb-4">
          <CalendarIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium text-[var(--color-text-primary)] mb-2">
            {emptyState?.title || "No events found"}
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
        <div className="text-[var(--color-text-muted)]">Loading calendar...</div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center py-16 text-center">
        <div className="text-[var(--color-error-border)] mb-4">
          <h3 className="text-lg font-medium mb-2">Error loading calendar</h3>
          <p className="text-[var(--color-error-border)]">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-hidden" ref={calendarRef}>
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
            onChange={(e) => handleViewChange(e.target.value as CalendarViewMode)}
            className="px-3 py-2 border border-[var(--color-border-input)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)]"
          >
            <option value="month">Month</option>
            <option value="week">Week</option>
            <option value="day">Day</option>
            <option value="agenda">Agenda</option>
            <option value="year">Year</option>
          </select>
          
          <Button variant="outline" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Event
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-4 overflow-auto" style={{ height: calendarConfig.height }}>
        {viewMode === 'month' && (
          <div className="grid grid-cols-7 gap-2">
            {/* Weekday headers */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
              <div key={day} className="text-center text-sm font-medium text-[var(--color-text-primary)] p-2">
                {day}
              </div>
            ))}
            
            {/* Calendar days */}
            {(calendarData as CalendarMonth).weeks.map((week) => (
              <React.Fragment key={week.weekNumber}>
                {week.days.map((day) => (
                  <div key={day.date.toISOString()}>
                    {renderDay(day)}
                  </div>
                ))}
              </React.Fragment>
            ))}
          </div>
        )}
        
        {viewMode === 'week' && (
          <div className="space-y-4">
            {/* Time slots */}
            {timeSlots?.enabled && (
              <div className="grid grid-cols-1 gap-1">
                {Array.from({ length: 24 }, (_, hour) => {
                  const slotStart = new Date(currentDate);
                  slotStart.setHours(hour, 0, 0, 0);
                  const slotEnd = new Date(currentDate);
                  slotEnd.setHours(hour + 1, 0, 0, 0);
                  
                  const slotEvents = calendarEvents.filter(event => 
                    event.start < slotEnd && (event.end || event.start) > slotStart
                  );
                  
                  return (
                    <div key={hour} className="flex border-b border-[var(--color-border-input)] min-h-[60px]">
                      <div className="w-20 text-xs text-[var(--color-text-muted)] p-2 border-r border-[var(--color-border-input)]">
                        {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : `${hour - 12} PM`}
                      </div>
                      <div className="flex-1 relative">
                        {slotEvents.map((event) => (
                          <div key={event.id} className="absolute">
                            {renderEvent(event)}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            
            {/* Week view */}
            <div className="grid grid-cols-7 gap-2">
              {(calendarData as CalendarWeek[]).map((week) => (
                <div key={week.weekNumber} className="space-y-2">
                  {week.days.map((day) => (
                    <div key={day.date.toISOString()}>
                      {renderDay(day)}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {viewMode === 'day' && (
          <div className="space-y-4">
            {/* Time slots */}
            {timeSlots?.enabled ? (
              <div className="grid grid-cols-1 gap-1">
                {Array.from({ length: 24 }, (_, hour) => {
                  const slotStart = new Date(currentDate);
                  slotStart.setHours(hour, 0, 0, 0);
                  const slotEnd = new Date(currentDate);
                  slotEnd.setHours(hour + 1, 0, 0, 0);
                  
                  const slotEvents = calendarEvents.filter(event => 
                    event.start < slotEnd && (event.end || event.start) > slotStart
                  );
                  
                  return (
                    <div key={hour} className="flex border-b border-[var(--color-border-input)] min-h-[60px]">
                      <div className="w-20 text-xs text-[var(--color-text-muted)] p-2 border-r border-[var(--color-border-input)]">
                        {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : `${hour - 12} PM`}
                      </div>
                      <div className="flex-1 relative">
                        {slotEvents.map((event) => (
                          <div key={event.id} className="absolute">
                            {renderEvent(event)}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-2">
                {calendarEvents.map((event) => (
                  <div key={event.id}>
                    {renderEvent(event)}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {/* Other views would be implemented similarly */}
        {viewMode === 'agenda' && (
          <div className="space-y-4">
            {calendarEvents
              .sort((a, b) => a.start.getTime() - b.start.getTime())
              .map((event) => (
                <div key={event.id} className="flex items-start gap-4 p-4 border border-[var(--color-border-input)] rounded-lg">
                  <div className="text-sm text-[var(--color-text-muted)]">
                    {event.start.toLocaleDateString()}
                  </div>
                  <div className="flex-1">
                    {renderEvent(event)}
                  </div>
                </div>
              ))}
          </div>
        )}
        
        {viewMode === 'year' && (
          <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
            {(calendarData as CalendarMonth[]).map((month) => (
              <div key={`${month.year}-${month.month}`} className="border border-[var(--color-border-input)] rounded-lg p-4">
                <h3 className="font-medium text-[var(--color-text-primary)] mb-2">
                  {month.name}
                </h3>
                <div className="grid grid-cols-7 gap-1 text-xs">
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                    <div key={index} className="text-center text-[var(--color-text-muted)] p-1">
                      {day}
                    </div>
                  ))}
                  {month.weeks.map((week) =>
                    week.days.map((day) => (
                      <div
                        key={day.date.toISOString()}
                        className={clsx(
                          "text-center p-1",
                          !day.isCurrentMonth && "text-[var(--color-text-muted)]",
                          day.isToday && "bg-[var(--color-brand-primary)] text-white rounded"
                        )}
                      >
                        {day.dayNumber}
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Helper functions to generate calendar data
function generateMonthData(date: Date, events: CalendarEvent<any>[], config: any): CalendarMonth {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - startDate.getDay());
  
  const weeks: CalendarWeek[] = [];
  const currentWeek: CalendarDay[] = [];
  
  for (let day = 0; day < 42; day++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + day);
    
    if (currentDate.getMonth() !== month) {
      if (currentWeek.length > 0) {
        weeks.push({
          weekNumber: getWeekNumber(currentWeek[0].date),
          days: currentWeek,
          startDate: currentWeek[0].date,
          endDate: currentWeek[currentWeek.length - 1].date,
        });
        currentWeek.length = 0;
      }
      continue;
    }
    
    const dayEvents = events.filter(event => {
      const eventDate = new Date(event.start);
      return eventDate.getDate() === currentDate.getDate() &&
             eventDate.getMonth() === month &&
             eventDate.getFullYear() === year;
    });
    
    currentWeek.push({
      date: currentDate,
      isCurrentMonth: true,
      isToday: isToday(currentDate),
      isWeekend: isWeekend(currentDate),
      events: dayEvents,
      dayNumber: currentDate.getDate(),
      weekNumber: getWeekNumber(currentDate),
    });
  }
  
  if (currentWeek.length > 0) {
    weeks.push({
      weekNumber: getWeekNumber(currentWeek[0].date),
      days: currentWeek,
      startDate: currentWeek[0].date,
      endDate: currentWeek[currentWeek.length - 1].date,
    });
  }
  
  return {
    month,
    year,
    name: firstDay.toLocaleDateString('en-US', { month: 'long' }),
    weeks,
    firstDay,
    lastDay,
    daysInMonth,
  };
}

function generateWeekData(date: Date, events: CalendarEvent<any>[], config: any): CalendarWeek[] {
  const startOfWeek = new Date(date);
  startOfWeek.setDate(date.getDate() - date.getDay());
  
  const weeks: CalendarWeek[] = [];
  
  for (let week = 0; week < 1; week++) {
    const weekDays: CalendarDay[] = [];
    
    for (let day = 0; day < 7; day++) {
      const currentDate = new Date(startOfWeek);
      currentDate.setDate(startOfWeek.getDate() + week * 7 + day);
      
      const dayEvents = events.filter(event => {
        const eventStart = new Date(event.start);
        const eventEnd = event.end ? new Date(event.end) : eventStart;
        return eventStart <= currentDate && eventEnd >= currentDate;
      });
      
      weekDays.push({
        date: currentDate,
        isCurrentMonth: true,
        isToday: isToday(currentDate),
        isWeekend: isWeekend(currentDate),
        events: dayEvents,
        dayNumber: currentDate.getDate(),
        weekNumber: getWeekNumber(currentDate),
      });
    }
    
    weeks.push({
      weekNumber: getWeekNumber(weekDays[0].date),
      days: weekDays,
      startDate: weekDays[0].date,
      endDate: weekDays[weekDays.length - 1].date,
    });
  }
  
  return weeks;
}

function generateDayData(date: Date, events: CalendarEvent<any>[], config: any): CalendarDay {
  const dayEvents = events.filter(event => {
    const eventStart = new Date(event.start);
    const eventEnd = event.end ? new Date(event.end) : eventStart;
    return eventStart <= date && eventEnd >= date;
  });
  
  return {
    date,
    isCurrentMonth: true,
    isToday: isToday(date),
    isWeekend: isWeekend(date),
    events: dayEvents,
    dayNumber: date.getDate(),
    weekNumber: getWeekNumber(date),
  };
}

function generateAgendaData(date: Date, events: CalendarEvent<any>[], config: any): CalendarEvent<any>[] {
  return events.sort((a, b) => a.start.getTime() - b.start.getTime());
}

function generateYearData(date: Date, events: CalendarEvent<any>[], config: any): CalendarMonth[] {
  const months: CalendarMonth[] = [];
  
  for (let month = 0; month < 12; month++) {
    const monthDate = new Date(date.getFullYear(), month, 1);
    months.push(generateMonthData(monthDate, events, config));
  }
  
  return months;
}

// Helper functions
function isToday(date: Date): boolean {
  const today = new Date();
  return date.getDate() === today.getDate() &&
         date.getMonth() === today.getMonth() &&
         date.getFullYear() === today.getFullYear();
}

function isWeekend(date: Date): boolean {
  return date.getDay() === 0 || date.getDay() === 6;
}

function getWeekNumber(date: Date): number {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const daysSinceFirstDay = Math.floor((date.getTime() - firstDayOfYear.getTime()) / (24 * 60 * 60 * 1000));
  return Math.ceil(daysSinceFirstDay / 7);
}
