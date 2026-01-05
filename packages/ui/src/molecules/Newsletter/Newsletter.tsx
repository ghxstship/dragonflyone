"use client";

import { forwardRef, useState, FormEvent } from "react";
import { 
  newsletterVariants,
  newsletterFormVariants,
  newsletterInputVariants,
  newsletterButtonVariants,
  newsletterSuccessVariants 
} from "./Newsletter.variants.js";
import type { NewsletterProps } from "./Newsletter.types.js";

/**
 * Newsletter component - Bold Contemporary Pop Art Adventure
 * 
 * Features:
 * - Bold borders and shadows
 * - Clear visual hierarchy
 * - Interactive form elements
 * - Loading and success states
 * - CVA-based variants for consistent theming
 * 
 * @example
 * ```tsx
 * <Newsletter
 *   onSubmit={(email) => console.log('Subscribed:', email)}
 *   placeholder="Enter your email"
 *   buttonText="Subscribe"
 * />
 * ```
 */
export const Newsletter = forwardRef<HTMLDivElement, NewsletterProps>(
  function Newsletter({ 
    onSubmit, 
    placeholder = "Your email", 
    buttonText = "Subscribe", 
    inverted = false, 
    className, 
    ...props 
  }, ref) {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
      e.preventDefault();
      if (!email || loading) return;

      setLoading(true);
      try {
        await onSubmit?.(email);
        setSuccess(true);
        setEmail("");
        setTimeout(() => setSuccess(false), 3000);
      } catch (error) {
        console.error("Newsletter signup failed:", error);
      } finally {
        setLoading(false);
      }
    };

    return (
      <div 
        ref={ref} 
        className={newsletterVariants({ inverted, className })} 
        {...props}
      >
        <form onSubmit={handleSubmit} className={newsletterFormVariants({ inverted })}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={placeholder}
            required
            disabled={loading}
            className={newsletterInputVariants({ inverted })}
            aria-label="Email address"
          />
          
          <button
            type="submit"
            disabled={loading || !email}
            className={newsletterButtonVariants({ 
              loading: loading || !email, 
              success, 
              inverted 
            })}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin">⏳</span>
                {buttonText}
              </span>
            ) : success ? (
              <span className="flex items-center justify-center gap-2">
                ✓ Subscribed!
              </span>
            ) : (
              buttonText
            )}
          </button>
        </form>

        {success && (
          <div className={newsletterSuccessVariants({ inverted })}>
            Thank you for subscribing! Check your email for confirmation.
          </div>
        )}
      </div>
    );
  }
);

Newsletter.displayName = "Newsletter";
