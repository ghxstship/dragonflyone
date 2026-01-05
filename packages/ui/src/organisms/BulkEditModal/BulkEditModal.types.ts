export interface BulkEditField {
  key: string;
  label: string;
  type: "text" | "number" | "select" | "date" | "checkbox";
  options?: { value: string; label: string }[];
  placeholder?: string;
}

export interface BulkEditModalProps<T> {
  open: boolean;
  onClose: () => void;
  selectedItems: T[];
  fields: BulkEditField[];
  onSubmit: (updates: Record<string, unknown>, selectedIds: string[]) => Promise<void>;
  getItemId: (item: T) => string;
  getItemLabel: (item: T) => string;
  title?: string;
  description?: string;
  submitLabel?: string;
  className?: string;
}
