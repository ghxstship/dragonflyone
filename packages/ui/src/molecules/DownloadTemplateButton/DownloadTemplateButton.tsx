"use client";

import { Download, Upload } from "lucide-react";
import { Button } from "../../atoms/Button/index.js";
import { 
  downloadTemplateButtonVariants,
  importButtonVariants 
} from "./DownloadTemplateButton.variants.js";
import type { 
  DownloadTemplateButtonProps, 
  ImportButtonProps 
} from "./DownloadTemplateButton.types.js";

/**
 * DownloadTemplateButton component - Bold Contemporary Pop Art Adventure
 * 
 * Features:
 * - Bold borders and shadows
 * - Clear visual hierarchy
 * - Download action functionality
 * - CVA-based variants for consistent theming
 * 
 * @example
 * ```tsx
 * <DownloadTemplateButton
 *   templateUrl="/templates/example.xlsx"
 *   templateName="Excel Template"
 *   variant="outline"
 *   size="sm"
 * />
 * ```
 */
export function DownloadTemplateButton({
  templateUrl,
  templateName = "Template",
  disabled = false,
  variant = "outline",
  size = "sm",
  className,
  ...props
}: DownloadTemplateButtonProps) {
  const handleDownload = () => {
    if (disabled) return;
    window.open(templateUrl, "_blank");
  };

  return (
    <div className={downloadTemplateButtonVariants({ disabled, className })}>
      <Button
        variant={variant}
        size={size}
        icon={<Download className="w-4 h-4" />}
        onClick={handleDownload}
        disabled={disabled}
        title={disabled ? "Import not available for this page" : `Download ${templateName}`}
        {...props}
      >
        Download Template
      </Button>
    </div>
  );
}

/**
 * ImportButton component - Bold Contemporary Pop Art Adventure
 * 
 * Features:
 * - Bold borders and shadows
 * - Clear visual hierarchy
 * - Import action functionality
 * - CVA-based variants for consistent theming
 * 
 * @example
 * ```tsx
 * <ImportButton
 *   onImport={() => console.log('Import clicked')}
 *   variant="outline"
 *   size="sm"
 * />
 * ```
 */
export function ImportButton({
  onImport,
  disabled = false,
  variant = "outline",
  size = "sm",
  className,
  ...props
}: ImportButtonProps) {
  const handleImport = () => {
    if (disabled || !onImport) return;
    onImport();
  };

  return (
    <div className={importButtonVariants({ disabled, className })}>
      <Button
        variant={variant}
        size={size}
        icon={<Upload className="w-4 h-4" />}
        onClick={handleImport}
        disabled={disabled}
        title={disabled ? "Import not available" : "Import data"}
        {...props}
      >
        Import
      </Button>
    </div>
  );
}
