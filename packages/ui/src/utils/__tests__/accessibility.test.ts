import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { trapFocus, announceToScreenReader, getAriaLabel, generateId, keyboardNavigation } from '../accessibility.js';

describe('trapFocus', () => {
  let container: HTMLDivElement;
  let button1: HTMLButtonElement;
  let button2: HTMLButtonElement;
  let cleanup: () => void;

  beforeEach(() => {
    container = document.createElement('div');
    button1 = document.createElement('button');
    button1.textContent = 'First';
    button2 = document.createElement('button');
    button2.textContent = 'Last';
    container.appendChild(button1);
    container.appendChild(button2);
    document.body.appendChild(container);
  });

  afterEach(() => {
    if (cleanup) cleanup();
    document.body.removeChild(container);
  });

  it('returns a cleanup function', () => {
    cleanup = trapFocus(container);
    expect(typeof cleanup).toBe('function');
  });

  it('traps focus within container on Tab', () => {
    cleanup = trapFocus(container);
    button2.focus();
    
    const event = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true });
    vi.spyOn(event, 'preventDefault');
    container.dispatchEvent(event);
    
    expect(event.preventDefault).toHaveBeenCalled();
  });

  it('traps focus within container on Shift+Tab', () => {
    cleanup = trapFocus(container);
    button1.focus();
    
    const event = new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true });
    vi.spyOn(event, 'preventDefault');
    container.dispatchEvent(event);
    
    expect(event.preventDefault).toHaveBeenCalled();
  });

  it('ignores non-Tab keys', () => {
    cleanup = trapFocus(container);
    
    const event = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true });
    vi.spyOn(event, 'preventDefault');
    container.dispatchEvent(event);
    
    expect(event.preventDefault).not.toHaveBeenCalled();
  });
});

describe('announceToScreenReader', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    document.querySelectorAll('[role="status"]').forEach(el => el.remove());
  });

  it('creates announcement element', () => {
    announceToScreenReader('Test message');
    const announcement = document.querySelector('[role="status"]');
    expect(announcement).not.toBeNull();
    expect(announcement?.textContent).toBe('Test message');
  });

  it('sets aria-live to polite by default', () => {
    announceToScreenReader('Test message');
    const announcement = document.querySelector('[role="status"]');
    expect(announcement?.getAttribute('aria-live')).toBe('polite');
  });

  it('sets aria-live to assertive when specified', () => {
    announceToScreenReader('Urgent message', 'assertive');
    const announcement = document.querySelector('[role="status"]');
    expect(announcement?.getAttribute('aria-live')).toBe('assertive');
  });

  it('removes announcement after timeout', () => {
    announceToScreenReader('Test message');
    expect(document.querySelector('[role="status"]')).not.toBeNull();
    
    vi.advanceTimersByTime(1000);
    expect(document.querySelector('[role="status"]')).toBeNull();
  });

  it('sets aria-atomic to true', () => {
    announceToScreenReader('Test message');
    const announcement = document.querySelector('[role="status"]');
    expect(announcement?.getAttribute('aria-atomic')).toBe('true');
  });
});

describe('getAriaLabel', () => {
  it('returns element name without context', () => {
    expect(getAriaLabel('Button')).toBe('Button');
  });

  it('returns element with context', () => {
    expect(getAriaLabel('Button', 'Navigation')).toBe('Button in Navigation');
  });

  it('handles empty context', () => {
    expect(getAriaLabel('Button', '')).toBe('Button');
  });
});

describe('generateId', () => {
  it('generates unique IDs', () => {
    const id1 = generateId();
    const id2 = generateId();
    expect(id1).not.toBe(id2);
  });

  it('uses default prefix', () => {
    const id = generateId();
    expect(id.startsWith('id-')).toBe(true);
  });

  it('uses custom prefix', () => {
    const id = generateId('custom');
    expect(id.startsWith('custom-')).toBe(true);
  });

  it('generates valid ID format', () => {
    const id = generateId('test');
    expect(id).toMatch(/^test-[a-z0-9]+$/);
  });
});

describe('keyboardNavigation', () => {
  describe('isActionKey', () => {
    it('returns true for Enter', () => {
      expect(keyboardNavigation.isActionKey('Enter')).toBe(true);
    });

    it('returns true for Space', () => {
      expect(keyboardNavigation.isActionKey(' ')).toBe(true);
    });

    it('returns false for other keys', () => {
      expect(keyboardNavigation.isActionKey('a')).toBe(false);
      expect(keyboardNavigation.isActionKey('Tab')).toBe(false);
    });
  });

  describe('isEscapeKey', () => {
    it('returns true for Escape', () => {
      expect(keyboardNavigation.isEscapeKey('Escape')).toBe(true);
    });

    it('returns false for other keys', () => {
      expect(keyboardNavigation.isEscapeKey('Enter')).toBe(false);
      expect(keyboardNavigation.isEscapeKey('Esc')).toBe(false);
    });
  });

  describe('isArrowKey', () => {
    it('returns true for arrow keys', () => {
      expect(keyboardNavigation.isArrowKey('ArrowUp')).toBe(true);
      expect(keyboardNavigation.isArrowKey('ArrowDown')).toBe(true);
      expect(keyboardNavigation.isArrowKey('ArrowLeft')).toBe(true);
      expect(keyboardNavigation.isArrowKey('ArrowRight')).toBe(true);
    });

    it('returns false for other keys', () => {
      expect(keyboardNavigation.isArrowKey('Up')).toBe(false);
      expect(keyboardNavigation.isArrowKey('Enter')).toBe(false);
    });
  });
});
