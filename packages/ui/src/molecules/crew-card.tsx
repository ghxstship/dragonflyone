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
  /** Custom className */
  className?: string;
}

const statusConfig = {
  available: { label: "AVAILABLE", bgClass: "bg-black", textClass: "text-white" },
  assigned: { label: "ASSIGNED", bgClass: "bg-grey-700", textClass: "text-white" },
  unavailable: { label: "UNAVAILABLE", bgClass: "bg-grey-400", textClass: "text-black" },
  "on-call": { label: "ON CALL", bgClass: "bg-grey-800", textClass: "text-white" },
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
  id,
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
  className = "",
}: CrewCardProps) {
  const statusInfo = statusConfig[status];
  const isCompact = variant === "compact";
  const isDetailed = variant === "detailed";

  const avatarHeightClass = isCompact ? "h-20" : isDetailed ? "h-[200px]" : "h-40";

  return (
    <article
      className={clsx(
        "flex bg-white border-2 border-black overflow-hidden transition-all duration-base",
        isCompact ? "flex-row" : "flex-col",
        onClick && "cursor-pointer hover:-translate-y-0.5 hover:shadow-hard",
        className
      )}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {/* Avatar Section */}
      <div
        className={clsx(
          "relative bg-grey-800 flex items-center justify-center flex-shrink-0 overflow-hidden",
          isCompact ? "w-20 h-20" : "w-full",
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
              "font-heading text-white",
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
              "absolute top-3 right-3 font-code text-mono-xs tracking-widest px-2 py-1",
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
          isCompact ? "p-3 gap-1" : "p-5 gap-2"
        )}
      >
        {/* Name & Role */}
        <div>
          <h3
            className={clsx(
              "font-heading text-black uppercase tracking-wide leading-snug",
              isCompact ? "text-h5-md" : "text-h4-md"
            )}
          >
            {name}
          </h3>
          <div
            className={clsx(
              "font-body text-grey-700 mt-1",
              isCompact ? "text-body-sm" : "text-body-md"
            )}
          >
            {role}
          </div>
        </div>

        {/* Department */}
        {department && !isCompact && (
          <div className="font-code text-mono-sm text-grey-500 tracking-wide">
            {department}
          </div>
        )}

        {/* Compact Status */}
        {isCompact && (
          <div
            className={clsx(
              "font-code text-mono-xs tracking-widest mt-auto",
              status === "available" ? "text-black" : "text-grey-600"
            )}
          >
            {statusInfo.label}
          </div>
        )}

        {/* Current Assignment */}
        {currentAssignment && !isCompact && (
          <div className="font-code text-mono-sm text-grey-600 tracking-wide p-2 bg-grey-100 mt-2">
            ASSIGNED: {currentAssignment}
          </div>
        )}

        {/* Skills */}
        {isDetailed && skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {skills.slice(0, 4).map((skill, index) => (
              <span
                key={index}
                className="font-code text-mono-xs text-grey-700 tracking-wide px-2 py-1 border border-grey-300"
              >
                {skill}
              </span>
            ))}
            {skills.length > 4 && (
              <span className="font-code text-mono-xs text-grey-500 tracking-wide px-2 py-1">
                +{skills.length - 4}
              </span>
            )}
          </div>
        )}

        {/* Contact Info (Detailed only) */}
        {isDetailed && (email || phone) && (
          <div className="flex flex-col gap-1 mt-auto pt-3 border-t border-grey-200">
            {email && (
              <div className="font-code text-mono-sm text-grey-600 tracking-wide">
                {email}
              </div>
            )}
            {phone && (
              <div className="font-code text-mono-sm text-grey-600 tracking-wide">
                {phone}
              </div>
            )}
          </div>
        )}

        {/* Rating */}
        {rating !== undefined && !isCompact && (
          <div
            className={clsx(
              "flex items-center gap-1",
              isDetailed ? "mt-2" : "mt-auto"
            )}
          >
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className={clsx(
                  "w-3 h-3",
                  star <= rating ? "bg-black" : "bg-grey-300"
                )}
              />
            ))}
            <span className="font-code text-mono-xs text-grey-600 ml-2">
              {rating.toFixed(1)}
            </span>
          </div>
        )}
      </div>
    </article>
  );
}

export default CrewCard;
