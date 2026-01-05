"use client";

import { forwardRef } from "react";
import { 
  settingsRowVariants,
  settingsRowContentContainerVariants,
  settingsRowIconVariants,
  settingsRowTextContainerVariants,
  settingsRowLabelVariants,
  settingsRowDescriptionVariants,
  settingsRowControlContainerVariants 
} from "./SettingsRow.variants.js";
import type { SettingsRowProps } from "./SettingsRow.types.js";

/**
 * SettingsRow component - Bold Contemporary Pop Art Adventure
 * 
 * Features:
 * - Bold borders and shadows
 * - Clear visual hierarchy
 * - Settings row with label, description, and control
 * - CVA-based variants for consistent theming
 * 
 * @example
 * ```tsx
 * <SettingsRow
 *   label="Notifications"
 *   description="Receive push notifications"
 *   control={<Switch />}
 *   icon={<BellIcon />}
 *   bordered={true}
 *   inverted={false}
 * />
 * ```
 */
export const SettingsRow = forwardRef<HTMLDivElement, SettingsRowProps>(
  function SettingsRow(
    {
      label,
      description,
      control,
      icon,
      disabled = false,
      bordered = false,
      inverted = false,
      className,
      ...props
    },
    ref
  ) {
    return (
      <div
        ref={ref}
        className={settingsRowVariants({ bordered, disabled, inverted, className })}
        {...props}
      >
        {/* Content Container */}
        <div className={settingsRowContentContainerVariants({ inverted })}>
          {/* Icon */}
          {icon && (
            <div className={settingsRowIconVariants({ inverted })}>
              {icon}
            </div>
          )}
          
          {/* Text Container */}
          <div className={settingsRowTextContainerVariants({ inverted })}>
            {/* Label */}
            <div className={settingsRowLabelVariants({ inverted })}>
              {label}
            </div>
            
            {/* Description */}
            {description && (
              <div className={settingsRowDescriptionVariants({ inverted })}>
                {description}
              </div>
            )}
          </div>
        </div>
        
        {/* Control Container */}
        <div className={settingsRowControlContainerVariants({ inverted })}>
          {control}
        </div>
      </div>
    );
  }
);

SettingsRow.displayName = "SettingsRow";
