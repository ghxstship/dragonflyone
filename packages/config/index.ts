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

// Saved filters and views
export * from './saved-filters';
export { useSavedFilters, useSavedViews } from './hooks/useSavedFilters';
export type { FilterPreset, ViewPreset } from './hooks/useSavedFilters';

// PDF generation utilities - NOT exported from barrel to avoid bundling jspdf (~500KB)
// Import directly when needed: import { PDFGenerator } from '@ghxstship/config/pdf-generator'

// Organization catalog hooks
export * from './hooks/useOrgCatalog';

// Advance templates hooks
export * from './hooks/useAdvanceTemplates';

// Catalog visibility and permissions hooks
export * from './hooks/useCatalogVisibility';

// Asset scanning hooks
export * from './hooks/useAssetScan';

// Calibration hooks
export * from './hooks/useCalibration';

// Maintenance hooks
export * from './hooks/useMaintenance';

// Damage reports hooks
export * from './hooks/useDamageReports';

// Asset kits hooks
export * from './hooks/useAssetKits';

// Rentals hooks
export * from './hooks/useRentals';

// Storage locations hooks
export * from './hooks/useStorageLocations';

// Asset tracking hooks
export * from './hooks/useAssetTracking';

// Asset utilization hooks
export * from './hooks/useAssetUtilization';

// Serialized components hooks
export * from './hooks/useSerializedComponents';

// Idle assets hooks
export * from './hooks/useIdleAssets';

// Optimization hooks
export * from './hooks/useOptimization';

// Asset performance hooks
export * from './hooks/useAssetPerformance';

// Asset specifications hooks
export * from './hooks/useAssetSpecifications';

// Accounts receivable hooks
export * from './hooks/useAccountsReceivable';

// Investors hooks
export * from './hooks/useInvestors';

// Sponsors hooks
export * from './hooks/useSponsors';

// Crew members hooks
export * from './hooks/useCrewMembers';

// Crew assignments hooks
export * from './hooks/useCrewAssignments';

// Vendor contracts hooks
export * from './hooks/useVendorContracts';

// Bookings hooks
export * from './hooks/useBookings';

// Investor updates hooks
export * from './hooks/useInvestorUpdates';

// Sponsor reports hooks
export * from './hooks/useSponsorReports';

// Sponsor activations hooks
export * from './hooks/useSponsorActivations';

// CRM Tasks hooks
export * from './hooks/useCrmTasks';

// CRM Calendar hooks
export * from './hooks/useCrmCalendar';

// CRM Leads hooks
export * from './hooks/useCrmLeads';

// CRM Emails hooks
export * from './hooks/useCrmEmails';

// CRM Stakeholders hooks
export * from './hooks/useCrmStakeholders';

// Compensation hooks
export * from './hooks/useCompensation';

// Referrals hooks
export * from './hooks/useReferrals';

// Background checks hooks
export * from './hooks/useBackgroundChecks';

// Succession plans hooks
export * from './hooks/useSuccessionPlans';

// Labor laws hooks
export * from './hooks/useLaborLaws';

// Union rules hooks
export * from './hooks/useUnionRules';

// Handbook hooks
export * from './hooks/useHandbook';

// Union compliance hooks
export * from './hooks/useUnionCompliance';

// Marketing attribution hooks
export * from './hooks/useMarketingAttribution';

// Procurement categories hooks
export * from './hooks/useProcurementCategories';

// Emergency procurement hooks
export * from './hooks/useEmergencyProcurement';

// Vendor audits hooks
export * from './hooks/useVendorAudits';

// Vendor selection hooks
export * from './hooks/useVendorSelection';

// A/B Testing hooks
export * from './hooks/useABTesting';

// Campaign Metrics hooks
export * from './hooks/useCampaignMetrics';

// Social Inbox hooks
export * from './hooks/useSocialInbox';

// Group Orders hooks
export * from './hooks/useGroupOrders';

// GVTEWAY Marketing hooks
export * from './hooks/useGvtewayMarketing';

// GVTEWAY Social hooks
export * from './hooks/useGvtewaySocial';

// GVTEWAY Tickets hooks
export * from './hooks/useGvtewayTickets';

// GVTEWAY Settings hooks
export * from './hooks/useGvtewaySettings';

// Bank reconciliation hooks
export * from './hooks/useBankReconciliation';

// Commissions hooks
export * from './hooks/useCommissions';

// Credit cards hooks
export * from './hooks/useCreditCards';

// Analytics reports hooks
export * from './hooks/useAnalyticsReports';

// Analytics dashboards hooks
export * from './hooks/useAnalyticsDashboards';

// Client retention hooks
export * from './hooks/useClientRetention';

// Data warehouse hooks
export * from './hooks/useDataWarehouse';

// Dashboard builder hooks
export * from './hooks/useDashboardBuilder';

// Training hooks
export * from './hooks/useTraining';

// Shows hooks (run-of-show, cues, set-times)
export * from './hooks/useShows';

// Sponsor deliverables hooks
export * from './hooks/useSponsorDeliverables';

// Team assignments hooks
export * from './hooks/useTeamAssignments';

// Marketing hooks
export * from './hooks/useMarketing';

// Catalog types
export type * from './types/catalog';

// Unified catalog category system
export * from './catalog-categories';

// Catalog categories hooks
export * from './hooks/useCatalogCategories';

// Navigation types and utilities
export * from './navigation-types';

// Enhanced navigation hook
export * from './hooks/useEnhancedNavigation';

// Cookie consent hook and provider
export * from './hooks/useCookieConsent';
export {
  CookieConsentProvider,
  useCookieConsentContext,
  useAnalyticsConsent,
  useAdvertisingConsent,
  useFunctionalConsent,
  withConsentRequired,
} from './providers/CookieConsentProvider';

// ATLVS Settings hooks (tax, api-keys, apps, organization, security, roles, export, import)
export * from './hooks/useAtlvsSettings';

// ATLVS Support hooks (support tickets, lead nurturing, feedback, budget forecasting, financial reports, payment plans, invoice templates, community)
export * from './hooks/useAtlvsSupport';

// GVTEWAY Admin hooks (forums, embed, seo, widgets, moderation, merch, templates, friends, blueprints, check-in)
export * from './hooks/useGvtewayAdmin';

// Calendar utilities (headless helpers for calendar operations)
export * from './calendar-utils';

// Legend Master Data types
export type * from './types/legend';

// Legend Master Data hooks
export * from './hooks/useLegend';

// Saga Workflow types
export type * from './types/saga';

// Saga Workflow hooks
export * from './hooks/useSaga';

// Chronicle Activity types
export type * from './types/chronicle';

// Chronicle Activity hooks
export * from './hooks/useChronicle';
