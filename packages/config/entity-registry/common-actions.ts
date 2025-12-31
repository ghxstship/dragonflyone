/**
 * Common Action Definitions
 * 
 * Reusable action definitions for common operations across all entities.
 * Import and spread these into entity-specific action arrays.
 */

import type { RowActionDefinition, BulkActionDefinition, QuickActionDefinition } from './types';

// ============================================================================
// Standard Row Actions
// ============================================================================

/**
 * View action - opens detail drawer
 */
export const viewAction: RowActionDefinition = {
  id: 'view',
  label: 'View Details',
  icon: 'Eye',
  handler: 'drawer',
};

/**
 * View action - navigates to detail page
 */
export function viewPageAction(routeTemplate: string): RowActionDefinition {
  return {
    id: 'view',
    label: 'View',
    icon: 'Eye',
    handler: 'route',
    route: routeTemplate,
  };
}

/**
 * Edit action - navigates to edit page
 */
export function editAction(routeTemplate: string): RowActionDefinition {
  return {
    id: 'edit',
    label: 'Edit',
    icon: 'Pencil',
    handler: 'route',
    route: routeTemplate,
  };
}

/**
 * Delete action with confirmation
 */
export function deleteAction(
  options: {
    titleField?: string;
    message?: string;
  } = {}
): RowActionDefinition {
  const { titleField = 'name', message } = options;
  return {
    id: 'delete',
    label: 'Delete',
    icon: 'Trash2',
    variant: 'danger',
    handler: 'confirm',
    confirm: {
      title: 'Delete Item',
      message: message || ((row) => `Are you sure you want to delete "${row[titleField]}"? This action cannot be undone.`),
      confirmLabel: 'Delete',
      variant: 'danger',
    },
  };
}

/**
 * Archive action with confirmation
 */
export function archiveAction(
  options: {
    titleField?: string;
  } = {}
): RowActionDefinition {
  const { titleField = 'name' } = options;
  return {
    id: 'archive',
    label: 'Archive',
    icon: 'Archive',
    handler: 'confirm',
    confirm: {
      title: 'Archive Item',
      message: (row) => `Are you sure you want to archive "${row[titleField]}"?`,
      confirmLabel: 'Archive',
      variant: 'warning',
    },
  };
}

/**
 * Duplicate/Copy action
 */
export function duplicateAction(routeTemplate?: string): RowActionDefinition {
  return {
    id: 'duplicate',
    label: 'Duplicate',
    icon: 'Copy',
    handler: routeTemplate ? 'route' : 'custom',
    route: routeTemplate,
    customAction: routeTemplate ? undefined : 'duplicate',
  };
}

// ============================================================================
// Status Change Actions
// ============================================================================

/**
 * Approve action
 */
export const approveAction: RowActionDefinition = {
  id: 'approve',
  label: 'Approve',
  icon: 'CheckCircle',
  handler: 'confirm',
  confirm: {
    title: 'Approve',
    message: 'Are you sure you want to approve this item?',
    confirmLabel: 'Approve',
    variant: 'info',
  },
  hidden: (row) => row.status === 'approved',
};

/**
 * Reject action
 */
export const rejectAction: RowActionDefinition = {
  id: 'reject',
  label: 'Reject',
  icon: 'XCircle',
  variant: 'danger',
  handler: 'confirm',
  confirm: {
    title: 'Reject',
    message: 'Are you sure you want to reject this item?',
    confirmLabel: 'Reject',
    variant: 'danger',
  },
  hidden: (row) => row.status === 'rejected',
};

/**
 * Suspend action
 */
export const suspendAction: RowActionDefinition = {
  id: 'suspend',
  label: 'Suspend',
  icon: 'Ban',
  handler: 'custom',
  customAction: 'suspend',
  hidden: (row) => row.status !== 'active',
};

/**
 * Reactivate action
 */
export const reactivateAction: RowActionDefinition = {
  id: 'reactivate',
  label: 'Reactivate',
  icon: 'CheckCircle',
  handler: 'custom',
  customAction: 'reactivate',
  hidden: (row) => row.status !== 'suspended',
};

/**
 * Revoke action
 */
export function revokeAction(
  options: {
    titleField?: string;
  } = {}
): RowActionDefinition {
  const { titleField = 'name' } = options;
  return {
    id: 'revoke',
    label: 'Revoke',
    icon: 'Ban',
    variant: 'danger',
    handler: 'confirm',
    confirm: {
      title: 'Revoke',
      message: (row) => `Are you sure you want to revoke "${row[titleField]}"? This action cannot be undone.`,
      confirmLabel: 'Revoke',
      variant: 'danger',
    },
    hidden: (row) => row.status === 'revoked',
  };
}

/**
 * Cancel action
 */
export function cancelAction(
  options: {
    titleField?: string;
  } = {}
): RowActionDefinition {
  const { titleField = 'name' } = options;
  return {
    id: 'cancel',
    label: 'Cancel',
    icon: 'XCircle',
    variant: 'danger',
    handler: 'confirm',
    confirm: {
      title: 'Cancel',
      message: (row) => `Are you sure you want to cancel "${row[titleField]}"?`,
      confirmLabel: 'Cancel',
      variant: 'danger',
    },
    hidden: (row) => row.status === 'cancelled',
  };
}

/**
 * Complete action
 */
export const completeAction: RowActionDefinition = {
  id: 'complete',
  label: 'Mark Complete',
  icon: 'CheckCircle',
  handler: 'custom',
  customAction: 'complete',
  hidden: (row) => row.status === 'completed',
};

// ============================================================================
// Financial Actions
// ============================================================================

/**
 * Record payment action
 */
export function recordPaymentAction(routeTemplate: string): RowActionDefinition {
  return {
    id: 'payment',
    label: 'Record Payment',
    icon: 'DollarSign',
    handler: 'route',
    route: routeTemplate,
  };
}

/**
 * Send invoice action
 */
export const sendInvoiceAction: RowActionDefinition = {
  id: 'send',
  label: 'Send Invoice',
  icon: 'Send',
  handler: 'custom',
  customAction: 'sendInvoice',
};

/**
 * Refund action
 */
export function refundAction(
  options: {
    titleField?: string;
  } = {}
): RowActionDefinition {
  const { titleField = 'order_number' } = options;
  return {
    id: 'refund',
    label: 'Refund',
    icon: 'RotateCcw',
    handler: 'confirm',
    confirm: {
      title: 'Process Refund',
      message: (row) => `Are you sure you want to refund "${row[titleField]}"?`,
      confirmLabel: 'Refund',
      variant: 'warning',
    },
  };
}

// ============================================================================
// Document Actions
// ============================================================================

/**
 * Download action
 */
export const downloadAction: RowActionDefinition = {
  id: 'download',
  label: 'Download',
  icon: 'Download',
  handler: 'custom',
  customAction: 'download',
};

/**
 * Print action
 */
export const printAction: RowActionDefinition = {
  id: 'print',
  label: 'Print',
  icon: 'Printer',
  handler: 'custom',
  customAction: 'print',
};

/**
 * Share action
 */
export const shareAction: RowActionDefinition = {
  id: 'share',
  label: 'Share',
  icon: 'Share',
  handler: 'modal',
};

// ============================================================================
// Scanning Actions
// ============================================================================

/**
 * View QR code action
 */
export function viewQRAction(routeTemplate: string): RowActionDefinition {
  return {
    id: 'qr',
    label: 'View QR Code',
    icon: 'QrCode',
    handler: 'route',
    route: routeTemplate,
  };
}

/**
 * Scan action
 */
export function scanAction(routeTemplate: string): RowActionDefinition {
  return {
    id: 'scan',
    label: 'Scan',
    icon: 'Scan',
    handler: 'route',
    route: routeTemplate,
  };
}

// ============================================================================
// Transfer/Assignment Actions
// ============================================================================

/**
 * Transfer action
 */
export function transferAction(routeTemplate: string): RowActionDefinition {
  return {
    id: 'transfer',
    label: 'Transfer',
    icon: 'Send',
    handler: 'route',
    route: routeTemplate,
    disabled: (row) => row.status === 'cancelled',
  };
}

/**
 * Assign action
 */
export const assignAction: RowActionDefinition = {
  id: 'assign',
  label: 'Assign',
  icon: 'UserPlus',
  handler: 'modal',
};

/**
 * Unassign action
 */
export const unassignAction: RowActionDefinition = {
  id: 'unassign',
  label: 'Unassign',
  icon: 'UserMinus',
  handler: 'custom',
  customAction: 'unassign',
};

// ============================================================================
// Standard Bulk Actions
// ============================================================================

/**
 * Export bulk action
 */
export const exportBulkAction: BulkActionDefinition = {
  id: 'export',
  label: 'Export',
  icon: 'Download',
  handler: 'export',
};

/**
 * Delete bulk action
 */
export const deleteBulkAction: BulkActionDefinition = {
  id: 'delete',
  label: 'Delete Selected',
  icon: 'Trash2',
  variant: 'danger',
  requiresConfirmation: true,
  handler: 'api',
  apiMethod: 'DELETE',
  confirm: {
    title: 'Delete Selected',
    message: (count) => `Are you sure you want to delete ${count} item${count === 1 ? '' : 's'}? This action cannot be undone.`,
    confirmLabel: 'Delete',
    variant: 'danger',
  },
};

/**
 * Archive bulk action
 */
export const archiveBulkAction: BulkActionDefinition = {
  id: 'archive',
  label: 'Archive Selected',
  icon: 'Archive',
  requiresConfirmation: true,
  handler: 'api',
  apiMethod: 'PATCH',
  confirm: {
    title: 'Archive Selected',
    message: (count) => `Are you sure you want to archive ${count} item${count === 1 ? '' : 's'}?`,
    confirmLabel: 'Archive',
    variant: 'warning',
  },
};

/**
 * Approve bulk action
 */
export const approveBulkAction: BulkActionDefinition = {
  id: 'approve',
  label: 'Approve Selected',
  icon: 'CheckCircle',
  handler: 'api',
  apiMethod: 'PATCH',
};

/**
 * Suspend bulk action
 */
export const suspendBulkAction: BulkActionDefinition = {
  id: 'suspend',
  label: 'Suspend Selected',
  icon: 'Ban',
  handler: 'api',
  apiMethod: 'PATCH',
};

/**
 * Revoke bulk action
 */
export const revokeBulkAction: BulkActionDefinition = {
  id: 'revoke',
  label: 'Revoke Selected',
  icon: 'Ban',
  variant: 'danger',
  requiresConfirmation: true,
  handler: 'api',
  apiMethod: 'PATCH',
  confirm: {
    title: 'Revoke Selected',
    message: (count) => `Are you sure you want to revoke ${count} item${count === 1 ? '' : 's'}? This action cannot be undone.`,
    confirmLabel: 'Revoke',
    variant: 'danger',
  },
};

// ============================================================================
// Standard Quick Actions
// ============================================================================

/**
 * Create quick action
 */
export function createQuickAction(
  label: string,
  route: string,
  icon: QuickActionDefinition['icon'] = 'Plus'
): QuickActionDefinition {
  return {
    id: 'create',
    label,
    icon,
    handler: 'route',
    route,
    primary: true,
  };
}

/**
 * Import quick action
 */
export const importQuickAction: QuickActionDefinition = {
  id: 'import',
  label: 'Import',
  icon: 'Upload',
  handler: 'modal',
};

/**
 * Scan quick action
 */
export function scanQuickAction(route: string): QuickActionDefinition {
  return {
    id: 'scan',
    label: 'Scan',
    icon: 'QrCode',
    handler: 'route',
    route,
  };
}

/**
 * Settings/Manage quick action
 */
export function manageQuickAction(
  label: string,
  route: string,
  icon: QuickActionDefinition['icon'] = 'Settings'
): QuickActionDefinition {
  return {
    id: 'manage',
    label,
    icon,
    handler: 'route',
    route,
  };
}

// ============================================================================
// Action Sets
// ============================================================================

/**
 * Standard CRUD row actions
 */
export function standardRowActions(
  entityRoute: string,
  options: {
    titleField?: string;
    includeView?: boolean;
    includeEdit?: boolean;
    includeDelete?: boolean;
  } = {}
): RowActionDefinition[] {
  const {
    titleField = 'name',
    includeView = true,
    includeEdit = true,
    includeDelete = true,
  } = options;
  
  const actions: RowActionDefinition[] = [];
  
  if (includeView) {
    actions.push(viewAction);
  }
  
  if (includeEdit) {
    actions.push(editAction(`${entityRoute}/[id]/edit`));
  }
  
  if (includeDelete) {
    actions.push(deleteAction({ titleField }));
  }
  
  return actions;
}

/**
 * Standard bulk actions
 */
export function standardBulkActions(
  options: {
    includeExport?: boolean;
    includeDelete?: boolean;
    includeArchive?: boolean;
  } = {}
): BulkActionDefinition[] {
  const {
    includeExport = true,
    includeDelete = true,
    includeArchive = false,
  } = options;
  
  const actions: BulkActionDefinition[] = [];
  
  if (includeExport) {
    actions.push(exportBulkAction);
  }
  
  if (includeArchive) {
    actions.push(archiveBulkAction);
  }
  
  if (includeDelete) {
    actions.push(deleteBulkAction);
  }
  
  return actions;
}

// ============================================================================
// Export All Common Actions
// ============================================================================

export const commonActions = {
  // Row actions
  view: viewAction,
  viewPage: viewPageAction,
  edit: editAction,
  delete: deleteAction,
  archive: archiveAction,
  duplicate: duplicateAction,
  approve: approveAction,
  reject: rejectAction,
  suspend: suspendAction,
  reactivate: reactivateAction,
  revoke: revokeAction,
  cancel: cancelAction,
  complete: completeAction,
  recordPayment: recordPaymentAction,
  sendInvoice: sendInvoiceAction,
  refund: refundAction,
  download: downloadAction,
  print: printAction,
  share: shareAction,
  viewQR: viewQRAction,
  scan: scanAction,
  transfer: transferAction,
  assign: assignAction,
  unassign: unassignAction,
  
  // Bulk actions
  exportBulk: exportBulkAction,
  deleteBulk: deleteBulkAction,
  archiveBulk: archiveBulkAction,
  approveBulk: approveBulkAction,
  suspendBulk: suspendBulkAction,
  revokeBulk: revokeBulkAction,
  
  // Quick actions
  create: createQuickAction,
  import: importQuickAction,
  scanQuick: scanQuickAction,
  manage: manageQuickAction,
  
  // Action sets
  standardRow: standardRowActions,
  standardBulk: standardBulkActions,
};
