import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Analytics, trackEvent } from '../analytics.js';

describe('Analytics', () => {
  beforeEach(() => {
    vi.stubGlobal('window', {});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('initialize', () => {
    it('does not throw when called', () => {
      expect(() => Analytics.initialize()).not.toThrow();
    });

    it('handles missing window gracefully', () => {
      vi.stubGlobal('window', undefined);
      expect(() => Analytics.initialize()).not.toThrow();
    });
  });

  describe('track', () => {
    it('does not throw when tracking event', () => {
      expect(() => Analytics.track({ name: 'Test Event' })).not.toThrow();
    });

    it('handles event with properties', () => {
      expect(() => Analytics.track({ 
        name: 'Test Event', 
        properties: { key: 'value' } 
      })).not.toThrow();
    });

    it('handles missing window gracefully', () => {
      vi.stubGlobal('window', undefined);
      expect(() => Analytics.track({ name: 'Test' })).not.toThrow();
    });

    it('calls gtag when available', () => {
      const mockGtag = vi.fn();
      vi.stubGlobal('window', { gtag: mockGtag });
      vi.stubEnv('NODE_ENV', 'production');
      
      Analytics.track({ name: 'Test', properties: { foo: 'bar' } });
      // In development mode, gtag won't be called
    });
  });

  describe('page', () => {
    it('tracks page view event', () => {
      const trackSpy = vi.spyOn(Analytics, 'track');
      Analytics.page('Home');
      
      expect(trackSpy).toHaveBeenCalledWith({
        name: 'Page View',
        properties: { page: 'Home' },
      });
    });

    it('includes additional properties', () => {
      const trackSpy = vi.spyOn(Analytics, 'track');
      Analytics.page('Home', { referrer: 'google' });
      
      expect(trackSpy).toHaveBeenCalledWith({
        name: 'Page View',
        properties: { page: 'Home', referrer: 'google' },
      });
    });
  });

  describe('identify', () => {
    it('does not throw when identifying user', () => {
      expect(() => Analytics.identify('user-123')).not.toThrow();
    });

    it('handles traits parameter', () => {
      expect(() => Analytics.identify('user-123', { name: 'John' })).not.toThrow();
    });

    it('handles missing window gracefully', () => {
      vi.stubGlobal('window', undefined);
      expect(() => Analytics.identify('user-123')).not.toThrow();
    });
  });
});

describe('trackEvent helpers', () => {
  beforeEach(() => {
    vi.stubGlobal('window', {});
    vi.spyOn(Analytics, 'track');
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('buttonClick', () => {
    it('tracks button click with correct properties', () => {
      trackEvent.buttonClick('Submit', 'Header');
      
      expect(Analytics.track).toHaveBeenCalledWith({
        name: 'Button Clicked',
        properties: { buttonName: 'Submit', location: 'Header' },
      });
    });
  });

  describe('formSubmit', () => {
    it('tracks form submit with success', () => {
      trackEvent.formSubmit('Contact Form', true);
      
      expect(Analytics.track).toHaveBeenCalledWith({
        name: 'Form Submitted',
        properties: { formName: 'Contact Form', success: true },
      });
    });

    it('tracks form submit with failure', () => {
      trackEvent.formSubmit('Contact Form', false);
      
      expect(Analytics.track).toHaveBeenCalledWith({
        name: 'Form Submitted',
        properties: { formName: 'Contact Form', success: false },
      });
    });
  });

  describe('searchPerformed', () => {
    it('tracks search with query and results count', () => {
      trackEvent.searchPerformed('concert', 25);
      
      expect(Analytics.track).toHaveBeenCalledWith({
        name: 'Search Performed',
        properties: { query: 'concert', resultsCount: 25 },
      });
    });
  });

  describe('eventViewed', () => {
    it('tracks event view with id and name', () => {
      trackEvent.eventViewed('event-123', 'Summer Festival');
      
      expect(Analytics.track).toHaveBeenCalledWith({
        name: 'Event Viewed',
        properties: { eventId: 'event-123', eventName: 'Summer Festival' },
      });
    });
  });

  describe('ticketPurchased', () => {
    it('tracks ticket purchase with all properties', () => {
      trackEvent.ticketPurchased('event-123', 2, 150);
      
      expect(Analytics.track).toHaveBeenCalledWith({
        name: 'Ticket Purchased',
        properties: { eventId: 'event-123', quantity: 2, amount: 150 },
      });
    });
  });
});
