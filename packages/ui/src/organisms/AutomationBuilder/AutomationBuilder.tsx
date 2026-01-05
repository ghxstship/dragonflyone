"use client";

import React, { useState, useCallback } from "react";
import clsx from "clsx";
import { 
  Plus, 
  Trash2, 
  Play, 
  Pause, 
  Settings,
  ChevronDown,
  ChevronRight,
  Zap,
  Clock,
  Bell,
  Mail,
  FileEdit,
  FilePlus,
  Webhook,
  UserPlus,
  ArrowRight,
  GripVertical,
} from "lucide-react";
import { automationBuilderVariants } from "./AutomationBuilder.variants.js";
import type { 
  AutomationBuilderProps,
  AutomationWorkflow,
  TriggerConfig,
  ConditionConfig,
  ActionConfig,
  TriggerType,
  ActionType,
  ConditionOperator
} from "./AutomationBuilder.types.js";

// =============================================================================
// TRIGGER ICONS
// =============================================================================

const triggerLabels: Record<TriggerType, string> = {
  status_change: "Status Changes",
  date_reached: "Date Reached",
  field_update: "Field Updated",
  threshold_exceeded: "Threshold Exceeded",
  schedule: "On Schedule",
  record_created: "Record Created",
  record_deleted: "Record Deleted",
};

// =============================================================================
// ACTION ICONS
// =============================================================================

const actionIcons: Record<ActionType, React.ReactNode> = {
  send_notification: <Bell className="size-4" />,
  send_email: <Mail className="size-4" />,
  update_field: <FileEdit className="size-4" />,
  create_record: <FilePlus className="size-4" />,
  call_webhook: <Webhook className="size-4" />,
  assign_task: <UserPlus className="size-4" />,
  delay: <Clock className="size-4" />,
};

const actionLabels: Record<ActionType, string> = {
  send_notification: "Send Notification",
  send_email: "Send Email",
  update_field: "Update Field",
  create_record: "Create Record",
  call_webhook: "Call Webhook",
  assign_task: "Assign Task",
  delay: "Add Delay",
};

// =============================================================================
// TRIGGER NODE
// =============================================================================

interface TriggerNodeProps {
  trigger: TriggerConfig;
  onUpdate: (trigger: TriggerConfig) => void;
  expanded: boolean;
  onToggle: () => void;
}

function TriggerNode({ trigger, onUpdate, expanded, onToggle }: TriggerNodeProps) {
  return (
    <div className="bg-surface-primary border-2 border-primary-500 rounded-card overflow-hidden shadow-sm">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-gap-md px-spacing-4 py-spacing-3 bg-primary-500 text-white border-none cursor-pointer"
      >
        <Zap className="size-5" />
        <div className="flex-1 text-left">
          <p className="font-code text-mono-sm uppercase tracking-wider">When</p>
          <p className="text-body-md font-medium">{triggerLabels[trigger.type]}</p>
        </div>
        {expanded ? <ChevronDown className="size-5" /> : <ChevronRight className="size-5" />}
      </button>
      
      {expanded && (
        <div className="p-spacing-4 border-t border-border-secondary">
          <label className="block mb-spacing-3">
            <span className="font-code text-mono-xs text-text-disabled uppercase tracking-wider">Trigger Type</span>
            <select
              value={trigger.type}
              onChange={(e) => onUpdate({ ...trigger, type: e.target.value as TriggerType })}
              className="mt-spacing-1 w-full px-spacing-3 py-spacing-2 bg-surface-secondary border-2 border-border-primary rounded-button text-body-sm"
            >
              {Object.entries(triggerLabels).map(([type, label]) => (
                <option key={type} value={type}>{label}</option>
              ))}
            </select>
          </label>
          
          {/* Trigger-specific configuration */}
          {trigger.type === "schedule" && (
            <label className="block">
              <span className="font-code text-mono-xs text-text-disabled uppercase tracking-wider">Schedule (Cron)</span>
              <input
                type="text"
                value={String(trigger.config.cron || "")}
                onChange={(e) => onUpdate({ ...trigger, config: { ...trigger.config, cron: e.target.value } })}
                placeholder="0 9 * * 1-5"
                className="mt-spacing-1 w-full px-spacing-3 py-spacing-2 bg-surface-secondary border-2 border-border-primary rounded-button text-body-sm"
              />
            </label>
          )}
          
          {trigger.type === "status_change" && (
            <>
              <label className="block mb-spacing-3">
                <span className="font-code text-mono-xs text-text-disabled uppercase tracking-wider">From Status</span>
                <input
                  type="text"
                  value={String(trigger.config.fromStatus || "")}
                  onChange={(e) => onUpdate({ ...trigger, config: { ...trigger.config, fromStatus: e.target.value } })}
                  placeholder="Any"
                  className="mt-spacing-1 w-full px-spacing-3 py-spacing-2 bg-surface-secondary border-2 border-border-primary rounded-button text-body-sm"
                />
              </label>
              <label className="block">
                <span className="font-code text-mono-xs text-text-disabled uppercase tracking-wider">To Status</span>
                <input
                  type="text"
                  value={String(trigger.config.toStatus || "")}
                  onChange={(e) => onUpdate({ ...trigger, config: { ...trigger.config, toStatus: e.target.value } })}
                  placeholder="completed"
                  className="mt-spacing-1 w-full px-spacing-3 py-spacing-2 bg-surface-secondary border-2 border-border-primary rounded-button text-body-sm"
                />
              </label>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// =============================================================================
// CONDITION NODE
// =============================================================================

interface ConditionNodeProps {
  condition: ConditionConfig;
  onUpdate: (condition: ConditionConfig) => void;
  onRemove: () => void;
  isFirst: boolean;
}

function ConditionNode({ condition, onUpdate, onRemove, isFirst }: ConditionNodeProps) {
  const operators: Array<{ value: ConditionOperator; label: string }> = [
    { value: "eq", label: "equals" },
    { value: "neq", label: "not equals" },
    { value: "gt", label: "greater than" },
    { value: "gte", label: "greater or equal" },
    { value: "lt", label: "less than" },
    { value: "lte", label: "less or equal" },
    { value: "contains", label: "contains" },
    { value: "not_contains", label: "not contains" },
    { value: "is_empty", label: "is empty" },
    { value: "is_not_empty", label: "is not empty" },
  ];

  return (
    <div className="flex items-center gap-gap-sm">
      {!isFirst && (
        <select
          value={condition.logic || "and"}
          onChange={(e) => onUpdate({ ...condition, logic: e.target.value as "and" | "or" })}
          className="px-spacing-2 py-spacing-1 bg-surface-secondary border-2 border-border-primary rounded-button text-body-xs font-code uppercase"
        >
          <option value="and">AND</option>
          <option value="or">OR</option>
        </select>
      )}
      
      <div className="flex-1 flex items-center gap-gap-xs bg-surface-secondary border-2 border-border-primary rounded-card p-spacing-2">
        <input
          type="text"
          value={condition.field}
          onChange={(e) => onUpdate({ ...condition, field: e.target.value })}
          placeholder="field"
          className="flex-1 px-spacing-2 py-spacing-1 bg-surface-primary border border-border-secondary rounded-button text-body-sm"
        />
        
        <select
          value={condition.operator}
          onChange={(e) => onUpdate({ ...condition, operator: e.target.value as ConditionOperator })}
          className="px-spacing-2 py-spacing-1 bg-surface-primary border border-border-secondary rounded-button text-body-sm"
        >
          {operators.map((op) => (
            <option key={op.value} value={op.value}>{op.label}</option>
          ))}
        </select>
        
        {!["is_empty", "is_not_empty"].includes(condition.operator) && (
          <input
            type="text"
            value={String(condition.value || "")}
            onChange={(e) => onUpdate({ ...condition, value: e.target.value })}
            placeholder="value"
            className="flex-1 px-spacing-2 py-spacing-1 bg-surface-primary border border-border-secondary rounded-button text-body-sm"
          />
        )}
        
        <button
          onClick={onRemove}
          className="p-spacing-1 text-error-500 hover:bg-error-500/10 rounded-button border-none bg-transparent cursor-pointer"
        >
          <Trash2 className="size-4" />
        </button>
      </div>
    </div>
  );
}

// =============================================================================
// ACTION NODE
// =============================================================================

interface ActionNodeProps {
  action: ActionConfig;
  onUpdate: (action: ActionConfig) => void;
  onRemove: () => void;
  index: number;
}

function ActionNode({ action, onUpdate, onRemove, index }: ActionNodeProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-surface-primary border-2 border-accent-500 rounded-card overflow-hidden shadow-sm">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-gap-md px-spacing-4 py-spacing-3 bg-accent-500 text-white border-none cursor-pointer"
      >
        <GripVertical className="size-4 opacity-50" />
        <span className="font-code text-mono-sm">{index + 1}</span>
        {actionIcons[action.type]}
        <div className="flex-1 text-left">
          <p className="text-body-md font-medium">{actionLabels[action.type]}</p>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          className="p-spacing-1 text-white/70 hover:text-white bg-transparent border-none cursor-pointer"
        >
          <Trash2 className="size-4" />
        </button>
        {expanded ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
      </button>
      
      {expanded && (
        <div className="p-spacing-4 border-t border-border-secondary">
          <label className="block mb-spacing-3">
            <span className="font-code text-mono-xs text-text-disabled uppercase tracking-wider">Action Type</span>
            <select
              value={action.type}
              onChange={(e) => onUpdate({ ...action, type: e.target.value as ActionType })}
              className="mt-spacing-1 w-full px-spacing-3 py-spacing-2 bg-surface-secondary border-2 border-border-primary rounded-button text-body-sm"
            >
              {Object.entries(actionLabels).map(([type, label]) => (
                <option key={type} value={type}>{label}</option>
              ))}
            </select>
          </label>
          
          {/* Action-specific configuration */}
          {action.type === "send_notification" && (
            <>
              <label className="block mb-spacing-3">
                <span className="font-code text-mono-xs text-text-disabled uppercase tracking-wider">Title</span>
                <input
                  type="text"
                  value={String(action.config.title || "")}
                  onChange={(e) => onUpdate({ ...action, config: { ...action.config, title: e.target.value } })}
                  placeholder="Notification title"
                  className="mt-spacing-1 w-full px-spacing-3 py-spacing-2 bg-surface-secondary border-2 border-border-primary rounded-button text-body-sm"
                />
              </label>
              <label className="block">
                <span className="font-code text-mono-xs text-text-disabled uppercase tracking-wider">Message</span>
                <textarea
                  value={String(action.config.message || "")}
                  onChange={(e) => onUpdate({ ...action, config: { ...action.config, message: e.target.value } })}
                  placeholder="Notification message"
                  rows={3}
                  className="mt-spacing-1 w-full px-spacing-3 py-spacing-2 bg-surface-secondary border-2 border-border-primary rounded-button text-body-sm resize-none"
                />
              </label>
            </>
          )}
          
          {action.type === "send_email" && (
            <>
              <label className="block mb-spacing-3">
                <span className="font-code text-mono-xs text-text-disabled uppercase tracking-wider">To</span>
                <input
                  type="email"
                  value={String(action.config.to || "")}
                  onChange={(e) => onUpdate({ ...action, config: { ...action.config, to: e.target.value } })}
                  placeholder="recipient@example.com"
                  className="mt-spacing-1 w-full px-spacing-3 py-spacing-2 bg-surface-secondary border-2 border-border-primary rounded-button text-body-sm"
                />
              </label>
              <label className="block mb-spacing-3">
                <span className="font-code text-mono-xs text-text-disabled uppercase tracking-wider">Subject</span>
                <input
                  type="text"
                  value={String(action.config.subject || "")}
                  onChange={(e) => onUpdate({ ...action, config: { ...action.config, subject: e.target.value } })}
                  placeholder="Email subject"
                  className="mt-spacing-1 w-full px-spacing-3 py-spacing-2 bg-surface-secondary border-2 border-border-primary rounded-button text-body-sm"
                />
              </label>
              <label className="block">
                <span className="font-code text-mono-xs text-text-disabled uppercase tracking-wider">Body</span>
                <textarea
                  value={String(action.config.body || "")}
                  onChange={(e) => onUpdate({ ...action, config: { ...action.config, body: e.target.value } })}
                  placeholder="Email body"
                  rows={4}
                  className="mt-spacing-1 w-full px-spacing-3 py-spacing-2 bg-surface-secondary border-2 border-border-primary rounded-button text-body-sm resize-none"
                />
              </label>
            </>
          )}
          
          {action.type === "call_webhook" && (
            <>
              <label className="block mb-spacing-3">
                <span className="font-code text-mono-xs text-text-disabled uppercase tracking-wider">URL</span>
                <input
                  type="url"
                  value={String(action.config.url || "")}
                  onChange={(e) => onUpdate({ ...action, config: { ...action.config, url: e.target.value } })}
                  placeholder="https://api.example.com/webhook"
                  className="mt-spacing-1 w-full px-spacing-3 py-spacing-2 bg-surface-secondary border-2 border-border-primary rounded-button text-body-sm"
                />
              </label>
              <label className="block">
                <span className="font-code text-mono-xs text-text-disabled uppercase tracking-wider">Method</span>
                <select
                  value={String(action.config.method || "POST")}
                  onChange={(e) => onUpdate({ ...action, config: { ...action.config, method: e.target.value } })}
                  className="mt-spacing-1 w-full px-spacing-3 py-spacing-2 bg-surface-secondary border-2 border-border-primary rounded-button text-body-sm"
                >
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                  <option value="PUT">PUT</option>
                  <option value="PATCH">PATCH</option>
                </select>
              </label>
            </>
          )}
          
          {action.type === "delay" && (
            <label className="block">
              <span className="font-code text-mono-xs text-text-disabled uppercase tracking-wider">Delay (minutes)</span>
              <input
                type="number"
                value={Number(action.config.minutes || 0)}
                onChange={(e) => onUpdate({ ...action, config: { ...action.config, minutes: parseInt(e.target.value) } })}
                min={1}
                className="mt-spacing-1 w-full px-spacing-3 py-spacing-2 bg-surface-secondary border-2 border-border-primary rounded-button text-body-sm"
              />
            </label>
          )}
        </div>
      )}
    </div>
  );
}

// =============================================================================
// AUTOMATION BUILDER
// =============================================================================

export function AutomationBuilder({
  workflow: initialWorkflow,
  onSave,
  onTest,
  onDelete,
  className,
}: AutomationBuilderProps) {
  const [workflow, setWorkflow] = useState<AutomationWorkflow>(
    initialWorkflow || {
      id: crypto.randomUUID(),
      name: "New Automation",
      enabled: false,
      trigger: { id: crypto.randomUUID(), type: "status_change", config: {} },
      conditions: [],
      actions: [],
    }
  );
  const [triggerExpanded, setTriggerExpanded] = useState(true);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Update workflow name
  const handleNameChange = useCallback((name: string) => {
    setWorkflow((prev) => ({ ...prev, name }));
  }, []);

  // Update trigger
  const handleTriggerUpdate = useCallback((trigger: TriggerConfig) => {
    setWorkflow((prev) => ({ ...prev, trigger }));
  }, []);

  // Add condition
  const handleAddCondition = useCallback(() => {
    setWorkflow((prev) => ({
      ...prev,
      conditions: [
        ...prev.conditions,
        { id: crypto.randomUUID(), field: "", operator: "eq", value: "" },
      ],
    }));
  }, []);

  // Update condition
  const handleConditionUpdate = useCallback((index: number, condition: ConditionConfig) => {
    setWorkflow((prev) => ({
      ...prev,
      conditions: prev.conditions.map((c, i) => (i === index ? condition : c)),
    }));
  }, []);

  // Remove condition
  const handleConditionRemove = useCallback((index: number) => {
    setWorkflow((prev) => ({
      ...prev,
      conditions: prev.conditions.filter((_, i) => i !== index),
    }));
  }, []);

  // Add action
  const handleAddAction = useCallback(() => {
    setWorkflow((prev) => ({
      ...prev,
      actions: [
        ...prev.actions,
        { id: crypto.randomUUID(), type: "send_notification", config: {} },
      ],
    }));
  }, []);

  // Update action
  const handleActionUpdate = useCallback((index: number, action: ActionConfig) => {
    setWorkflow((prev) => ({
      ...prev,
      actions: prev.actions.map((a, i) => (i === index ? action : a)),
    }));
  }, []);

  // Remove action
  const handleActionRemove = useCallback((index: number) => {
    setWorkflow((prev) => ({
      ...prev,
      actions: prev.actions.filter((_, i) => i !== index),
    }));
  }, []);

  // Toggle enabled
  const handleToggleEnabled = useCallback(() => {
    setWorkflow((prev) => ({ ...prev, enabled: !prev.enabled }));
  }, []);

  // Test workflow
  const handleTest = useCallback(async () => {
    if (!onTest) return;
    setTesting(true);
    setTestResult(null);
    try {
      const result = await onTest(workflow);
      setTestResult(result);
    } catch (err) {
      setTestResult({ success: false, message: err instanceof Error ? err.message : "Test failed" });
    } finally {
      setTesting(false);
    }
  }, [workflow, onTest]);

  // Save workflow
  const handleSave = useCallback(() => {
    onSave?.(workflow);
  }, [workflow, onSave]);

  return (
    <div className={clsx(automationBuilderVariants(), className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <input
            type="text"
            value={workflow.name}
            onChange={(e) => handleNameChange(e.target.value)}
            className="text-h2-sm font-display bg-transparent border-none outline-none focus:ring-2 focus:ring-primary-500 rounded-button px-spacing-2 -ml-spacing-2"
          />
          <p className="text-body-sm text-text-disabled mt-spacing-1">
            Configure when this automation runs and what it does
          </p>
        </div>
        
        <div className="flex items-center gap-gap-sm">
          <button
            onClick={handleToggleEnabled}
            className={clsx(
              "flex items-center gap-gap-xs px-spacing-4 py-spacing-2 rounded-button border-2 font-code text-mono-sm cursor-pointer transition-colors",
              workflow.enabled
                ? "bg-success-500 border-success-600 text-white"
                : "bg-surface-secondary border-border-primary text-text-disabled"
            )}
          >
            {workflow.enabled ? <Play className="size-4" /> : <Pause className="size-4" />}
            {workflow.enabled ? "Enabled" : "Disabled"}
          </button>
          
          {onDelete && (
            <button
              onClick={() => onDelete(workflow.id)}
              className="p-spacing-2 text-error-500 hover:bg-error-500/10 rounded-button border-none bg-transparent cursor-pointer"
            >
              <Trash2 className="size-5" />
            </button>
          )}
        </div>
      </div>

      {/* Workflow Canvas */}
      <div className="flex flex-col gap-gap-md">
        {/* Trigger */}
        <TriggerNode
          trigger={workflow.trigger}
          onUpdate={handleTriggerUpdate}
          expanded={triggerExpanded}
          onToggle={() => setTriggerExpanded(!triggerExpanded)}
        />
        
        {/* Arrow */}
        <div className="flex justify-center">
          <ArrowRight className="size-6 text-text-muted rotate-90" />
        </div>
        
        {/* Conditions */}
        <div className="bg-surface-secondary border-2 border-border-primary rounded-card p-spacing-4">
          <div className="flex items-center justify-between mb-spacing-3">
            <span className="font-code text-mono-sm text-text-disabled uppercase tracking-wider">
              Conditions (Optional)
            </span>
            <button
              onClick={handleAddCondition}
              className="flex items-center gap-gap-xs px-spacing-2 py-spacing-1 bg-surface-tertiary hover:bg-muted rounded-button text-body-xs border-none cursor-pointer transition-colors"
            >
              <Plus className="size-3" />
              Add Condition
            </button>
          </div>
          
          {workflow.conditions.length === 0 ? (
            <p className="text-body-sm text-text-muted text-center py-spacing-4">
              No conditions - automation will run for all matching triggers
            </p>
          ) : (
            <div className="flex flex-col gap-gap-sm">
              {workflow.conditions.map((condition, index) => (
                <ConditionNode
                  key={condition.id}
                  condition={condition}
                  onUpdate={(c) => handleConditionUpdate(index, c)}
                  onRemove={() => handleConditionRemove(index)}
                  isFirst={index === 0}
                />
              ))}
            </div>
          )}
        </div>
        
        {/* Arrow */}
        <div className="flex justify-center">
          <ArrowRight className="size-6 text-text-muted rotate-90" />
        </div>
        
        {/* Actions */}
        <div className="bg-surface-secondary border-2 border-border-primary rounded-card p-spacing-4">
          <div className="flex items-center justify-between mb-spacing-3">
            <span className="font-code text-mono-sm text-text-disabled uppercase tracking-wider">
              Actions
            </span>
            <button
              onClick={handleAddAction}
              className="flex items-center gap-gap-xs px-spacing-2 py-spacing-1 bg-accent-500 text-white hover:bg-accent-600 rounded-button text-body-xs border-none cursor-pointer transition-colors"
            >
              <Plus className="size-3" />
              Add Action
            </button>
          </div>
          
          {workflow.actions.length === 0 ? (
            <p className="text-body-sm text-text-muted text-center py-spacing-4">
              Add at least one action for this automation
            </p>
          ) : (
            <div className="flex flex-col gap-gap-sm">
              {workflow.actions.map((action, index) => (
                <ActionNode
                  key={action.id}
                  action={action}
                  onUpdate={(a) => handleActionUpdate(index, a)}
                  onRemove={() => handleActionRemove(index)}
                  index={index}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Test Result */}
      {testResult && (
        <div className={clsx(
          "p-spacing-4 rounded-card border-2",
          testResult.success
            ? "bg-success-500/10 border-success-500 text-success-700"
            : "bg-error-500/10 border-error-500 text-error-700"
        )}>
          <p className="font-code text-mono-sm">{testResult.message}</p>
        </div>
      )}

      {/* Footer Actions */}
      <div className="flex items-center justify-end gap-gap-sm pt-spacing-4 border-t border-border-secondary">
        {onTest && (
          <button
            onClick={handleTest}
            disabled={testing || workflow.actions.length === 0}
            className={clsx(
              "flex items-center gap-gap-xs px-spacing-4 py-spacing-2 rounded-button border-2 font-code text-mono-sm cursor-pointer transition-colors",
              testing || workflow.actions.length === 0
                ? "bg-muted border-border text-text-muted cursor-not-allowed"
                : "bg-surface-secondary border-border-primary text-text-primary hover:bg-surface-tertiary"
            )}
          >
            <Settings className={clsx("size-4", testing && "animate-spin")} />
            {testing ? "Testing..." : "Test Automation"}
          </button>
        )}
        
        {onSave && (
          <button
            onClick={handleSave}
            disabled={workflow.actions.length === 0}
            className={clsx(
              "flex items-center gap-gap-xs px-spacing-6 py-spacing-2 rounded-button border-2 font-code text-mono-sm cursor-pointer transition-colors",
              workflow.actions.length === 0
                ? "bg-muted border-border text-text-muted cursor-not-allowed"
                : "bg-primary-500 border-primary-600 text-white hover:bg-primary-600"
            )}
          >
            Save Automation
          </button>
        )}
      </div>
    </div>
  );
}

export default AutomationBuilder;
