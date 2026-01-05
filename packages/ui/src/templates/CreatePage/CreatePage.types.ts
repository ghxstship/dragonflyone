import type { ReactNode, HTMLAttributes } from "react";

export interface FormSection {
  id: string;
  title: string;
  description?: string;
  icon?: ReactNode;
  content: ReactNode;
}

export interface CreatePageProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  /** Page title */
  title: string;
  /** Page subtitle/description */
  subtitle?: string;
  /** Breadcrumb navigation */
  breadcrumbs?: Array<{
    label: string;
    href?: string;
  }>;
  /** Back button href */
  backHref: string;
  /** Back button label */
  backLabel?: string;
  /** Form sections */
  sections: FormSection[];
  /** Form submit handler */
  onSubmit: (e: React.FormEvent) => void | Promise<void>;
  /** Submit button label */
  submitLabel?: string;
  /** Cancel button label */
  cancelLabel?: string;
  /** Cancel button href */
  cancelHref?: string;
  /** Loading state */
  loading?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Show save button */
  showSave?: boolean;
  /** Additional actions */
  actions?: ReactNode;
  /** Page header actions */
  headerActions?: ReactNode;
  /** Inverted theme */
  inverted?: boolean;
}

export interface CreatePageVariants {
  inverted?: boolean;
  className?: string;
}
