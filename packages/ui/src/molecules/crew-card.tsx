"use client";

import React from "react";
import { colors, typography, fontSizes, letterSpacing, transitions, borderWidths } from "../tokens.js";

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
  available: { label: "AVAILABLE", bgColor: colors.black, textColor: colors.white },
  assigned: { label: "ASSIGNED", bgColor: colors.grey700, textColor: colors.white },
  unavailable: { label: "UNAVAILABLE", bgColor: colors.grey400, textColor: colors.black },
  "on-call": { label: "ON CALL", bgColor: colors.grey800, textColor: colors.white },
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

  return (
    <article
      className={className}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      style={{
        display: "flex",
        flexDirection: isCompact ? "row" : "column",
        backgroundColor: colors.white,
        border: `${borderWidths.medium} solid ${colors.black}`,
        cursor: onClick ? "pointer" : "default",
        transition: transitions.base,
        overflow: "hidden",
      }}
      onMouseEnter={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = "translateY(-2px)";
          e.currentTarget.style.boxShadow = `2px 2px 0 0 ${colors.black}`;
        }
      }}
      onMouseLeave={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "none";
        }
      }}
    >
      {/* Avatar Section */}
      <div
        style={{
          position: "relative",
          width: isCompact ? "80px" : "100%",
          height: isCompact ? "80px" : isDetailed ? "200px" : "160px",
          backgroundColor: colors.grey800,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          overflow: "hidden",
        }}
      >
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={name}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              filter: "grayscale(100%) contrast(1.1)",
            }}
          />
        ) : (
          <span
            style={{
              fontFamily: typography.heading,
              fontSize: isCompact ? fontSizes.h4MD : fontSizes.h2MD,
              color: colors.white,
            }}
          >
            {getInitials(name)}
          </span>
        )}

        {/* Status Badge */}
        {!isCompact && (
          <div
            style={{
              position: "absolute",
              top: "0.75rem",
              right: "0.75rem",
              backgroundColor: statusInfo.bgColor,
              color: statusInfo.textColor,
              fontFamily: typography.mono,
              fontSize: fontSizes.monoXS,
              letterSpacing: letterSpacing.widest,
              padding: "0.25rem 0.5rem",
            }}
          >
            {statusInfo.label}
          </div>
        )}
      </div>

      {/* Content Section */}
      <div
        style={{
          padding: isCompact ? "0.75rem" : "1.25rem",
          display: "flex",
          flexDirection: "column",
          gap: isCompact ? "0.25rem" : "0.5rem",
          flex: 1,
        }}
      >
        {/* Name & Role */}
        <div>
          <h3
            style={{
              fontFamily: typography.heading,
              fontSize: isCompact ? fontSizes.h5MD : fontSizes.h4MD,
              color: colors.black,
              textTransform: "uppercase",
              letterSpacing: letterSpacing.wide,
              margin: 0,
              lineHeight: 1.1,
            }}
          >
            {name}
          </h3>
          <div
            style={{
              fontFamily: typography.body,
              fontSize: isCompact ? fontSizes.bodySM : fontSizes.bodyMD,
              color: colors.grey700,
              marginTop: "0.25rem",
            }}
          >
            {role}
          </div>
        </div>

        {/* Department */}
        {department && !isCompact && (
          <div
            style={{
              fontFamily: typography.mono,
              fontSize: fontSizes.monoSM,
              color: colors.grey500,
              letterSpacing: letterSpacing.wide,
            }}
          >
            {department}
          </div>
        )}

        {/* Compact Status */}
        {isCompact && (
          <div
            style={{
              fontFamily: typography.mono,
              fontSize: fontSizes.monoXS,
              color: statusInfo.bgColor === colors.black ? colors.black : colors.grey600,
              letterSpacing: letterSpacing.widest,
              marginTop: "auto",
            }}
          >
            {statusInfo.label}
          </div>
        )}

        {/* Current Assignment */}
        {currentAssignment && !isCompact && (
          <div
            style={{
              fontFamily: typography.mono,
              fontSize: fontSizes.monoSM,
              color: colors.grey600,
              letterSpacing: letterSpacing.wide,
              padding: "0.5rem",
              backgroundColor: colors.grey100,
              marginTop: "0.5rem",
            }}
          >
            ASSIGNED: {currentAssignment}
          </div>
        )}

        {/* Skills */}
        {isDetailed && skills.length > 0 && (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "0.375rem",
              marginTop: "0.5rem",
            }}
          >
            {skills.slice(0, 4).map((skill, index) => (
              <span
                key={index}
                style={{
                  fontFamily: typography.mono,
                  fontSize: fontSizes.monoXS,
                  color: colors.grey700,
                  letterSpacing: letterSpacing.wide,
                  padding: "0.25rem 0.5rem",
                  border: `1px solid ${colors.grey300}`,
                }}
              >
                {skill}
              </span>
            ))}
            {skills.length > 4 && (
              <span
                style={{
                  fontFamily: typography.mono,
                  fontSize: fontSizes.monoXS,
                  color: colors.grey500,
                  letterSpacing: letterSpacing.wide,
                  padding: "0.25rem 0.5rem",
                }}
              >
                +{skills.length - 4}
              </span>
            )}
          </div>
        )}

        {/* Contact Info (Detailed only) */}
        {isDetailed && (email || phone) && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.25rem",
              marginTop: "auto",
              paddingTop: "0.75rem",
              borderTop: `1px solid ${colors.grey200}`,
            }}
          >
            {email && (
              <div
                style={{
                  fontFamily: typography.mono,
                  fontSize: fontSizes.monoSM,
                  color: colors.grey600,
                  letterSpacing: letterSpacing.wide,
                }}
              >
                {email}
              </div>
            )}
            {phone && (
              <div
                style={{
                  fontFamily: typography.mono,
                  fontSize: fontSizes.monoSM,
                  color: colors.grey600,
                  letterSpacing: letterSpacing.wide,
                }}
              >
                {phone}
              </div>
            )}
          </div>
        )}

        {/* Rating */}
        {rating !== undefined && !isCompact && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.25rem",
              marginTop: isDetailed ? "0.5rem" : "auto",
            }}
          >
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                style={{
                  width: "12px",
                  height: "12px",
                  backgroundColor: star <= rating ? colors.black : colors.grey300,
                }}
              />
            ))}
            <span
              style={{
                fontFamily: typography.mono,
                fontSize: fontSizes.monoXS,
                color: colors.grey600,
                marginLeft: "0.5rem",
              }}
            >
              {rating.toFixed(1)}
            </span>
          </div>
        )}
      </div>
    </article>
  );
}

export default CrewCard;
