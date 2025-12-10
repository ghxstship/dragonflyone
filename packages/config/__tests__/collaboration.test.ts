import { describe, it, expect } from 'vitest';
import type {
  CollaborationUser,
  PresenceState,
  EditOperation,
  DocumentLock,
} from '../collaboration';

describe('collaboration', () => {
  describe('CollaborationUser interface', () => {
    it('should have all required fields', () => {
      const user: CollaborationUser = {
        id: 'user-123',
        name: 'John Doe',
        email: 'john@example.com',
        color: '#FF5733',
      };

      expect(user.id).toBe('user-123');
      expect(user.name).toBe('John Doe');
      expect(user.email).toBe('john@example.com');
      expect(user.color).toBe('#FF5733');
    });

    it('should support optional avatar', () => {
      const user: CollaborationUser = {
        id: 'user-123',
        name: 'Jane Doe',
        email: 'jane@example.com',
        avatar: 'https://example.com/avatar.jpg',
        color: '#3498DB',
      };

      expect(user.avatar).toBe('https://example.com/avatar.jpg');
    });
  });

  describe('PresenceState interface', () => {
    it('should have all required fields', () => {
      const presence: PresenceState = {
        user: {
          id: 'user-123',
          name: 'John Doe',
          email: 'john@example.com',
          color: '#FF5733',
        },
        lastSeen: new Date().toISOString(),
      };

      expect(presence.user.id).toBe('user-123');
      expect(presence.lastSeen).toBeDefined();
    });

    it('should support cursor position', () => {
      const presence: PresenceState = {
        user: {
          id: 'user-123',
          name: 'John Doe',
          email: 'john@example.com',
          color: '#FF5733',
        },
        cursor: { x: 100, y: 200 },
        lastSeen: new Date().toISOString(),
      };

      expect(presence.cursor?.x).toBe(100);
      expect(presence.cursor?.y).toBe(200);
    });

    it('should support text selection', () => {
      const presence: PresenceState = {
        user: {
          id: 'user-123',
          name: 'John Doe',
          email: 'john@example.com',
          color: '#FF5733',
        },
        selection: { start: 10, end: 25 },
        lastSeen: new Date().toISOString(),
      };

      expect(presence.selection?.start).toBe(10);
      expect(presence.selection?.end).toBe(25);
    });

    it('should support editing field indicator', () => {
      const presence: PresenceState = {
        user: {
          id: 'user-123',
          name: 'John Doe',
          email: 'john@example.com',
          color: '#FF5733',
        },
        editing: 'description',
        lastSeen: new Date().toISOString(),
      };

      expect(presence.editing).toBe('description');
    });
  });

  describe('EditOperation interface', () => {
    it('should support insert operation', () => {
      const op: EditOperation = {
        type: 'insert',
        position: 10,
        content: 'Hello World',
        userId: 'user-123',
        timestamp: new Date().toISOString(),
      };

      expect(op.type).toBe('insert');
      expect(op.position).toBe(10);
      expect(op.content).toBe('Hello World');
    });

    it('should support delete operation', () => {
      const op: EditOperation = {
        type: 'delete',
        position: 5,
        length: 10,
        userId: 'user-123',
        timestamp: new Date().toISOString(),
      };

      expect(op.type).toBe('delete');
      expect(op.length).toBe(10);
    });

    it('should support replace operation', () => {
      const op: EditOperation = {
        type: 'replace',
        position: 0,
        content: 'New content',
        length: 15,
        userId: 'user-123',
        timestamp: new Date().toISOString(),
      };

      expect(op.type).toBe('replace');
      expect(op.content).toBe('New content');
      expect(op.length).toBe(15);
    });

    it('should support format operation', () => {
      const op: EditOperation = {
        type: 'format',
        position: 0,
        length: 20,
        userId: 'user-123',
        timestamp: new Date().toISOString(),
      };

      expect(op.type).toBe('format');
    });

    it('should include user and timestamp', () => {
      const op: EditOperation = {
        type: 'insert',
        position: 0,
        content: 'Test',
        userId: 'user-456',
        timestamp: '2025-01-01T00:00:00.000Z',
      };

      expect(op.userId).toBe('user-456');
      expect(op.timestamp).toBe('2025-01-01T00:00:00.000Z');
    });
  });

  describe('DocumentLock interface', () => {
    it('should have all required fields', () => {
      const lock: DocumentLock = {
        documentId: 'doc-123',
        fieldName: 'title',
        userId: 'user-456',
        lockedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 60000).toISOString(),
      };

      expect(lock.documentId).toBe('doc-123');
      expect(lock.fieldName).toBe('title');
      expect(lock.userId).toBe('user-456');
      expect(lock.lockedAt).toBeDefined();
      expect(lock.expiresAt).toBeDefined();
    });

    it('should have expiry after lock time', () => {
      const now = Date.now();
      const lock: DocumentLock = {
        documentId: 'doc-123',
        fieldName: 'description',
        userId: 'user-789',
        lockedAt: new Date(now).toISOString(),
        expiresAt: new Date(now + 300000).toISOString(), // 5 minutes
      };

      const lockedTime = new Date(lock.lockedAt).getTime();
      const expiryTime = new Date(lock.expiresAt).getTime();
      expect(expiryTime).toBeGreaterThan(lockedTime);
    });
  });
});
