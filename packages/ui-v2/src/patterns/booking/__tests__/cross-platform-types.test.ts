/**
 * Cross-Platform Booking Types Tests
 * Unit tests for adapters and type conversions
 */

import { describe, it, expect } from '@jest/globals';
import {
  adaptGVTEWAYExperience,
  adaptATLVSPackage,
  adaptCOMPVSSCompetition,
  getBookingAdapter,
  type GVTEWAYExperience,
  type ATLVSPackage,
  type COMPVSSCompetition,
} from '../cross-platform-types';

describe('Cross-Platform Type Adapters', () => {
  describe('adaptGVTEWAYExperience', () => {
    it('should convert GVTEWAY experience to unified format', () => {
      const experience: GVTEWAYExperience = {
        id: 'exp-123',
        title: 'Wine Tasting Tour',
        description: 'Explore local vineyards',
        tagline: 'A delightful experience',
        images: ['image1.jpg', 'image2.jpg'],
        organizerId: 'org-456',
        organizerName: 'Wine Tours Inc',
        basePrice: 150,
        currency: 'USD',
        maxGuests: 8,
        durationHours: 4,
        location: {
          name: 'Napa Valley',
          city: 'Napa',
          country: 'USA',
          address: '123 Vineyard Lane',
        },
        category: 'Food & Drink',
        difficulty: 'Easy',
        included: ['Transportation', 'Wine Tasting', 'Lunch'],
      };

      const result = adaptGVTEWAYExperience(experience);

      expect(result.id).toBe('exp-123');
      expect(result.platform).toBe('gvteway');
      expect(result.type).toBe('experience');
      expect(result.title).toBe('Wine Tasting Tour');
      expect(result.description).toBe('Explore local vineyards');
      expect(result.images).toEqual(['image1.jpg', 'image2.jpg']);
      expect(result.organizerId).toBe('org-456');
      expect(result.organizerName).toBe('Wine Tours Inc');
      expect(result.basePrice).toBe(150);
      expect(result.currency).toBe('USD');
      expect(result.maxGuests).toBe(8);
      expect(result.durationHours).toBe(4);
      expect(result.location?.name).toBe('Napa Valley');
      expect(result.location?.city).toBe('Napa');
      expect(result.location?.country).toBe('USA');
      expect(result.metadata.category).toBe('Food & Drink');
      expect(result.metadata.difficulty).toBe('Easy');
      expect(result.metadata.included).toEqual(['Transportation', 'Wine Tasting', 'Lunch']);
    });

    it('should handle missing optional fields', () => {
      const experience: GVTEWAYExperience = {
        id: 'exp-123',
        title: 'Basic Tour',
        description: 'A simple tour',
        images: [],
        organizerId: 'org-456',
        basePrice: 50,
        currency: 'USD',
        maxGuests: 10,
        durationHours: 2,
        location: {
          name: 'City Center',
          city: 'Portland',
          country: 'USA',
        },
      };

      const result = adaptGVTEWAYExperience(experience);

      expect(result.organizerName).toBe('Unknown Organizer');
      expect(result.metadata.category).toBeUndefined();
      expect(result.metadata.difficulty).toBeUndefined();
      expect(result.metadata.included).toBeUndefined();
    });
  });

  describe('adaptATLVSPackage', () => {
    it('should convert ATLVS package to unified format', () => {
      const pkg: ATLVSPackage = {
        id: 'pkg-789',
        name: 'European Adventure',
        description: 'Two weeks in Europe',
        event_types: ['Travel', 'Culture'],
        base_price: 2500,
        min_guests: 2,
        max_guests: 20,
        duration_hours: 336, // 14 days
        included_items: [
          { name: 'Hotel', category: 'Accommodation', quantity: 14 },
          { name: 'Breakfast', category: 'Food', quantity: 14 },
          { name: 'Tour Guide', category: 'Service', quantity: 1 },
        ],
        optional_add_ons: ['addon-1', 'addon-2'],
        is_featured: true,
        is_active: true,
      };

      const result = adaptATLVSPackage(pkg);

      expect(result.id).toBe('pkg-789');
      expect(result.platform).toBe('atlvs');
      expect(result.type).toBe('package');
      expect(result.title).toBe('European Adventure');
      expect(result.description).toBe('Two weeks in Europe');
      expect(result.basePrice).toBe(2500);
      expect(result.currency).toBe('USD');
      expect(result.minGuests).toBe(2);
      expect(result.maxGuests).toBe(20);
      expect(result.durationHours).toBe(336);
      expect(result.metadata.eventTypes).toEqual(['Travel', 'Culture']);
      expect(result.metadata.includedItems).toHaveLength(3);
      expect(result.metadata.isFeatured).toBe(true);
    });

    it('should handle minimal package data', () => {
      const pkg: ATLVSPackage = {
        id: 'pkg-123',
        name: 'Basic Package',
        event_types: [],
        base_price: 100,
        included_items: [],
        optional_add_ons: [],
        is_featured: false,
        is_active: true,
      };

      const result = adaptATLVSPackage(pkg);

      expect(result.description).toBe('');
      expect(result.images).toEqual([]);
      expect(result.organizerName).toBe('ATLVS');
    });
  });

  describe('adaptCOMPVSSCompetition', () => {
    it('should convert COMPVSS competition to unified format', () => {
      const competition: COMPVSSCompetition = {
        id: 'comp-456',
        name: 'Annual Gaming Tournament',
        description: 'Compete for the grand prize',
        startDate: '2026-06-01T10:00:00Z',
        endDate: '2026-06-03T18:00:00Z',
        location: {
          name: 'Convention Center',
          address: '456 Main St',
          city: 'Los Angeles',
          country: 'USA',
        },
        entryFee: 50,
        maxParticipants: 128,
        category: 'Esports',
        status: 'open',
      };

      const result = adaptCOMPVSSCompetition(competition);

      expect(result.id).toBe('comp-456');
      expect(result.platform).toBe('compvss');
      expect(result.type).toBe('competition');
      expect(result.title).toBe('Annual Gaming Tournament');
      expect(result.description).toBe('Compete for the grand prize');
      expect(result.basePrice).toBe(50);
      expect(result.currency).toBe('USD');
      expect(result.maxGuests).toBe(128);
      expect(result.startDate).toBeInstanceOf(Date);
      expect(result.endDate).toBeInstanceOf(Date);
      expect(result.location?.name).toBe('Convention Center');
      expect(result.location?.city).toBe('Los Angeles');
      expect(result.metadata.category).toBe('Esports');
      expect(result.metadata.status).toBe('open');
    });

    it('should handle missing optional fields', () => {
      const competition: COMPVSSCompetition = {
        id: 'comp-789',
        name: 'Quick Contest',
        startDate: '2026-07-01T10:00:00Z',
        endDate: '2026-07-01T18:00:00Z',
        location: {
          name: 'Online',
        },
        entryFee: 10,
        category: 'General',
        status: 'draft',
      };

      const result = adaptCOMPVSSCompetition(competition);

      expect(result.description).toBe('');
      expect(result.maxGuests).toBeUndefined();
      expect(result.organizerName).toBe('COMPVSS');
    });
  });

  describe('getBookingAdapter', () => {
    it('should return GVTEWAY adapter for gvteway platform', () => {
      const adapter = getBookingAdapter('gvteway');
      expect(adapter.platform).toBe('gvteway');
    });

    it('should return ATLVS adapter for atlvs platform', () => {
      const adapter = getBookingAdapter('atlvs');
      expect(adapter.platform).toBe('atlvs');
    });

    it('should return COMPVSS adapter for compvss platform', () => {
      const adapter = getBookingAdapter('compvss');
      expect(adapter.platform).toBe('compvss');
    });

    it('should throw error for unknown platform', () => {
      expect(() => {
        getBookingAdapter('invalid' as any);
      }).toThrow('Unknown platform: invalid');
    });
  });
});

describe('Booking Adapter Interface', () => {
  describe('GVTEWAY Adapter', () => {
    const adapter = getBookingAdapter('gvteway');

    it('should have correct platform identifier', () => {
      expect(adapter.platform).toBe('gvteway');
    });

    it('should have all required methods', () => {
      expect(typeof adapter.createBooking).toBe('function');
      expect(typeof adapter.getBooking).toBe('function');
      expect(typeof adapter.createPaymentIntent).toBe('function');
      expect(typeof adapter.confirmBooking).toBe('function');
      expect(typeof adapter.cancelBooking).toBe('function');
    });
  });

  describe('ATLVS Adapter', () => {
    const adapter = getBookingAdapter('atlvs');

    it('should have correct platform identifier', () => {
      expect(adapter.platform).toBe('atlvs');
    });

    it('should have all required methods', () => {
      expect(typeof adapter.createBooking).toBe('function');
      expect(typeof adapter.getBooking).toBe('function');
      expect(typeof adapter.createPaymentIntent).toBe('function');
      expect(typeof adapter.confirmBooking).toBe('function');
      expect(typeof adapter.cancelBooking).toBe('function');
    });
  });

  describe('COMPVSS Adapter', () => {
    const adapter = getBookingAdapter('compvss');

    it('should have correct platform identifier', () => {
      expect(adapter.platform).toBe('compvss');
    });

    it('should have all required methods', () => {
      expect(typeof adapter.createBooking).toBe('function');
      expect(typeof adapter.getBooking).toBe('function');
      expect(typeof adapter.createPaymentIntent).toBe('function');
      expect(typeof adapter.confirmBooking).toBe('function');
      expect(typeof adapter.cancelBooking).toBe('function');
    });
  });
});
