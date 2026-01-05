"use client";

import React, { useState, useCallback } from "react";
import clsx from "clsx";
import { Plus, Trash2 } from "lucide-react";
import { Modal } from "../Modal/index.js";
import type { 
  SavedFilterBuilderProps,
  FilterCondition,
  FilterOperator
} from "./SavedFilterBuilder.types.js";

export const SavedFilterBuilder = function({
  fields = [],
  value,
  onChange,
  className,
}: SavedFilterBuilderProps) {
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [filterName, setFilterName] = useState("");
  const [saving, setSaving] = useState(false);

  const handleAddCondition = useCallback(() => {
    const newCondition: FilterCondition = {
      id: `condition-${Date.now()}`,
      field: fields[0]?.key || "",
      operator: "equals",
      value: ""
    };
    onChange({
      ...value,
      conditions: [...value.conditions, newCondition]
    });
  }, [value, fields, onChange]);

  const handleRemoveCondition = useCallback((conditionId: string) => {
    onChange({
      ...value,
      conditions: value.conditions.filter(c => c.id !== conditionId)
    });
  }, [value, onChange]);

  const handleUpdateCondition = useCallback((conditionId: string, updates: Partial<FilterCondition>) => {
    onChange({
      ...value,
      conditions: value.conditions.map(c => 
        c.id === conditionId ? { ...c, ...updates } : c
      )
    });
  }, [value, onChange]);

  const handleToggleLogic = useCallback(() => {
    onChange({
      ...value,
      logic: value.logic === "AND" ? "OR" : "AND"
    });
  }, [value, onChange]);

  const handleSaveFilter = useCallback(async () => {
    if (!filterName.trim()) return;
    
    try {
      setSaving(true);
      setSaveDialogOpen(false);
      setFilterName("");
    } catch (error) {
      console.error("Failed to save filter:", error);
    } finally {
      setSaving(false);
    }
  }, [filterName]);

  return (
    <div className={clsx("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <h3 className="font-mono text-lg text-[var(--color-text-primary)]">Filter Builder</h3>
        <button
          onClick={() => setSaveDialogOpen(true)}
          disabled={value.conditions.length === 0}
          className="px-3 py-2 text-sm font-mono bg-[var(--color-primary-500)] text-white border-2 border-[var(--color-primary-500)] rounded-badge hover:bg-[var(--color-primary-500)]/90 disabled:opacity-50"
        >
          Save Filter
        </button>
      </div>

      <div className="border-2 border-[var(--color-border-default)] rounded-card">
        <div className="flex items-center justify-between p-4 bg-[var(--color-surface-elevated)]">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm text-[var(--color-text-primary)]">
              {value.logic === "AND" ? "AND" : "OR"}
            </span>
            <span className="text-sm text-[var(--color-text-muted)]">
              ({value.conditions.length} condition{value.conditions.length !== 1 ? "s" : ""})
            </span>
          </div>
          
          <button
            onClick={handleToggleLogic}
            className="px-2 py-1 text-xs font-mono border-2 border-[var(--color-border-default)] rounded-badge hover:border-[var(--color-primary-500)]"
          >
            {value.logic === "AND" ? "OR" : "AND"}
          </button>
        </div>

        <div className="p-4 space-y-3">
          {value.conditions.map((condition) => (
            <div key={condition.id} className="flex items-center gap-2">
              <select
                value={condition.field}
                onChange={(e) => handleUpdateCondition(condition.id, { field: e.target.value })}
                className="px-2 py-1 text-sm bg-[var(--color-surface-primary)] border-2 border-[var(--color-border-default)] rounded-badge"
              >
                {fields.map(field => (
                  <option key={field.key} value={field.key}>
                    {field.label}
                  </option>
                ))}
              </select>
              
              <select
                value={condition.operator}
                onChange={(e) => handleUpdateCondition(condition.id, { operator: e.target.value as FilterOperator })}
                className="px-2 py-1 text-sm bg-[var(--color-surface-primary)] border-2 border-[var(--color-border-default)] rounded-badge"
              >
                <option value="equals">equals</option>
                <option value="not_equals">not equals</option>
                <option value="contains">contains</option>
                <option value="not_contains">not contains</option>
                <option value="greater_than">greater than</option>
                <option value="less_than">less than</option>
              </select>
              
              <input
                type="text"
                value={String(condition.value || '')}
                onChange={(e) => handleUpdateCondition(condition.id, { value: e.target.value })}
                placeholder="Value..."
                className="flex-1 px-2 py-1 text-sm bg-[var(--color-surface-primary)] border-2 border-[var(--color-border-default)] rounded-badge"
              />
              
              <button
                onClick={() => handleRemoveCondition(condition.id)}
                className="p-1 rounded-badge hover:bg-[var(--color-error-500)]/10 text-[var(--color-error-500)]"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
          
          <button
            onClick={handleAddCondition}
            className="flex items-center gap-2 px-3 py-2 text-sm font-mono border-2 border-dashed border-[var(--color-border-default)] rounded-badge hover:border-[var(--color-primary-500)]"
          >
            <Plus className="w-3 h-3" />
            Add Condition
          </button>
        </div>
      </div>

      <Modal
        size="sm"
        open={saveDialogOpen}
        onClose={() => setSaveDialogOpen(false)}
        showClose={!saving}
      >
        <div className="p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
              Filter Name
            </label>
            <input
              type="text"
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
              placeholder="Enter filter name..."
              className="w-full px-3 py-2 bg-[var(--color-surface-primary)] border-2 border-[var(--color-border-default)] text-[var(--color-text-primary)]"
              autoFocus
            />
          </div>
        </div>
        
        <div className="p-6 border-t-2 border-[var(--color-border-default)] bg-[var(--color-surface-elevated)]">
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setSaveDialogOpen(false)}
              disabled={saving}
              className="px-4 py-2 font-mono text-sm bg-[var(--color-surface-primary)] text-[var(--color-text-primary)] border-2 border-[var(--color-border-default)]"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveFilter}
              disabled={saving || !filterName.trim()}
              className="px-4 py-2 font-mono text-sm bg-primary text-white border-2 border-primary"
            >
              {saving ? "Saving..." : "Save Filter"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};