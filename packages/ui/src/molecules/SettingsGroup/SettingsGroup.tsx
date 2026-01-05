"use client";

import React from "react";
import { Display, Body } from "../../atoms/Typography/index.js";
import { settingsGroupVariants } from "./SettingsGroup.variants.js";
import type { SettingsGroupProps } from "./SettingsGroup.types.js";

/**
 * SettingsGroup component - Bold Contemporary Pop Art Adventure
 * 
 * A settings group with title and content
 */
export function SettingsGroup({
  title,
  description,
  children,
  className,
}: SettingsGroupProps) {
  return (
    <div className={settingsGroupVariants({ className })}>
      <div className="border-b-2 border-border pb-4 mb-6">
        <Display className="text-text-primary">{title}</Display>
        {description && (
          <Body className="text-text-muted mt-2">
            {description}
          </Body>
        )}
      </div>
      <div className="space-y-6">
        {children}
      </div>
    </div>
  );
}
