"use client";

import { forwardRef, useEffect } from "react";
import clsx from "clsx";
import type { HTMLAttributes, ReactNode } from "react";

export type ModalProps = HTMLAttributes<HTMLDivElement> & {
  open: boolean;
  onClose?: () => void;
  title?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showClose?: boolean;
  inverted?: boolean;
};

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
        className="fixed inset-0 z-modal flex items-center justify-center p-spacing-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "modal-title" : undefined}
      >
        <div
          className={clsx("absolute inset-0", inverted ? "bg-white/20" : "bg-black/50")}
          onClick={onClose}
          aria-hidden="true"
        />
        <div
          ref={ref}
          className={clsx(
            "relative border-2 w-full",
            inverted
              ? "bg-ink-900 border-grey-600 text-white shadow-hard-lg-white"
              : "bg-white border-black text-black shadow-hard-lg",
            sizeClasses[size],
            className
          )}
          {...props}
        >
          {(title || showClose) ? (
            <div className={clsx(
              "flex items-center justify-between p-spacing-6 border-b-2",
              inverted ? "border-grey-700" : "border-black"
            )}>
              {title ? (
                <h2 id="modal-title" className={clsx(
                  "font-heading text-h4-sm uppercase tracking-wider",
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
                    "hover:opacity-70 transition-opacity",
                    inverted ? "text-grey-300" : "text-black"
                  )}
                  aria-label="Close modal"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              ) : null}
            </div>
          ) : null}
          <div className={clsx("p-spacing-6", inverted ? "text-grey-200" : "text-grey-800")}>{children}</div>
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
      <div ref={ref} className={clsx("mb-spacing-4", inverted ? "text-white" : "text-black", className)} {...props}>
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
        "mt-spacing-6 pt-spacing-4 border-t-2 flex gap-spacing-3 justify-end",
        inverted ? "border-grey-700" : "border-grey-200",
        className
      )} {...props}>
        {children}
      </div>
    );
  }
);
