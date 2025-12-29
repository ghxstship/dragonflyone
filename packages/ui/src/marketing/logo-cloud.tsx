"use client";

import { forwardRef } from "react";
import clsx from "clsx";
import { Container, Stack } from "../foundations/layout.js";
import { Kicker } from "../atoms/kicker.js";

/**
 * LogoCloud - Display client/partner logos for social proof
 * 2026 Best Practices:
 * - Grayscale logos for visual consistency
 * - Hover effect to reveal color
 * - Responsive grid layout
 * Bold Contemporary Pop Art Adventure Design System
 */

export interface LogoItem {
  id: string;
  name: string;
  logo: string;
  href?: string;
}

export interface LogoCloudProps {
  /** Section title */
  title?: string;
  /** Logos to display */
  logos: LogoItem[];
  /** Number of logos per row */
  columns?: 4 | 5 | 6;
  /** Background color */
  background?: "transparent" | "black" | "ink";
  /** Logo size */
  size?: "sm" | "md" | "lg";
  /** Grayscale filter */
  grayscale?: boolean;
  /** Show as marquee animation */
  marquee?: boolean;
  className?: string;
}

export const LogoCloud = forwardRef<HTMLElement, LogoCloudProps>(
  function LogoCloud(
    {
      title,
      logos,
      columns = 5,
      background = "transparent",
      size = "md",
      grayscale = true,
      marquee = false,
      className,
    },
    ref
  ) {
    const bgClasses = {
      transparent: "",
      black: "bg-black",
      ink: "bg-ink-950",
    };

    const sizeClasses = {
      sm: "h-6 md:h-8",
      md: "h-8 md:h-10",
      lg: "h-10 md:h-12",
    };

    const colClasses = {
      4: "grid-cols-2 sm:grid-cols-4",
      5: "grid-cols-2 sm:grid-cols-3 md:grid-cols-5",
      6: "grid-cols-3 sm:grid-cols-4 md:grid-cols-6",
    };

    const LogoImage = ({ logo }: { logo: LogoItem }) => (
      <div
        className={clsx(
          "flex items-center justify-center p-4 transition-all duration-300",
          grayscale && "grayscale opacity-60 hover:grayscale-0 hover:opacity-100"
        )}
      >
        {logo.href ? (
          <a
            href={logo.href}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <img
              src={logo.logo}
              alt={logo.name}
              className={clsx("w-auto object-contain", sizeClasses[size])}
            />
          </a>
        ) : (
          <img
            src={logo.logo}
            alt={logo.name}
            className={clsx("w-auto object-contain", sizeClasses[size])}
          />
        )}
      </div>
    );

    return (
      <section
        ref={ref}
        className={clsx("py-12 md:py-16", bgClasses[background], className)}
      >
        <Container size="xl">
          {title && (
            <Stack gap={8} className="items-center text-center mb-8">
              <Kicker className="text-grey-500">{title}</Kicker>
            </Stack>
          )}

          {marquee ? (
            <div className="relative overflow-hidden">
              <div className="flex animate-marquee">
                {[...logos, ...logos].map((logo, idx) => (
                  <LogoImage key={`${logo.id}-${idx}`} logo={logo} />
                ))}
              </div>
            </div>
          ) : (
            <div className={clsx("grid gap-4 items-center", colClasses[columns])}>
              {logos.map((logo) => (
                <LogoImage key={logo.id} logo={logo} />
              ))}
            </div>
          )}
        </Container>
      </section>
    );
  }
);

export default LogoCloud;
