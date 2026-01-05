export type FieldType = 
  | "text" | "textarea" | "number" | "email" | "tel" | "url" | "password"
  | "date" | "time" | "datetime" | "daterange"
  | "select" | "multiselect" | "combobox" | "radio" | "checkbox"
  | "file" | "image" | "avatar"
  | "currency" | "percentage"
  | "color" | "rating" | "slider" | "switch" | "toggle"
  | "rich-text" | "markdown" | "code"
  | "address" | "phone" | "coordinates"
  | "relation" | "tags" | "json"
  | "hidden" | "autocomplete" | "linked-record" | "signature" | "location";

export interface FormFieldOption {
  value: string;
  label: string;
}

export interface FormFieldConfig {
  name: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  options?: FormFieldOption[];
  hint?: string;
  defaultValue?: unknown;
  validation?: {
    pattern?: RegExp | string;
    patternMessage?: string;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    custom?: (value: unknown) => string | null;
  };
  colSpan?: 1 | 2;
}

export interface FormStep {
  id: string;
  title: string;
  description?: string;
  fields: FormFieldConfig[];
}

export interface RecordFormModalProps<T = Record<string, unknown>> {
  open: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  title?: string;
  record?: Partial<T>;
  fields?: FormFieldConfig[];
  steps?: FormStep[];
  onSubmit: (data: T) => Promise<void>;
  submitLabel?: string;
  cancelLabel?: string;
  size?: "sm" | "md" | "lg" | "xl";
  loading?: boolean;
  className?: string;
}
