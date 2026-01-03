"use client";

import React, { useState, useCallback, useMemo } from "react";
import clsx from "clsx";
import { Plus, Trash2, Save, X, ChevronDown, ChevronUp } from "lucide-react";
import { OverlayLayout } from "../templates/overlay-layout.js";

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

const operatorLabels: Record<FilterOperator, string> = {
  equals: "equals",
  not_equals: "does not equal",
  contains: "contains",
  not_contains: "does not contain",
  starts_with: "starts with",
  ends_with: "ends with",
  greater_than: "greater than",
  less_than: "less than",
  greater_or_equal: "greater or equal",
  less_or_equal: "less or equal",
  is_empty: "is empty",
  is_not_empty: "is not empty",
  in: "is any of",
  not_in: "is none of",
};

const operatorsByType: Record<string, FilterOperator[]> = {
  text: ["equals", "not_equals", "contains", "not_contains", "starts_with", "ends_with", "is_empty", "is_not_empty"],
  number: ["equals", "not_equals", "greater_than", "less_than", "greater_or_equal", "less_or_equal", "is_empty", "is_not_empty"],
  date: ["equals", "not_equals", "greater_than", "less_than", "greater_or_equal", "less_or_equal", "is_empty", "is_not_empty"],
  select: ["equals", "not_equals", "in", "not_in", "is_empty", "is_not_empty"],
  boolean: ["equals", "not_equals"],
};

function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

export function SavedFilterBuilder({
  fields,
  value,
  onChange,
  savedFilters = [],
  onSaveFilter,
  onDeleteFilter,
  onApplyFilter,
  maxDepth = 2,
  className = "",
}: SavedFilterBuilderProps) {
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [filterName, setFilterName] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedFiltersOpen, setSavedFiltersOpen] = useState(false);

  const handleAddCondition = useCallback(
    (groupId: string) => {
      const newCondition: FilterCondition = {
        id: generateId(),
        field: fields[0]?.key || "",
        operator: "equals",
        value: "",
      };

      const addToGroup = (group: FilterGroup): FilterGroup => {
        if (group.id === groupId) {
          return { ...group, conditions: [...group.conditions, newCondition] };
        }
        if (group.groups) {
          return { ...group, groups: group.groups.map(addToGroup) };
        }
        return group;
      };

      onChange(addToGroup(value));
    },
    [fields, value, onChange]
  );

  const handleRemoveCondition = useCallback(
    (groupId: string, conditionId: string) => {
      const removeFromGroup = (group: FilterGroup): FilterGroup => {
        if (group.id === groupId) {
          return {
            ...group,
            conditions: group.conditions.filter((c) => c.id !== conditionId),
          };
        }
        if (group.groups) {
          return { ...group, groups: group.groups.map(removeFromGroup) };
        }
        return group;
      };

      onChange(removeFromGroup(value));
    },
    [value, onChange]
  );

  const handleUpdateCondition = useCallback(
    (groupId: string, conditionId: string, updates: Partial<FilterCondition>) => {
      const updateInGroup = (group: FilterGroup): FilterGroup => {
        if (group.id === groupId) {
          return {
            ...group,
            conditions: group.conditions.map((c) =>
              c.id === conditionId ? { ...c, ...updates } : c
            ),
          };
        }
        if (group.groups) {
          return { ...group, groups: group.groups.map(updateInGroup) };
        }
        return group;
      };

      onChange(updateInGroup(value));
    },
    [value, onChange]
  );

  const handleToggleLogic = useCallback(
    (groupId: string) => {
      const toggleInGroup = (group: FilterGroup): FilterGroup => {
        if (group.id === groupId) {
          return { ...group, logic: group.logic === "AND" ? "OR" : "AND" };
        }
        if (group.groups) {
          return { ...group, groups: group.groups.map(toggleInGroup) };
        }
        return group;
      };

      onChange(toggleInGroup(value));
    },
    [value, onChange]
  );

  const handleAddGroup = useCallback(
    (parentGroupId: string, currentDepth: number) => {
      if (currentDepth >= maxDepth) return;

      const newGroup: FilterGroup = {
        id: generateId(),
        logic: "AND",
        conditions: [],
      };

      const addToParent = (group: FilterGroup): FilterGroup => {
        if (group.id === parentGroupId) {
          return { ...group, groups: [...(group.groups || []), newGroup] };
        }
        if (group.groups) {
          return { ...group, groups: group.groups.map(addToParent) };
        }
        return group;
      };

      onChange(addToParent(value));
    },
    [value, onChange, maxDepth]
  );

  const handleRemoveGroup = useCallback(
    (parentGroupId: string, groupId: string) => {
      const removeFromParent = (group: FilterGroup): FilterGroup => {
        if (group.id === parentGroupId && group.groups) {
          return {
            ...group,
            groups: group.groups.filter((g) => g.id !== groupId),
          };
        }
        if (group.groups) {
          return { ...group, groups: group.groups.map(removeFromParent) };
        }
        return group;
      };

      onChange(removeFromParent(value));
    },
    [value, onChange]
  );

  const handleSaveFilter = useCallback(async () => {
    if (!filterName.trim() || !onSaveFilter) return;
    setSaving(true);
    try {
      await onSaveFilter(filterName.trim(), value);
      setFilterName("");
      setSaveDialogOpen(false);
    } finally {
      setSaving(false);
    }
  }, [filterName, value, onSaveFilter]);

  const handleApplySavedFilter = useCallback(
    (filter: SavedFilter) => {
      onChange(filter.filter);
      onApplyFilter?.(filter.filter);
      setSavedFiltersOpen(false);
    },
    [onChange, onApplyFilter]
  );

  const handleClearFilter = useCallback(() => {
    onChange({
      id: generateId(),
      logic: "AND",
      conditions: [],
    });
  }, [onChange]);

  const hasConditions = useMemo(() => {
    const countConditions = (group: FilterGroup): number => {
      let count = group.conditions.length;
      if (group.groups) {
        count += group.groups.reduce((sum, g) => sum + countConditions(g), 0);
      }
      return count;
    };
    return countConditions(value) > 0;
  }, [value]);

  return (
    <div className={clsx("space-y-spacing-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-gap-sm">
        <h3 className="font-code text-mono-md tracking-widest uppercase text-on-dark-disabled">
          Filters
        </h3>

        <div className="flex items-center gap-gap-xs">
          {savedFilters.length > 0 && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setSavedFiltersOpen(!savedFiltersOpen)}
                className="flex items-center gap-gap-xs px-spacing-3 py-spacing-2 font-code text-mono-sm tracking-wide uppercase bg-surface-primary text-text-primary border-2 border-border-primary cursor-pointer hover:bg-surface-secondary"
              >
                Saved
                {savedFiltersOpen ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
              </button>

              {savedFiltersOpen && (
                <div className="absolute top-full right-0 mt-spacing-1 min-w-container-sm bg-surface-elevated border-2 border-border-primary z-dropdown shadow-md">
                  {savedFilters.map((filter) => (
                    <div
                      key={filter.id}
                      className="flex items-center justify-between px-spacing-3 py-spacing-2 hover:bg-surface-secondary"
                    >
                      <button
                        type="button"
                        onClick={() => handleApplySavedFilter(filter)}
                        className="flex-1 text-left font-body text-body-sm bg-transparent border-none cursor-pointer"
                      >
                        {filter.name}
                        {filter.isDefault && (
                          <span className="ml-spacing-2 text-mono-xs text-on-dark-disabled">(default)</span>
                        )}
                      </button>
                      {onDeleteFilter && (
                        <button
                          type="button"
                          onClick={() => onDeleteFilter(filter.id)}
                          className="p-spacing-1 text-on-dark-disabled hover:text-error-500 bg-transparent border-none cursor-pointer"
                          aria-label="Delete filter"
                        >
                          <Trash2 className="size-3" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {onSaveFilter && hasConditions && (
            <button
              type="button"
              onClick={() => setSaveDialogOpen(true)}
              className="flex items-center gap-gap-xs px-spacing-3 py-spacing-2 font-code text-mono-sm tracking-wide uppercase bg-surface-primary text-text-primary border-2 border-border-primary cursor-pointer hover:bg-surface-secondary"
            >
              <Save className="size-3" />
              Save
            </button>
          )}

          {hasConditions && (
            <button
              type="button"
              onClick={handleClearFilter}
              className="flex items-center gap-gap-xs px-spacing-3 py-spacing-2 font-code text-mono-sm tracking-wide uppercase bg-surface-primary text-on-dark-disabled border-2 border-border-primary cursor-pointer hover:bg-surface-secondary"
            >
              <X className="size-3" />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Filter Groups */}
      <FilterGroupComponent
        group={value}
        fields={fields}
        depth={0}
        maxDepth={maxDepth}
        parentId={null}
        onAddCondition={handleAddCondition}
        onRemoveCondition={handleRemoveCondition}
        onUpdateCondition={handleUpdateCondition}
        onToggleLogic={handleToggleLogic}
        onAddGroup={handleAddGroup}
        onRemoveGroup={handleRemoveGroup}
      />

      {/* Save Dialog */}
      <OverlayLayout
        type="modal"
        size="sm"
        open={saveDialogOpen}
        onClose={() => setSaveDialogOpen(false)}
        title="Save Filter"
        closeOnEscape={!saving}
        closeOnBackdrop={!saving}
        preventScroll
        animation="scale"
        inverted={false}
        showClose={!saving}
        ariaLabel="Save Filter"
        footerContent={
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setSaveDialogOpen(false)}
              disabled={saving}
              className="px-4 py-2 font-mono text-sm tracking-wide uppercase bg-surface-primary text-on-light-primary border-2 border-border cursor-pointer hover:bg-muted disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveFilter}
              disabled={!filterName.trim() || saving}
              className="px-4 py-2 font-mono text-sm tracking-wide uppercase bg-surface-inverse text-on-dark-primary border-2 border-border cursor-pointer hover:bg-surface-elevated disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        }
      >
        <input
          type="text"
          value={filterName}
          onChange={(e) => setFilterName(e.target.value)}
          placeholder="Filter name..."
          className="w-full px-3 py-2 bg-surface-primary border-2 border-border text-on-light-primary outline-none focus:border-primary-500"
          autoFocus
        />
      </OverlayLayout>
    </div>
  );
}

interface FilterGroupComponentProps {
  group: FilterGroup;
  fields: FilterField[];
  depth: number;
  maxDepth: number;
  parentId: string | null;
  onAddCondition: (groupId: string) => void;
  onRemoveCondition: (groupId: string, conditionId: string) => void;
  onUpdateCondition: (groupId: string, conditionId: string, updates: Partial<FilterCondition>) => void;
  onToggleLogic: (groupId: string) => void;
  onAddGroup: (parentGroupId: string, currentDepth: number) => void;
  onRemoveGroup: (parentGroupId: string, groupId: string) => void;
}

function FilterGroupComponent({
  group,
  fields,
  depth,
  maxDepth,
  parentId,
  onAddCondition,
  onRemoveCondition,
  onUpdateCondition,
  onToggleLogic,
  onAddGroup,
  onRemoveGroup,
}: FilterGroupComponentProps) {
  return (
    <div
      className={clsx(
        "p-spacing-4 border-2 rounded-card",
        depth === 0 ? "border-border-primary bg-surface-primary" : "border-border bg-surface-secondary"
      )}
    >
      {/* Logic toggle */}
      <div className="flex items-center gap-gap-sm mb-spacing-3">
        <button
          type="button"
          onClick={() => onToggleLogic(group.id)}
          className={clsx(
            "px-spacing-3 py-spacing-1 font-code text-mono-sm tracking-wide uppercase border-2 cursor-pointer transition-colors duration-fast",
            group.logic === "AND"
              ? "bg-primary-500 text-white border-primary-500"
              : "bg-secondary-500 text-white border-secondary-500"
          )}
        >
          {group.logic}
        </button>
        <span className="font-body text-body-xs text-on-dark-disabled">
          {group.logic === "AND" ? "All conditions must match" : "Any condition can match"}
        </span>

        {parentId && (
          <button
            type="button"
            onClick={() => onRemoveGroup(parentId, group.id)}
            className="ml-auto p-spacing-1 text-on-dark-disabled hover:text-error-500 bg-transparent border-none cursor-pointer"
            aria-label="Remove group"
          >
            <Trash2 className="size-4" />
          </button>
        )}
      </div>

      {/* Conditions */}
      <div className="space-y-spacing-2">
        {group.conditions.map((condition) => (
          <FilterConditionRow
            key={condition.id}
            condition={condition}
            fields={fields}
            groupId={group.id}
            onUpdate={onUpdateCondition}
            onRemove={onRemoveCondition}
          />
        ))}
      </div>

      {/* Nested groups */}
      {group.groups && group.groups.length > 0 && (
        <div className="mt-spacing-3 space-y-spacing-3">
          {group.groups.map((nestedGroup) => (
            <FilterGroupComponent
              key={nestedGroup.id}
              group={nestedGroup}
              fields={fields}
              depth={depth + 1}
              maxDepth={maxDepth}
              parentId={group.id}
              onAddCondition={onAddCondition}
              onRemoveCondition={onRemoveCondition}
              onUpdateCondition={onUpdateCondition}
              onToggleLogic={onToggleLogic}
              onAddGroup={onAddGroup}
              onRemoveGroup={onRemoveGroup}
            />
          ))}
        </div>
      )}

      {/* Add buttons */}
      <div className="flex items-center gap-gap-sm mt-spacing-3">
        <button
          type="button"
          onClick={() => onAddCondition(group.id)}
          className="flex items-center gap-gap-xs px-spacing-3 py-spacing-2 font-code text-mono-xs tracking-wide uppercase bg-surface-primary text-text-primary border-2 border-border-primary cursor-pointer hover:bg-surface-secondary"
        >
          <Plus className="size-3" />
          Add Condition
        </button>

        {depth < maxDepth && (
          <button
            type="button"
            onClick={() => onAddGroup(group.id, depth)}
            className="flex items-center gap-gap-xs px-spacing-3 py-spacing-2 font-code text-mono-xs tracking-wide uppercase bg-surface-primary text-on-dark-disabled border-2 border-border-primary cursor-pointer hover:bg-surface-secondary"
          >
            <Plus className="size-3" />
            Add Group
          </button>
        )}
      </div>
    </div>
  );
}

interface FilterConditionRowProps {
  condition: FilterCondition;
  fields: FilterField[];
  groupId: string;
  onUpdate: (groupId: string, conditionId: string, updates: Partial<FilterCondition>) => void;
  onRemove: (groupId: string, conditionId: string) => void;
}

function FilterConditionRow({
  condition,
  fields,
  groupId,
  onUpdate,
  onRemove,
}: FilterConditionRowProps) {
  const selectedField = fields.find((f) => f.key === condition.field);
  const availableOperators = selectedField
    ? operatorsByType[selectedField.type] || operatorsByType.text
    : operatorsByType.text;

  const needsValue = !["is_empty", "is_not_empty"].includes(condition.operator);

  return (
    <div className="flex items-center gap-gap-xs flex-wrap">
      {/* Field select */}
      <select
        value={condition.field}
        onChange={(e) => onUpdate(groupId, condition.id, { field: e.target.value, value: "" })}
        className="px-spacing-2 py-spacing-1 bg-surface-primary border-2 border-border-primary text-text-primary text-body-sm outline-none focus:border-primary-500"
      >
        {fields.map((field) => (
          <option key={field.key} value={field.key}>
            {field.label}
          </option>
        ))}
      </select>

      {/* Operator select */}
      <select
        value={condition.operator}
        onChange={(e) => onUpdate(groupId, condition.id, { operator: e.target.value as FilterOperator })}
        className="px-spacing-2 py-spacing-1 bg-surface-primary border-2 border-border-primary text-text-primary text-body-sm outline-none focus:border-primary-500"
      >
        {availableOperators.map((op) => (
          <option key={op} value={op}>
            {operatorLabels[op]}
          </option>
        ))}
      </select>

      {/* Value input */}
      {needsValue && (
        <>
          {selectedField?.type === "select" && selectedField.options ? (
            <select
              value={String(condition.value ?? "")}
              onChange={(e) => onUpdate(groupId, condition.id, { value: e.target.value })}
              className="px-spacing-2 py-spacing-1 bg-surface-primary border-2 border-border-primary text-text-primary text-body-sm outline-none focus:border-primary-500"
            >
              <option value="">Select...</option>
              {selectedField.options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          ) : selectedField?.type === "boolean" ? (
            <select
              value={String(condition.value ?? "")}
              onChange={(e) => onUpdate(groupId, condition.id, { value: e.target.value === "true" })}
              className="px-spacing-2 py-spacing-1 bg-surface-primary border-2 border-border-primary text-text-primary text-body-sm outline-none focus:border-primary-500"
            >
              <option value="">Select...</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          ) : selectedField?.type === "date" ? (
            <input
              type="date"
              value={String(condition.value ?? "")}
              onChange={(e) => onUpdate(groupId, condition.id, { value: e.target.value })}
              className="px-spacing-2 py-spacing-1 bg-surface-primary border-2 border-border-primary text-text-primary text-body-sm outline-none focus:border-primary-500"
            />
          ) : selectedField?.type === "number" ? (
            <input
              type="number"
              value={condition.value === null || condition.value === undefined ? "" : String(condition.value)}
              onChange={(e) => onUpdate(groupId, condition.id, { value: e.target.valueAsNumber || null })}
              placeholder="Value"
              className="px-spacing-2 py-spacing-1 bg-surface-primary border-2 border-border-primary text-text-primary text-body-sm outline-none focus:border-primary-500 w-24"
            />
          ) : (
            <input
              type="text"
              value={String(condition.value ?? "")}
              onChange={(e) => onUpdate(groupId, condition.id, { value: e.target.value })}
              placeholder="Value"
              className="px-spacing-2 py-spacing-1 bg-surface-primary border-2 border-border-primary text-text-primary text-body-sm outline-none focus:border-primary-500 flex-1 min-w-spacing-24"
            />
          )}
        </>
      )}

      {/* Remove button */}
      <button
        type="button"
        onClick={() => onRemove(groupId, condition.id)}
        className="p-spacing-1 text-on-dark-disabled hover:text-error-500 bg-transparent border-none cursor-pointer"
        aria-label="Remove condition"
      >
        <Trash2 className="size-4" />
      </button>
    </div>
  );
}

export default SavedFilterBuilder;
