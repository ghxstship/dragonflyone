"use client";

import React, { useState, useCallback } from "react";
import { Lock, User } from "lucide-react";
import { 
  collaborativeFieldVariants,
  collaborativeFieldOverlayVariants,
  collaborativeFieldIndicatorVariants,
  collaborativeFieldUserVariants,
  collaborativeFieldCursorVariants 
} from "./CollaborativeField.variants.js";
import type { 
  CollaborativeFieldProps, 
  CollaborationUser 
} from "./CollaborativeField.types.js";

/**
 * CollaborativeField component - Bold Contemporary Pop Art Adventure
 * 
 * Features:
 * - Real-time collaboration indicators
 * - Field locking mechanism
 * - User presence display
 * - Bold borders and shadows
 * - CVA-based variants for consistent theming
 * 
 * @example
 * ```tsx
 * <CollaborativeField
 *   field="title"
 *   documentId="doc-123"
 *   currentUser={{ id: "user-1", name: "John", color: "#3B82F6" }}
 *   presence={{ isLocked: true, lockedBy: { id: "user-2", name: "Jane", color: "#EF4444" } }}
 *   onLockAcquire={() => Promise.resolve(true)}
 * >
 *   <input type="text" placeholder="Enter title..." />
 * </CollaborativeField>
 * ```
 */
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
  inverted = false,
}: CollaborativeFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);

  // Handle edit start
  const handleEditStart = useCallback(async () => {
    if (presence?.isLocked && presence.lockedBy?.id !== currentUser?.id) {
      // Field is locked by another user
      return;
    }

    // Try to acquire lock if needed
    if (onLockAcquire && !presence?.isLocked) {
      const acquired = await onLockAcquire();
      if (!acquired) {
        return;
      }
    }

    setIsEditing(true);
    onEditStart?.();
  }, [presence, currentUser, onLockAcquire, onEditStart]);

  // Handle edit end
  const handleEditEnd = useCallback(() => {
    setIsEditing(false);
    onEditEnd?.();
    
    // Release lock if we had it
    if (onLockRelease && presence?.isLocked && presence.lockedBy?.id === currentUser?.id) {
      onLockRelease();
    }
  }, [presence, currentUser, onLockRelease, onEditEnd]);

  // Handle focus/blur events
  const handleFocus = useCallback(() => {
    setShowOverlay(true);
    handleEditStart();
  }, [handleEditStart]);

  const handleBlur = useCallback(() => {
    setShowOverlay(false);
    handleEditEnd();
  }, [handleEditEnd]);

  // Get user initials for avatar
  const getUserInitials = (user: CollaborationUser) => {
    return user.name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Get user color for styling
  const getUserColor = (user: CollaborationUser) => {
    return user.color || '#6B7280';
  };

  const isLocked = presence?.isLocked && presence.lockedBy?.id !== currentUser?.id;
  const isEditingByOther = presence?.isEditing && presence.editingBy?.id !== currentUser?.id;
  const lockedBy = presence?.lockedBy;
  const editingBy = presence?.editingBy;

  return (
    <div 
      className={collaborativeFieldVariants({ 
        isLocked, 
        isEditing: isEditing || isEditingByOther, 
        
        className 
      })}
    >
      {/* Field Content */}
      <div className="relative">
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child as React.ReactElement<Record<string, unknown>>, {
              onFocus: handleFocus,
              onBlur: handleBlur,
              disabled: isLocked,
              readOnly: isLocked,
              'data-field': field,
              'data-document-id': documentId,
            });
          }
          return child;
        })}

        {/* Editing Cursor */}
        {isEditingByOther && editingBy && (
          <div 
            className={collaborativeFieldCursorVariants({})}
            style={{ 
              backgroundColor: getUserColor(editingBy),
              right: '8px',
              top: '50%',
              transform: 'translateY(-50%)'
            }}
          />
        )}
      </div>

      {/* Collaboration Overlay */}
      <div className={collaborativeFieldOverlayVariants({ visible: showOverlay || isLocked })}>
        {isLocked && lockedBy && (
          <div className={collaborativeFieldIndicatorVariants({ type: "locked" })}>
            <Lock className="w-4 h-4" />
            <span>Locked by {lockedBy.name}</span>
            <div 
              className={collaborativeFieldUserVariants({})}
              style={{ backgroundColor: getUserColor(lockedBy) }}
            >
              {getUserInitials(lockedBy)}
            </div>
          </div>
        )}

        {isEditingByOther && editingBy && !isLocked && (
          <div className={collaborativeFieldIndicatorVariants({ type: "editing" })}>
            <User className="w-4 h-4" />
            <span>{editingBy.name} is editing...</span>
            <div 
              className={collaborativeFieldUserVariants({})}
              style={{ backgroundColor: getUserColor(editingBy) }}
            >
              {getUserInitials(editingBy)}
            </div>
          </div>
        )}
      </div>

      {/* Current User Indicator (when editing) */}
      {isEditing && currentUser && (
        <div className="absolute -top-2 -right-2">
          <div 
            className={collaborativeFieldUserVariants({})}
            style={{ backgroundColor: getUserColor(currentUser) }}
          >
            {getUserInitials(currentUser)}
          </div>
        </div>
      )}
    </div>
  );
}
