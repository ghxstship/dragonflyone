"use client";

/**
 * Event Calendar Page
 * Calendar view for browsing events
 * Uses DetailPage template for consistent layout
 */

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, List } from "lucide-react";
import {
  Body,
  Button,
  Card,
  Grid,
  Badge,
  DetailPage,
  Section,
  SectionHeader,
  Link,
  Box,
  Stack,
} from "@ghxstship/ui";
import { useEvents } from "@/hooks/useEvents";

interface CalendarEvent {
  id: string;
  title?: string;
  name?: string;
  date?: string;
  start_date?: string;
  venue?: string;
  category?: string;
  price?: number;
}

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  events: CalendarEvent[];
}

export default function CalendarPage() {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<"month" | "week">("month");

  const { data: events, isLoading, error, refetch } = useEvents({ status: "published" });

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days: CalendarDay[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);

      const dayEvents = (events || []).filter((event: CalendarEvent) => {
        const eventDate = new Date(event.date || event.start_date || "");
        return eventDate.toDateString() === date.toDateString();
      });

      days.push({
        date,
        isCurrentMonth: date.getMonth() === month,
        isToday: date.toDateString() === today.toDateString(),
        events: dayEvents,
      });
    }

    return days;
  }, [currentDate, events]);

  const selectedDayEvents = useMemo(() => {
    if (!selectedDate) return [];
    return (events || []).filter((event: CalendarEvent) => {
      const eventDate = new Date(event.date || event.start_date || "");
      return eventDate.toDateString() === selectedDate.toDateString();
    });
  }, [selectedDate, events]);

  const upcomingEvents = useMemo(() => {
    return (events || [])
      .filter((event: CalendarEvent) => {
        const eventDate = new Date(event.date || event.start_date || "");
        return eventDate.getMonth() === currentDate.getMonth() && eventDate.getFullYear() === currentDate.getFullYear() && eventDate >= new Date();
      })
      .slice(0, 5);
  }, [events, currentDate]);

  const handlePrevMonth = useCallback(() => setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1)), []);
  const handleNextMonth = useCallback(() => setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1)), []);
  const handleToday = useCallback(() => { setCurrentDate(new Date()); setSelectedDate(new Date()); }, []);
  const handleDayClick = useCallback((day: CalendarDay) => setSelectedDate(day.date), []);
  const handleEventClick = (eventId: string) => router.push(`/events/${eventId}`);

  const headerActions = (
    <Box className="flex items-center gap-2">
      <Button variant={viewMode === "month" ? "solid" : "outline"} onClick={() => setViewMode("month")}>Month</Button>
      <Button variant={viewMode === "week" ? "solid" : "outline"} onClick={() => setViewMode("week")}>Week</Button>
    </Box>
  );

  const tabs = [
    {
      id: "calendar",
      label: "Calendar",
      icon: <CalendarIcon className="size-4" />,
      content: (
        <Section>
          <Grid cols={3} gap={8} className="grid-cols-1 lg:grid-cols-3">
            <Box className="lg:col-span-2">
              <Card className="p-6">
                <Box className="flex items-center justify-between mb-6">
                  <Button variant="ghost" onClick={handlePrevMonth} icon={<ChevronLeft className="size-4" />} />
                  <Body className="font-weight-bold">{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</Body>
                  <Button variant="ghost" onClick={handleNextMonth} icon={<ChevronRight className="size-4" />} />
                </Box>

                <Button variant="outline" className="mb-4" onClick={handleToday}>Today</Button>

                {/* eslint-disable-next-line no-restricted-syntax -- Calendar requires 7-column grid which Grid component doesn't support */}
                <Box className="grid grid-cols-7 gap-1">
                  {dayNames.map((day) => (
                    <Box key={day} className="p-2 text-center">
                      <Body size="sm" className="text-on-dark-muted">{day}</Body>
                    </Box>
                  ))}

                  {calendarDays.map((day, index) => (
                    <Card
                      key={index}
                      className={`min-h-[80px] cursor-pointer p-2 transition-colors ${!day.isCurrentMonth ? "opacity-50" : ""} ${day.isToday ? "ring-2 ring-primary" : ""} ${selectedDate?.toDateString() === day.date.toDateString() ? "bg-primary text-white" : ""}`}
                      onClick={() => handleDayClick(day)}
                    >
                      <Body className={selectedDate?.toDateString() === day.date.toDateString() ? "text-white" : ""}>{day.date.getDate()}</Body>
                      {day.events.length > 0 && (
                        <Stack gap={1} className="mt-1">
                          {day.events.slice(0, 2).map((event) => (
                            <Badge key={event.id} variant={selectedDate?.toDateString() === day.date.toDateString() ? "outline" : "info"} size="sm" className="truncate block">
                              {event.title || event.name}
                            </Badge>
                          ))}
                          {day.events.length > 2 && <Body size="sm" className="text-on-dark-muted">+{day.events.length - 2} more</Body>}
                        </Stack>
                      )}
                    </Card>
                  ))}
                </Box>
              </Card>
            </Box>

            <Stack gap={6}>
              <Card className="p-6">
                <SectionHeader title={selectedDate ? selectedDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }) : "Select a Date"} />
                {selectedDate ? (
                  selectedDayEvents.length > 0 ? (
                    <Stack gap={4} className="mt-4">
                      {selectedDayEvents.map((event: CalendarEvent) => (
                        <Card key={event.id} className="p-4 cursor-pointer hover:border-primary" onClick={() => handleEventClick(event.id)}>
                          <Body className="font-weight-medium">{event.title || event.name}</Body>
                          <Body size="sm" className="text-on-dark-muted">{event.venue}</Body>
                          <Box className="flex gap-2 mt-2">
                            <Badge variant="outline">{event.category}</Badge>
                            <Badge variant="success">From ${event.price}</Badge>
                          </Box>
                        </Card>
                      ))}
                    </Stack>
                  ) : (
                    <Body className="text-on-dark-muted mt-4">No events on this date.</Body>
                  )
                ) : (
                  <Body className="text-on-dark-muted mt-4">Click on a date to see events.</Body>
                )}
              </Card>

              <Card className="p-6">
                <SectionHeader title="Upcoming This Month" />
                <Stack gap={3} className="mt-4">
                  {upcomingEvents.map((event: CalendarEvent) => (
                    <Link key={event.id} href={`/events/${event.id}`} className="flex items-center justify-between py-2 border-b border-border">
                      <Box>
                        <Body className="font-weight-medium">{event.title || event.name}</Body>
                        <Body size="sm" className="text-on-dark-muted">{new Date(event.date || event.start_date || "").toLocaleDateString()}</Body>
                      </Box>
                      <Badge variant="outline">${event.price || 0}</Badge>
                    </Link>
                  ))}
                </Stack>
              </Card>
            </Stack>
          </Grid>
        </Section>
      ),
    },
    {
      id: "list",
      label: "List View",
      icon: <List className="size-4" />,
      content: (
        <Section>
          <SectionHeader title="All Events" description="Browse all upcoming events" />
          <Stack gap={4} className="mt-4">
            {(events || []).slice(0, 20).map((event: CalendarEvent) => (
              <Card key={event.id} className="p-4 cursor-pointer hover:border-primary" onClick={() => handleEventClick(event.id)}>
                <Box className="flex items-center justify-between">
                  <Box>
                    <Body className="font-weight-medium">{event.title || event.name}</Body>
                    <Body size="sm" className="text-on-dark-muted">{event.venue} • {new Date(event.date || event.start_date || "").toLocaleDateString()}</Body>
                  </Box>
                  <Box className="flex gap-2">
                    <Badge variant="outline">{event.category}</Badge>
                    <Badge variant="success">From ${event.price}</Badge>
                  </Box>
                </Box>
              </Card>
            ))}
          </Stack>
        </Section>
      ),
    },
  ];

  return (
    <DetailPage
      header={{
        kicker: "Plan Your Events",
        title: "Event Calendar",
        description: "Browse and discover upcoming events",
      }}
      loading={isLoading}
      error={error instanceof Error ? error : null}
      onRetry={refetch}
      tabs={tabs}
      actions={headerActions}
    />
  );
}
