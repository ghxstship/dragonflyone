/**
 * Common Form Field Definitions
 * 
 * Reusable form field definitions for common fields across all entities.
 * Import and spread these into entity-specific form field arrays.
 */

import type { FormFieldDefinition, FilterOption } from './types';

// ============================================================================
// Identity Fields
// ============================================================================

/**
 * Name field
 */
export const nameField: FormFieldDefinition = {
  name: 'name',
  label: 'Name',
  type: 'text',
  required: true,
  placeholder: 'Enter name',
};

/**
 * Title field
 */
export const titleField: FormFieldDefinition = {
  name: 'title',
  label: 'Title',
  type: 'text',
  required: true,
  placeholder: 'Enter title',
  colSpan: 2,
};

/**
 * First name field
 */
export const firstNameField: FormFieldDefinition = {
  name: 'first_name',
  label: 'First Name',
  type: 'text',
  required: true,
  placeholder: 'First name',
};

/**
 * Last name field
 */
export const lastNameField: FormFieldDefinition = {
  name: 'last_name',
  label: 'Last Name',
  type: 'text',
  required: true,
  placeholder: 'Last name',
};

/**
 * Reference number field
 */
export function referenceNumberField(
  name: string,
  label: string,
  options: { required?: boolean; placeholder?: string } = {}
): FormFieldDefinition {
  return {
    name,
    label,
    type: 'text',
    required: options.required ?? false,
    placeholder: options.placeholder || `Enter ${label.toLowerCase()}`,
  };
}

// ============================================================================
// Contact Fields
// ============================================================================

/**
 * Email field
 */
export const emailField: FormFieldDefinition = {
  name: 'email',
  label: 'Email',
  type: 'email',
  required: true,
  placeholder: 'email@example.com',
  validation: {
    pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$',
    patternMessage: 'Please enter a valid email address',
  },
};

/**
 * Phone field
 */
export const phoneField: FormFieldDefinition = {
  name: 'phone',
  label: 'Phone',
  type: 'tel',
  placeholder: '(555) 123-4567',
};

/**
 * Website field
 */
export const websiteField: FormFieldDefinition = {
  name: 'website',
  label: 'Website',
  type: 'url',
  placeholder: 'https://example.com',
};

// ============================================================================
// Address Fields
// ============================================================================

/**
 * Street address field
 */
export const streetField: FormFieldDefinition = {
  name: 'street',
  label: 'Street Address',
  type: 'text',
  placeholder: '123 Main St',
  colSpan: 2,
};

/**
 * Street address line 2 field
 */
export const street2Field: FormFieldDefinition = {
  name: 'street2',
  label: 'Address Line 2',
  type: 'text',
  placeholder: 'Apt, Suite, Unit, etc.',
  colSpan: 2,
};

/**
 * City field
 */
export const cityField: FormFieldDefinition = {
  name: 'city',
  label: 'City',
  type: 'text',
  placeholder: 'City',
};

/**
 * State field
 */
export const stateField: FormFieldDefinition = {
  name: 'state',
  label: 'State',
  type: 'text',
  placeholder: 'State',
};

/**
 * ZIP code field
 */
export const zipField: FormFieldDefinition = {
  name: 'zip',
  label: 'ZIP Code',
  type: 'text',
  placeholder: '12345',
  validation: {
    pattern: '^\\d{5}(-\\d{4})?$',
    patternMessage: 'Please enter a valid ZIP code',
  },
};

/**
 * Country field
 */
export const countryField: FormFieldDefinition = {
  name: 'country',
  label: 'Country',
  type: 'select',
  options: [
    { value: 'US', label: 'United States' },
    { value: 'CA', label: 'Canada' },
    { value: 'UK', label: 'United Kingdom' },
    { value: 'AU', label: 'Australia' },
  ],
  defaultValue: 'US',
};

/**
 * Full address field group
 */
export const addressFields: FormFieldDefinition[] = [
  streetField,
  street2Field,
  cityField,
  stateField,
  zipField,
  countryField,
];

// ============================================================================
// Status Fields
// ============================================================================

/**
 * Generic status field
 */
export function statusField(
  options: FilterOption[],
  config: Partial<FormFieldDefinition> = {}
): FormFieldDefinition {
  return {
    name: 'status',
    label: 'Status',
    type: 'select',
    required: true,
    options,
    ...config,
  };
}

/**
 * Priority field
 */
export const priorityField: FormFieldDefinition = {
  name: 'priority',
  label: 'Priority',
  type: 'select',
  options: [
    { value: 'critical', label: 'Critical' },
    { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' },
    { value: 'low', label: 'Low' },
  ],
  defaultValue: 'medium',
};

// ============================================================================
// Date/Time Fields
// ============================================================================

/**
 * Date field
 */
export function dateField(
  name: string,
  label: string,
  options: { required?: boolean } = {}
): FormFieldDefinition {
  return {
    name,
    label,
    type: 'date',
    required: options.required,
  };
}

/**
 * DateTime field
 */
export function dateTimeField(
  name: string,
  label: string,
  options: { required?: boolean } = {}
): FormFieldDefinition {
  return {
    name,
    label,
    type: 'datetime',
    required: options.required,
  };
}

/**
 * Start date field
 */
export const startDateField: FormFieldDefinition = {
  name: 'start_date',
  label: 'Start Date',
  type: 'date',
  required: true,
};

/**
 * End date field
 */
export const endDateField: FormFieldDefinition = {
  name: 'end_date',
  label: 'End Date',
  type: 'date',
};

/**
 * Due date field
 */
export const dueDateField: FormFieldDefinition = {
  name: 'due_date',
  label: 'Due Date',
  type: 'date',
  required: true,
};

/**
 * Issue date field
 */
export const issueDateField: FormFieldDefinition = {
  name: 'issue_date',
  label: 'Issue Date',
  type: 'date',
  required: true,
};

/**
 * Effective date field
 */
export const effectiveDateField: FormFieldDefinition = {
  name: 'effective_date',
  label: 'Effective Date',
  type: 'date',
};

/**
 * Expiration date field
 */
export const expirationDateField: FormFieldDefinition = {
  name: 'expires_at',
  label: 'Expiration Date',
  type: 'date',
};

// ============================================================================
// Currency/Amount Fields
// ============================================================================

/**
 * Amount field
 */
export function amountField(
  name: string,
  label: string,
  options: { required?: boolean } = {}
): FormFieldDefinition {
  return {
    name,
    label,
    type: 'currency',
    required: options.required,
    validation: {
      min: 0,
    },
  };
}

/**
 * Total amount field
 */
export const totalAmountField: FormFieldDefinition = {
  name: 'total_amount',
  label: 'Total Amount',
  type: 'currency',
  required: true,
  validation: {
    min: 0,
  },
};

/**
 * Subtotal field
 */
export const subtotalField: FormFieldDefinition = {
  name: 'subtotal',
  label: 'Subtotal',
  type: 'currency',
  required: true,
  validation: {
    min: 0,
  },
};

/**
 * Tax field
 */
export const taxField: FormFieldDefinition = {
  name: 'tax',
  label: 'Tax',
  type: 'currency',
  validation: {
    min: 0,
  },
};

/**
 * Fees field
 */
export const feesField: FormFieldDefinition = {
  name: 'fees',
  label: 'Fees',
  type: 'currency',
  validation: {
    min: 0,
  },
};

/**
 * Currency field
 */
export const currencyField: FormFieldDefinition = {
  name: 'currency',
  label: 'Currency',
  type: 'select',
  options: [
    { value: 'USD', label: 'USD - US Dollar' },
    { value: 'EUR', label: 'EUR - Euro' },
    { value: 'GBP', label: 'GBP - British Pound' },
    { value: 'CAD', label: 'CAD - Canadian Dollar' },
    { value: 'AUD', label: 'AUD - Australian Dollar' },
  ],
  defaultValue: 'USD',
};

/**
 * Price field
 */
export const priceField: FormFieldDefinition = {
  name: 'price',
  label: 'Price',
  type: 'currency',
  required: true,
  validation: {
    min: 0,
  },
};

// ============================================================================
// Relationship Fields
// ============================================================================

/**
 * Vendor select field
 */
export function vendorField(
  optionsLoader?: () => Promise<FilterOption[]>
): FormFieldDefinition {
  return {
    name: 'vendor_id',
    label: 'Vendor',
    type: 'select',
    required: true,
    options: [],
    optionsLoader,
    colSpan: 2,
  };
}

/**
 * Project select field
 */
export function projectField(
  optionsLoader?: () => Promise<FilterOption[]>
): FormFieldDefinition {
  return {
    name: 'project_id',
    label: 'Project',
    type: 'select',
    options: [],
    optionsLoader,
  };
}

/**
 * Event select field
 */
export function eventField(
  optionsLoader?: () => Promise<FilterOption[]>
): FormFieldDefinition {
  return {
    name: 'event_id',
    label: 'Event',
    type: 'select',
    options: [],
    optionsLoader,
  };
}

/**
 * Organization select field
 */
export function organizationField(
  optionsLoader?: () => Promise<FilterOption[]>
): FormFieldDefinition {
  return {
    name: 'organization_id',
    label: 'Organization',
    type: 'select',
    options: [],
    optionsLoader,
  };
}

/**
 * Assignee select field
 */
export function assigneeField(
  optionsLoader?: () => Promise<FilterOption[]>
): FormFieldDefinition {
  return {
    name: 'assignee_id',
    label: 'Assignee',
    type: 'select',
    options: [],
    optionsLoader,
  };
}

/**
 * Owner select field
 */
export function ownerField(
  optionsLoader?: () => Promise<FilterOption[]>
): FormFieldDefinition {
  return {
    name: 'owner_id',
    label: 'Owner',
    type: 'select',
    options: [],
    optionsLoader,
  };
}

// ============================================================================
// Category/Type Fields
// ============================================================================

/**
 * Category select field
 */
export function categoryField(
  optionsLoader?: () => Promise<FilterOption[]>
): FormFieldDefinition {
  return {
    name: 'category_id',
    label: 'Category',
    type: 'select',
    required: true,
    options: [],
    optionsLoader,
  };
}

/**
 * Type select field
 */
export function typeField(
  name: string = 'type_id',
  label: string = 'Type',
  optionsLoader?: () => Promise<FilterOption[]>
): FormFieldDefinition {
  return {
    name,
    label,
    type: 'select',
    required: true,
    options: [],
    optionsLoader,
  };
}

// ============================================================================
// Description/Notes Fields
// ============================================================================

/**
 * Description field
 */
export const descriptionField: FormFieldDefinition = {
  name: 'description',
  label: 'Description',
  type: 'textarea',
  placeholder: 'Enter description...',
  colSpan: 2,
};

/**
 * Notes field
 */
export const notesField: FormFieldDefinition = {
  name: 'notes',
  label: 'Notes',
  type: 'textarea',
  placeholder: 'Additional notes...',
  colSpan: 2,
};

/**
 * Comments field
 */
export const commentsField: FormFieldDefinition = {
  name: 'comments',
  label: 'Comments',
  type: 'textarea',
  placeholder: 'Enter comments...',
  colSpan: 2,
};

// ============================================================================
// Boolean/Toggle Fields
// ============================================================================

/**
 * Checkbox field
 */
export function checkboxField(
  name: string,
  label: string,
  options: { defaultValue?: boolean } = {}
): FormFieldDefinition {
  return {
    name,
    label,
    type: 'checkbox',
    defaultValue: options.defaultValue ?? false,
  };
}

/**
 * Toggle/Switch field
 */
export function toggleField(
  name: string,
  label: string,
  options: { defaultValue?: boolean; helpText?: string } = {}
): FormFieldDefinition {
  return {
    name,
    label,
    type: 'switch',
    defaultValue: options.defaultValue ?? false,
    helpText: options.helpText,
  };
}

/**
 * Active toggle field
 */
export const activeField: FormFieldDefinition = {
  name: 'is_active',
  label: 'Active',
  type: 'switch',
  defaultValue: true,
};

/**
 * Required toggle field
 */
export const requiredField: FormFieldDefinition = {
  name: 'required',
  label: 'Required',
  type: 'checkbox',
  defaultValue: false,
};

// ============================================================================
// Version Field
// ============================================================================

/**
 * Version field
 */
export const versionField: FormFieldDefinition = {
  name: 'version',
  label: 'Version',
  type: 'text',
  required: true,
  placeholder: '1.0',
  validation: {
    pattern: '^\\d+(\\.\\d+)*$',
    patternMessage: 'Please enter a valid version number (e.g., 1.0, 2.1.3)',
  },
};

// ============================================================================
// File/Image Fields
// ============================================================================

/**
 * File upload field
 */
export function fileField(
  name: string,
  label: string,
  options: { required?: boolean; helpText?: string } = {}
): FormFieldDefinition {
  return {
    name,
    label,
    type: 'file',
    required: options.required,
    helpText: options.helpText,
    colSpan: 2,
  };
}

/**
 * Image upload field
 */
export function imageField(
  name: string,
  label: string,
  options: { required?: boolean; helpText?: string } = {}
): FormFieldDefinition {
  return {
    name,
    label,
    type: 'image',
    required: options.required,
    helpText: options.helpText,
  };
}

/**
 * Avatar field
 */
export const avatarField: FormFieldDefinition = {
  name: 'avatar',
  label: 'Avatar',
  type: 'avatar',
};

// ============================================================================
// Payment Fields
// ============================================================================

/**
 * Payment method field
 */
export const paymentMethodField: FormFieldDefinition = {
  name: 'payment_method',
  label: 'Payment Method',
  type: 'select',
  options: [
    { value: 'credit_card', label: 'Credit Card' },
    { value: 'debit_card', label: 'Debit Card' },
    { value: 'paypal', label: 'PayPal' },
    { value: 'bank_transfer', label: 'Bank Transfer' },
    { value: 'cash', label: 'Cash' },
    { value: 'check', label: 'Check' },
  ],
};

/**
 * Payment status field
 */
export const paymentStatusField: FormFieldDefinition = {
  name: 'payment_status',
  label: 'Payment Status',
  type: 'select',
  options: [
    { value: 'pending', label: 'Pending' },
    { value: 'paid', label: 'Paid' },
    { value: 'failed', label: 'Failed' },
  ],
  defaultValue: 'pending',
};

// ============================================================================
// Export All Common Fields
// ============================================================================

export const commonFormFields = {
  // Identity
  name: nameField,
  title: titleField,
  firstName: firstNameField,
  lastName: lastNameField,
  referenceNumber: referenceNumberField,
  
  // Contact
  email: emailField,
  phone: phoneField,
  website: websiteField,
  
  // Address
  street: streetField,
  street2: street2Field,
  city: cityField,
  state: stateField,
  zip: zipField,
  country: countryField,
  address: addressFields,
  
  // Status
  status: statusField,
  priority: priorityField,
  
  // Date/Time
  date: dateField,
  dateTime: dateTimeField,
  startDate: startDateField,
  endDate: endDateField,
  dueDate: dueDateField,
  issueDate: issueDateField,
  effectiveDate: effectiveDateField,
  expirationDate: expirationDateField,
  
  // Currency/Amount
  amount: amountField,
  totalAmount: totalAmountField,
  subtotal: subtotalField,
  tax: taxField,
  fees: feesField,
  currency: currencyField,
  price: priceField,
  
  // Relationships
  vendor: vendorField,
  project: projectField,
  event: eventField,
  organization: organizationField,
  assignee: assigneeField,
  owner: ownerField,
  
  // Category/Type
  category: categoryField,
  type: typeField,
  
  // Description/Notes
  description: descriptionField,
  notes: notesField,
  comments: commentsField,
  
  // Boolean/Toggle
  checkbox: checkboxField,
  toggle: toggleField,
  active: activeField,
  required: requiredField,
  
  // Version
  version: versionField,
  
  // File/Image
  file: fileField,
  image: imageField,
  avatar: avatarField,
  
  // Payment
  paymentMethod: paymentMethodField,
  paymentStatus: paymentStatusField,
};
