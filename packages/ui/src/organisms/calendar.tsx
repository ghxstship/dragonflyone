"use client";

import React, { useState, useMemo } from "react";
import clsx from "clsx";
import { ink } from "../tokens.js";

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
  /** Inverted theme (for dark backgrounds) */
  inverted?: boolean;
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

/**
 * Calendar component - Bold Contemporary Pop Art Adventure
 * 
 * Features:
 * - Comic panel aesthetic with bold borders
 * - Hard offset shadows
 * - Bold navigation buttons with hover lift
 * - Accent shadow on selected date
 */
export function Calendar({
  events = [],
  selectedDate,
  onDateSelect,
  onEventClick,
  minDate,
  maxDate,
  showWeekNumbers = false,
  weekStartsOnMonday = false,
  inverted = false,
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

  // Navigation button classes
  const navButtonClasses = inverted
    ? "w-10 h-10 flex items-center justify-center border-2 border-grey-600 bg-transparent text-white rounded-[var(--radius-button)] shadow-[2px_2px_0_rgba(255,255,255,0.1)] cursor-pointer font-heading text-lg transition-all duration-100 ease-[var(--ease-bounce)] hover:bg-white hover:text-black hover:border-white hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[3px_3px_0_rgba(255,255,255,0.2)]"
    : "w-10 h-10 flex items-center justify-center border-2 border-black bg-transparent text-black rounded-[var(--radius-button)] shadow-[2px_2px_0_rgba(0,0,0,0.08)] cursor-pointer font-heading text-lg transition-all duration-100 ease-[var(--ease-bounce)] hover:bg-grey-100 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[3px_3px_0_rgba(0,0,0,0.12)]";

  return (
    <div className={clsx(
      "overflow-hidden border-2 rounded-[var(--radius-card)]",
      inverted
        ? "bg-ink-900 text-white border-grey-600 shadow-[4px_4px_0_rgba(255,255,255,0.15)]"
        : "bg-white text-black border-black shadow-[4px_4px_0_rgba(0,0,0,0.15)]",
      className
    )}>
      {/* Header */}
      <div className={clsx(
        "flex items-center justify-between px-5 py-4 border-b-2",
        inverted ? "border-grey-700" : "border-grey-200"
      )}>
        <button
          onClick={() => navigateMonth(-1)}
          className={navButtonClasses}
          aria-label="Previous month"
        >
          ←
        </button>

        <div className="text-center">
          <div className={clsx(
            "font-heading text-xl tracking-wide uppercase",
            inverted ? "text-white" : "text-black"
          )}>
            {MONTHS[viewDate.getMonth()]}
          </div>
          <div className={clsx(
            "font-code text-sm tracking-widest",
            inverted ? "text-grey-400" : "text-grey-600"
          )}>
            {viewDate.getFullYear()}
          </div>
        </div>

        <button
          onClick={() => navigateMonth(1)}
          className={navButtonClasses}
          aria-label="Next month"
        >
          →
        </button>
      </div>

      {/* Days of Week Header */}
      <div
        className={clsx("grid border-b-2", inverted ? "border-grey-700" : "border-grey-200")}
        style={{ gridTemplateColumns: showWeekNumbers ? "40px repeat(7, 1fr)" : "repeat(7, 1fr)" }}
      >
        {showWeekNumbers && (
          <div className={clsx(
            "px-2 py-3 text-center font-code text-xs",
            inverted ? "text-grey-500" : "text-grey-400"
          )}>
            WK
          </div>
        )}
        {daysOfWeek.map((day) => (
          <div
            key={day}
            className={clsx(
              "px-2 py-3 text-center font-code text-xs tracking-widest",
              inverted ? "text-grey-400" : "text-grey-600"
            )}
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
            className={clsx(
              "grid",
              weekIndex < weeks.length - 1 && (inverted ? "border-b border-grey-800" : "border-b border-grey-100")
            )}
            style={{ gridTemplateColumns: showWeekNumbers ? "40px repeat(7, 1fr)" : "repeat(7, 1fr)" }}
          >
            {showWeekNumbers && (
              <div className={clsx(
                "flex items-center justify-center p-2 text-center font-code text-xs",
                inverted ? "text-grey-500" : "text-grey-400"
              )}>
                {week[0] ? getWeekNumber(week[0]) : ""}
              </div>
            )}
            {week.map((date, dayIndex) => {
              if (!date) {
                return (
                  <div
                    key={`empty-${dayIndex}`}
                    className={clsx(
                      "min-h-[72px] p-2",
                      inverted ? "bg-ink-950" : "bg-grey-100"
                    )}
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
                    "flex min-h-[72px] flex-col items-start gap-1 border-none p-2 transition-colors duration-100",
                    isSelected
                      ? inverted
                        ? "bg-white shadow-[inset_0_0_0_2px_hsl(239,84%,67%)]"
                        : "bg-black shadow-[inset_0_0_0_2px_hsl(239,84%,67%)]"
                      : isToday
                        ? inverted ? "bg-grey-800" : "bg-grey-100"
                        : inverted ? "bg-ink-900 hover:bg-grey-800" : "bg-white hover:bg-grey-50",
                    dayIndex < 6 && (inverted ? "border-r border-grey-800" : "border-r border-grey-100"),
                    isDisabled ? "cursor-not-allowed opacity-40" : "cursor-pointer"
                  )}
                >
                  <span className={clsx(
                    "font-heading text-base",
                    isSelected
                      ? inverted ? "text-black" : "text-white"
                      : inverted ? "text-white" : "text-black"
                  )}>
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
                      className="w-full cursor-pointer truncate px-1 py-0.5 text-left font-code text-[10px] tracking-wide text-white"
                      style={{ backgroundColor: event.color || ink[800] }}
                    >
                      {event.title}
                    </div>
                  ))}
                  {dayEvents.length > 2 && (
                    <span className={clsx(
                      "font-code text-[10px]",
                      isSelected
                        ? inverted ? "text-grey-600" : "text-grey-400"
                        : inverted ? "text-grey-500" : "text-grey-500"
                    )}>
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
      <div className={clsx(
        "flex justify-center border-t-2 py-3",
        inverted ? "border-grey-700" : "border-grey-200"
      )}>
        <button
          onClick={goToToday}
          className={clsx(
            "cursor-pointer border-2 rounded-[var(--radius-button)] px-4 py-2 font-code text-sm uppercase tracking-widest transition-all duration-100 ease-[var(--ease-bounce)]",
            inverted
              ? "border-grey-500 bg-transparent text-grey-200 shadow-[2px_2px_0_rgba(255,255,255,0.1)] hover:border-white hover:bg-white hover:text-black hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[3px_3px_0_rgba(255,255,255,0.2)]"
              : "border-black bg-transparent text-black shadow-[2px_2px_0_rgba(0,0,0,0.1)] hover:bg-grey-100 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[3px_3px_0_rgba(0,0,0,0.15)]"
          )}
        >
          TODAY
        </button>
      </div>
    </div>
  );
}

export default Calendar;
