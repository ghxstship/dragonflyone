/**
 * Auth Validation Schemas
 * Zod schemas for authentication forms across all platforms
 */

import { z } from 'zod';

// Password validation rules
const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

// Email validation
const emailSchema = z.string().email('Invalid email address');

// Sign Up Schema
export const signUpSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  agreeToTerms: z.boolean().refine((val) => val === true, {
    message: 'You must agree to the terms and conditions',
  }),
  inviteCode: z.string().optional(),
  organizationId: z.string().uuid().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export type SignUpInput = z.infer<typeof signUpSchema>;

// Sign In Schema
export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

export type SignInInput = z.infer<typeof signInSchema>;

// Forgot Password Schema
export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

// Reset Password Schema
export const resetPasswordSchema = z.object({
  password: passwordSchema,
  confirmPassword: z.string(),
  token: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

// Magic Link Schema
export const magicLinkSchema = z.object({
  email: emailSchema,
});

export type MagicLinkInput = z.infer<typeof magicLinkSchema>;

// Profile Setup Schema
export const profileSetupSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  displayName: z.string().max(100).optional(),
  phone: z.string().optional(),
  bio: z.string().max(500).optional(),
  avatarUrl: z.string().url().optional().or(z.literal('')),
});

export type ProfileSetupInput = z.infer<typeof profileSetupSchema>;

// Organization Setup Schema
export const organizationSetupSchema = z.object({
  organizationName: z.string().min(1, 'Organization name is required').max(100),
  organizationType: z.enum(['production_company', 'venue', 'agency', 'promoter', 'other']).optional(),
  role: z.string().optional(),
  teamSize: z.enum(['1', '2-10', '11-50', '51-200', '200+']).optional(),
});

export type OrganizationSetupInput = z.infer<typeof organizationSetupSchema>;

// Role Selection Schema
export const roleSelectionSchema = z.object({
  primaryRole: z.string().min(1, 'Please select a role'),
  additionalRoles: z.array(z.string()).optional(),
});

export type RoleSelectionInput = z.infer<typeof roleSelectionSchema>;

// Preferences Schema
export const preferencesSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']).default('system'),
  language: z.string().default('en'),
  timezone: z.string().default('America/New_York'),
  emailNotifications: z.boolean().default(true),
  pushNotifications: z.boolean().default(true),
  marketingEmails: z.boolean().default(false),
});

export type PreferencesInput = z.infer<typeof preferencesSchema>;

// OAuth Provider Types
export type OAuthProvider = 'google' | 'apple';

// Onboarding Step Types
export type OnboardingStep = 
  | 'profile'
  | 'organization'
  | 'role'
  | 'preferences'
  | 'complete';

export interface OnboardingProgress {
  currentStep: OnboardingStep;
  completedSteps: OnboardingStep[];
  skippedSteps: OnboardingStep[];
}

// Auth Error Types
export type AuthErrorCode =
  | 'invalid_credentials'
  | 'email_exists'
  | 'invalid_token'
  | 'expired_token'
  | 'rate_limited'
  | 'network_error'
  | 'server_error'
  | 'oauth_error'
  | 'session_expired'
  | 'validation_error'
  | 'permission_denied'
  | 'user_not_found'
  | 'weak_password'
  | 'email_not_verified';

export interface AuthError {
  code: AuthErrorCode;
  message: string;
  details?: Record<string, string>;
}

// Auth Response Types
export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export interface AuthUser {
  id: string;
  email: string;
  fullName?: string;
  avatarUrl?: string;
  platformRoles: string[];
  organizationId?: string;
  onboardingCompleted: boolean;
}

export interface AuthResponse {
  user: AuthUser;
  session: AuthSession;
}

// Helper function to get error message from code
export function getAuthErrorMessage(code: AuthErrorCode): string {
  const messages: Record<AuthErrorCode, string> = {
    invalid_credentials: 'Invalid email or password',
    email_exists: 'An account with this email already exists',
    invalid_token: 'Invalid or malformed token',
    expired_token: 'Your session has expired. Please sign in again.',
    rate_limited: 'Too many attempts. Please try again later.',
    network_error: 'Network error. Please check your connection.',
    server_error: 'An unexpected error occurred. Please try again.',
    oauth_error: 'OAuth authentication failed. Please try again.',
    session_expired: 'Your session has expired. Please sign in again.',
    validation_error: 'Please check your input and try again.',
    permission_denied: 'You do not have permission to perform this action.',
    user_not_found: 'No account found with this email address.',
    weak_password: 'Password does not meet security requirements.',
    email_not_verified: 'Please verify your email address to continue.',
  };
  return messages[code] || 'An unexpected error occurred';
}
