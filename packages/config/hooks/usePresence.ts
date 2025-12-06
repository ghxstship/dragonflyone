/**
 * usePresence Hook
 * Simplified hook for page-level presence tracking
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '../supabase-client';

// =============================================================================
// TYPES
// =============================================================================

export interface PresenceUser {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  color?: string;
  status?: 'online' | 'away' | 'offline';
  lastActive?: string;
  currentPage?: string;
  currentRecord?: string;
}

export interface UsePresenceOptions {
  /** Current page path */
  pagePath: string;
  /** Current record ID (if viewing a specific record) */
  recordId?: string;
  /** User info */
  user: {
    id: string;
    name: string;
    email?: string;
    avatar?: string;
  };
  /** Whether to enable presence tracking */
  enabled?: boolean;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const PRESENCE_COLORS = [
  '#6366f1', // Primary indigo
  '#8b5cf6', // Secondary purple
  '#f59e0b', // Accent amber
  '#10b981', // Success green
  '#ef4444', // Error red
  '#3b82f6', // Blue
  '#ec4899', // Pink
  '#14b8a6', // Teal
];

const AWAY_TIMEOUT = 60000; // 1 minute

// =============================================================================
// HOOK
// =============================================================================

export function usePresence({
  pagePath,
  recordId,
  user,
  enabled = true,
}: UsePresenceOptions) {
  const [viewers, setViewers] = useState<PresenceUser[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const activityTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Generate consistent color from user ID
  const userColor = PRESENCE_COLORS[
    Math.abs(user.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % PRESENCE_COLORS.length
  ];

  // Create room ID from page path and optional record ID
  const roomId = recordId ? `${pagePath}:${recordId}` : pagePath;

  const markAway = useCallback(async () => {
    if (!channelRef.current) return;
    await channelRef.current.track({
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      color: userColor,
      status: 'away',
      lastActive: new Date().toISOString(),
      currentPage: pagePath,
      currentRecord: recordId,
    });
  }, [user, userColor, pagePath, recordId]);

  const markOnline = useCallback(async () => {
    if (!channelRef.current) return;
    
    await channelRef.current.track({
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      color: userColor,
      status: 'online',
      lastActive: new Date().toISOString(),
      currentPage: pagePath,
      currentRecord: recordId,
    });

    // Reset away timeout
    if (activityTimeoutRef.current) {
      clearTimeout(activityTimeoutRef.current);
    }
    activityTimeoutRef.current = setTimeout(markAway, AWAY_TIMEOUT);
  }, [user, userColor, pagePath, recordId, markAway]);

  useEffect(() => {
    if (!enabled) return;

    const channel = supabase.channel(`presence:${roomId}`, {
      config: {
        presence: {
          key: user.id,
        },
      },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const presenceState = channel.presenceState();
        const users = Object.values(presenceState)
          .flat()
          .map((p) => p as unknown as PresenceUser)
          .filter((p) => p.id !== user.id); // Exclude self
        setViewers(users);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          setIsConnected(true);
          await channel.track({
            id: user.id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            color: userColor,
            status: 'online',
            lastActive: new Date().toISOString(),
            currentPage: pagePath,
            currentRecord: recordId,
          });

          // Start away timeout
          activityTimeoutRef.current = setTimeout(markAway, AWAY_TIMEOUT);
        }
      });

    channelRef.current = channel;

    // Activity listeners to reset away status
    const handleActivity = () => {
      markOnline();
    };
    
    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('click', handleActivity);
    window.addEventListener('scroll', handleActivity);

    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('click', handleActivity);
      window.removeEventListener('scroll', handleActivity);

      if (activityTimeoutRef.current) {
        clearTimeout(activityTimeoutRef.current);
      }

      supabase.removeChannel(channel);
      setIsConnected(false);
    };
  }, [enabled, roomId, user, userColor, pagePath, recordId, markAway, markOnline]);

  return {
    /** Other users viewing this page/record */
    viewers,
    /** Total viewer count (excluding self) */
    viewerCount: viewers.length,
    /** Whether connected to presence channel */
    isConnected,
    /** Online viewers only */
    onlineViewers: viewers.filter((v) => v.status === 'online'),
    /** Away viewers */
    awayViewers: viewers.filter((v) => v.status === 'away'),
  };
}

export default usePresence;
