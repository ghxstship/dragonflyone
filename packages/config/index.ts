// Aggregate exports for the @ghxstship/config package
export * from './auth-helpers';
export * from './supabase-client';
export * from './rpc-client';
export * from './analytics-client';
export * from './realtime-client';
export * from './validation';
export * from './storage-client';
export * from './logger';
export * from './error-tracking';
export * from './monitoring';
export * from './api-client';
export * from './offline-handler';
export * from './request-interceptor';
export * from './roles';
export * from './workflow-helpers';
export * from './api-helpers';
export * from './form-validators';
export * from './middleware';
export * from './hooks/useAdvancingCatalog';
export * from './hooks/useAuth';
export * from './hooks/useRealtime';
export * from './notifications/advancing-notifications';
export * from './webhooks/advancing-webhooks';
export type * from './supabase-types';

// Note: advancing-helpers has formatCurrency which conflicts with api-helpers
// Import explicitly when needed: import { calculateEstimatedCost } from '@ghxstship/config/utils/advancing-helpers'

// Status utilities for consistent status variant mapping across apps
export * from './status-utils';

// App context for navigation hierarchy
export * from './app-context';

// Auth context for user authentication (explicit exports to avoid conflicts with hooks/useAuth)
export { 
  AuthProvider, 
  useAuth as useAuthContext,
  RequireRole,
  RequirePlatformAccess,
} from './auth-context';
export type { User as AuthUser } from './auth-context';

// Production context for ATLVS production selection
export {
  ProductionProvider,
  useProductionContext,
  useProductionContextSafe,
} from './production-context';
export type { Production } from './production-context';

// Auth schemas and validation
export * from './auth-schemas';

// Auth actions (server-side) - use explicit exports to avoid conflicts with auth-helpers
export {
  signUp,
  signIn,
  signInWithOAuth,
  handleOAuthCallback,
  sendMagicLink,
  forgotPassword,
  verifyEmail,
  refreshSession,
  updateProfile,
  updatePreferences,
  completeOnboarding,
  getSession,
} from './auth-actions';

// CSRF protection middleware
export * from './middleware/csrf';

// MFA (Multi-Factor Authentication) utilities
export * from './mfa';

// Cross-app navigation utilities
export * from './cross-app-navigation';

// API versioning utilities
export * from './api-versioning';

// SSO/SAML configuration for enterprise
export * from './sso-config';

// Detailed permission system
export * from './permissions';

// Centralized logging
export * from './logging';

// Session timeout configuration
export * from './session-config';

// Rate limiting (explicit exports to avoid conflicts with middleware)
export {
  RateLimiter,
  rateLimited,
  getRateLimiterForEndpoint,
  rateLimiters,
  RATE_LIMIT_PRESETS,
  memoryRateLimitStore,
  ipKeyGenerator,
  userKeyGenerator,
  endpointKeyGenerator,
} from './rate-limiting';
export type {
  RateLimitConfig,
  RateLimitInfo,
  RateLimitResult,
  RateLimitStore,
} from './rate-limiting';

// Export utilities for ListPage
export * from './export-utils';

// Import utilities for ListPage
export * from './import-utils';

// Saved filters and views - BLOCKED: needs saved_filters/saved_views tables in DB
// export * from './saved-filters';
// export { useSavedFilters, useSavedViews } from './hooks/useSavedFilters';
// export type { FilterPreset, ViewPreset } from './hooks/useSavedFilters';
