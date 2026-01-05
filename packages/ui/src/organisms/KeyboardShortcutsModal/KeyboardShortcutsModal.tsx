"use client";

import React from "react";
import clsx from "clsx";
import { Keyboard } from "lucide-react";
import { Modal } from "../Modal/index.js";
import { formatShortcut, type KeyboardShortcut } from "../../hooks/useKeyboardShortcuts.js";
import type { KeyboardShortcutsModalProps } from "./KeyboardShortcutsModal.types.js";

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
            "font-code text-mono-sm text-text-disabled"
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

/**
 * KeyboardShortcutsModal component - Bold Contemporary Pop Art Adventure
 * 
 * Built on Modal for consistent accessibility and behavior:
 * - Focus trap
 * - Escape key handling
 * - Body scroll prevention
 * - ARIA attributes
 * 
 * Features:
 * - Categorized shortcuts display
 * - Formatted key combinations
 * - Two-column responsive layout
 */
export function KeyboardShortcutsModal({
  open,
  onClose,
  categories,
  className,
}: KeyboardShortcutsModalProps) {
  const headerContent = (
    <div className="flex items-center gap-4 px-6 py-4 bg-surface-inverse text-text-primary border-b-2 border-border">
      <Keyboard className="size-6" />
      <h2 className="font-display text-xl">Keyboard Shortcuts</h2>
    </div>
  );

  const footerContent = (
    <div className="text-center">
      <p className="text-xs text-text-muted">
        Press <kbd className="px-1 py-px bg-muted rounded-badge font-mono">Esc</kbd> to close
      </p>
    </div>
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      showClose
      className={className}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {categories.map((category) => (
          <div key={category.id}>
            <h3 className="font-mono text-sm text-text-muted uppercase tracking-wider mb-3">
              {category.label}
            </h3>
            <div className="flex flex-col gap-2">
              {category.shortcuts.map((shortcut: KeyboardShortcut) => (
                <div
                  key={shortcut.id}
                  className="flex items-center justify-between py-2 border-b border-border last:border-b-0"
                >
                  <div>
                    <p className="text-base text-text-primary">{shortcut.label}</p>
                    {shortcut.description && (
                      <p className="text-sm text-text-muted">{shortcut.description}</p>
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
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Keyboard className="size-12 text-text-muted mb-4" />
          <p className="text-base text-text-muted">No keyboard shortcuts available</p>
        </div>
      )}
      
      {/* Header */}
      <div className="p-6 border-b-2 border-border bg-surface-elevated">
        {headerContent}
      </div>
      
      {/* Footer */}
      <div className="p-6 border-t-2 border-border bg-surface-elevated">
        {footerContent}
      </div>
    </Modal>
  );
}

export default KeyboardShortcutsModal;
