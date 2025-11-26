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
};

export const Modal = forwardRef<HTMLDivElement, ModalProps>(
  function Modal({ open, onClose, title, size = "md", showClose = true, className, children, ...props }, ref) {
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
        <div
          className="absolute inset-0 bg-black/50"
          onClick={onClose}
          aria-hidden="true"
        />
        <div
          ref={ref}
          className={clsx(
            "relative bg-white border-2 border-black w-full",
            sizeClasses[size],
            "shadow-hard-lg",
            className
          )}
          {...props}
        >
          {(title || showClose) ? (
            <div className="flex items-center justify-between p-6 border-b-2 border-black">
              {title ? (
                <h2 id="modal-title" className="font-heading text-h4-sm uppercase tracking-wider">
                  {title}
                </h2>
              ) : <div />}
              {showClose && onClose ? (
                <button
                  type="button"
                  onClick={onClose}
                  className="hover:opacity-70 transition-opacity"
                  aria-label="Close modal"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              ) : null}
            </div>
          ) : null}
          <div className="p-6">{children}</div>
        </div>
      </div>
    );
  }
);

export const ModalHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function ModalHeader({ className, children, ...props }, ref) {
    return (
      <div ref={ref} className={clsx("mb-4", className)} {...props}>
        {children}
      </div>
    );
  }
);

export const ModalBody = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function ModalBody({ className, children, ...props }, ref) {
    return (
      <div ref={ref} className={clsx(className)} {...props}>
        {children}
      </div>
    );
  }
);

export const ModalFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function ModalFooter({ className, children, ...props }, ref) {
    return (
      <div ref={ref} className={clsx("mt-6 pt-4 border-t-2 border-grey-200 flex gap-3 justify-end", className)} {...props}>
        {children}
      </div>
    );
  }
);
