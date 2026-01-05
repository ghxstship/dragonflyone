import type { ReactNode } from "react";

/**
 * Collaboration user information
 */
export interface CollaborationUser {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  color: string;
}

/**
 * Field presence state for collaboration
 */
export interface FieldPresenceState {
  isLocked: boolean;
  lockedBy?: CollaborationUser;
  isEditing: boolean;
  editingBy?: CollaborationUser;
}

/**
 * CollaborativeField component props
 */
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
  children: ReactNode;
  
  /** Additional class name */
  className?: string;
  
  /** Inverted theme */
  inverted?: boolean;
}
