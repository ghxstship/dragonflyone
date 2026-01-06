"use client";

import React from "react";
import { Star, Mail, Phone, Briefcase } from "lucide-react";
import { 
  crewCardVariants,
  crewCardHeaderVariants,
  crewCardAvatarVariants,
  crewCardAvatarPlaceholderVariants,
  crewCardContentVariants,
  crewCardNameVariants,
  crewCardRoleVariants,
  crewCardStatusVariants,
  crewCardDetailsVariants,
  crewCardDetailItemVariants 
} from "./CrewCard.variants.js";
import type { 
  CrewCardProps, 
  CrewCardStatus 
} from "./CrewCard.types.js";

/**
 * CrewCard component - Bold Contemporary Pop Art Adventure
 * 
 * Features:
 * - Bold borders and shadows
 * - Clear visual hierarchy
 * - Status-based styling
 * - Multiple variants (default, compact, detailed)
 * - CVA-based variants for consistent theming
 * 
 * @example
 * ```tsx
 * <CrewCard
 *   id="crew-1"
 *   name="John Doe"
 *   role="Event Manager"
 *   department="Operations"
 *   status="available"
 *   rating={5}
 *   variant="default"
 *   onClick={() => console.log('Card clicked')}
 * />
 * ```
 */
export function CrewCard({
  name,
  role,
  department,
  imageUrl,
  email,
  phone,
  skills,
  status = "available",
  currentAssignment,
  rating,
  variant = "default",
  onClick,
  inverted = false,
  className,
}: CrewCardProps) {
  // Get initials for avatar placeholder
  const getInitials = (fullName: string): string => {
    return fullName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Get status label
  const getStatusLabel = (crewStatus: CrewCardStatus): string => {
    const statusLabels = {
      available: "AVAILABLE",
      assigned: "ASSIGNED", 
      unavailable: "UNAVAILABLE",
      "on-call": "ON CALL"
    };
    return statusLabels[crewStatus];
  };

  // Render rating stars
  const renderRating = (ratingValue?: number) => {
    if (!ratingValue) return null;
    
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, index) => (
          <Star
            key={index}
            className={`w-4 h-4 ${
              index < ratingValue
                ? "fill-warning-500 text-warning-500"
                : "fill-transparent text-border"
            }`}
          />
        ))}
        <span className={`text-sm ml-1 ${
          inverted ? "text-text-muted-inverse" : "text-text-muted"
        }`}>
          {ratingValue}.0
        </span>
      </div>
    );
  };

  return (
    <div
      className={crewCardVariants({ variant, className })}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`Crew member: ${name}, ${role}`}
    >
      {/* Header */}
      <div className={crewCardHeaderVariants({ variant })}>
        {/* Avatar */}
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={`${name} - ${role}`}
            className={crewCardAvatarVariants({ variant })}
          />
        ) : (
          <div className={crewCardAvatarPlaceholderVariants({ variant })}>
            {getInitials(name)}
          </div>
        )}

        {/* Content */}
        <div className={crewCardContentVariants({ variant })}>
          <div>
            <h3 className={crewCardNameVariants({ variant })}>
              {name}
            </h3>
            <p className={crewCardRoleVariants({ variant })}>
              {role}
            </p>
            {department && (
              <p className={`text-sm ${inverted ? 'text-text-muted-inverse' : 'text-text-muted'}`}>
                {department}
              </p>
            )}
          </div>

          {/* Status Badge */}
          <div className={crewCardStatusVariants({ status })}>
            {getStatusLabel(status)}
          </div>
        </div>
      </div>

      {/* Details (hidden in compact variant) */}
      <div className={crewCardDetailsVariants({ variant })}>
        {/* Current Assignment */}
        {currentAssignment && (
          <div className={crewCardDetailItemVariants({})}>
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              <span>{currentAssignment}</span>
            </div>
          </div>
        )}

        {/* Contact Info */}
        {(email || phone) && (
          <div className="space-y-1">
            {email && (
              <div className={crewCardDetailItemVariants({})}>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>{email}</span>
                </div>
              </div>
            )}
            {phone && (
              <div className={crewCardDetailItemVariants({})}>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>{phone}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Skills */}
        {skills && skills.length > 0 && (
          <div className={crewCardDetailItemVariants({})}>
            <div className="flex flex-wrap gap-1">
              {skills.slice(0, 3).map((skill, index) => (
                <span
                  key={index}
                  className={`px-2 py-1 text-xs rounded-badge ${
                    inverted 
                      ? "bg-surface-elevated-inverse border-border-inverse text-text-inverse" 
                      : "bg-surface-elevated border-border text-text-primary"
                  }`}
                >
                  {skill}
                </span>
              ))}
              {skills.length > 3 && (
                <span className={`px-2 py-1 text-xs rounded-badge ${
                  inverted 
                    ? "bg-surface-elevated-inverse border-border-inverse text-text-muted-inverse" 
                    : "bg-surface-elevated border-border text-text-muted"
                }`}>
                  +{skills.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Rating */}
        {rating && renderRating(rating)}
      </div>
    </div>
  );
}
