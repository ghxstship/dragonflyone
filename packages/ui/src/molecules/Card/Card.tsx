import { forwardRef } from "react";
import { cardVariants } from "./Card.variants.js";
import type {
  CardProps,
  CardHeaderProps,
  CardTitleProps,
  CardDescriptionProps,
  CardBodyProps,
  CardFooterProps,
} from "./Card.types.js";

/**
 * Card component
 * 
 * A versatile card component that uses design tokens via CSS custom properties
 * for consistent styling across themes and whitelabel configurations.
 * 
 * @example
 * ```tsx
 * <Card variant="elevated">
 *   <CardHeader>
 *     <CardTitle>Card Title</CardTitle>
 *     <CardDescription>Card description</CardDescription>
 *   </CardHeader>
 *   <CardBody>Card content</CardBody>
 *   <CardFooter>Card footer</CardFooter>
 * </Card>
 * ```
 */
export const Card = forwardRef<HTMLDivElement, CardProps>(
  function Card(
    { variant = "default", interactive = false, asButton, onClick, onKeyDown, className, children, ...props },
    ref
  ) {
    // Handle keyboard activation (Enter/Space)
    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (onClick && (e.key === "Enter" || e.key === " ")) {
        e.preventDefault();
        onClick(e as unknown as React.MouseEvent<HTMLDivElement>);
      }
      onKeyDown?.(e);
    };

    const isClickable = !!onClick;
    const shouldBeAccessible = isClickable || asButton;

    return (
      <div
        ref={ref}
        role={shouldBeAccessible ? "button" : undefined}
        tabIndex={shouldBeAccessible ? 0 : undefined}
        onClick={onClick}
        onKeyDown={handleKeyDown}
        className={cardVariants({ variant, interactive, className })}
        {...props}
      >
        {children}
      </div>
    );
  }
);

/**
 * CardHeader component
 * 
 * Header section of a card with bottom border separation.
 */
export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  function CardHeader({ className, children, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={`pb-4 mb-4 border-b-2 border-[var(--color-border-default)] ${className || ""}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

/**
 * CardTitle component
 * 
 * Title heading for card headers.
 */
export const CardTitle = forwardRef<HTMLHeadingElement, CardTitleProps>(
  function CardTitle({ className, children, ...props }, ref) {
    return (
      <h3
        ref={ref}
        className={`font-heading text-lg uppercase tracking-wider font-bold text-[var(--color-text-primary)] ${className || ""}`}
        {...props}
      >
        {children}
      </h3>
    );
  }
);

/**
 * CardDescription component
 * 
 * Subtitle text for card headers.
 */
export const CardDescription = forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  function CardDescription({ className, children, ...props }, ref) {
    return (
      <p
        ref={ref}
        className={`text-sm mt-1 text-[var(--color-text-secondary)] ${className || ""}`}
        {...props}
      >
        {children}
      </p>
    );
  }
);

/**
 * CardBody component
 * 
 * Main content section of a card.
 */
export const CardBody = forwardRef<HTMLDivElement, CardBodyProps>(
  function CardBody({ className, children, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={`mb-4 text-[var(--color-text-primary)] ${className || ""}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

/**
 * CardFooter component
 * 
 * Footer section of a card with top border separation.
 */
export const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  function CardFooter({ className, children, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={`mt-4 pt-4 border-t-2 border-[var(--color-border-default)] ${className || ""}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);
