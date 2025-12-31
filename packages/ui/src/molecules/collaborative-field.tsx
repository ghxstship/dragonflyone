"use client";

import React, { useState, useEffect, useCallback } from "react";
import clsx from "clsx";
import { Lock, User } from "lucide-react";
import { Tooltip } from "../atoms/tooltip.js";

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

export interface CollaborativeFieldProps {
  /** Field identifier */
  field: string;
  /** Document ID for collaboration context */
  documentId: string;
  /** Current user */
  currentUser?: CollaborationUser;
  /** Field presence state from collaboration hook */
  presence?: FieldPresenceState;
  /** Called when user starts editing */
  onEditStart?: () => void;
  /** Called when user stops editing */
  onEditEnd?: () => void;
  /** Called to acquire lock */
  onLockAcquire?: () => Promise<boolean>;
  /** Called to release lock */
  onLockRelease?: () => void;
  /** Children to render */
  children: React.ReactNode;
  /** Additional class name */
  className?: string;
}

// =============================================================================
// PRESENCE INDICATOR
// =============================================================================

interface PresenceIndicatorProps {
  user: CollaborationUser;
  type: "editing" | "viewing";
}

function PresenceIndicator({ user, type }: PresenceIndicatorProps) {
  return (
    <div 
      className={clsx(
        "absolute -top-spacing-2 -right-spacing-2 flex items-center gap-gap-xs px-spacing-2 py-spacing-1 rounded-badge text-body-xs font-code animate-pop-in z-content-overlay",
        "border-2 shadow-xs"
      )}
      style={{ 
        backgroundColor: user.color + "20",
        borderColor: user.color,
        color: user.color 
      }}
    >
      {user.avatar ? (
        <img src={user.avatar} alt={user.name} className="size-4 rounded-avatar" />
      ) : (
        <User className="size-3" />
      )}
      <span className="max-w-container-xs truncate">{user.name}</span>
      {type === "editing" && (
        <span className="inline-block w-2 h-2 rounded-avatar animate-pulse" style={{ backgroundColor: user.color }} />
      )}
    </div>
  );
}

// =============================================================================
// LOCK INDICATOR
// =============================================================================

interface LockIndicatorProps {
  user: CollaborationUser;
}

function LockIndicator({ user }: LockIndicatorProps) {
  return (
    <div 
      className="absolute inset-0 flex items-center justify-center bg-surface-primary/80 rounded-card z-content-controls"
    >
      <div className="flex flex-col items-center gap-gap-xs text-center p-spacing-4">
        <Lock className="size-6 text-warning-500" />
        <p className="text-body-sm text-on-dark-disabled">
          Locked by <span className="font-code" style={{ color: user.color }}>{user.name}</span>
        </p>
      </div>
    </div>
  );
}

// =============================================================================
// COLLABORATIVE CURSOR
// =============================================================================

export interface CollaborativeCursorProps {
  user: CollaborationUser;
  position: { x: number; y: number };
}

export function CollaborativeCursor({ user, position }: CollaborativeCursorProps) {
  return (
    <div 
      className="absolute pointer-events-none z-tooltip animate-pop-in"
      style={{ 
        left: position.x, 
        top: position.y,
        transform: "translate(-2px, -2px)"
      }}
    >
      {/* Cursor arrow */}
      <svg 
        width="16" 
        height="20" 
        viewBox="0 0 16 20" 
        fill="none"
        style={{ filter: `drop-shadow(1px 1px 0 ${user.color})` }}
      >
        <path 
          d="M0 0L16 12L8 12L4 20L0 0Z" 
          fill={user.color}
        />
      </svg>
      {/* User label */}
      <div 
        className="absolute left-spacing-4 top-spacing-4 px-spacing-2 py-spacing-1 rounded-badge text-body-xs font-code whitespace-nowrap"
        style={{ 
          backgroundColor: user.color,
          color: "white"
        }}
      >
        {user.name}
      </div>
    </div>
  );
}

// =============================================================================
// COLLABORATIVE FIELD WRAPPER
// =============================================================================

export function CollaborativeField({
  field,
  documentId,
  currentUser,
  presence,
  onEditStart,
  onEditEnd,
  onLockAcquire,
  onLockRelease,
  children,
  className,
}: CollaborativeFieldProps) {
  const [isLocalEditing, setIsLocalEditing] = useState(false);
  const [lockFailed, setLockFailed] = useState(false);

  const isLocked = presence?.isLocked && presence.lockedBy?.id !== currentUser?.id;
  const isBeingEdited = presence?.isEditing && presence.editingBy?.id !== currentUser?.id;

  // Handle focus - start editing
  const handleFocus = useCallback(async () => {
    if (isLocked) return;
    
    // Try to acquire lock if handler provided
    if (onLockAcquire) {
      const success = await onLockAcquire();
      if (!success) {
        setLockFailed(true);
        return;
      }
    }
    
    setIsLocalEditing(true);
    setLockFailed(false);
    onEditStart?.();
  }, [isLocked, onLockAcquire, onEditStart]);

  // Handle blur - stop editing
  const handleBlur = useCallback(() => {
    setIsLocalEditing(false);
    onEditEnd?.();
    onLockRelease?.();
  }, [onEditEnd, onLockRelease]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isLocalEditing) {
        onEditEnd?.();
        onLockRelease?.();
      }
    };
  }, [isLocalEditing, onEditEnd, onLockRelease]);

  return (
    <div 
      className={clsx(
        "relative",
        isLocked && "opacity-50 pointer-events-none",
        lockFailed && "ring-2 ring-error-500 rounded-card",
        className
      )}
      onFocus={handleFocus}
      onBlur={handleBlur}
      data-field={field}
      data-document={documentId}
    >
      {/* Show who is editing this field */}
      {isBeingEdited && presence?.editingBy && (
        <PresenceIndicator user={presence.editingBy} type="editing" />
      )}
      
      {/* Show lock overlay if locked by another user */}
      {isLocked && presence?.lockedBy && (
        <LockIndicator user={presence.lockedBy} />
      )}
      
      {/* Field content */}
      {children}
      
      {/* Lock failed message */}
      {lockFailed && (
        <p className="text-error-500 text-body-xs mt-spacing-1">
          Could not acquire lock. Please try again.
        </p>
      )}
    </div>
  );
}

// =============================================================================
// COLLABORATORS LIST
// =============================================================================

export interface CollaboratorsListProps {
  collaborators: CollaborationUser[];
  currentUserId?: string;
  maxVisible?: number;
  className?: string;
}

export function CollaboratorsList({ 
  collaborators, 
  currentUserId,
  maxVisible = 5,
  className 
}: CollaboratorsListProps) {
  const otherCollaborators = collaborators.filter(c => c.id !== currentUserId);
  const visibleCollaborators = otherCollaborators.slice(0, maxVisible);
  const hiddenCount = otherCollaborators.length - maxVisible;

  if (otherCollaborators.length === 0) return null;

  return (
    <div className={clsx("flex items-center gap-gap-xs", className)}>
      <span className="text-body-sm text-on-dark-disabled">Collaborators:</span>
      <div className="flex -space-x-spacing-2">
        {visibleCollaborators.map((user) => (
          <Tooltip key={user.id} content={user.name}>
            <div className="relative group">
              {user.avatar ? (
                <img 
                  src={user.avatar} 
                  alt={user.name} 
                  className="size-8 rounded-avatar border-2 border-surface-primary"
                  style={{ borderColor: user.color }}
                />
              ) : (
                <div 
                  className="size-8 rounded-avatar border-2 border-surface-primary flex items-center justify-center text-body-xs font-code text-white"
                  style={{ backgroundColor: user.color }}
                >
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
            {/* Online indicator */}
              <span 
                className="absolute bottom-0 right-0 size-2 rounded-avatar border border-surface-primary"
                style={{ backgroundColor: user.color }}
              />
            </div>
          </Tooltip>
        ))}
        {hiddenCount > 0 && (
          <div className="size-8 rounded-avatar bg-grey-200 border-2 border-surface-primary flex items-center justify-center text-body-xs font-code text-on-dark-disabled">
            +{hiddenCount}
          </div>
        )}
      </div>
    </div>
  );
}

export default CollaborativeField;
