"use client";

import { forwardRef, useEffect } from "react";
import clsx from "clsx";
import type { HTMLAttributes } from "react";

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
  function Modal({ open, onClose, title, size = "md", showClose = true, inverted = false, className, children, ...props }, ref) {
    useEffect(() => {
      if (open) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "";
      }
      return () => {
        document.body.style.overflow = "";
      };
    }, [open]);

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
          ref={ref}
          className={clsx(
            "relative w-full border-4 rounded-[var(--radius-modal)]",
            "animate-pop-in",
            inverted
              ? "bg-ink-900 border-white text-white shadow-[8px_8px_0_rgba(255,255,255,0.25)]"
              : "bg-white border-black text-black shadow-[8px_8px_0_rgba(0,0,0,0.2)]",
            sizeClasses[size],
            className
          )}
          {...props}
        >
          {(title || showClose) ? (
            <div className={clsx(
              "flex items-center justify-between p-6 border-b-2",
              inverted ? "border-grey-700" : "border-grey-200"
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
                      ? "border-grey-600 text-grey-300 hover:border-white hover:text-white hover:shadow-[2px_2px_0_rgba(255,255,255,0.2)]" 
                      : "border-grey-300 text-grey-600 hover:border-black hover:text-black hover:shadow-[2px_2px_0_rgba(0,0,0,0.15)]"
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
          <div className={clsx("p-6", inverted ? "text-grey-200" : "text-grey-800")}>{children}</div>
        </div>
      </div>
    );
  }
);

export type ModalHeaderProps = HTMLAttributes<HTMLDivElement> & {
  inverted?: boolean;
};

export const ModalHeader = forwardRef<HTMLDivElement, ModalHeaderProps>(
  function ModalHeader({ inverted = false, className, children, ...props }, ref) {
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
  function ModalBody({ inverted = false, className, children, ...props }, ref) {
    return (
      <div ref={ref} className={clsx(inverted ? "text-grey-200" : "text-grey-800", className)} {...props}>
        {children}
      </div>
    );
  }
);

export type ModalFooterProps = HTMLAttributes<HTMLDivElement> & {
  inverted?: boolean;
};

export const ModalFooter = forwardRef<HTMLDivElement, ModalFooterProps>(
  function ModalFooter({ inverted = false, className, children, ...props }, ref) {
    return (
      <div ref={ref} className={clsx(
        "mt-6 pt-4 border-t-2 flex gap-3 justify-end",
        inverted ? "border-grey-700" : "border-grey-200",
        className
      )} {...props}>
        {children}
      </div>
    );
  }
);
