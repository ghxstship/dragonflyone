export type FilterOperator =
  | "equals"
  | "not_equals"
  | "contains"
  | "not_contains"
  | "starts_with"
  | "ends_with"
  | "greater_than"
  | "less_than"
  | "greater_or_equal"
  | "less_or_equal"
  | "is_empty"
  | "is_not_empty"
  | "in"
  | "not_in";

export type FilterLogic = "AND" | "OR";

export interface FilterField {
  key: string;
  label: string;
  type: "text" | "number" | "date" | "select" | "boolean";
  options?: { value: string; label: string }[];
}

export interface FilterCondition {
  id: string;
  field: string;
  operator: FilterOperator;
  value: unknown;
}

export interface FilterGroup {
  id: string;
  logic: FilterLogic;
  conditions: FilterCondition[];
  groups?: FilterGroup[];
}

export interface SavedFilter {
  id: string;
  name: string;
  filter: FilterGroup;
  isDefault?: boolean;
  createdAt?: string;
}

export interface SavedFilterBuilderProps {
  fields: FilterField[];
  value: FilterGroup;
  onChange: (filter: FilterGroup) => void;
  savedFilters?: SavedFilter[];
  onSaveFilter?: (name: string, filter: FilterGroup) => Promise<void>;
  onDeleteFilter?: (filterId: string) => Promise<void>;
  onApplyFilter?: (filter: FilterGroup) => void;
  maxDepth?: number;
  className?: string;
}
