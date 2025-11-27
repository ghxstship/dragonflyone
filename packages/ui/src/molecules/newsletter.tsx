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
                ? "bg-transparent border-white text-white placeholder:text-grey-400 focus:ring-white"
                : "bg-white border-black text-black placeholder:text-grey-500 focus:ring-black"
            )}
            disabled={loading || success}
          />
          <button
            type="submit"
            disabled={loading || success}
            className={clsx(
              "px-spacing-6 py-spacing-3 font-heading uppercase tracking-wider border-2 transition-all min-w-container-xs",
              inverted
                ? "border-white bg-transparent text-white hover:bg-white hover:text-black disabled:opacity-50"
                : "border-black bg-black text-white hover:bg-white hover:text-black disabled:opacity-50"
            )}
          >
            {success ? "Done!" : loading ? "..." : buttonText}
          </button>
        </form>
      </div>
    );
  }
);
