export type CustomFieldType =
  | "text"
  | "number"
  | "date"
  | "datetime"
  | "select"
  | "multiselect"
  | "checkbox"
  | "url"
  | "email"
  | "phone"
  | "currency"
  | "percent"
  | "formula"
  | "reference"
  | "rich_text";

export type FieldPermission = "editable" | "readonly" | "hidden";

export interface CustomFieldOption {
  value: string;
  label: string;
  color?: string;
}

export interface CustomFieldDefinition {
  id: string;
  key: string;
  label: string;
  type: CustomFieldType;
  required?: boolean;
  placeholder?: string;
  helpText?: string;
  options?: CustomFieldOption[];
  formula?: string;
  referenceEntity?: string;
  referenceDisplayField?: string;
  permission?: FieldPermission;
  validation?: {
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    patternMessage?: string;
  };
  defaultValue?: unknown;
  currencyCode?: string;
}

export interface CustomFieldRendererProps {
  field: CustomFieldDefinition;
  value: unknown;
  onChange?: (value: unknown) => void;
  onBlur?: () => void;
  error?: string;
  disabled?: boolean;
  compact?: boolean;
  showLabel?: boolean;
  className?: string;
  pendingSync?: boolean;
  referenceOptions?: CustomFieldOption[];
  onReferenceSearch?: (query: string) => Promise<CustomFieldOption[]>;
}

export interface CustomFieldGroupProps {
  fields: CustomFieldDefinition[];
  values: Record<string, unknown>;
  onChange?: (key: string, value: unknown) => void;
  errors?: Record<string, string>;
  disabled?: boolean;
  compact?: boolean;
  columns?: 1 | 2 | 3;
  className?: string;
  pendingSyncFields?: string[];
}
