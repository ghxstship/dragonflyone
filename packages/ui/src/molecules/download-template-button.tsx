"use client";

import { Download } from "lucide-react";
import { Button, type ButtonProps } from "../atoms/button.js";

export interface DownloadTemplateButtonProps extends Omit<ButtonProps, "onClick"> {
  templateUrl: string;
  templateName?: string;
  disabled?: boolean;
}

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
    <Button
      variant={variant}
      size={size}
      icon={<Download className="size-4" />}
      onClick={handleDownload}
      disabled={disabled}
      className={className}
      title={disabled ? "Import not available for this page" : `Download ${templateName}`}
      {...props}
    >
      Download Template
    </Button>
  );
}

export interface ImportButtonProps extends Omit<ButtonProps, "onClick"> {
  onImport?: () => void;
  disabled?: boolean;
}

export function ImportButton({
  onImport,
  disabled = false,
  variant = "outline",
  size = "sm",
  className,
  ...props
}: ImportButtonProps) {
  return (
    <Button
      variant={variant}
      size={size}
      icon={<Download className="size-4" />}
      onClick={onImport}
      disabled={disabled}
      className={disabled ? "opacity-50 cursor-not-allowed" : className}
      title={disabled ? "Bulk import not available for this page" : "Import data from template"}
      {...props}
    >
      Import
    </Button>
  );
}
