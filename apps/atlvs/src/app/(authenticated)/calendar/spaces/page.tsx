'use client';

import {
  Body,
  Button,
  H1,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Text,
} from '@ghxstship/ui';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft, ChevronLeft, ChevronRight, Check, X, Clock } from 'lucide-react';
import { useSpaceAvailability } from '@/hooks/useCalendar';

export default function CalendarSpacesPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedVenue] = useState<string>('');

  const startDate = useMemo(() => {
    const date = new Date(currentDate);
    date.setDate(1);
    return date.toISOString().split('T')[0];
  }, [currentDate]);

  const endDate = useMemo(() => {
    const date = new Date(currentDate);
    date.setMonth(date.getMonth() + 1, 0);
    return date.toISOString().split('T')[0];
  }, [currentDate]);

  const { data, isLoading, error } = useSpaceAvailability({
    start_date: startDate,
    end_date: endDate,
    venue_id: selectedVenue || undefined,
  });

  const spaces = data?.spaces || [];

  const navigatePrev = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setCurrentDate(newDate);
  };

  const navigateNext = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setCurrentDate(newDate);
  };

  const formatMonthYear = () => {
    return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const getDaysInMonth = () => {
    const days: Date[] = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      days.push(new Date(d));
    }
    return days;
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-muted-foreground">Loading availability...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-12 bg-destructive/10 border-2 border-destructive rounded-card">
          <Body className="text-destructive">Failed to load availability</Body>
        </div>
      </div>
    );
  }

  const days = getDaysInMonth();

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/calendar"
              className="p-2 hover:bg-muted rounded-button transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-muted-foreground" />
            </Link>
            <div>
              <H1 className="text-h2-md font-weight-bold text-foreground">Space Availability</H1>
              <Body className="text-body-sm text-muted-foreground mt-1">
                View availability across all spaces
              </Body>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Button
                onClick={navigatePrev}
                className="p-2 hover:bg-muted rounded-button transition-colors"
              >
                <ChevronLeft className="h-5 w-5 text-muted-foreground" />
              </Button>
              <Text className="text-body-md font-weight-medium text-foreground min-w-[180px] text-center">
                {formatMonthYear()}
              </Text>
              <Button
                onClick={navigateNext}
                className="p-2 hover:bg-muted rounded-button transition-colors"
              >
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </Button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-success-100 border-2 border-success-300 rounded" />
            <Text className="text-body-sm text-muted-foreground">Available</Text>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-error-100 border-2 border-error-300 rounded" />
            <Text className="text-body-sm text-muted-foreground">Booked</Text>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-violet-100 border-2 border-violet-300 rounded" />
            <Text className="text-body-sm text-muted-foreground">Hold</Text>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        {spaces.length === 0 ? (
          <div className="text-center py-12 bg-muted/30 border-2 border-dashed border-border rounded-card">
            <Body className="text-body-md text-muted-foreground">No spaces found</Body>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table className="w-full border-collapse">
              <TableHeader>
                <TableRow>
                  <TableHead className="sticky left-0 z-10 bg-background p-2 text-left text-body-sm font-weight-medium text-muted-foreground border-b border-r border-border min-w-[200px]">
                    Space
                  </TableHead>
                  {days.map((day) => (
                    <TableHead
                      key={day.toISOString()}
                      className={`p-1 text-center text-body-xs border-b border-border min-w-[40px] ${
                        isToday(day) ? 'bg-primary/10' : ''
                      }`}
                    >
                      <div className="text-muted-foreground">
                        {day.toLocaleDateString('en-US', { weekday: 'short' }).charAt(0)}
                      </div>
                      <div className={`font-weight-medium ${isToday(day) ? 'text-primary' : 'text-foreground'}`}>
                        {day.getDate()}
                      </div>
                    </TableHead>
                  ))}
                  <TableHead className="p-2 text-right text-body-sm font-weight-medium text-muted-foreground border-b border-l border-border min-w-[100px]">
                    Availability
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {spaces.map((spaceData) => (
                  <TableRow key={spaceData.space.id} className="hover:bg-muted/30">
                    <TableCell className="sticky left-0 z-10 bg-background p-2 border-b border-r border-border">
                      <Link
                        href={`/spaces/${spaceData.space.id}`}
                        className="text-body-sm font-weight-medium text-foreground hover:text-primary"
                      >
                        {spaceData.space.name}
                      </Link>
                      <div className="text-body-xs text-muted-foreground">
                        {(spaceData.space.venue as { name: string })?.name} • {spaceData.space.capacity} guests
                      </div>
                    </TableCell>
                    {spaceData.availability.map((dayAvail) => {
                      const hasHold = dayAvail.holds > 0;
                      const isBooked = !dayAvail.available;

                      return (
                        <TableCell
                          key={dayAvail.date}
                          className={`p-1 text-center border-b border-border ${
                            isToday(new Date(dayAvail.date)) ? 'bg-primary/5' : ''
                          }`}
                        >
                          <div
                            className={`w-6 h-6 mx-auto rounded flex items-center justify-center ${
                              isBooked
                                ? 'bg-error-100 border-2 border-error-300'
                                : hasHold
                                  ? 'bg-violet-100 border-2 border-violet-300'
                                  : 'bg-success-100 border-2 border-success-300'
                            }`}
                          >
                            {isBooked ? (
                              <X className="h-3 w-3 text-error-600" />
                            ) : hasHold ? (
                              <Clock className="h-3 w-3 text-violet-600" />
                            ) : (
                              <Check className="h-3 w-3 text-success-600" />
                            )}
                          </div>
                        </TableCell>
                      );
                    })}
                    <TableCell className="p-2 text-right border-b border-l border-border">
                      <Text className={`text-body-sm font-weight-medium ${
                        spaceData.summary.availability_rate >= 70
                          ? 'text-success-600'
                          : spaceData.summary.availability_rate >= 40
                            ? 'text-warning-600'
                            : 'text-error-600'
                      }`}>
                        {spaceData.summary.availability_rate}%
                      </Text>
                      <div className="text-body-xs text-muted-foreground">
                        {spaceData.summary.available_days}/{spaceData.summary.total_days} days
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
