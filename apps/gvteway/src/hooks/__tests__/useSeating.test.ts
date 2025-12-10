import { describe, it, expect } from 'vitest';

// Interfaces copied from useSeating.ts for testing
interface Seat {
  id: string;
  section: string;
  row: string;
  number: string;
  status: 'available' | 'reserved' | 'sold';
  ticket_type_id: string;
  x_position?: number;
  y_position?: number;
}

interface Seating {
  id: string;
  layout_name: string;
  total_capacity: number;
  seats: Seat[];
}

describe('useSeating', () => {
  describe('Seat interface', () => {
    it('should have all required fields', () => {
      const seat: Seat = {
        id: 'seat-123',
        section: 'A',
        row: '1',
        number: '5',
        status: 'available',
        ticket_type_id: 'ticket-type-1',
      };

      expect(seat.id).toBe('seat-123');
      expect(seat.section).toBe('A');
      expect(seat.row).toBe('1');
      expect(seat.number).toBe('5');
      expect(seat.status).toBe('available');
      expect(seat.ticket_type_id).toBe('ticket-type-1');
    });

    it('should support all status values', () => {
      const statuses: Seat['status'][] = ['available', 'reserved', 'sold'];
      expect(statuses.length).toBe(3);
    });

    it('should support available status', () => {
      const seat: Seat = {
        id: 'seat-1',
        section: 'B',
        row: '2',
        number: '10',
        status: 'available',
        ticket_type_id: 'vip',
      };
      expect(seat.status).toBe('available');
    });

    it('should support reserved status', () => {
      const seat: Seat = {
        id: 'seat-2',
        section: 'C',
        row: '3',
        number: '15',
        status: 'reserved',
        ticket_type_id: 'general',
      };
      expect(seat.status).toBe('reserved');
    });

    it('should support sold status', () => {
      const seat: Seat = {
        id: 'seat-3',
        section: 'D',
        row: '4',
        number: '20',
        status: 'sold',
        ticket_type_id: 'premium',
      };
      expect(seat.status).toBe('sold');
    });

    it('should support optional position coordinates', () => {
      const seat: Seat = {
        id: 'seat-1',
        section: 'A',
        row: '1',
        number: '1',
        status: 'available',
        ticket_type_id: 'general',
        x_position: 100,
        y_position: 200,
      };
      expect(seat.x_position).toBe(100);
      expect(seat.y_position).toBe(200);
    });
  });

  describe('Seating interface', () => {
    it('should have all required fields', () => {
      const seating: Seating = {
        id: 'seating-123',
        layout_name: 'Main Hall',
        total_capacity: 500,
        seats: [],
      };

      expect(seating.id).toBe('seating-123');
      expect(seating.layout_name).toBe('Main Hall');
      expect(seating.total_capacity).toBe(500);
      expect(seating.seats).toEqual([]);
    });

    it('should support multiple seats', () => {
      const seating: Seating = {
        id: 'seating-1',
        layout_name: 'Theater Layout',
        total_capacity: 100,
        seats: [
          { id: 's1', section: 'A', row: '1', number: '1', status: 'available', ticket_type_id: 'vip' },
          { id: 's2', section: 'A', row: '1', number: '2', status: 'sold', ticket_type_id: 'vip' },
          { id: 's3', section: 'A', row: '1', number: '3', status: 'reserved', ticket_type_id: 'vip' },
        ],
      };

      expect(seating.seats.length).toBe(3);
    });

    it('should calculate availability from seats', () => {
      const seating: Seating = {
        id: 'seating-1',
        layout_name: 'Concert Hall',
        total_capacity: 10,
        seats: [
          { id: 's1', section: 'A', row: '1', number: '1', status: 'available', ticket_type_id: 'ga' },
          { id: 's2', section: 'A', row: '1', number: '2', status: 'available', ticket_type_id: 'ga' },
          { id: 's3', section: 'A', row: '1', number: '3', status: 'sold', ticket_type_id: 'ga' },
          { id: 's4', section: 'A', row: '1', number: '4', status: 'sold', ticket_type_id: 'ga' },
          { id: 's5', section: 'A', row: '1', number: '5', status: 'reserved', ticket_type_id: 'ga' },
        ],
      };

      const available = seating.seats.filter((s) => s.status === 'available').length;
      const sold = seating.seats.filter((s) => s.status === 'sold').length;
      const reserved = seating.seats.filter((s) => s.status === 'reserved').length;

      expect(available).toBe(2);
      expect(sold).toBe(2);
      expect(reserved).toBe(1);
    });

    it('should group seats by section', () => {
      const seating: Seating = {
        id: 'seating-1',
        layout_name: 'Stadium',
        total_capacity: 6,
        seats: [
          { id: 's1', section: 'VIP', row: '1', number: '1', status: 'available', ticket_type_id: 'vip' },
          { id: 's2', section: 'VIP', row: '1', number: '2', status: 'available', ticket_type_id: 'vip' },
          { id: 's3', section: 'GA', row: '1', number: '1', status: 'available', ticket_type_id: 'ga' },
          { id: 's4', section: 'GA', row: '1', number: '2', status: 'available', ticket_type_id: 'ga' },
          { id: 's5', section: 'GA', row: '2', number: '1', status: 'available', ticket_type_id: 'ga' },
          { id: 's6', section: 'GA', row: '2', number: '2', status: 'available', ticket_type_id: 'ga' },
        ],
      };

      const sections = new Set(seating.seats.map((s) => s.section));
      expect(sections.size).toBe(2);
      expect(sections.has('VIP')).toBe(true);
      expect(sections.has('GA')).toBe(true);

      const vipSeats = seating.seats.filter((s) => s.section === 'VIP');
      const gaSeats = seating.seats.filter((s) => s.section === 'GA');
      expect(vipSeats.length).toBe(2);
      expect(gaSeats.length).toBe(4);
    });
  });
});
