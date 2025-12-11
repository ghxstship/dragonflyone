import { describe, it, expect } from 'vitest';
import {
  eventDetailsKeys,
  type EventDetails,
} from '../useEventDetails';

describe('useEventDetails', () => {
  describe('eventDetailsKeys', () => {
    it('should generate correct all query key', () => {
      const key = eventDetailsKeys.all;
      expect(key).toEqual(['event-details']);
    });

    it('should generate correct detail query key', () => {
      const key = eventDetailsKeys.detail('event-123');
      expect(key).toEqual(['event-details', 'event-123']);
    });

    it('should generate unique keys for different events', () => {
      const key1 = eventDetailsKeys.detail('event-1');
      const key2 = eventDetailsKeys.detail('event-2');
      
      expect(key1).not.toEqual(key2);
      expect(key1[1]).toBe('event-1');
      expect(key2[1]).toBe('event-2');
    });
  });

  describe('EventDetails interface', () => {
    it('should have correct structure', () => {
      const event: EventDetails = {
        id: 'event-123',
        title: 'Summer Music Festival',
        date: '2024-12-15T19:00:00Z',
        venue: 'Madison Square Garden',
      };

      expect(event.id).toBe('event-123');
      expect(event.title).toBe('Summer Music Festival');
      expect(event.date).toBe('2024-12-15T19:00:00Z');
      expect(event.venue).toBe('Madison Square Garden');
    });

    it('should support optional description', () => {
      const event: EventDetails = {
        id: 'event-456',
        title: 'Concert',
        date: '2024-12-20T20:00:00Z',
        venue: 'The Forum',
        description: 'An incredible night of live music',
      };

      expect(event.description).toBe('An incredible night of live music');
    });

    it('should support optional imageUrl', () => {
      const event: EventDetails = {
        id: 'event-789',
        title: 'Festival',
        date: '2024-12-25T18:00:00Z',
        venue: 'Central Park',
        imageUrl: 'https://example.com/event.jpg',
      };

      expect(event.imageUrl).toBe('https://example.com/event.jpg');
    });

    it('should support all optional fields', () => {
      const event: EventDetails = {
        id: 'event-full',
        title: 'Complete Event',
        date: '2024-12-30T21:00:00Z',
        venue: 'Hollywood Bowl',
        description: 'Full event with all details',
        imageUrl: 'https://example.com/full-event.jpg',
      };

      expect(event.id).toBe('event-full');
      expect(event.description).toBeDefined();
      expect(event.imageUrl).toBeDefined();
    });

    it('should work without optional fields', () => {
      const event: EventDetails = {
        id: 'event-minimal',
        title: 'Minimal Event',
        date: '2024-12-31T23:00:00Z',
        venue: 'Times Square',
      };

      expect(event.description).toBeUndefined();
      expect(event.imageUrl).toBeUndefined();
    });
  });
});
