import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useKeyboardShortcuts } from '../hooks/useFavorites';

describe('useKeyboardShortcuts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const createKeyboardEvent = (options: {
    key: string;
    metaKey?: boolean;
    ctrlKey?: boolean;
    shiftKey?: boolean;
    altKey?: boolean;
  }) => {
    return new KeyboardEvent('keydown', {
      key: options.key,
      metaKey: options.metaKey || false,
      ctrlKey: options.ctrlKey || false,
      shiftKey: options.shiftKey || false,
      altKey: options.altKey || false,
      bubbles: true,
    });
  };

  describe('basic shortcuts', () => {
    it('should trigger action on matching key press', () => {
      const action = vi.fn();
      
      renderHook(() =>
        useKeyboardShortcuts({
          shortcuts: [{ keys: 'cmd+1', action }],
        })
      );

      window.dispatchEvent(createKeyboardEvent({ key: '1', metaKey: true }));

      expect(action).toHaveBeenCalledTimes(1);
    });

    it('should not trigger action on non-matching key press', () => {
      const action = vi.fn();
      
      renderHook(() =>
        useKeyboardShortcuts({
          shortcuts: [{ keys: 'cmd+1', action }],
        })
      );

      window.dispatchEvent(createKeyboardEvent({ key: '2', metaKey: true }));

      expect(action).not.toHaveBeenCalled();
    });

    it('should handle multiple shortcuts', () => {
      const action1 = vi.fn();
      const action2 = vi.fn();
      
      renderHook(() =>
        useKeyboardShortcuts({
          shortcuts: [
            { keys: 'cmd+1', action: action1 },
            { keys: 'cmd+2', action: action2 },
          ],
        })
      );

      window.dispatchEvent(createKeyboardEvent({ key: '1', metaKey: true }));
      window.dispatchEvent(createKeyboardEvent({ key: '2', metaKey: true }));

      expect(action1).toHaveBeenCalledTimes(1);
      expect(action2).toHaveBeenCalledTimes(1);
    });
  });

  describe('modifier keys', () => {
    it('should handle cmd+shift combinations', () => {
      const action = vi.fn();
      
      renderHook(() =>
        useKeyboardShortcuts({
          shortcuts: [{ keys: 'cmd+shift+p', action }],
        })
      );

      window.dispatchEvent(createKeyboardEvent({ key: 'p', metaKey: true, shiftKey: true }));

      expect(action).toHaveBeenCalledTimes(1);
    });

    it('should not trigger without required shift key', () => {
      const action = vi.fn();
      
      renderHook(() =>
        useKeyboardShortcuts({
          shortcuts: [{ keys: 'cmd+shift+p', action }],
        })
      );

      window.dispatchEvent(createKeyboardEvent({ key: 'p', metaKey: true }));

      expect(action).not.toHaveBeenCalled();
    });

    it('should handle ctrl key', () => {
      const action = vi.fn();
      
      renderHook(() =>
        useKeyboardShortcuts({
          shortcuts: [{ keys: 'ctrl+k', action }],
        })
      );

      window.dispatchEvent(createKeyboardEvent({ key: 'k', ctrlKey: true }));

      expect(action).toHaveBeenCalledTimes(1);
    });

    it('should handle alt key', () => {
      const action = vi.fn();
      
      renderHook(() =>
        useKeyboardShortcuts({
          shortcuts: [{ keys: 'alt+d', action }],
        })
      );

      window.dispatchEvent(createKeyboardEvent({ key: 'd', altKey: true }));

      expect(action).toHaveBeenCalledTimes(1);
    });
  });

  describe('enabled state', () => {
    it('should not trigger when globally disabled', () => {
      const action = vi.fn();
      
      renderHook(() =>
        useKeyboardShortcuts({
          shortcuts: [{ keys: 'cmd+1', action }],
          enabled: false,
        })
      );

      window.dispatchEvent(createKeyboardEvent({ key: '1', metaKey: true }));

      expect(action).not.toHaveBeenCalled();
    });

    it('should not trigger when individual shortcut is disabled', () => {
      const action = vi.fn();
      
      renderHook(() =>
        useKeyboardShortcuts({
          shortcuts: [{ keys: 'cmd+1', action, enabled: false }],
        })
      );

      window.dispatchEvent(createKeyboardEvent({ key: '1', metaKey: true }));

      expect(action).not.toHaveBeenCalled();
    });
  });

  describe('input field handling', () => {
    it('should not trigger when typing in input fields', () => {
      const action = vi.fn();
      
      renderHook(() =>
        useKeyboardShortcuts({
          shortcuts: [{ keys: 'cmd+1', action }],
        })
      );

      // Create an input element and set it as the event target
      const input = document.createElement('input');
      document.body.appendChild(input);
      input.focus();

      const event = new KeyboardEvent('keydown', {
        key: '1',
        metaKey: true,
        bubbles: true,
      });
      Object.defineProperty(event, 'target', { value: input });
      
      window.dispatchEvent(event);

      expect(action).not.toHaveBeenCalled();
      
      document.body.removeChild(input);
    });

    it('should not trigger when typing in textarea', () => {
      const action = vi.fn();
      
      renderHook(() =>
        useKeyboardShortcuts({
          shortcuts: [{ keys: 'cmd+1', action }],
        })
      );

      const textarea = document.createElement('textarea');
      document.body.appendChild(textarea);
      textarea.focus();

      const event = new KeyboardEvent('keydown', {
        key: '1',
        metaKey: true,
        bubbles: true,
      });
      Object.defineProperty(event, 'target', { value: textarea });
      
      window.dispatchEvent(event);

      expect(action).not.toHaveBeenCalled();
      
      document.body.removeChild(textarea);
    });

    it('should not trigger when typing in contenteditable', () => {
      const action = vi.fn();
      
      renderHook(() =>
        useKeyboardShortcuts({
          shortcuts: [{ keys: 'cmd+1', action }],
        })
      );

      const div = document.createElement('div');
      div.contentEditable = 'true';
      // In jsdom, we need to set isContentEditable explicitly
      Object.defineProperty(div, 'isContentEditable', { value: true });
      document.body.appendChild(div);
      div.focus();

      const event = new KeyboardEvent('keydown', {
        key: '1',
        metaKey: true,
        bubbles: true,
      });
      Object.defineProperty(event, 'target', { value: div });
      
      window.dispatchEvent(event);

      expect(action).not.toHaveBeenCalled();
      
      document.body.removeChild(div);
    });
  });

  describe('cleanup', () => {
    it('should remove event listener on unmount', () => {
      const action = vi.fn();
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
      
      const { unmount } = renderHook(() =>
        useKeyboardShortcuts({
          shortcuts: [{ keys: 'cmd+1', action }],
        })
      );

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
      
      removeEventListenerSpy.mockRestore();
    });
  });

  describe('case insensitivity', () => {
    it('should handle uppercase keys', () => {
      const action = vi.fn();
      
      renderHook(() =>
        useKeyboardShortcuts({
          shortcuts: [{ keys: 'CMD+P', action }],
        })
      );

      window.dispatchEvent(createKeyboardEvent({ key: 'p', metaKey: true }));

      expect(action).toHaveBeenCalledTimes(1);
    });
  });
});
