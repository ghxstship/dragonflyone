'use client';

import React, { useState, useCallback, type ComponentType } from 'react';

// =============================================================================
// QUICK LINK FORM SHEET
// Opens workflow forms in a modal/drawer instead of navigating to pages
// =============================================================================

// Local type definitions to avoid circular dependency with @ghxstship/ui
export interface FormFieldConfig {
  name: string;
  label: string;
  type: 'text' | 'email' | 'number' | 'date' | 'datetime' | 'select' | 'textarea' | 'checkbox';
  required?: boolean;
  placeholder?: string;
  hint?: string;
  colSpan?: number;
  options?: Array<{ value: string; label: string }>;
  validation?: { min?: number; max?: number };
}

export interface FormStep {
  id: string;
  title: string;
  description?: string;
  fields: FormFieldConfig[];
}

export interface RecordFormModalProps {
  open: boolean;
  onClose: () => void;
  mode: 'create' | 'edit';
  title: string;
  fields?: FormFieldConfig[];
  steps?: FormStep[];
  onSubmit: (data: Record<string, unknown>) => Promise<void>;
  submitLabel?: string;
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

// This will be injected by the consuming app
let RecordFormModalComponent: ComponentType<RecordFormModalProps> | null = null;

export function setRecordFormModal(component: ComponentType<RecordFormModalProps>) {
  RecordFormModalComponent = component;
}

export interface QuickLinkFormConfig {
  id: string;
  name: string;
  description: string;
  href: string;
  icon: string;
  category: string;
  formType: 'single' | 'wizard';
  fields?: FormFieldConfig[];
  steps?: FormStep[];
  onSubmit?: (data: Record<string, unknown>) => Promise<void>;
}

// Form configurations for all quick links
export const QUICK_LINK_FORMS: Record<string, QuickLinkFormConfig> = {
  // Projects
  '/projects/new': {
    id: 'create-project',
    name: 'Create New Project',
    description: 'Start a new project from scratch',
    href: '/projects/new',
    icon: 'FolderPlus',
    category: 'projects',
    formType: 'wizard',
    steps: [
      {
        id: 'basics',
        title: 'Project Basics',
        description: 'Enter basic project information',
        fields: [
          { name: 'name', label: 'Project Name', type: 'text', required: true, colSpan: 2 },
          { name: 'client_id', label: 'Client', type: 'select', options: [], placeholder: 'Select client' },
          { name: 'project_type', label: 'Project Type', type: 'select', required: true, options: [
            { value: 'festival', label: 'Festival' },
            { value: 'concert', label: 'Concert' },
            { value: 'corporate', label: 'Corporate Event' },
            { value: 'theater', label: 'Theater Production' },
            { value: 'broadcast', label: 'Broadcast' },
            { value: 'other', label: 'Other' },
          ]},
          { name: 'description', label: 'Description', type: 'textarea', colSpan: 2 },
        ],
      },
      {
        id: 'dates',
        title: 'Schedule',
        description: 'Set project dates',
        fields: [
          { name: 'start_date', label: 'Start Date', type: 'date', required: true },
          { name: 'end_date', label: 'End Date', type: 'date', required: true },
          { name: 'load_in_date', label: 'Load-In Date', type: 'date' },
          { name: 'load_out_date', label: 'Load-Out Date', type: 'date' },
        ],
      },
      {
        id: 'budget',
        title: 'Budget',
        description: 'Set project budget',
        fields: [
          { name: 'budget', label: 'Total Budget', type: 'number', required: true, hint: 'Enter amount in USD' },
          { name: 'currency', label: 'Currency', type: 'select', options: [
            { value: 'USD', label: 'USD - US Dollar' },
            { value: 'EUR', label: 'EUR - Euro' },
            { value: 'GBP', label: 'GBP - British Pound' },
          ]},
        ],
      },
    ],
  },

  // Finance - Expense Report
  '/expenses/new': {
    id: 'submit-expense',
    name: 'Submit Expense Report',
    description: 'Submit a new expense for reimbursement',
    href: '/expenses/new',
    icon: 'Receipt',
    category: 'finance',
    formType: 'single',
    fields: [
      { name: 'description', label: 'Description', type: 'text', required: true, colSpan: 2 },
      { name: 'amount', label: 'Amount', type: 'number', required: true },
      { name: 'currency', label: 'Currency', type: 'select', options: [
        { value: 'USD', label: 'USD' },
        { value: 'EUR', label: 'EUR' },
        { value: 'GBP', label: 'GBP' },
      ]},
      { name: 'category', label: 'Category', type: 'select', required: true, options: [
        { value: 'travel', label: 'Travel' },
        { value: 'meals', label: 'Meals & Entertainment' },
        { value: 'supplies', label: 'Supplies' },
        { value: 'equipment', label: 'Equipment' },
        { value: 'services', label: 'Professional Services' },
        { value: 'other', label: 'Other' },
      ]},
      { name: 'project_id', label: 'Project', type: 'select', options: [], placeholder: 'Select project (optional)' },
      { name: 'expense_date', label: 'Expense Date', type: 'date', required: true },
      { name: 'notes', label: 'Notes', type: 'textarea', colSpan: 2 },
    ],
  },

  // Finance - Invoice
  '/invoices/new': {
    id: 'create-invoice',
    name: 'Create Invoice',
    description: 'Generate a new invoice',
    href: '/invoices/new',
    icon: 'FileText',
    category: 'finance',
    formType: 'wizard',
    steps: [
      {
        id: 'client',
        title: 'Client Info',
        fields: [
          { name: 'client_id', label: 'Client', type: 'select', required: true, options: [], colSpan: 2 },
          { name: 'project_id', label: 'Project', type: 'select', options: [], colSpan: 2 },
        ],
      },
      {
        id: 'details',
        title: 'Invoice Details',
        fields: [
          { name: 'invoice_number', label: 'Invoice Number', type: 'text', required: true },
          { name: 'issue_date', label: 'Issue Date', type: 'date', required: true },
          { name: 'due_date', label: 'Due Date', type: 'date', required: true },
          { name: 'payment_terms', label: 'Payment Terms', type: 'select', options: [
            { value: 'net_15', label: 'Net 15' },
            { value: 'net_30', label: 'Net 30' },
            { value: 'net_45', label: 'Net 45' },
            { value: 'net_60', label: 'Net 60' },
            { value: 'due_on_receipt', label: 'Due on Receipt' },
          ]},
          { name: 'amount', label: 'Amount', type: 'number', required: true },
          { name: 'currency', label: 'Currency', type: 'select', options: [
            { value: 'USD', label: 'USD' },
            { value: 'EUR', label: 'EUR' },
            { value: 'GBP', label: 'GBP' },
          ]},
          { name: 'description', label: 'Description', type: 'textarea', colSpan: 2 },
        ],
      },
    ],
  },

  // Finance - Budget Request
  '/budgets/request': {
    id: 'budget-request',
    name: 'Budget Request',
    description: 'Request budget allocation',
    href: '/budgets/request',
    icon: 'DollarSign',
    category: 'finance',
    formType: 'single',
    fields: [
      { name: 'title', label: 'Request Title', type: 'text', required: true, colSpan: 2 },
      { name: 'project_id', label: 'Project', type: 'select', required: true, options: [] },
      { name: 'department', label: 'Department', type: 'select', required: true, options: [
        { value: 'production', label: 'Production' },
        { value: 'marketing', label: 'Marketing' },
        { value: 'operations', label: 'Operations' },
        { value: 'talent', label: 'Talent' },
        { value: 'technical', label: 'Technical' },
      ]},
      { name: 'amount_requested', label: 'Amount Requested', type: 'number', required: true },
      { name: 'currency', label: 'Currency', type: 'select', options: [
        { value: 'USD', label: 'USD' },
        { value: 'EUR', label: 'EUR' },
      ]},
      { name: 'justification', label: 'Justification', type: 'textarea', required: true, colSpan: 2 },
      { name: 'urgency', label: 'Urgency', type: 'select', options: [
        { value: 'low', label: 'Low - Can wait' },
        { value: 'medium', label: 'Medium - Within 2 weeks' },
        { value: 'high', label: 'High - Within 1 week' },
        { value: 'critical', label: 'Critical - Immediate' },
      ]},
    ],
  },

  // Finance - Payment Request
  '/finance/payments/new': {
    id: 'payment-request',
    name: 'Payment Request',
    description: 'Submit a payment request',
    href: '/finance/payments/new',
    icon: 'CreditCard',
    category: 'finance',
    formType: 'single',
    fields: [
      { name: 'payee_name', label: 'Payee Name', type: 'text', required: true },
      { name: 'payee_type', label: 'Payee Type', type: 'select', required: true, options: [
        { value: 'vendor', label: 'Vendor' },
        { value: 'contractor', label: 'Contractor' },
        { value: 'employee', label: 'Employee' },
        { value: 'other', label: 'Other' },
      ]},
      { name: 'amount', label: 'Amount', type: 'number', required: true },
      { name: 'currency', label: 'Currency', type: 'select', options: [
        { value: 'USD', label: 'USD' },
        { value: 'EUR', label: 'EUR' },
      ]},
      { name: 'payment_method', label: 'Payment Method', type: 'select', options: [
        { value: 'ach', label: 'ACH Transfer' },
        { value: 'wire', label: 'Wire Transfer' },
        { value: 'check', label: 'Check' },
        { value: 'credit_card', label: 'Credit Card' },
      ]},
      { name: 'due_date', label: 'Due Date', type: 'date', required: true },
      { name: 'invoice_number', label: 'Invoice/Reference Number', type: 'text' },
      { name: 'project_id', label: 'Project', type: 'select', options: [] },
      { name: 'notes', label: 'Notes', type: 'textarea', colSpan: 2 },
    ],
  },

  // Finance - Purchase Order
  '/procurement/orders/new': {
    id: 'purchase-order',
    name: 'Purchase Order',
    description: 'Create a new purchase order',
    href: '/procurement/orders/new',
    icon: 'ShoppingCart',
    category: 'finance',
    formType: 'wizard',
    steps: [
      {
        id: 'vendor',
        title: 'Vendor',
        fields: [
          { name: 'vendor_id', label: 'Vendor', type: 'select', required: true, options: [], colSpan: 2 },
          { name: 'project_id', label: 'Project', type: 'select', options: [], colSpan: 2 },
        ],
      },
      {
        id: 'items',
        title: 'Order Details',
        fields: [
          { name: 'description', label: 'Description', type: 'textarea', required: true, colSpan: 2 },
          { name: 'quantity', label: 'Quantity', type: 'number', required: true },
          { name: 'unit_price', label: 'Unit Price', type: 'number', required: true },
          { name: 'delivery_date', label: 'Required Delivery Date', type: 'date' },
          { name: 'shipping_address', label: 'Shipping Address', type: 'textarea', colSpan: 2 },
        ],
      },
    ],
  },

  // Assets - Reserve
  '/assets/reserve': {
    id: 'reserve-asset',
    name: 'Reserve Asset',
    description: 'Reserve equipment or resources',
    href: '/assets/reserve',
    icon: 'Package',
    category: 'assets',
    formType: 'single',
    fields: [
      { name: 'asset_id', label: 'Asset', type: 'select', required: true, options: [], colSpan: 2 },
      { name: 'project_id', label: 'Project', type: 'select', required: true, options: [] },
      { name: 'production_id', label: 'Production', type: 'select', options: [] },
      { name: 'start_date', label: 'Start Date', type: 'date', required: true },
      { name: 'end_date', label: 'End Date', type: 'date', required: true },
      { name: 'quantity', label: 'Quantity', type: 'number' },
      { name: 'notes', label: 'Notes', type: 'textarea', colSpan: 2 },
    ],
  },

  // Assets - Report Issue
  '/assets/issues/new': {
    id: 'report-asset-issue',
    name: 'Report Asset Issue',
    description: 'Report damage or maintenance need',
    href: '/assets/issues/new',
    icon: 'AlertTriangle',
    category: 'assets',
    formType: 'single',
    fields: [
      { name: 'asset_id', label: 'Asset', type: 'select', required: true, options: [], colSpan: 2 },
      { name: 'issue_type', label: 'Issue Type', type: 'select', required: true, options: [
        { value: 'damage', label: 'Damage' },
        { value: 'malfunction', label: 'Malfunction' },
        { value: 'maintenance', label: 'Scheduled Maintenance' },
        { value: 'missing', label: 'Missing Parts' },
        { value: 'other', label: 'Other' },
      ]},
      { name: 'severity', label: 'Severity', type: 'select', required: true, options: [
        { value: 'low', label: 'Low - Cosmetic only' },
        { value: 'medium', label: 'Medium - Functional but impaired' },
        { value: 'high', label: 'High - Significantly impaired' },
        { value: 'critical', label: 'Critical - Non-functional' },
      ]},
      { name: 'description', label: 'Description', type: 'textarea', required: true, colSpan: 2 },
      { name: 'location', label: 'Current Location', type: 'text' },
      { name: 'discovered_date', label: 'Date Discovered', type: 'date', required: true },
    ],
  },

  // Assets - Checkout
  '/assets/checkout': {
    id: 'checkout-asset',
    name: 'Asset Checkout',
    description: 'Check out an asset',
    href: '/assets/checkout',
    icon: 'LogOut',
    category: 'assets',
    formType: 'single',
    fields: [
      { name: 'asset_id', label: 'Asset', type: 'select', required: true, options: [], colSpan: 2 },
      { name: 'project_id', label: 'Project', type: 'select', options: [] },
      { name: 'checked_out_to', label: 'Checked Out To', type: 'text', required: true },
      { name: 'checkout_date', label: 'Checkout Date', type: 'date', required: true },
      { name: 'expected_return', label: 'Expected Return Date', type: 'date', required: true },
      { name: 'destination', label: 'Destination', type: 'text' },
      { name: 'notes', label: 'Notes', type: 'textarea', colSpan: 2 },
    ],
  },

  // CRM - Add Contact
  '/contacts/new': {
    id: 'add-contact',
    name: 'Add New Contact',
    description: 'Create a new contact record',
    href: '/contacts/new',
    icon: 'UserPlus',
    category: 'crm',
    formType: 'single',
    fields: [
      { name: 'first_name', label: 'First Name', type: 'text', required: true },
      { name: 'last_name', label: 'Last Name', type: 'text', required: true },
      { name: 'email', label: 'Email', type: 'email', required: true },
      { name: 'phone', label: 'Phone', type: 'text' },
      { name: 'company', label: 'Company', type: 'text' },
      { name: 'title', label: 'Job Title', type: 'text' },
      { name: 'contact_type', label: 'Contact Type', type: 'select', options: [
        { value: 'client', label: 'Client' },
        { value: 'vendor', label: 'Vendor' },
        { value: 'partner', label: 'Partner' },
        { value: 'prospect', label: 'Prospect' },
        { value: 'other', label: 'Other' },
      ]},
      { name: 'source', label: 'Source', type: 'select', options: [
        { value: 'referral', label: 'Referral' },
        { value: 'website', label: 'Website' },
        { value: 'event', label: 'Event' },
        { value: 'cold_outreach', label: 'Cold Outreach' },
        { value: 'other', label: 'Other' },
      ]},
      { name: 'notes', label: 'Notes', type: 'textarea', colSpan: 2 },
    ],
  },

  // CRM - Create Deal
  '/deals/new': {
    id: 'create-deal',
    name: 'Create Deal',
    description: 'Start a new deal in pipeline',
    href: '/deals/new',
    icon: 'Handshake',
    category: 'crm',
    formType: 'wizard',
    steps: [
      {
        id: 'basics',
        title: 'Deal Basics',
        fields: [
          { name: 'name', label: 'Deal Name', type: 'text', required: true, colSpan: 2 },
          { name: 'contact_id', label: 'Primary Contact', type: 'select', required: true, options: [] },
          { name: 'company_id', label: 'Company', type: 'select', options: [] },
        ],
      },
      {
        id: 'value',
        title: 'Deal Value',
        fields: [
          { name: 'value', label: 'Deal Value', type: 'number', required: true },
          { name: 'currency', label: 'Currency', type: 'select', options: [
            { value: 'USD', label: 'USD' },
            { value: 'EUR', label: 'EUR' },
          ]},
          { name: 'probability', label: 'Win Probability (%)', type: 'number', validation: { min: 0, max: 100 } },
          { name: 'expected_close', label: 'Expected Close Date', type: 'date' },
          { name: 'stage', label: 'Pipeline Stage', type: 'select', required: true, options: [
            { value: 'lead', label: 'Lead' },
            { value: 'qualified', label: 'Qualified' },
            { value: 'proposal', label: 'Proposal' },
            { value: 'negotiation', label: 'Negotiation' },
            { value: 'closed_won', label: 'Closed Won' },
            { value: 'closed_lost', label: 'Closed Lost' },
          ]},
        ],
      },
    ],
  },

  // CRM - Log Activity
  '/crm/activities/new': {
    id: 'log-activity',
    name: 'Log Activity',
    description: 'Log a call, meeting, or note',
    href: '/crm/activities/new',
    icon: 'MessageSquare',
    category: 'crm',
    formType: 'single',
    fields: [
      { name: 'activity_type', label: 'Activity Type', type: 'select', required: true, options: [
        { value: 'call', label: 'Phone Call' },
        { value: 'email', label: 'Email' },
        { value: 'meeting', label: 'Meeting' },
        { value: 'note', label: 'Note' },
        { value: 'task', label: 'Task' },
      ]},
      { name: 'contact_id', label: 'Contact', type: 'select', options: [] },
      { name: 'deal_id', label: 'Related Deal', type: 'select', options: [] },
      { name: 'subject', label: 'Subject', type: 'text', required: true, colSpan: 2 },
      { name: 'activity_date', label: 'Date', type: 'datetime', required: true },
      { name: 'duration', label: 'Duration (minutes)', type: 'number' },
      { name: 'description', label: 'Description', type: 'textarea', required: true, colSpan: 2 },
      { name: 'outcome', label: 'Outcome', type: 'select', options: [
        { value: 'positive', label: 'Positive' },
        { value: 'neutral', label: 'Neutral' },
        { value: 'negative', label: 'Negative' },
        { value: 'no_answer', label: 'No Answer' },
      ]},
    ],
  },

  // CRM - Send Proposal
  '/quotes/new': {
    id: 'send-proposal',
    name: 'Send Proposal',
    description: 'Create and send a proposal',
    href: '/quotes/new',
    icon: 'Send',
    category: 'crm',
    formType: 'wizard',
    steps: [
      {
        id: 'recipient',
        title: 'Recipient',
        fields: [
          { name: 'contact_id', label: 'Contact', type: 'select', required: true, options: [], colSpan: 2 },
          { name: 'deal_id', label: 'Related Deal', type: 'select', options: [], colSpan: 2 },
        ],
      },
      {
        id: 'proposal',
        title: 'Proposal Details',
        fields: [
          { name: 'title', label: 'Proposal Title', type: 'text', required: true, colSpan: 2 },
          { name: 'valid_until', label: 'Valid Until', type: 'date', required: true },
          { name: 'total_value', label: 'Total Value', type: 'number', required: true },
          { name: 'currency', label: 'Currency', type: 'select', options: [
            { value: 'USD', label: 'USD' },
            { value: 'EUR', label: 'EUR' },
          ]},
          { name: 'description', label: 'Description', type: 'textarea', colSpan: 2 },
          { name: 'terms', label: 'Terms & Conditions', type: 'textarea', colSpan: 2 },
        ],
      },
    ],
  },

  // CRM - Schedule Meeting
  '/crm/calendar/new': {
    id: 'schedule-meeting',
    name: 'Schedule Meeting',
    description: 'Schedule a meeting with contacts',
    href: '/crm/calendar/new',
    icon: 'CalendarPlus',
    category: 'crm',
    formType: 'single',
    fields: [
      { name: 'title', label: 'Meeting Title', type: 'text', required: true, colSpan: 2 },
      { name: 'contact_ids', label: 'Attendees', type: 'select', required: true, options: [] },
      { name: 'meeting_type', label: 'Meeting Type', type: 'select', options: [
        { value: 'in_person', label: 'In Person' },
        { value: 'video', label: 'Video Call' },
        { value: 'phone', label: 'Phone Call' },
      ]},
      { name: 'start_time', label: 'Start Time', type: 'datetime', required: true },
      { name: 'end_time', label: 'End Time', type: 'datetime', required: true },
      { name: 'location', label: 'Location / Meeting Link', type: 'text', colSpan: 2 },
      { name: 'agenda', label: 'Agenda', type: 'textarea', colSpan: 2 },
      { name: 'send_invite', label: 'Send calendar invite', type: 'checkbox', placeholder: 'Send calendar invitations to attendees' },
    ],
  },
};

// Props for the QuickLinkFormSheet component
export interface QuickLinkFormSheetProps {
  href: string;
  open: boolean;
  onClose: () => void;
  onSubmit?: (data: Record<string, unknown>) => Promise<void>;
}

/**
 * QuickLinkFormSheet - Opens workflow forms in a modal instead of navigating
 */
export function QuickLinkFormSheet({
  href,
  open,
  onClose,
  onSubmit,
}: QuickLinkFormSheetProps) {
  const [submitting, setSubmitting] = useState(false);
  
  const formConfig = QUICK_LINK_FORMS[href];
  
  const handleSubmit = useCallback(async (data: Record<string, unknown>) => {
    setSubmitting(true);
    try {
      if (onSubmit) {
        await onSubmit(data);
      } else if (formConfig?.onSubmit) {
        await formConfig.onSubmit(data);
      }
      // Form submitted successfully
      onClose();
    } catch (error) {
      // Re-throw to let caller handle
      throw error;
    } finally {
      setSubmitting(false);
    }
  }, [onSubmit, formConfig, onClose]);

  if (!formConfig) {
    // No form config - this link should navigate normally
    return null;
  }

  // RecordFormModalComponent must be set by the consuming app via setRecordFormModal
  if (!RecordFormModalComponent) {
    console.warn('QuickLinkFormSheet: RecordFormModal component not set. Call setRecordFormModal() first.');
    return null;
  }

  return (
    <RecordFormModalComponent
      open={open}
      onClose={onClose}
      mode="create"
      title={formConfig.name}
      fields={formConfig.formType === 'single' ? formConfig.fields : undefined}
      steps={formConfig.formType === 'wizard' ? formConfig.steps : undefined}
      onSubmit={handleSubmit}
      submitLabel="Submit"
      size={formConfig.formType === 'wizard' ? 'lg' : 'md'}
      loading={submitting}
    />
  );
}

/**
 * Hook to manage quick link form state
 */
export function useQuickLinkForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentHref, setCurrentHref] = useState<string | null>(null);

  const openForm = useCallback((href: string) => {
    // Check if this href has a form config
    if (QUICK_LINK_FORMS[href]) {
      setCurrentHref(href);
      setIsOpen(true);
      return true; // Form will open
    }
    return false; // No form, should navigate
  }, []);

  const closeForm = useCallback(() => {
    setIsOpen(false);
    setCurrentHref(null);
  }, []);

  return {
    isOpen,
    currentHref,
    openForm,
    closeForm,
    hasForm: (href: string) => !!QUICK_LINK_FORMS[href],
  };
}

export default QuickLinkFormSheet;
