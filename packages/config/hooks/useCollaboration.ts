/**
 * Real-Time Collaboration Hooks
 * Provides presence, cursors, and live editing features
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '../supabase-client';

// =============================================================================
// TYPES
// =============================================================================

export interface CollaboratorPresence {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  color: string;
  cursor?: { x: number; y: number };
  selection?: { start: number; end: number };
  lastActive: string;
  status: 'online' | 'away' | 'offline';
}

export interface CollaborationRoom {
  id: string;
  type: 'production' | 'document' | 'schedule' | 'budget';
  resourceId: string;
  participants: CollaboratorPresence[];
}

export interface CursorPosition {
  x: number;
  y: number;
  elementId?: string;
}

export interface SelectionRange {
  start: number;
  end: number;
  fieldId?: string;
}

export interface CollaborationEvent {
  type: 'cursor_move' | 'selection_change' | 'field_focus' | 'field_blur' | 'typing';
  userId: string;
  data: Record<string, unknown>;
  timestamp: string;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const COLLABORATOR_COLORS = [
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
const _OFFLINE_TIMEOUT = 300000; // 5 minutes (reserved for future use)

// =============================================================================
// HOOKS
// =============================================================================

/**
 * Hook for managing presence in a collaboration room
 */
export function useCollaborationPresence(
  roomId: string,
  user: { id: string; name: string; email: string; avatar?: string }
) {
  const [participants, setParticipants] = useState<CollaboratorPresence[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const activityTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Assign a consistent color based on user ID
  const userColor = COLLABORATOR_COLORS[
    Math.abs(user.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % COLLABORATOR_COLORS.length
  ];

  const updatePresence = useCallback(async (updates: Partial<CollaboratorPresence>) => {
    if (!channelRef.current) return;

    await channelRef.current.track({
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      color: userColor,
      lastActive: new Date().toISOString(),
      status: 'online',
      ...updates,
    });
  }, [user, userColor]);

  const updateCursor = useCallback((cursor: CursorPosition) => {
    updatePresence({ cursor: { x: cursor.x, y: cursor.y } });
  }, [updatePresence]);

  const updateSelection = useCallback((selection: SelectionRange) => {
    updatePresence({ selection: { start: selection.start, end: selection.end } });
  }, [updatePresence]);

  const markAway = useCallback(() => {
    updatePresence({ status: 'away' });
  }, [updatePresence]);

  const markOnline = useCallback(() => {
    updatePresence({ status: 'online' });
    
    // Reset away timeout
    if (activityTimeoutRef.current) {
      clearTimeout(activityTimeoutRef.current);
    }
    activityTimeoutRef.current = setTimeout(markAway, AWAY_TIMEOUT);
  }, [updatePresence, markAway]);

  useEffect(() => {
    const channel = supabase.channel(`room:${roomId}`, {
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
          .map((p) => p as unknown as CollaboratorPresence);
        setParticipants(users);
      })
      .on('presence', { event: 'join' }, () => {
        // Collaborator joined - presence state will be updated via sync
      })
      .on('presence', { event: 'leave' }, () => {
        // Collaborator left - presence state will be updated via sync
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
            lastActive: new Date().toISOString(),
            status: 'online',
          });
          
          // Start away timeout
          activityTimeoutRef.current = setTimeout(markAway, AWAY_TIMEOUT);
        }
      });

    channelRef.current = channel;

    // Activity listeners
    const handleActivity = () => markOnline();
    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('click', handleActivity);

    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('click', handleActivity);
      
      if (activityTimeoutRef.current) {
        clearTimeout(activityTimeoutRef.current);
      }
      
      supabase.removeChannel(channel);
      setIsConnected(false);
    };
  }, [roomId, user, userColor, markAway, markOnline]);

  return {
    participants,
    isConnected,
    updateCursor,
    updateSelection,
    markAway,
    markOnline,
    userColor,
  };
}

/**
 * Hook for broadcasting collaboration events
 */
export function useCollaborationEvents(roomId: string, userId: string) {
  const channelRef = useRef<RealtimeChannel | null>(null);
  const [events, setEvents] = useState<CollaborationEvent[]>([]);

  const broadcastEvent = useCallback(async (
    type: CollaborationEvent['type'],
    data: Record<string, unknown>
  ) => {
    if (!channelRef.current) return;

    const event: CollaborationEvent = {
      type,
      userId,
      data,
      timestamp: new Date().toISOString(),
    };

    await channelRef.current.send({
      type: 'broadcast',
      event: 'collaboration_event',
      payload: event,
    });
  }, [userId]);

  useEffect(() => {
    const channel = supabase.channel(`events:${roomId}`);

    channel
      .on('broadcast', { event: 'collaboration_event' }, ({ payload }) => {
        const event = payload as CollaborationEvent;
        // Don't add own events
        if (event.userId !== userId) {
          setEvents((prev) => [...prev.slice(-50), event]); // Keep last 50 events
        }
      })
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId, userId]);

  return {
    events,
    broadcastEvent,
    broadcastCursorMove: (position: CursorPosition) => 
      broadcastEvent('cursor_move', { ...position }),
    broadcastSelectionChange: (selection: SelectionRange) =>
      broadcastEvent('selection_change', { ...selection }),
    broadcastFieldFocus: (fieldId: string) =>
      broadcastEvent('field_focus', { fieldId }),
    broadcastFieldBlur: (fieldId: string) =>
      broadcastEvent('field_blur', { fieldId }),
    broadcastTyping: (fieldId: string, isTyping: boolean) =>
      broadcastEvent('typing', { fieldId, isTyping }),
  };
}

/**
 * Hook for live document editing with conflict resolution
 */
export function useLiveEditing<T extends Record<string, unknown>>(
  documentId: string,
  initialData: T,
  onConflict?: (local: T, remote: T) => T
) {
  const [data, setData] = useState<T>(initialData);
  const [pendingChanges, setPendingChanges] = useState<Partial<T>>({});
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);

  const updateField = useCallback(<K extends keyof T>(field: K, value: T[K]) => {
    setData((prev) => ({ ...prev, [field]: value }));
    setPendingChanges((prev) => ({ ...prev, [field]: value }));
  }, []);

  const syncChanges = useCallback(async () => {
    if (Object.keys(pendingChanges).length === 0 || !channelRef.current) return;

    setIsSyncing(true);

    await channelRef.current.send({
      type: 'broadcast',
      event: 'document_update',
      payload: {
        documentId,
        changes: pendingChanges,
        timestamp: new Date().toISOString(),
      },
    });

    setPendingChanges({});
    setLastSyncedAt(new Date().toISOString());
    setIsSyncing(false);
  }, [documentId, pendingChanges]);

  useEffect(() => {
    const channel = supabase.channel(`doc:${documentId}`);

    channel
      .on('broadcast', { event: 'document_update' }, ({ payload }) => {
        const { changes, timestamp } = payload as { 
          changes: Partial<T>; 
          timestamp: string;
        };

        setData((prev) => {
          const merged = { ...prev, ...changes };
          
          // Check for conflicts with pending changes
          if (Object.keys(pendingChanges).length > 0 && onConflict) {
            return onConflict(prev, merged);
          }
          
          return merged;
        });
        
        setLastSyncedAt(timestamp);
      })
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, [documentId, pendingChanges, onConflict]);

  // Auto-sync pending changes after debounce
  useEffect(() => {
    if (Object.keys(pendingChanges).length === 0) return;

    const timeout = setTimeout(syncChanges, 500);
    return () => clearTimeout(timeout);
  }, [pendingChanges, syncChanges]);

  return {
    data,
    updateField,
    syncChanges,
    isSyncing,
    hasPendingChanges: Object.keys(pendingChanges).length > 0,
    lastSyncedAt,
  };
}

/**
 * Hook for showing typing indicators
 */
export function useTypingIndicator(roomId: string, userId: string, fieldId: string) {
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const typingTimeoutRef = useRef<Record<string, NodeJS.Timeout>>({});

  const setTyping = useCallback((isTyping: boolean) => {
    if (!channelRef.current) return;

    channelRef.current.send({
      type: 'broadcast',
      event: 'typing',
      payload: { userId, fieldId, isTyping },
    });
  }, [userId, fieldId]);

  useEffect(() => {
    const channel = supabase.channel(`typing:${roomId}:${fieldId}`);

    channel
      .on('broadcast', { event: 'typing' }, ({ payload }) => {
        const { userId: typingUserId, isTyping } = payload as {
          userId: string;
          isTyping: boolean;
        };

        if (typingUserId === userId) return;

        if (isTyping) {
          setTypingUsers((prev) => 
            prev.includes(typingUserId) ? prev : [...prev, typingUserId]
          );

          // Clear after 3 seconds of no typing
          if (typingTimeoutRef.current[typingUserId]) {
            clearTimeout(typingTimeoutRef.current[typingUserId]);
          }
          typingTimeoutRef.current[typingUserId] = setTimeout(() => {
            setTypingUsers((prev) => prev.filter((id) => id !== typingUserId));
          }, 3000);
        } else {
          setTypingUsers((prev) => prev.filter((id) => id !== typingUserId));
          if (typingTimeoutRef.current[typingUserId]) {
            clearTimeout(typingTimeoutRef.current[typingUserId]);
          }
        }
      })
      .subscribe();

    channelRef.current = channel;

    const timeouts = typingTimeoutRef.current;
    return () => {
      Object.values(timeouts).forEach(clearTimeout);
      supabase.removeChannel(channel);
    };
  }, [roomId, fieldId, userId]);

  return {
    typingUsers,
    setTyping,
    isAnyoneTyping: typingUsers.length > 0,
  };
}

// Types are exported at their definition above
