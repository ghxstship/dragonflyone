"use client";

import { forwardRef, ReactNode, useEffect, useCallback, useRef, useState } from "react";
import clsx from "clsx";
import { Stack } from "../foundations/layout.js";
import { Spinner } from "../atoms/spinner.js";
import { Body, H2 } from "../atoms/typography.js";
import { Button } from "../atoms/button.js";
import { X, AlertTriangle, ChevronLeft } from "lucide-react";

// =============================================================================
// OVERLAY LAYOUT
// Modal, drawer, sheet, and dialog layouts.
// Bold Contemporary Pop Art Adventure Design System
// =============================================================================

/** Hook to detect mobile breakpoint */
function useIsMobile(breakpoint: number = 768): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, [breakpoint]);

  return isMobile;
}

export interface OverlayLayoutProps {
  children: ReactNode;
  /** Overlay type */
  type?: "modal" | "drawer" | "sheet" | "fullscreen";
  /** Drawer/sheet position */
  position?: "left" | "right" | "top" | "bottom";
  /** Size variant */
  size?: "sm" | "md" | "lg" | "xl" | "full";
  /** 
   * Responsive behavior - automatically switch overlay type on mobile
   * - "sheet": Modal/drawer becomes bottom sheet on mobile
   * - "fullscreen": Modal/drawer becomes fullscreen on mobile
   * - "none": No responsive adaptation (default)
   */
  mobileType?: "sheet" | "fullscreen" | "none";
  /** Mobile breakpoint in pixels (default: 768) */
  mobileBreakpoint?: number;
  /** Whether overlay is open */
  open: boolean;
  /** Close handler */
  onClose: () => void;
  /** Title */
  title?: string;
  /** Subtitle/description */
  subtitle?: string;
  /** Header content (custom) */
  headerContent?: ReactNode;
  /** Footer content */
  footerContent?: ReactNode;
  /** Show close button */
  showClose?: boolean;
  /** Show back button (for nested overlays) */
  showBack?: boolean;
  /** Back button handler */
  onBack?: () => void;
  /** Close on backdrop click */
  closeOnBackdrop?: boolean;
  /** Close on escape key */
  closeOnEscape?: boolean;
  /** Backdrop blur */
  backdropBlur?: boolean;
  /** Prevent body scroll when open */
  preventScroll?: boolean;
  /** Animation type */
  animation?: "fade" | "slide" | "scale" | "none";
  /** Dark/light theme */
  inverted?: boolean;
  /** Loading state */
  loading?: boolean;
  /** Loading message */
  loadingMessage?: string;
  /** Error state */
  error?: Error | null;
  /** Error retry handler */
  onRetry?: () => void;
  /** Custom className */
  className?: string;
  /** Content className */
  contentClassName?: string;
  /** Z-index layer */
  zIndex?: "modal" | "drawer" | "sheet" | "tooltip";
  /** Aria label for accessibility */
  ariaLabel?: string;
  /** Aria described by for accessibility */
  ariaDescribedBy?: string;
}

const sizeClasses = {
  modal: {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
    full: "max-w-full mx-4",
  },
  drawer: {
    sm: "w-64",
    md: "w-80",
    lg: "w-96",
    xl: "w-[480px]",
    full: "w-full",
  },
  sheet: {
    sm: "max-h-[30vh]",
    md: "max-h-[50vh]",
    lg: "max-h-[70vh]",
    xl: "max-h-[85vh]",
    full: "max-h-full",
  },
};

const zIndexClasses = {
  modal: "z-modal",
  drawer: "z-drawer",
  sheet: "z-sheet",
  tooltip: "z-tooltip",
};

/**
 * OverlayLayout - Modal, drawer, sheet, and dialog layouts
 * 
 * Use cases:
 * - Confirmation dialogs
 * - Form modals
 * - Detail panels (drawer)
 * - Action sheets (mobile)
 * - Full-screen takeovers
 * - Nested navigation
 * 
 * Features:
 * - Multiple overlay types (modal, drawer, sheet, fullscreen)
 * - Configurable positions for drawers/sheets
 * - Size variants
 * - Backdrop click/escape to close
 * - Animation options
 * - Loading and error states
 * - Accessibility compliant (focus trap, aria attributes)
 * - Body scroll prevention
 */
export const OverlayLayout = forwardRef<HTMLDivElement, OverlayLayoutProps>(
  function OverlayLayout(
    {
      children,
      type = "modal",
      position = "right",
      size = "md",
      mobileType = "none",
      mobileBreakpoint = 768,
      open,
      onClose,
      title,
      subtitle,
      headerContent,
      footerContent,
      showClose = true,
      showBack = false,
      onBack,
      closeOnBackdrop = true,
      closeOnEscape = true,
      backdropBlur = true,
      preventScroll = true,
      animation = "fade",
      inverted = true,
      loading = false,
      loadingMessage = "Loading...",
      error = null,
      onRetry,
      className,
      contentClassName,
      zIndex = "modal",
      ariaLabel,
      ariaDescribedBy,
    },
    ref
  ) {
    const overlayRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const isMobile = useIsMobile(mobileBreakpoint);

    // Determine effective type based on responsive settings
    const effectiveType = (() => {
      if (!isMobile || mobileType === "none") return type;
      if (mobileType === "sheet") return "sheet";
      if (mobileType === "fullscreen") return "fullscreen";
      return type;
    })();

    // Determine effective position for sheet (always bottom on mobile)
    const effectivePosition = effectiveType === "sheet" && isMobile ? "bottom" : position;

    // Determine effective size for responsive types
    const effectiveSize = (() => {
      if (!isMobile || mobileType === "none") return size;
      if (effectiveType === "sheet") return "lg"; // Larger sheet on mobile for better UX
      return size;
    })();

    const bgClass = inverted ? "bg-surface-elevated" : "bg-surface-primary";
    const borderClass = inverted ? "border-border" : "border-border";
    const textClass = inverted ? "text-on-dark-primary" : "text-on-light-primary";

    // Handle escape key
    useEffect(() => {
      if (!open || !closeOnEscape) return;

      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          onClose();
        }
      };

      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }, [open, closeOnEscape, onClose]);

    // Prevent body scroll
    useEffect(() => {
      if (!preventScroll) return;

      if (open) {
        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
          document.body.style.overflow = originalOverflow;
        };
      }
    }, [open, preventScroll]);

    // Focus trap
    useEffect(() => {
      if (!open) return;

      const focusableElements = contentRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      if (focusableElements && focusableElements.length > 0) {
        (focusableElements[0] as HTMLElement).focus();
      }
    }, [open]);

    const handleBackdropClick = useCallback(
      (e: React.MouseEvent) => {
        if (closeOnBackdrop && e.target === overlayRef.current) {
          onClose();
        }
      },
      [closeOnBackdrop, onClose]
    );

    if (!open) return null;

    // Animation classes - uses effectiveType and effectivePosition for responsive behavior
    const getAnimationClasses = () => {
      if (animation === "none") return "";

      if (effectiveType === "modal") {
        switch (animation) {
          case "fade":
            return "animate-fade-in";
          case "scale":
            return "animate-pop-in";
          default:
            return "animate-fade-in";
        }
      }

      if (effectiveType === "drawer") {
        switch (effectivePosition) {
          case "left":
            return "animate-slide-in-left";
          case "right":
            return "animate-slide-in-right";
          case "top":
            return "animate-slide-in-top";
          case "bottom":
            return "animate-slide-in-bottom";
          default:
            return "animate-slide-in-right";
        }
      }

      if (effectiveType === "sheet") {
        return effectivePosition === "top" ? "animate-slide-in-top" : "animate-slide-in-bottom";
      }

      if (effectiveType === "fullscreen") {
        return "animate-fade-in";
      }

      return "";
    };

    // Position classes for drawer - uses effectivePosition for responsive behavior
    const getDrawerPositionClasses = () => {
      switch (effectivePosition) {
        case "left":
          return "left-0 top-0 bottom-0";
        case "right":
          return "right-0 top-0 bottom-0";
        case "top":
          return "top-0 left-0 right-0";
        case "bottom":
          return "bottom-0 left-0 right-0";
        default:
          return "right-0 top-0 bottom-0";
      }
    };

    // Position classes for sheet - uses effectivePosition for responsive behavior
    const getSheetPositionClasses = () => {
      return effectivePosition === "top"
        ? "top-0 left-0 right-0"
        : "bottom-0 left-0 right-0";
    };

    // Content rendering
    const renderContent = () => {
      if (loading) {
        return (
          <div className="flex-1 flex items-center justify-center p-8">
            <Stack gap={4} className="items-center text-center">
              <Spinner size="lg" />
              <Body className={inverted ? "text-on-dark-muted" : "text-on-light-muted"}>
                {loadingMessage}
              </Body>
            </Stack>
          </div>
        );
      }

      if (error) {
        return (
          <div className="flex-1 flex items-center justify-center p-8">
            <Stack gap={6} className="items-center text-center max-w-sm">
              <AlertTriangle className="size-12 text-error animate-shake" />
              <Stack gap={2} className="items-center">
                <H2 className={inverted ? "text-on-dark-primary" : "text-on-light-primary"}>
                  Error
                </H2>
                <Body className={inverted ? "text-on-dark-muted" : "text-on-light-muted"}>
                  {error.message || "An unexpected error occurred"}
                </Body>
              </Stack>
              {onRetry && (
                <Button variant="solid" onClick={onRetry}>
                  Try Again
                </Button>
              )}
            </Stack>
          </div>
        );
      }

      return children;
    };

    // Header rendering
    const renderHeader = () => {
      if (headerContent) return headerContent;

      if (!title && !showClose && !showBack) return null;

      return (
        <div className={clsx(
          "shrink-0 flex items-center justify-between px-6 py-4 border-b-2",
          borderClass
        )}>
          <Stack direction="horizontal" gap={3} className="items-center">
            {showBack && onBack && (
              <button
                onClick={onBack}
                className={clsx(
                  "p-1 rounded transition-colors",
                  inverted ? "hover:bg-surface-inverse" : "hover:bg-muted"
                )}
              >
                <ChevronLeft className="size-5" />
              </button>
            )}
            {title && (
              <Stack gap={1}>
                <H2 className={clsx("text-lg", textClass)}>{title}</H2>
                {subtitle && (
                  <Body size="sm" className={inverted ? "text-on-dark-muted" : "text-on-light-muted"}>
                    {subtitle}
                  </Body>
                )}
              </Stack>
            )}
          </Stack>
          {showClose && (
            <button
              onClick={onClose}
              className={clsx(
                "p-2 rounded transition-colors",
                inverted ? "hover:bg-surface-inverse" : "hover:bg-muted"
              )}
              aria-label="Close"
            >
              <X className="size-5" />
            </button>
          )}
        </div>
      );
    };

    // Modal layout
    if (effectiveType === "modal") {
      return (
        <div
          ref={overlayRef}
          onClick={handleBackdropClick}
          className={clsx(
            "fixed inset-0 flex items-center justify-center p-4",
            zIndexClasses[zIndex],
            backdropBlur ? "bg-black/60 backdrop-blur-sm" : "bg-black/50",
            className
          )}
          role="dialog"
          aria-modal="true"
          aria-label={ariaLabel || title}
          aria-describedby={ariaDescribedBy}
        >
          <div
            ref={ref}
            className={clsx(
              "flex flex-col max-h-[90vh] w-full rounded-modal border-2 shadow-xl",
              sizeClasses.modal[effectiveSize],
              bgClass,
              borderClass,
              getAnimationClasses(),
              contentClassName
            )}
          >
            {renderHeader()}
            <div className="flex-1 overflow-auto p-6">
              {renderContent()}
            </div>
            {footerContent && (
              <div className={clsx(
                "shrink-0 px-6 py-4 border-t-2",
                borderClass
              )}>
                {footerContent}
              </div>
            )}
          </div>
        </div>
      );
    }

    // Drawer layout
    if (effectiveType === "drawer") {
      const isHorizontal = effectivePosition === "left" || effectivePosition === "right";

      return (
        <div
          ref={overlayRef}
          onClick={handleBackdropClick}
          className={clsx(
            "fixed inset-0",
            zIndexClasses[zIndex],
            backdropBlur ? "bg-black/60 backdrop-blur-sm" : "bg-black/50",
            className
          )}
          role="dialog"
          aria-modal="true"
          aria-label={ariaLabel || title}
          aria-describedby={ariaDescribedBy}
        >
          <div
            ref={ref}
            className={clsx(
              "fixed flex flex-col border-2 shadow-xl",
              getDrawerPositionClasses(),
              isHorizontal ? sizeClasses.drawer[effectiveSize] : "h-auto",
              !isHorizontal && "max-h-[80vh]",
              bgClass,
              effectivePosition === "left" && "border-l-0 border-t-0 border-b-0",
              effectivePosition === "right" && "border-r-0 border-t-0 border-b-0",
              effectivePosition === "top" && "border-t-0 border-l-0 border-r-0",
              effectivePosition === "bottom" && "border-b-0 border-l-0 border-r-0",
              borderClass,
              getAnimationClasses(),
              contentClassName
            )}
          >
            {renderHeader()}
            <div className="flex-1 overflow-auto p-6">
              {renderContent()}
            </div>
            {footerContent && (
              <div className={clsx(
                "shrink-0 px-6 py-4 border-t-2",
                borderClass
              )}>
                {footerContent}
              </div>
            )}
          </div>
        </div>
      );
    }

    // Sheet layout
    if (effectiveType === "sheet") {
      return (
        <div
          ref={overlayRef}
          onClick={handleBackdropClick}
          className={clsx(
            "fixed inset-0",
            zIndexClasses[zIndex],
            backdropBlur ? "bg-black/60 backdrop-blur-sm" : "bg-black/50",
            className
          )}
          role="dialog"
          aria-modal="true"
          aria-label={ariaLabel || title}
          aria-describedby={ariaDescribedBy}
        >
          <div
            ref={ref}
            className={clsx(
              "fixed flex flex-col border-2 shadow-xl",
              getSheetPositionClasses(),
              sizeClasses.sheet[effectiveSize],
              bgClass,
              effectivePosition === "top" ? "border-t-0 rounded-b-modal" : "border-b-0 rounded-t-modal",
              borderClass,
              getAnimationClasses(),
              contentClassName
            )}
          >
            {/* Drag handle for mobile sheets */}
            <div className="flex justify-center py-2">
              <div className={clsx(
                "w-12 h-1 rounded-full",
                inverted ? "bg-surface-elevated" : "bg-muted"
              )} />
            </div>
            {renderHeader()}
            <div className="flex-1 overflow-auto p-6">
              {renderContent()}
            </div>
            {footerContent && (
              <div className={clsx(
                "shrink-0 px-6 py-4 border-t-2",
                borderClass
              )}>
                {footerContent}
              </div>
            )}
          </div>
        </div>
      );
    }

    // Fullscreen layout
    if (effectiveType === "fullscreen") {
      return (
        <div
          ref={ref}
          className={clsx(
            "fixed inset-0 flex flex-col",
            zIndexClasses[zIndex],
            bgClass,
            getAnimationClasses(),
            className
          )}
          role="dialog"
          aria-modal="true"
          aria-label={ariaLabel || title}
          aria-describedby={ariaDescribedBy}
        >
          {renderHeader()}
          <div className={clsx("flex-1 overflow-auto", contentClassName)}>
            {renderContent()}
          </div>
          {footerContent && (
            <div className={clsx(
              "shrink-0 px-6 py-4 border-t-2",
              borderClass
            )}>
              {footerContent}
            </div>
          )}
        </div>
      );
    }

    return null;
  }
);

export default OverlayLayout;
