"use client";

import { useState, useEffect, useCallback, useRef } from "react";

// =============================================================================
// TYPES
// =============================================================================

export interface CollaborationUser {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  color: string;
}

export interface FieldPresenceState {
  isLocked: boolean;
  lockedBy?: CollaborationUser;
  isEditing: boolean;
  editingBy?: CollaborationUser;
}

export interface PresenceState {
  user: CollaborationUser;
  cursor?: { x: number; y: number };
  selection?: { start: number; end: number };
  editing?: string; // field name being edited
  lastSeen: string;
}

export interface UseFieldPresenceOptions {
  /** Document ID */
  documentId: string;
  /** Field name */
  field: string;
  /** Current user */
  currentUser: CollaborationUser;
  /** Presence states from collaboration context */
  presenceStates?: Record<string, PresenceState>;
  /** Lock check function */
  checkLock?: (documentId: string, field: string) => Promise<{ isLocked: boolean; lockedBy?: CollaborationUser }>;
  /** Lock acquire function */
  acquireLock?: (documentId: string, field: string, userId: string) => Promise<boolean>;
  /** Lock release function */
  releaseLock?: (documentId: string, field: string, userId: string) => Promise<void>;
  /** Update presence function */
  updatePresence?: (updates: Partial<PresenceState>) => Promise<void>;
}

export interface UseFieldPresenceReturn {
  /** Current field presence state */
  presence: FieldPresenceState;
  /** Start editing this field */
  startEditing: () => Promise<boolean>;
  /** Stop editing this field */
  stopEditing: () => Promise<void>;
  /** Check if current user can edit */
  canEdit: boolean;
  /** Loading state */
  loading: boolean;
}

// =============================================================================
// HOOK
// =============================================================================

export function useFieldPresence({
  documentId,
  field,
  currentUser,
  presenceStates = {},
  checkLock,
  acquireLock,
  releaseLock,
  updatePresence,
}: UseFieldPresenceOptions): UseFieldPresenceReturn {
  const [presence, setPresence] = useState<FieldPresenceState>({
    isLocked: false,
    isEditing: false,
  });
  const [loading, setLoading] = useState(false);
  const isEditingRef = useRef(false);

  // Derive presence from collaboration states
  useEffect(() => {
    const otherUsers = Object.values(presenceStates).filter(
      (state) => state.user.id !== currentUser.id
    );

    // Check if anyone else is editing this field
    const editingUser = otherUsers.find((state) => state.editing === field);

    setPresence((prev) => ({
      ...prev,
      isEditing: !!editingUser,
      editingBy: editingUser?.user,
    }));
  }, [presenceStates, currentUser.id, field]);

  // Check lock status periodically
  useEffect(() => {
    if (!checkLock) return;

    const checkLockStatus = async () => {
      const result = await checkLock(documentId, field);
      setPresence((prev) => ({
        ...prev,
        isLocked: result.isLocked && result.lockedBy?.id !== currentUser.id,
        lockedBy: result.lockedBy,
      }));
    };

    checkLockStatus();
    const interval = setInterval(checkLockStatus, 5000);

    return () => clearInterval(interval);
  }, [documentId, field, currentUser.id, checkLock]);

  // Start editing
  const startEditing = useCallback(async (): Promise<boolean> => {
    if (presence.isLocked || presence.isEditing) {
      return false;
    }

    setLoading(true);
    try {
      // Try to acquire lock
      if (acquireLock) {
        const success = await acquireLock(documentId, field, currentUser.id);
        if (!success) {
          setLoading(false);
          return false;
        }
      }

      // Update presence to show we're editing
      if (updatePresence) {
        await updatePresence({ editing: field });
      }

      isEditingRef.current = true;
      setLoading(false);
      return true;
    } catch {
      setLoading(false);
      return false;
    }
  }, [documentId, field, currentUser.id, presence.isLocked, presence.isEditing, acquireLock, updatePresence]);

  // Stop editing
  const stopEditing = useCallback(async (): Promise<void> => {
    if (!isEditingRef.current) return;

    setLoading(true);
    try {
      // Release lock
      if (releaseLock) {
        await releaseLock(documentId, field, currentUser.id);
      }

      // Clear editing presence
      if (updatePresence) {
        await updatePresence({ editing: undefined });
      }

      isEditingRef.current = false;
    } finally {
      setLoading(false);
    }
  }, [documentId, field, currentUser.id, releaseLock, updatePresence]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isEditingRef.current) {
        // Fire and forget cleanup
        if (releaseLock) {
          releaseLock(documentId, field, currentUser.id);
        }
        if (updatePresence) {
          updatePresence({ editing: undefined });
        }
      }
    };
  }, [documentId, field, currentUser.id, releaseLock, updatePresence]);

  const canEdit = !presence.isLocked && !presence.isEditing;

  return {
    presence,
    startEditing,
    stopEditing,
    canEdit,
    loading,
  };
}

export default useFieldPresence;
