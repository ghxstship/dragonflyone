"use client";

import { forwardRef, useState, FormEvent } from "react";
import clsx from "clsx";
import type { HTMLAttributes } from "react";

export type NewsletterProps = HTMLAttributes<HTMLDivElement> & {
  onSubmit?: (email: string) => void | Promise<void>;
  placeholder?: string;
  buttonText?: string;
  inverted?: boolean;
};

export const Newsletter = forwardRef<HTMLDivElement, NewsletterProps>(
  function Newsletter({ onSubmit, placeholder = "Your email", buttonText = "Subscribe", inverted = false, className, ...props }, ref) {
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
      <div ref={ref} className={clsx("w-full max-w-md", className)} {...props}>
        <form onSubmit={handleSubmit} className="flex gap-gap-xs">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={placeholder}
            required
            className={clsx(
              "flex-1 px-spacing-4 py-spacing-3 font-body border-2 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors",
              inverted
                ? "bg-transparent border-on-dark-primary text-text-primary placeholder:text-text-muted focus:ring-on-dark-primary"
                : "bg-surface-primary border-border-primary text-text-primary placeholder:text-text-disabled focus:ring-border-primary"
            )}
            disabled={loading || success}
          />
          <button
            type="submit"
            disabled={loading || success}
            className={clsx(
              "px-spacing-6 py-spacing-3 font-heading uppercase tracking-wider leading-none border-2 transition-all min-w-container-xs",
              inverted
                ? "border-on-dark-primary bg-transparent text-text-primary hover:bg-surface-primary hover:text-text-primary disabled:opacity-50"
                : "border-border-primary bg-surface-inverse text-text-primary hover:bg-surface-primary hover:text-text-primary disabled:opacity-50"
            )}
          >
            {success ? "Done!" : loading ? "..." : buttonText}
          </button>
        </form>
      </div>
    );
  }
);
