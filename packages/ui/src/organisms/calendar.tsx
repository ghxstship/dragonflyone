"use client";

import React, { useState, useMemo } from "react";
import { colors, typography, fontSizes, letterSpacing, transitions, borderWidths } from "../tokens.js";

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
    <div
      className={className}
      style={{
        backgroundColor: colors.white,
        border: `${borderWidths.medium} solid ${colors.black}`,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "1rem 1.25rem",
          borderBottom: `${borderWidths.thin} solid ${colors.grey200}`,
        }}
      >
        <button
          onClick={() => navigateMonth(-1)}
          style={{
            width: "40px",
            height: "40px",
            backgroundColor: "transparent",
            border: `${borderWidths.medium} solid ${colors.black}`,
            cursor: "pointer",
            fontFamily: typography.heading,
            fontSize: fontSizes.h5MD,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: transitions.fast,
          }}
          aria-label="Previous month"
        >
          ←
        </button>

        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontFamily: typography.heading,
              fontSize: fontSizes.h4MD,
              color: colors.black,
              letterSpacing: letterSpacing.wide,
            }}
          >
            {MONTHS[viewDate.getMonth()]}
          </div>
          <div
            style={{
              fontFamily: typography.mono,
              fontSize: fontSizes.monoSM,
              color: colors.grey600,
              letterSpacing: letterSpacing.widest,
            }}
          >
            {viewDate.getFullYear()}
          </div>
        </div>

        <button
          onClick={() => navigateMonth(1)}
          style={{
            width: "40px",
            height: "40px",
            backgroundColor: "transparent",
            border: `${borderWidths.medium} solid ${colors.black}`,
            cursor: "pointer",
            fontFamily: typography.heading,
            fontSize: fontSizes.h5MD,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: transitions.fast,
          }}
          aria-label="Next month"
        >
          →
        </button>
      </div>

      {/* Days of Week Header */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: showWeekNumbers ? "40px repeat(7, 1fr)" : "repeat(7, 1fr)",
          borderBottom: `${borderWidths.thin} solid ${colors.grey200}`,
        }}
      >
        {showWeekNumbers && (
          <div
            style={{
              padding: "0.75rem 0.5rem",
              fontFamily: typography.mono,
              fontSize: fontSizes.monoXS,
              color: colors.grey400,
              textAlign: "center",
            }}
          >
            WK
          </div>
        )}
        {daysOfWeek.map((day) => (
          <div
            key={day}
            style={{
              padding: "0.75rem 0.5rem",
              fontFamily: typography.mono,
              fontSize: fontSizes.monoXS,
              color: colors.grey600,
              letterSpacing: letterSpacing.widest,
              textAlign: "center",
            }}
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
            style={{
              display: "grid",
              gridTemplateColumns: showWeekNumbers ? "40px repeat(7, 1fr)" : "repeat(7, 1fr)",
              borderBottom: weekIndex < weeks.length - 1 ? `1px solid ${colors.grey100}` : "none",
            }}
          >
            {showWeekNumbers && (
              <div
                style={{
                  padding: "0.5rem",
                  fontFamily: typography.mono,
                  fontSize: fontSizes.monoXS,
                  color: colors.grey400,
                  textAlign: "center",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {week[0] ? getWeekNumber(week[0]) : ""}
              </div>
            )}
            {week.map((date, dayIndex) => {
              if (!date) {
                return (
                  <div
                    key={`empty-${dayIndex}`}
                    style={{
                      padding: "0.5rem",
                      minHeight: "60px",
                      backgroundColor: colors.grey100,
                    }}
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
                  style={{
                    padding: "0.5rem",
                    minHeight: "60px",
                    backgroundColor: isSelected
                      ? colors.black
                      : isToday
                      ? colors.grey100
                      : colors.white,
                    border: "none",
                    borderRight: dayIndex < 6 ? `1px solid ${colors.grey100}` : "none",
                    cursor: isDisabled ? "not-allowed" : "pointer",
                    opacity: isDisabled ? 0.4 : 1,
                    transition: transitions.fast,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    gap: "0.25rem",
                  }}
                >
                  <span
                    style={{
                      fontFamily: typography.heading,
                      fontSize: fontSizes.h6MD,
                      color: isSelected ? colors.white : colors.black,
                    }}
                  >
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
                      style={{
                        width: "100%",
                        padding: "0.125rem 0.25rem",
                        backgroundColor: event.color || colors.grey800,
                        color: colors.white,
                        fontFamily: typography.mono,
                        fontSize: fontSizes.monoXXS,
                        letterSpacing: letterSpacing.wide,
                        textAlign: "left",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        cursor: "pointer",
                      }}
                    >
                      {event.title}
                    </div>
                  ))}
                  {dayEvents.length > 2 && (
                    <span
                      style={{
                        fontFamily: typography.mono,
                        fontSize: fontSizes.monoXXS,
                        color: isSelected ? colors.grey400 : colors.grey500,
                      }}
                    >
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
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          padding: "0.75rem",
          borderTop: `${borderWidths.thin} solid ${colors.grey200}`,
        }}
      >
        <button
          onClick={goToToday}
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: "transparent",
            border: `${borderWidths.medium} solid ${colors.black}`,
            fontFamily: typography.mono,
            fontSize: fontSizes.monoSM,
            letterSpacing: letterSpacing.widest,
            cursor: "pointer",
            transition: transitions.fast,
          }}
        >
          TODAY
        </button>
      </div>
    </div>
  );
}

export default Calendar;
