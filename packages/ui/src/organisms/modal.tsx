"use client";

import { forwardRef, useEffect, useRef, useCallback } from "react";
import clsx from "clsx";
import type { HTMLAttributes } from "react";

// Focusable element selectors for focus trap
const FOCUSABLE_SELECTORS = [
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'a[href]',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

export type ModalProps = HTMLAttributes<HTMLDivElement> & {
  open: boolean;
  onClose?: () => void;
  title?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showClose?: boolean;
  inverted?: boolean;
};

/**
 * Modal component - Bold Contemporary Pop Art Adventure
 * 
 * Features:
 * - Heavy 4px border for maximum impact
 * - Prominent hard offset shadow
 * - Pop-in animation on open
 * - Bold close button with hover lift
 */
export const Modal = forwardRef<HTMLDivElement, ModalProps>(
  function Modal({ open, onClose, title, size = "md", showClose = true, inverted = true, className, children, ...props }, ref) {
    const modalRef = useRef<HTMLDivElement>(null);
    const previousActiveElement = useRef<HTMLElement | null>(null);

    // Focus trap: keep focus within modal
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
      if (e.key === 'Escape' && onClose) {
        onClose();
        return;
      }

      if (e.key !== 'Tab') return;

      const modal = modalRef.current;
      if (!modal) return;

      const focusableElements = modal.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS);
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      // Shift+Tab on first element -> go to last
      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      }
      // Tab on last element -> go to first
      else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }, [onClose]);

    // Lock body scroll and setup focus trap
    useEffect(() => {
      if (open) {
        // Store the previously focused element
        previousActiveElement.current = document.activeElement as HTMLElement;
        document.body.style.overflow = "hidden";

        // Add focus trap listener
        document.addEventListener('keydown', handleKeyDown);

        // Auto-focus first focusable element after a short delay (allow render)
        const timeoutId = setTimeout(() => {
          const modal = modalRef.current;
          if (modal) {
            const firstInput = modal.querySelector<HTMLElement>('input:not([disabled]), textarea:not([disabled]), select:not([disabled])');
            const firstFocusable = modal.querySelector<HTMLElement>(FOCUSABLE_SELECTORS);
            // Prefer input fields, then any focusable element
            (firstInput || firstFocusable)?.focus();
          }
        }, 50);

        return () => {
          clearTimeout(timeoutId);
          document.removeEventListener('keydown', handleKeyDown);
        };
      } else {
        document.body.style.overflow = "";
        // Restore focus to previously focused element
        previousActiveElement.current?.focus();
      }
      return () => {
        document.body.style.overflow = "";
        document.removeEventListener('keydown', handleKeyDown);
      };
    }, [open, handleKeyDown]);

    if (!open) return null;

    const sizeClasses = {
      sm: "max-w-md",
      md: "max-w-lg",
      lg: "max-w-2xl",
      xl: "max-w-4xl",
    };

    return (
      <div
        className="fixed inset-0 z-modal flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "modal-title" : undefined}
      >
        {/* Backdrop */}
        <div
          className={clsx(
            "absolute inset-0 animate-fade-in",
            inverted ? "bg-white/20" : "bg-black/60"
          )}
          onClick={onClose}
          aria-hidden="true"
        />
        {/* Modal panel */}
        <div
          ref={(node) => {
            // Handle both refs
            (modalRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
            if (typeof ref === 'function') ref(node);
            else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
          }}
          className={clsx(
            "relative w-full border-4 rounded-[var(--radius-modal)]",
            "animate-pop-in",
            inverted
              ? "bg-surface-inverse border-white text-text-primary shadow-[8px_8px_0_rgba(255,255,255,0.25)]"
              : "bg-white border-black text-black shadow-[8px_8px_0_rgba(0,0,0,0.2)]",
            sizeClasses[size],
            className
          )}
          {...props}
        >
          {(title || showClose) ? (
            <div className={clsx(
              "flex items-center justify-between p-6 border-b-2",
              inverted ? "border-border" : "border-border"
            )}>
              {title ? (
                <h2 id="modal-title" className={clsx(
                  "font-heading text-lg uppercase tracking-wider font-bold",
                  inverted ? "text-white" : "text-black"
                )}>
                  {title}
                </h2>
              ) : <div />}
              {showClose && onClose ? (
                <button
                  type="button"
                  onClick={onClose}
                  className={clsx(
                    "p-1 border-2 rounded transition-all duration-100",
                    "hover:-translate-x-0.5 hover:-translate-y-0.5",
                    "active:translate-x-0 active:translate-y-0",
                    inverted 
                      ? "border-border text-text-secondary hover:border-white hover:text-white hover:shadow-[2px_2px_0_rgba(255,255,255,0.2)]" 
                      : "border-border text-text-disabled hover:border-black hover:text-black hover:shadow-[2px_2px_0_rgba(0,0,0,0.15)]"
                  )}
                  aria-label="Close modal"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              ) : null}
            </div>
          ) : null}
          <div className={clsx("p-6", inverted ? "text-text-secondary" : "text-text-muted")}>{children}</div>
        </div>
      </div>
    );
  }
);

export type ModalHeaderProps = HTMLAttributes<HTMLDivElement> & {
  inverted?: boolean;
};

export const ModalHeader = forwardRef<HTMLDivElement, ModalHeaderProps>(
  function ModalHeader({ inverted = true, className, children, ...props }, ref) {
    return (
      <div ref={ref} className={clsx("mb-4", inverted ? "text-white" : "text-black", className)} {...props}>
        {children}
      </div>
    );
  }
);

export type ModalBodyProps = HTMLAttributes<HTMLDivElement> & {
  inverted?: boolean;
};

export const ModalBody = forwardRef<HTMLDivElement, ModalBodyProps>(
  function ModalBody({ inverted = true, className, children, ...props }, ref) {
    return (
      <div ref={ref} className={clsx(inverted ? "text-text-secondary" : "text-text-muted", className)} {...props}>
        {children}
      </div>
    );
  }
);

export type ModalFooterProps = HTMLAttributes<HTMLDivElement> & {
  inverted?: boolean;
};

export const ModalFooter = forwardRef<HTMLDivElement, ModalFooterProps>(
  function ModalFooter({ inverted = true, className, children, ...props }, ref) {
    return (
      <div ref={ref} className={clsx(
        "mt-6 pt-4 border-t-2 flex gap-3 justify-end",
        inverted ? "border-border" : "border-border",
        className
      )} {...props}>
        {children}
      </div>
    );
  }
);
