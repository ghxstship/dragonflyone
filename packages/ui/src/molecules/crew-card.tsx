"use client";

import React from "react";
import clsx from "clsx";

export interface CrewCardProps {
  /** Crew member ID */
  id: string;
  /** Full name */
  name: string;
  /** Primary role/position */
  role: string;
  /** Department */
  department?: string;
  /** Profile image URL */
  imageUrl?: string;
  /** Contact email */
  email?: string;
  /** Contact phone */
  phone?: string;
  /** Skills/certifications */
  skills?: string[];
  /** Availability status */
  status?: "available" | "assigned" | "unavailable" | "on-call";
  /** Current project/event assignment */
  currentAssignment?: string;
  /** Rating (1-5) */
  rating?: number;
  /** Card variant */
  variant?: "default" | "compact" | "detailed";
  /** Click handler */
  onClick?: () => void;
  /** Inverted theme (dark background) */
  inverted?: boolean;
  /** Custom className */
  className?: string;
}

const statusConfig = {
  available: { label: "AVAILABLE", bgClass: "bg-surface-inverse", textClass: "text-text-primary" },
  assigned: { label: "ASSIGNED", bgClass: "bg-surface-elevated", textClass: "text-text-primary" },
  unavailable: { label: "UNAVAILABLE", bgClass: "bg-muted", textClass: "text-text-primary" },
  "on-call": { label: "ON CALL", bgClass: "bg-surface-elevated", textClass: "text-text-primary" },
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function CrewCard({
  id: _id,
  name,
  role,
  department,
  imageUrl,
  email,
  phone,
  skills = [],
  status = "available",
  currentAssignment,
  rating,
  variant = "default",
  onClick,
  inverted = false,
  className = "",
}: CrewCardProps) {
  const statusInfo = statusConfig[status];
  const isCompact = variant === "compact";
  const isDetailed = variant === "detailed";

  const avatarHeightClass = isCompact ? "h-spacing-20" : isDetailed ? "h-spacing-48" : "h-spacing-40";

  return (
    <article
      className={clsx(
        "flex border-2 overflow-hidden transition-all duration-100 ease-[var(--ease-bounce)] rounded-[var(--radius-card)]",
        inverted
          ? "bg-surface-inverse border-border text-text-primary shadow-md"
          : "bg-surface-primary border-border-primary text-text-primary shadow-md",
        isCompact ? "flex-row" : "flex-col",
        onClick && "cursor-pointer hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_rgba(0,0,0,0.15)]",
        className
      )}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {/* Avatar Section */}
      <div
        className={clsx(
          "relative bg-surface-elevated flex items-center justify-center flex-shrink-0 overflow-hidden",
          isCompact ? "w-spacing-20 h-spacing-20" : "w-full",
          !isCompact && avatarHeightClass
        )}
      >
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-cover grayscale contrast-[1.1]"
          />
        ) : (
          <span
            className={clsx(
              "font-heading text-text-primary",
              isCompact ? "text-h4-md" : "text-h2-md"
            )}
          >
            {getInitials(name)}
          </span>
        )}

        {/* Status Badge */}
        {!isCompact && (
          <div
            className={clsx(
              "absolute top-spacing-3 right-spacing-3 font-code text-mono-xs tracking-widest px-spacing-2 py-spacing-1",
              statusInfo.bgClass,
              statusInfo.textClass
            )}
          >
            {statusInfo.label}
          </div>
        )}
      </div>

      {/* Content Section */}
      <div
        className={clsx(
          "flex flex-col flex-1",
          isCompact ? "p-spacing-3 gap-gap-xs" : "p-spacing-5 gap-gap-xs"
        )}
      >
        {/* Name & Role */}
        <div>
          <h3
            className={clsx(
              "font-heading uppercase tracking-wide leading-snug",
              inverted ? "text-text-primary" : "text-text-primary",
              isCompact ? "text-h5-md" : "text-h4-md"
            )}
          >
            {name}
          </h3>
          <div
            className={clsx(
              "font-body mt-spacing-1",
              inverted ? "text-text-secondary" : "text-text-muted",
              isCompact ? "text-body-sm" : "text-body-md"
            )}
          >
            {role}
          </div>
        </div>

        {/* Department */}
        {department && !isCompact && (
          <div className={clsx("font-code text-mono-sm tracking-wide", inverted ? "text-text-muted" : "text-text-muted")}>
            {department}
          </div>
        )}

        {/* Compact Status */}
        {isCompact && (
          <div
            className={clsx(
              "font-code text-mono-xs tracking-widest mt-auto",
              status === "available"
                ? inverted ? "text-text-primary" : "text-text-primary"
                : inverted ? "text-text-muted" : "text-text-muted"
            )}
          >
            {statusInfo.label}
          </div>
        )}

        {/* Current Assignment */}
        {currentAssignment && !isCompact && (
          <div className={clsx(
            "font-code text-mono-sm tracking-wide p-spacing-2 mt-spacing-2",
            inverted ? "text-text-secondary bg-surface-elevated" : "text-text-disabled bg-muted"
          )}>
            ASSIGNED: {currentAssignment}
          </div>
        )}

        {/* Skills */}
        {isDetailed && skills.length > 0 && (
          <div className="flex flex-wrap gap-gap-xs mt-spacing-2">
            {skills.slice(0, 4).map((skill, index) => (
              <span
                key={index}
                className={clsx(
                  "font-code text-mono-xs tracking-wide px-spacing-2 py-spacing-1 border",
                  inverted ? "text-text-secondary border-border" : "text-text-disabled border-border"
                )}
              >
                {skill}
              </span>
            ))}
            {skills.length > 4 && (
              <span className={clsx("font-code text-mono-xs tracking-wide px-spacing-2 py-spacing-1", inverted ? "text-text-muted" : "text-text-muted")}>
                +{skills.length - 4}
              </span>
            )}
          </div>
        )}

        {/* Contact Info (Detailed only) */}
        {isDetailed && (email || phone) && (
          <div className={clsx("flex flex-col gap-gap-xs mt-auto pt-spacing-3 border-t", inverted ? "border-border" : "border-border")}>
            {email && (
              <div className={clsx("font-code text-mono-sm tracking-wide", inverted ? "text-text-muted" : "text-text-muted")}>
                {email}
              </div>
            )}
            {phone && (
              <div className={clsx("font-code text-mono-sm tracking-wide", inverted ? "text-text-muted" : "text-text-muted")}>
                {phone}
              </div>
            )}
          </div>
        )}

        {/* Rating */}
        {rating !== undefined && !isCompact && (
          <div
            className={clsx(
              "flex items-center gap-gap-xs",
              isDetailed ? "mt-spacing-2" : "mt-auto"
            )}
          >
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className={clsx(
                  "w-spacing-3 h-spacing-3",
                  star <= rating
                    ? inverted ? "bg-on-dark-primary" : "bg-on-light-primary"
                    : inverted ? "bg-muted" : "bg-muted"
                )}
              />
            ))}
            <span className={clsx("font-code text-mono-xs ml-spacing-2", inverted ? "text-text-muted" : "text-text-muted")}>
              {rating.toFixed(1)}
            </span>
          </div>
        )}
      </div>
    </article>
  );
}

export default CrewCard;
