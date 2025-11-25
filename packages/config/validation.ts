import { z } from 'zod';

export const emailSchema = z.string().email('Invalid email address');
export const phoneSchema = z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number');
export const uuidSchema = z.string().uuid('Invalid UUID');
export const urlSchema = z.string().url('Invalid URL');

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

export const dateRangeSchema = z.object({
  start_date: z.coerce.date(),
  end_date: z.coerce.date(),
}).refine(
  (data) => data.end_date >= data.start_date,
  { message: 'End date must be after start date', path: ['end_date'] }
);

export const dealSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  organization_id: uuidSchema,
  contact_id: uuidSchema.optional(),
  value: z.number().min(0, 'Value must be positive'),
  probability: z.number().min(0).max(100, 'Probability must be between 0 and 100'),
  currency: z.string().length(3, 'Currency must be 3-letter code'),
  status: z.enum(['LEAD', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST']),
  expected_close_date: z.coerce.date().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const projectSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200, 'Name too long'),
  code: z.string().min(1, 'Code is required').max(50, 'Code too long'),
  organization_id: uuidSchema,
  deal_id: uuidSchema.optional(),
  budget: z.number().min(0, 'Budget must be positive'),
  currency: z.string().length(3, 'Currency must be 3-letter code'),
  status: z.enum(['PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'CANCELLED']),
  start_date: z.coerce.date(),
  end_date: z.coerce.date().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const assetSchema = z.object({
  asset_name: z.string().min(1, 'Asset name is required').max(200, 'Asset name too long'),
  asset_type: z.string().min(1, 'Asset type is required'),
  serial_number: z.string().optional(),
  purchase_price: z.number().min(0, 'Purchase price must be positive'),
  purchase_date: z.coerce.date().optional(),
  organization_id: uuidSchema,
  project_id: uuidSchema.optional(),
  current_state: z.enum(['AVAILABLE', 'IN_USE', 'MAINTENANCE', 'RETIRED', 'LOST']),
  metadata: z.record(z.unknown()).optional(),
});

export const expenseSchema = z.object({
  description: z.string().min(1, 'Description is required').max(500, 'Description too long'),
  amount: z.number().positive('Amount must be positive'),
  currency: z.string().length(3, 'Currency must be 3-letter code'),
  expense_date: z.coerce.date(),
  category: z.string().min(1, 'Category is required'),
  employee_id: uuidSchema.optional(),
  project_id: uuidSchema.optional(),
  status: z.enum(['DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED', 'PAID']),
  metadata: z.record(z.unknown()).optional(),
});

export const contactSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200, 'Name too long'),
  email: emailSchema.optional(),
  phone: phoneSchema.optional(),
  title: z.string().max(100, 'Title too long').optional(),
  company: z.string().max(200, 'Company name too long').optional(),
  organization_id: uuidSchema,
  metadata: z.record(z.unknown()).optional(),
});

export const fileUploadSchema = z.object({
  file: z.instanceof(File)
    .refine((file) => file.size <= 10 * 1024 * 1024, 'File size must be less than 10MB')
    .refine(
      (file) => [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      ].includes(file.type),
      'Invalid file type'
    ),
});

export const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .trim();
};

export const sanitizeObject = <T extends Record<string, unknown>>(obj: T): T => {
  const sanitized = { ...obj };
  
  for (const key in sanitized) {
    if (typeof sanitized[key] === 'string') {
      sanitized[key] = sanitizeInput(sanitized[key] as string) as T[Extract<keyof T, string>];
    } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
      sanitized[key] = sanitizeObject(sanitized[key] as Record<string, unknown>) as T[Extract<keyof T, string>];
    }
  }
  
  return sanitized;
};

export const validatePagination = (page?: number, perPage?: number) => {
  const validatedPage = Math.max(1, page || 1);
  const validatedPerPage = Math.min(100, Math.max(1, perPage || 20));
  
  return { page: validatedPage, perPage: validatedPerPage };
};

export const validateDateRange = (startDate?: string, endDate?: string) => {
  if (!startDate || !endDate) {
    return null;
  }
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    throw new Error('Invalid date format');
  }
  
  if (end < start) {
    throw new Error('End date must be after start date');
  }
  
  return { startDate: start, endDate: end };
};
