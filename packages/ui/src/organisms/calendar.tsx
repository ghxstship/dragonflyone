"use client";

import React, { useState, useMemo } from "react";
import clsx from "clsx";

export interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  endDate?: Date;
  color?: string;
}

export interface CalendarProps {
  /** Events to display */
  events?: CalendarEvent[];
  /** Selected date */
  selectedDate?: Date;
  /** Date selection handler */
  onDateSelect?: (date: Date) => void;
  /** Event click handler */
  onEventClick?: (event: CalendarEvent) => void;
  /** Minimum selectable date */
  minDate?: Date;
  /** Maximum selectable date */
  maxDate?: Date;
  /** Show week numbers */
  showWeekNumbers?: boolean;
  /** Start week on Monday */
  weekStartsOnMonday?: boolean;
  /** Custom className */
  className?: string;
}

const DAYS_SHORT = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const DAYS_SHORT_MONDAY = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
const MONTHS = [
  "JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE",
  "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"
];

function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

export function Calendar({
  events = [],
  selectedDate,
  onDateSelect,
  onEventClick,
  minDate,
  maxDate,
  showWeekNumbers = false,
  weekStartsOnMonday = false,
  className = "",
}: CalendarProps) {
  const [viewDate, setViewDate] = useState(selectedDate || new Date());

  const daysOfWeek = weekStartsOnMonday ? DAYS_SHORT_MONDAY : DAYS_SHORT;

  const calendarDays = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    let startDay = firstDay.getDay();
    if (weekStartsOnMonday) {
      startDay = startDay === 0 ? 6 : startDay - 1;
    }
    
    const days: (Date | null)[] = [];
    
    // Previous month days
    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }
    
    // Current month days
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }
    
    // Next month days to complete the grid
    const remainingDays = 42 - days.length; // 6 rows * 7 days
    for (let i = 0; i < remainingDays; i++) {
      days.push(null);
    }
    
    return days;
  }, [viewDate, weekStartsOnMonday]);

  const getEventsForDate = (date: Date): CalendarEvent[] => {
    return events.filter((event) => {
      const eventDate = new Date(event.date);
      if (event.endDate) {
        const endDate = new Date(event.endDate);
        return date >= eventDate && date <= endDate;
      }
      return isSameDay(eventDate, date);
    });
  };

  const isDateDisabled = (date: Date): boolean => {
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    return false;
  };

  const navigateMonth = (direction: -1 | 1) => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + direction, 1));
  };

  const goToToday = () => {
    const today = new Date();
    setViewDate(today);
    onDateSelect?.(today);
  };

  const weeks = [];
  for (let i = 0; i < calendarDays.length; i += 7) {
    weeks.push(calendarDays.slice(i, i + 7));
  }

  return (
    <div className={clsx("bg-white border-2 border-black", className)}>
      {/* Header */}
      <div className="flex justify-between items-center px-5 py-4 border-b border-grey-200">
        <button
          onClick={() => navigateMonth(-1)}
          className="w-10 h-10 bg-transparent border-2 border-black cursor-pointer font-heading text-h5-md flex items-center justify-center transition-colors duration-fast hover:bg-grey-100"
          aria-label="Previous month"
        >
          ←
        </button>

        <div className="text-center">
          <div className="font-heading text-h4-md text-black tracking-wide">
            {MONTHS[viewDate.getMonth()]}
          </div>
          <div className="font-code text-mono-sm text-grey-600 tracking-widest">
            {viewDate.getFullYear()}
          </div>
        </div>

        <button
          onClick={() => navigateMonth(1)}
          className="w-10 h-10 bg-transparent border-2 border-black cursor-pointer font-heading text-h5-md flex items-center justify-center transition-colors duration-fast hover:bg-grey-100"
          aria-label="Next month"
        >
          →
        </button>
      </div>

      {/* Days of Week Header */}
      <div
        className="grid border-b border-grey-200"
        style={{ gridTemplateColumns: showWeekNumbers ? "40px repeat(7, 1fr)" : "repeat(7, 1fr)" }}
      >
        {showWeekNumbers && (
          <div className="px-2 py-3 font-code text-mono-xs text-grey-400 text-center">
            WK
          </div>
        )}
        {daysOfWeek.map((day) => (
          <div
            key={day}
            className="px-2 py-3 font-code text-mono-xs text-grey-600 tracking-widest text-center"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div>
        {weeks.map((week, weekIndex) => (
          <div
            key={weekIndex}
            className={clsx("grid", weekIndex < weeks.length - 1 && "border-b border-grey-100")}
            style={{ gridTemplateColumns: showWeekNumbers ? "40px repeat(7, 1fr)" : "repeat(7, 1fr)" }}
          >
            {showWeekNumbers && (
              <div className="p-2 font-code text-mono-xs text-grey-400 text-center flex items-center justify-center">
                {week[0] ? getWeekNumber(week[0]) : ""}
              </div>
            )}
            {week.map((date, dayIndex) => {
              if (!date) {
                return (
                  <div
                    key={`empty-${dayIndex}`}
                    className="p-2 min-h-[60px] bg-grey-100"
                  />
                );
              }

              const isToday = isSameDay(date, new Date());
              const isSelected = selectedDate && isSameDay(date, selectedDate);
              const isDisabled = isDateDisabled(date);
              const dayEvents = getEventsForDate(date);

              return (
                <button
                  key={date.toISOString()}
                  onClick={() => !isDisabled && onDateSelect?.(date)}
                  disabled={isDisabled}
                  className={clsx(
                    "p-2 min-h-[60px] border-none flex flex-col items-start gap-1 transition-colors duration-fast",
                    isSelected ? "bg-black" : isToday ? "bg-grey-100" : "bg-white hover:bg-grey-50",
                    dayIndex < 6 && "border-r border-grey-100",
                    isDisabled ? "cursor-not-allowed opacity-40" : "cursor-pointer"
                  )}
                >
                  <span className={clsx("font-heading text-h6-md", isSelected ? "text-white" : "text-black")}>
                    {date.getDate()}
                  </span>

                  {/* Events */}
                  {dayEvents.slice(0, 2).map((event) => (
                    <div
                      key={event.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventClick?.(event);
                      }}
                      className="w-full px-1 py-0.5 text-white font-code text-[10px] tracking-wide text-left overflow-hidden text-ellipsis whitespace-nowrap cursor-pointer"
                      style={{ backgroundColor: event.color || "#1F2937" }}
                    >
                      {event.title}
                    </div>
                  ))}
                  {dayEvents.length > 2 && (
                    <span className={clsx("font-code text-[10px]", isSelected ? "text-grey-400" : "text-grey-500")}>
                      +{dayEvents.length - 2} more
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="flex justify-center py-3 border-t border-grey-200">
        <button
          onClick={goToToday}
          className="px-4 py-2 bg-transparent border-2 border-black font-code text-mono-sm tracking-widest cursor-pointer transition-colors duration-fast hover:bg-grey-100"
        >
          TODAY
        </button>
      </div>
    </div>
  );
}

export default Calendar;
