"use client";

import React from "react";
import clsx from "clsx";
import { X, Keyboard } from "lucide-react";
import { formatShortcut, type ShortcutCategory, type KeyboardShortcut } from "../hooks/useKeyboardShortcuts.js";

// =============================================================================
// TYPES
// =============================================================================

export interface KeyboardShortcutsModalProps {
  /** Whether the modal is open */
  open: boolean;
  /** Called when modal should close */
  onClose: () => void;
  /** Shortcut categories to display */
  categories: ShortcutCategory[];
  /** Additional class name */
  className?: string;
}

// =============================================================================
// SHORTCUT KEY DISPLAY
// =============================================================================

interface ShortcutKeyProps {
  keys: string;
}

function ShortcutKey({ keys }: ShortcutKeyProps) {
  const formatted = formatShortcut(keys);
  const parts = formatted.split(/(?=[⌘⇧⌥⌃↵←→↑↓])|(?<=[⌘⇧⌥⌃↵←→↑↓])/g).filter(Boolean);
  
  return (
    <div className="flex items-center gap-gap-xs">
      {parts.map((part: string, index: number) => (
        <kbd
          key={index}
          className={clsx(
            "inline-flex items-center justify-center min-w-spacing-6 h-spacing-6 px-spacing-2",
            "bg-surface-tertiary border border-border-secondary rounded-button",
            "font-code text-mono-sm text-grey-700"
          )}
        >
          {part}
        </kbd>
      ))}
    </div>
  );
}

// =============================================================================
// KEYBOARD SHORTCUTS MODAL
// =============================================================================

export function KeyboardShortcutsModal({
  open,
  onClose,
  categories,
  className,
}: KeyboardShortcutsModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-modal flex items-center justify-center p-spacing-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className={clsx(
        "relative w-full max-w-container-lg max-h-[80vh] bg-surface-primary border-2 border-border-primary rounded-modal shadow-xl overflow-hidden animate-pop-in",
        className
      )}>
        {/* Header */}
        <div className="flex items-center justify-between px-spacing-6 py-spacing-4 bg-surface-inverse text-text-inverse border-b-2 border-border-primary">
          <div className="flex items-center gap-gap-md">
            <Keyboard className="size-6" />
            <h2 className="font-display text-h3-sm">Keyboard Shortcuts</h2>
          </div>
          <button
            onClick={onClose}
            className="p-spacing-2 text-grey-400 hover:text-white bg-transparent border-none cursor-pointer transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-spacing-6 overflow-y-auto max-h-[calc(80vh-80px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-gap-lg">
            {categories.map((category) => (
              <div key={category.id}>
                <h3 className="font-code text-mono-sm text-grey-500 uppercase tracking-wider mb-spacing-3">
                  {category.label}
                </h3>
                <div className="flex flex-col gap-gap-sm">
                  {category.shortcuts.map((shortcut: KeyboardShortcut) => (
                    <div
                      key={shortcut.id}
                      className="flex items-center justify-between py-spacing-2 border-b border-border-secondary last:border-b-0"
                    >
                      <div>
                        <p className="text-body-md text-text-primary">{shortcut.label}</p>
                        {shortcut.description && (
                          <p className="text-body-sm text-grey-500">{shortcut.description}</p>
                        )}
                      </div>
                      <ShortcutKey keys={shortcut.keys} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          {categories.length === 0 && (
            <div className="flex flex-col items-center justify-center py-spacing-12 text-center">
              <Keyboard className="size-12 text-grey-300 mb-spacing-4" />
              <p className="text-body-md text-grey-500">No keyboard shortcuts available</p>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="px-spacing-6 py-spacing-3 bg-surface-secondary border-t border-border-secondary">
          <p className="text-body-xs text-grey-500 text-center">
            Press <kbd className="px-spacing-1 py-px bg-surface-tertiary rounded-badge font-code">Esc</kbd> to close
          </p>
        </div>
      </div>
    </div>
  );
}

export default KeyboardShortcutsModal;
