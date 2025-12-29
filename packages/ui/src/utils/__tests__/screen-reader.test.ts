import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { 
  announce, 
  announceLoading, 
  announceLoadingComplete, 
  announceError 
} from '../screen-reader.js';

describe('screen-reader utilities', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    document.body.innerHTML = '';
  });

  afterEach(() => {
    vi.useRealTimers();
    document.body.innerHTML = '';
  });

  describe('announce', () => {
    it('creates announcement element with message', () => {
      announce('Test message');
      const announcement = document.querySelector('[role="status"]');
      expect(announcement?.textContent).toBe('Test message');
    });

    it('uses polite priority by default', () => {
      announce('Test message');
      const announcement = document.querySelector('[role="status"]');
      expect(announcement?.getAttribute('aria-live')).toBe('polite');
    });

    it('uses assertive priority when specified', () => {
      announce('Urgent message', 'assertive');
      const announcement = document.querySelector('[aria-live="assertive"]');
      expect(announcement).not.toBeNull();
    });

    it('removes announcement after timeout', () => {
      announce('Test message');
      expect(document.querySelector('[role="status"]')).not.toBeNull();
      
      vi.advanceTimersByTime(1000);
      expect(document.body.textContent).toBe('');
    });

    it('sets aria-atomic to true', () => {
      announce('Test message');
      const announcement = document.querySelector('[role="status"]');
      expect(announcement?.getAttribute('aria-atomic')).toBe('true');
    });
  });

  describe('announceLoading', () => {
    it('announces generic loading message', () => {
      announceLoading();
      const announcement = document.querySelector('[role="status"]');
      expect(announcement?.textContent).toBe('Loading');
    });

    it('announces loading with resource name', () => {
      announceLoading('events');
      const announcement = document.querySelector('[role="status"]');
      expect(announcement?.textContent).toBe('Loading events');
    });
  });

  describe('announceLoadingComplete', () => {
    it('announces generic loading complete', () => {
      announceLoadingComplete();
      const announcement = document.querySelector('[role="status"]');
      expect(announcement?.textContent).toBe('Content loaded');
    });

    it('announces loading complete with resource name', () => {
      announceLoadingComplete('Events');
      const announcement = document.querySelector('[role="status"]');
      expect(announcement?.textContent).toBe('Events loaded');
    });

    it('includes item count when provided', () => {
      announceLoadingComplete('Events', 5);
      const announcement = document.querySelector('[role="status"]');
      expect(announcement?.textContent).toBe('Events loaded. 5 items found');
    });

    it('uses singular form for count of 1', () => {
      announceLoadingComplete('Event', 1);
      const announcement = document.querySelector('[role="status"]');
      expect(announcement?.textContent).toBe('Event loaded. 1 item found');
    });

    it('uses plural form for count of 0', () => {
      announceLoadingComplete('Events', 0);
      const announcement = document.querySelector('[role="status"]');
      expect(announcement?.textContent).toBe('Events loaded. 0 items found');
    });
  });

  describe('announceError', () => {
    it('announces error with assertive priority', () => {
      announceError('Something went wrong');
      const announcement = document.querySelector('[aria-live="assertive"]');
      expect(announcement).not.toBeNull();
      expect(announcement?.textContent).toBe('Error: Something went wrong');
    });

    it('prefixes message with Error:', () => {
      announceError('Network failure');
      const announcement = document.querySelector('[role="status"]');
      expect(announcement?.textContent).toContain('Error:');
    });
  });
});
