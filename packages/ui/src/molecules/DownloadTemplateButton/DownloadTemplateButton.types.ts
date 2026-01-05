import type { ButtonProps } from "../../atoms/Button/index.js";

/**
 * DownloadTemplateButton component props
 */
export interface DownloadTemplateButtonProps extends Omit<ButtonProps, "onClick"> {
  templateUrl: string;
  templateName?: string;
  disabled?: boolean;
}

/**
 * ImportButton component props
 */
export interface ImportButtonProps extends Omit<ButtonProps, "onClick"> {
  onImport?: () => void;
  disabled?: boolean;
}
