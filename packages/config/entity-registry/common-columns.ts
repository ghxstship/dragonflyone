/**
 * Common Column Definitions
 * 
 * Reusable column definitions for common fields across all entities.
 * Import and spread these into entity-specific column arrays.
 */

import type { ColumnDefinition, StatusVariant } from './types';
import { formatDate, formatDateTime, formatCurrency, formatName, formatId } from './formatters';
import { UNIVERSAL_STATUS_COLORS } from './status-mappings';

// ============================================================================
// Identity Columns
// ============================================================================

/**
 * Standard ID column (shortened UUID)
 */
export const idColumn: ColumnDefinition = {
  key: 'id',
  label: 'ID',
  accessor: 'id',
  sortable: false,
  width: '100px',
  hidden: true,
  hideable: true,
  dataType: 'string',
  render: (value) => formatId(value as string),
};

/**
 * Reference number column (order number, invoice number, etc.)
 */
export function referenceNumberColumn(
  key: string,
  label: string,
  options: { width?: string; prefix?: string } = {}
): ColumnDefinition {
  return {
    key,
    label,
    accessor: key,
    sortable: true,
    width: options.width || '120px',
    dataType: 'string',
    render: (value) => {
      const str = String(value || '');
      return options.prefix && !str.startsWith(options.prefix) 
        ? `${options.prefix}${str}` 
        : str;
    },
  };
}

// ============================================================================
// Name Columns
// ============================================================================

/**
 * Simple name column
 */
export const nameColumn: ColumnDefinition = {
  key: 'name',
  label: 'Name',
  accessor: 'name',
  sortable: true,
  dataType: 'string',
};

/**
 * Title column
 */
export const titleColumn: ColumnDefinition = {
  key: 'title',
  label: 'Title',
  accessor: 'title',
  sortable: true,
  dataType: 'string',
};

/**
 * Full name column (first + last)
 */
export function fullNameColumn(
  options: { 
    firstNameKey?: string; 
    lastNameKey?: string;
    label?: string;
  } = {}
): ColumnDefinition {
  const { firstNameKey = 'first_name', lastNameKey = 'last_name', label = 'Name' } = options;
  return {
    key: 'full_name',
    label,
    accessor: (row) => formatName(
      row[firstNameKey] as string,
      row[lastNameKey] as string
    ),
    sortable: true,
    dataType: 'string',
  };
}

/**
 * Contact name column (from nested contact object)
 */
export const contactNameColumn: ColumnDefinition = {
  key: 'contact_name',
  label: 'Contact',
  accessor: (row) => {
    const contact = row.contact as { first_name?: string; last_name?: string } | undefined;
    return contact ? formatName(contact.first_name, contact.last_name) : '—';
  },
  sortable: true,
  dataType: 'string',
};

// ============================================================================
// Status Columns
// ============================================================================

/**
 * Generic status column with color mapping
 */
export function statusColumn(
  options: {
    key?: string;
    label?: string;
    statusColors?: Record<string, StatusVariant>;
  } = {}
): ColumnDefinition {
  const { 
    key = 'status', 
    label = 'Status',
    statusColors = UNIVERSAL_STATUS_COLORS,
  } = options;
  
  return {
    key,
    label,
    accessor: key,
    sortable: true,
    dataType: 'status',
    statusColors,
  };
}

/**
 * Payment status column
 */
export const paymentStatusColumn: ColumnDefinition = {
  key: 'payment_status',
  label: 'Payment',
  accessor: 'payment_status',
  sortable: true,
  dataType: 'status',
  statusColors: {
    paid: 'success',
    pending: 'warning',
    failed: 'error',
    refunded: 'outline',
    partial: 'info',
  },
};

// ============================================================================
// Date/Time Columns
// ============================================================================

/**
 * Created at column
 */
export const createdAtColumn: ColumnDefinition = {
  key: 'created_at',
  label: 'Created',
  accessor: 'created_at',
  sortable: true,
  dataType: 'date',
  render: (value) => formatDate(value as string),
};

/**
 * Updated at column
 */
export const updatedAtColumn: ColumnDefinition = {
  key: 'updated_at',
  label: 'Updated',
  accessor: 'updated_at',
  sortable: true,
  hidden: true,
  hideable: true,
  dataType: 'date',
  render: (value) => formatDate(value as string),
};

/**
 * Generic date column
 */
export function dateColumn(
  key: string,
  label: string,
  options: { sortable?: boolean; hidden?: boolean } = {}
): ColumnDefinition {
  return {
    key,
    label,
    accessor: key,
    sortable: options.sortable ?? true,
    hidden: options.hidden,
    hideable: true,
    dataType: 'date',
    render: (value) => formatDate(value as string),
  };
}

/**
 * DateTime column
 */
export function dateTimeColumn(
  key: string,
  label: string,
  options: { sortable?: boolean; hidden?: boolean } = {}
): ColumnDefinition {
  return {
    key,
    label,
    accessor: key,
    sortable: options.sortable ?? true,
    hidden: options.hidden,
    hideable: true,
    dataType: 'datetime',
    render: (value) => formatDateTime(value as string),
  };
}

/**
 * Due date column with overdue highlighting
 */
export const dueDateColumn: ColumnDefinition = {
  key: 'due_date',
  label: 'Due Date',
  accessor: 'due_date',
  sortable: true,
  dataType: 'date',
  render: (value) => {
    if (!value) return '—';
    const date = new Date(value as string);
    const isOverdue = date < new Date();
    const formatted = formatDate(value as string);
    return isOverdue ? `⚠ ${formatted}` : formatted;
  },
};

/**
 * Expiration date column
 */
export const expiresAtColumn: ColumnDefinition = {
  key: 'expires_at',
  label: 'Expires',
  accessor: 'expires_at',
  sortable: true,
  dataType: 'date',
  render: (value) => value ? formatDate(value as string) : 'Never',
};

// ============================================================================
// Currency/Amount Columns
// ============================================================================

/**
 * Generic amount column
 */
export function amountColumn(
  key: string,
  label: string,
  options: { currency?: string; sortable?: boolean } = {}
): ColumnDefinition {
  return {
    key,
    label,
    accessor: key,
    sortable: options.sortable ?? true,
    align: 'right',
    dataType: 'currency',
    formatOptions: { currency: options.currency || 'USD' },
    render: (value) => formatCurrency(value as number, { currency: options.currency }),
  };
}

/**
 * Total amount column
 */
export const totalAmountColumn: ColumnDefinition = {
  key: 'total_amount',
  label: 'Total',
  accessor: 'total_amount',
  sortable: true,
  align: 'right',
  dataType: 'currency',
  render: (value) => formatCurrency(value as number),
};

/**
 * Price column
 */
export const priceColumn: ColumnDefinition = {
  key: 'price',
  label: 'Price',
  accessor: 'price',
  sortable: true,
  align: 'right',
  dataType: 'currency',
  render: (value) => formatCurrency(value as number),
};

// ============================================================================
// Relationship Columns
// ============================================================================

/**
 * Vendor column (from nested vendor object)
 */
export const vendorColumn: ColumnDefinition = {
  key: 'vendor',
  label: 'Vendor',
  accessor: (row) => {
    const vendor = row.vendor as { name?: string } | undefined;
    return vendor?.name || '—';
  },
  sortable: true,
  dataType: 'string',
};

/**
 * Project column (from nested project object)
 */
export const projectColumn: ColumnDefinition = {
  key: 'project',
  label: 'Project',
  accessor: (row) => {
    const project = row.project as { name?: string } | undefined;
    return project?.name || '—';
  },
  sortable: true,
  dataType: 'string',
};

/**
 * Event column (from nested event object)
 */
export const eventColumn: ColumnDefinition = {
  key: 'event',
  label: 'Event',
  accessor: (row) => {
    const event = row.event as { name?: string; title?: string } | undefined;
    return event?.name || event?.title || '—';
  },
  sortable: true,
  dataType: 'string',
};

/**
 * Organization column (from nested organization object)
 */
export const organizationColumn: ColumnDefinition = {
  key: 'organization',
  label: 'Organization',
  accessor: (row) => {
    const org = row.organization as { name?: string } | undefined;
    return org?.name || '—';
  },
  sortable: true,
  dataType: 'string',
};

/**
 * Owner/Assignee column (from nested user object)
 */
export function ownerColumn(
  key: string,
  label: string
): ColumnDefinition {
  return {
    key,
    label,
    accessor: (row) => {
      const owner = row[key] as { first_name?: string; last_name?: string; full_name?: string } | undefined;
      if (!owner) return '—';
      return owner.full_name || formatName(owner.first_name, owner.last_name);
    },
    sortable: true,
    dataType: 'string',
  };
}

// ============================================================================
// Type/Category Columns
// ============================================================================

/**
 * Type column with badge (from nested type object)
 */
export function typeColumn(
  key: string,
  label: string,
  options: { codeKey?: string; colorKey?: string } = {}
): ColumnDefinition {
  const { codeKey = 'code' } = options;
  return {
    key,
    label,
    accessor: (row) => {
      const type = row[key] as { name?: string; code?: string; [k: string]: unknown } | undefined;
      if (!type) return '—';
      return (type[codeKey] as string) || type.name || '—';
    },
    sortable: true,
    dataType: 'badge',
  };
}

/**
 * Category column
 */
export const categoryColumn: ColumnDefinition = {
  key: 'category',
  label: 'Category',
  accessor: (row) => {
    const category = row.category as { name?: string } | undefined;
    return category?.name || (row.category as string) || '—';
  },
  sortable: true,
  dataType: 'string',
};

// ============================================================================
// Description/Notes Columns
// ============================================================================

/**
 * Description column (truncated)
 */
export const descriptionColumn: ColumnDefinition = {
  key: 'description',
  label: 'Description',
  accessor: 'description',
  sortable: false,
  dataType: 'string',
  render: (value) => {
    const str = String(value || '');
    return str.length > 50 ? `${str.slice(0, 50)}...` : str || '—';
  },
};

/**
 * Notes column (truncated, hidden by default)
 */
export const notesColumn: ColumnDefinition = {
  key: 'notes',
  label: 'Notes',
  accessor: 'notes',
  sortable: false,
  hidden: true,
  hideable: true,
  dataType: 'string',
  render: (value) => {
    const str = String(value || '');
    return str.length > 50 ? `${str.slice(0, 50)}...` : str || '—';
  },
};

// ============================================================================
// Boolean Columns
// ============================================================================

/**
 * Boolean column with Yes/No display
 */
export function booleanColumn(
  key: string,
  label: string,
  options: { trueLabel?: string; falseLabel?: string } = {}
): ColumnDefinition {
  const { trueLabel = 'Yes', falseLabel = 'No' } = options;
  return {
    key,
    label,
    accessor: key,
    sortable: true,
    dataType: 'boolean',
    render: (value) => value ? trueLabel : falseLabel,
  };
}

/**
 * Required indicator column
 */
export function requiredColumn(
  key: string,
  label: string
): ColumnDefinition {
  return {
    key,
    label,
    accessor: key,
    sortable: true,
    dataType: 'boolean',
    render: (value) => value ? 'Required' : '—',
  };
}

// ============================================================================
// Level/Priority Columns
// ============================================================================

/**
 * Priority column
 */
export const priorityColumn: ColumnDefinition = {
  key: 'priority',
  label: 'Priority',
  accessor: 'priority',
  sortable: true,
  dataType: 'status',
  statusColors: {
    critical: 'error',
    high: 'error',
    urgent: 'error',
    medium: 'warning',
    normal: 'info',
    low: 'ghost',
  },
};

/**
 * Access level column
 */
export function accessLevelColumn(
  key: string = 'access_level',
  label: string = 'Level'
): ColumnDefinition {
  return {
    key,
    label,
    accessor: (row) => {
      const level = row[key] as number | undefined;
      return level !== undefined ? `L${level}` : '—';
    },
    sortable: true,
    width: '80px',
    dataType: 'string',
  };
}

// ============================================================================
// Version Column
// ============================================================================

/**
 * Version column
 */
export const versionColumn: ColumnDefinition = {
  key: 'version',
  label: 'Version',
  accessor: 'version',
  sortable: true,
  width: '100px',
  dataType: 'string',
};

// ============================================================================
// Export All Common Columns
// ============================================================================

export const commonColumns = {
  id: idColumn,
  referenceNumber: referenceNumberColumn,
  name: nameColumn,
  title: titleColumn,
  fullName: fullNameColumn,
  contactName: contactNameColumn,
  status: statusColumn,
  paymentStatus: paymentStatusColumn,
  createdAt: createdAtColumn,
  updatedAt: updatedAtColumn,
  date: dateColumn,
  dateTime: dateTimeColumn,
  dueDate: dueDateColumn,
  expiresAt: expiresAtColumn,
  amount: amountColumn,
  totalAmount: totalAmountColumn,
  price: priceColumn,
  vendor: vendorColumn,
  project: projectColumn,
  event: eventColumn,
  organization: organizationColumn,
  owner: ownerColumn,
  type: typeColumn,
  category: categoryColumn,
  description: descriptionColumn,
  notes: notesColumn,
  boolean: booleanColumn,
  required: requiredColumn,
  priority: priorityColumn,
  accessLevel: accessLevelColumn,
  version: versionColumn,
};
