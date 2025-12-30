'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// =============================================================================
// CLOCK IN/OUT HOOKS
// Manage time clock entries for crew members
// =============================================================================

export interface ClockEntry {
  id: string;
  user_id: string;
  entry_type: 'clock_in' | 'break_start' | 'break_end' | 'clock_out';
  timestamp: string;
  location?: string;
  notes?: string;
  created_at: string;
}

export interface ClockStatus {
  isClockedIn: boolean;
  isOnBreak: boolean;
  clockInTime: string | null;
  totalHoursToday: number;
  totalHoursWeek: number;
  totalHoursPayPeriod: number;
  overtimeHours: number;
}

// Fetch today's clock entries for current user
export function useClockEntries(userId: string) {
  return useQuery({
    queryKey: ['clock-entries', userId],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('time_clock_entries')
        .select('*')
        .eq('user_id', userId)
        .gte('timestamp', `${today}T00:00:00`)
        .order('timestamp', { ascending: true });

      if (error) throw error;
      return (data || []) as ClockEntry[];
    },
    enabled: !!userId,
  });
}

// Get current clock status
export function useClockStatus(userId: string) {
  return useQuery({
    queryKey: ['clock-status', userId],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      
      // Get today's entries
      const { data: todayEntries, error } = await supabase
        .from('time_clock_entries')
        .select('*')
        .eq('user_id', userId)
        .gte('timestamp', `${today}T00:00:00`)
        .order('timestamp', { ascending: true });

      if (error) throw error;

      const entries = (todayEntries || []) as ClockEntry[];
      
      // Calculate status from entries
      let isClockedIn = false;
      let isOnBreak = false;
      let clockInTime: string | null = null;

      for (const entry of entries) {
        switch (entry.entry_type) {
          case 'clock_in':
            isClockedIn = true;
            isOnBreak = false;
            clockInTime = entry.timestamp;
            break;
          case 'clock_out':
            isClockedIn = false;
            isOnBreak = false;
            clockInTime = null;
            break;
          case 'break_start':
            isOnBreak = true;
            break;
          case 'break_end':
            isOnBreak = false;
            break;
        }
      }

      // Get weekly totals from time_entries table
      const weekStart = getWeekStart();
      const { data: weekEntries } = await supabase
        .from('workforce_time_entries')
        .select('hours_regular, hours_overtime')
        .eq('user_id', userId)
        .gte('date', weekStart);

      const weeklyHours = (weekEntries || []).reduce((sum, e) => sum + (e.hours_regular || 0), 0);
      const overtimeHours = (weekEntries || []).reduce((sum, e) => sum + (e.hours_overtime || 0), 0);

      return {
        isClockedIn,
        isOnBreak,
        clockInTime,
        totalHoursToday: calculateTodayHours(entries),
        totalHoursWeek: weeklyHours,
        totalHoursPayPeriod: weeklyHours * 2, // Approximation
        overtimeHours,
      } as ClockStatus;
    },
    enabled: !!userId,
    refetchInterval: 60000, // Refresh every minute
  });
}

// Clock in
export function useClockIn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, location }: { userId: string; location?: string }) => {
      const { data, error } = await supabase
        .from('time_clock_entries')
        .insert({
          user_id: userId,
          entry_type: 'clock_in',
          timestamp: new Date().toISOString(),
          location,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['clock-entries', variables.userId] });
      queryClient.invalidateQueries({ queryKey: ['clock-status', variables.userId] });
    },
  });
}

// Clock out
export function useClockOut() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, location }: { userId: string; location?: string }) => {
      const { data, error } = await supabase
        .from('time_clock_entries')
        .insert({
          user_id: userId,
          entry_type: 'clock_out',
          timestamp: new Date().toISOString(),
          location,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['clock-entries', variables.userId] });
      queryClient.invalidateQueries({ queryKey: ['clock-status', variables.userId] });
    },
  });
}

// Start break
export function useStartBreak() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId }: { userId: string }) => {
      const { data, error } = await supabase
        .from('time_clock_entries')
        .insert({
          user_id: userId,
          entry_type: 'break_start',
          timestamp: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['clock-entries', variables.userId] });
      queryClient.invalidateQueries({ queryKey: ['clock-status', variables.userId] });
    },
  });
}

// End break
export function useEndBreak() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId }: { userId: string }) => {
      const { data, error } = await supabase
        .from('time_clock_entries')
        .insert({
          user_id: userId,
          entry_type: 'break_end',
          timestamp: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['clock-entries', variables.userId] });
      queryClient.invalidateQueries({ queryKey: ['clock-status', variables.userId] });
    },
  });
}

// Helper functions
function getWeekStart(): string {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diff = now.getDate() - dayOfWeek;
  const weekStart = new Date(now.setDate(diff));
  return weekStart.toISOString().split('T')[0];
}

function calculateTodayHours(entries: ClockEntry[]): number {
  let totalMs = 0;
  let clockInTime: Date | null = null;
  let breakStartTime: Date | null = null;

  for (const entry of entries) {
    const timestamp = new Date(entry.timestamp);
    
    switch (entry.entry_type) {
      case 'clock_in':
        clockInTime = timestamp;
        break;
      case 'clock_out':
        if (clockInTime) {
          totalMs += timestamp.getTime() - clockInTime.getTime();
          clockInTime = null;
        }
        break;
      case 'break_start':
        breakStartTime = timestamp;
        break;
      case 'break_end':
        if (breakStartTime) {
          // Subtract break time
          totalMs -= timestamp.getTime() - breakStartTime.getTime();
          breakStartTime = null;
        }
        break;
    }
  }

  // If still clocked in, add time until now
  if (clockInTime) {
    totalMs += Date.now() - clockInTime.getTime();
  }

  return totalMs / (1000 * 60 * 60); // Convert to hours
}
