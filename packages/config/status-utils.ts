/**
 * Centralized status variant mapping utilities
 * Used across ATLVS, COMPVSS, and GVTEWAY for consistent status styling
 */

export type StatusVariant = 
  | "success" 
  | "error" 
  | "warning" 
  | "info" 
  | "neutral" 
  | "active" 
  | "inactive" 
  | "pending";

export type BadgeVariant = "solid" | "outline" | "ghost";

/**
 * Maps status strings to StatusBadge variants
 * Common statuses: scheduled, tracking, closeout, intake, active, completed, etc.
 */
export function getStatusVariant(status: string): StatusVariant {
  const normalizedStatus = status.toLowerCase().replace(/[_-]/g, "");
  
  // Success states
  if (["completed", "done", "approved", "synced", "cleared", "active", "ontrack", "available"].includes(normalizedStatus)) {
    return "success";
  }
  
  // Error states
  if (["error", "failed", "rejected", "blocked", "over", "overdue", "critical", "high"].includes(normalizedStatus)) {
    return "error";
  }
  
  // Warning states
  if (["warning", "atrisk", "delayed", "investigating", "medium", "review", "inreview"].includes(normalizedStatus)) {
    return "warning";
  }
  
  // Info states
  if (["info", "tracking", "inprogress", "processing", "running"].includes(normalizedStatus)) {
    return "info";
  }
  
  // Active states
  if (["scheduled", "confirmed", "booked", "assigned"].includes(normalizedStatus)) {
    return "active";
  }
  
  // Inactive states
  if (["inactive", "disabled", "archived", "cancelled", "closeout"].includes(normalizedStatus)) {
    return "inactive";
  }
  
  // Neutral states
  if (["neutral", "draft", "unknown", "na"].includes(normalizedStatus)) {
    return "neutral";
  }
  
  // Default to pending
  return "pending";
}

/**
 * Maps status strings to Badge variants (solid/outline/ghost)
 * Used for budget status, priority levels, etc.
 */
export function getBadgeVariant(status: string): BadgeVariant {
  const normalizedStatus = status.toLowerCase().replace(/[_-]/g, "");
  
  if (["ontrack", "active", "completed", "approved", "success"].includes(normalizedStatus)) {
    return "solid";
  }
  
  if (["under", "pending", "draft", "scheduled"].includes(normalizedStatus)) {
    return "outline";
  }
  
  return "ghost";
}

/**
 * Maps severity levels to StatusBadge variants
 */
export function getSeverityVariant(severity: string): StatusVariant {
  const normalizedSeverity = severity.toLowerCase();
  
  switch (normalizedSeverity) {
    case "critical":
    case "high":
      return "error";
    case "medium":
      return "warning";
    case "low":
      return "info";
    default:
      return "neutral";
  }
}

/**
 * Maps sync/connection status to variants
 */
export function getSyncStatusVariant(status: string): StatusVariant {
  const normalizedStatus = status.toLowerCase().replace(/[_-]/g, "");
  
  switch (normalizedStatus) {
    case "synced":
    case "connected":
      return "success";
    case "inprogress":
    case "syncing":
      return "info";
    case "pending":
      return "pending";
    case "blocked":
    case "failed":
      return "error";
    default:
      return "neutral";
  }
}
