"use client";

import React from "react";
import { Check, X } from "lucide-react";
import { Body } from "../../atoms/Typography/index.js";
import { passwordRequirementsVariants } from "./PasswordRequirements.variants.js";
import type { PasswordRequirementsProps } from "./PasswordRequirements.types.js";

/**
 * PasswordRequirements component - Bold Contemporary Pop Art Adventure
 * 
 * Displays password requirements with visual indicators
 */
export function PasswordRequirements({
  requirements,
  className,
}: PasswordRequirementsProps) {
  return (
    <div className={passwordRequirementsVariants({ className })}>
      <div className="space-y-2">
        {requirements.map((requirement, index) => (
          <div
            key={index}
            className="flex items-center gap-2 text-sm"
          >
            {requirement.met ? (
              <Check className="w-4 h-4 text-green-500" />
            ) : (
              <X className="w-4 h-4 text-red-500" />
            )}
            <Body className={requirement.met ? "text-green-500" : "text-red-500"}>
              {requirement.text}
            </Body>
          </div>
        ))}
      </div>
    </div>
  );
}
