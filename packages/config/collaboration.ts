/**
 * Collaborative Editing Utilities
 * Real-time collaborative editing with conflict resolution and presence
 */

import { SupabaseClient } from '@supabase/supabase-js';
import type { Database, Json } from './supabase-types';

export interface CollaborationUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  color: string;
}

export interface PresenceState {
  user: CollaborationUser;
  cursor?: { x: number; y: number };
  selection?: { start: number; end: number };
  editing?: string; // field name being edited
  lastSeen: string;
}

export interface EditOperation {
  type: 'insert' | 'delete' | 'replace' | 'format';
  position: number;
  content?: string;
  length?: number;
  userId: string;
  timestamp: string;
}

export interface DocumentLock {
  documentId: string;
  fieldName: string;
  userId: string;
  lockedAt: string;
  expiresAt: string;
}

/**
 * Collaborative Document Manager
 */
export class CollaborativeDocument {
  private channelName: string;
  private channel: any;
  private localUser: CollaborationUser;
  private presenceCallback?: (states: Record<string, PresenceState>) => void;
  private changeCallback?: (operation: EditOperation) => void;

  constructor(
    private supabase: SupabaseClient<Database>,
    documentId: string,
    user: CollaborationUser
  ) {
    this.channelName = `document:${documentId}`;
    this.localUser = user;
    this.setupChannel();
  }

  /**
   * Setup realtime channel for collaboration
   */
  private setupChannel() {
    this.channel = this.supabase.channel(this.channelName, {
      config: {
        presence: {
          key: this.localUser.id,
        },
      },
    });

    // Track presence
    this.channel
      .on('presence', { event: 'sync' }, () => {
        const state = this.channel.presenceState();
        if (this.presenceCallback) {
          this.presenceCallback(state);
        }
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }: any) => {
        console.log('User joined:', key, newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }: any) => {
        console.log('User left:', key, leftPresences);
      });

    // Track document changes
    this.channel.on('broadcast', { event: 'edit' }, ({ payload }: any) => {
      if (payload.userId !== this.localUser.id && this.changeCallback) {
        this.changeCallback(payload as EditOperation);
      }
    });

    this.channel.subscribe(async (status: string) => {
      if (status === 'SUBSCRIBED') {
        await this.channel.track({
          user: this.localUser,
          lastSeen: new Date().toISOString(),
        });
      }
    });
  }

  /**
   * Update presence (cursor, selection, editing field)
   */
  async updatePresence(updates: Partial<Omit<PresenceState, 'user' | 'lastSeen'>>) {
    await this.channel.track({
      user: this.localUser,
      ...updates,
      lastSeen: new Date().toISOString(),
    });
  }

  /**
   * Broadcast an edit operation
   */
  async broadcastEdit(operation: Omit<EditOperation, 'userId' | 'timestamp'>) {
    const fullOperation: EditOperation = {
      ...operation,
      userId: this.localUser.id,
      timestamp: new Date().toISOString(),
    };

    await this.channel.send({
      type: 'broadcast',
      event: 'edit',
      payload: fullOperation,
    });

    return fullOperation;
  }

  /**
   * Subscribe to presence changes
   */
  onPresenceChange(callback: (states: Record<string, PresenceState>) => void) {
    this.presenceCallback = callback;
  }

  /**
   * Subscribe to document changes
   */
  onChange(callback: (operation: EditOperation) => void) {
    this.changeCallback = callback;
  }

  /**
   * Get current collaborators
   */
  getCollaborators(): PresenceState[] {
    const state = this.channel.presenceState();
    return Object.values(state).flat() as PresenceState[];
  }

  /**
   * Disconnect from collaborative session
   */
  async disconnect() {
    await this.channel.unsubscribe();
  }
}

/**
 * Document Locking Service
 * Prevents concurrent edits to the same field
 */
export class DocumentLockService {
  constructor(private supabase: SupabaseClient<Database>) {}

  /**
   * Acquire lock on a document field
   */
  async acquireLock(
    documentId: string,
    fieldName: string,
    userId: string,
    durationMs: number = 30000
  ): Promise<{ success: boolean; lock?: DocumentLock; error?: string }> {
    const expiresAt = new Date(Date.now() + durationMs).toISOString();

    try {
      // Check for existing locks
      const { data: existing, error: fetchError } = await this.supabase
        .from('document_locks')
        .select('*')
        .eq('document_id', documentId)
        .eq('field_name', fieldName)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        return { success: false, error: fetchError.message };
      }

      if (existing && existing.user_id !== userId) {
        return {
          success: false,
          error: 'Field is locked by another user',
          lock: {
            documentId: existing.document_id,
            fieldName: existing.field_name,
            userId: existing.user_id,
            lockedAt: existing.locked_at,
            expiresAt: existing.expires_at,
          },
        };
      }

      // Acquire or extend lock
      const { data, error } = await this.supabase
        .from('document_locks')
        .upsert({
          document_id: documentId,
          field_name: fieldName,
          user_id: userId,
          locked_at: new Date().toISOString(),
          expires_at: expiresAt,
        })
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return {
        success: true,
        lock: {
          documentId: data.document_id,
          fieldName: data.field_name,
          userId: data.user_id,
          lockedAt: data.locked_at,
          expiresAt: data.expires_at,
        },
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Release lock on a document field
   */
  async releaseLock(documentId: string, fieldName: string, userId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('document_locks')
        .delete()
        .eq('document_id', documentId)
        .eq('field_name', fieldName)
        .eq('user_id', userId);

      return !error;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get all active locks for a document
   */
  async getDocumentLocks(documentId: string): Promise<DocumentLock[]> {
    const { data, error } = await this.supabase
      .from('document_locks')
      .select('*')
      .eq('document_id', documentId)
      .gt('expires_at', new Date().toISOString());

    if (error || !data) return [];

    return data.map((row: any) => ({
      documentId: row.document_id,
      fieldName: row.field_name,
      userId: row.user_id,
      lockedAt: row.locked_at,
      expiresAt: row.expires_at,
    }));
  }

  /**
   * Clean up expired locks
   */
  async cleanupExpiredLocks(): Promise<number> {
    const { data, error } = await this.supabase
      .from('document_locks')
      .delete()
      .lt('expires_at', new Date().toISOString())
      .select();

    return data?.length || 0;
  }
}

/**
 * Operational Transform for conflict resolution
 * Simplified implementation for basic text operations
 */
export class OperationalTransform {
  /**
   * Transform operation A against operation B
   * Returns transformed version of A that can be applied after B
   */
  static transform(
    opA: EditOperation,
    opB: EditOperation
  ): EditOperation {
    // If operations don't conflict, return original
    if (opA.position + (opA.length || 0) <= opB.position) {
      return opA;
    }

    // Adjust position based on operation B
    const transformedOp = { ...opA };

    if (opB.type === 'insert' && opB.content) {
      // If B inserted before A, shift A's position
      if (opB.position <= opA.position) {
        transformedOp.position += opB.content.length;
      }
    } else if (opB.type === 'delete' && opB.length) {
      // If B deleted before A, shift A's position back
      if (opB.position + opB.length <= opA.position) {
        transformedOp.position -= opB.length;
      } else if (opB.position < opA.position) {
        // Partial overlap
        const overlap = Math.min(opB.position + opB.length - opA.position, opA.length || 0);
        transformedOp.position = opB.position;
        if (transformedOp.length) {
          transformedOp.length -= overlap;
        }
      }
    }

    return transformedOp;
  }

  /**
   * Apply operation to text
   */
  static apply(text: string, operation: EditOperation): string {
    switch (operation.type) {
      case 'insert':
        return (
          text.slice(0, operation.position) +
          (operation.content || '') +
          text.slice(operation.position)
        );

      case 'delete':
        return (
          text.slice(0, operation.position) +
          text.slice(operation.position + (operation.length || 0))
        );

      case 'replace':
        return (
          text.slice(0, operation.position) +
          (operation.content || '') +
          text.slice(operation.position + (operation.length || 0))
        );

      default:
        return text;
    }
  }
}

/**
 * Export collaboration utilities
 */
export const collaboration = {
  createDocument: (supabase: SupabaseClient<Database>, documentId: string, user: CollaborationUser) =>
    new CollaborativeDocument(supabase, documentId, user),
  createLockService: (supabase: SupabaseClient<Database>) => new DocumentLockService(supabase),
  OperationalTransform,
};

export default collaboration;
