// Shared hooks for all GHXSTSHIP apps
export { useAuth } from './useAuth';
export type { User, UseAuthReturn } from './useAuth';
export { useRealtime } from './useRealtime';
export type { UseRealtimeOptions } from './useRealtime';
export { 
  useAdvancingCatalog, 
  useAdvancingRequests,
  useCatalogCategories,
  useCatalogItem,
  useAdvancingRequest,
  useCreateAdvance,
  useUpdateAdvance,
  useDeleteAdvance,
  useApproveAdvance,
  useRejectAdvance,
  useFulfillAdvance,
} from './useAdvancingCatalog';
export type { CatalogCategory } from './useAdvancingCatalog';
export { useStorage, STORAGE_BUCKETS, BUCKET_CONFIG } from './useStorage';
export type { UseStorageOptions, UseStorageReturn, UploadProgress, StorageBucket } from './useStorage';

// Navigation hooks
export {
  usePermissions,
  useNavigationAccess,
  useRoleAwareNavigation,
  useNavigationContext,
  useAppAccess,
  ATLVS_PLATFORM_NAV_VISIBILITY,
  ATLVS_EVENT_NAV_VISIBILITY,
} from './useNavigation';
export type {
  AppContext,
  NavigationLevel,
  NavigationContext,
  NavItem,
  NavSection,
  UserRoleContext,
} from './useNavigation';

// Collaboration hooks
export {
  useCollaborationPresence,
  useCollaborationEvents,
  useLiveEditing,
  useTypingIndicator,
} from './useCollaboration';
export type {
  CollaboratorPresence,
  CollaborationRoom,
  CursorPosition,
  SelectionRange,
  CollaborationEvent,
} from './useCollaboration';

// Presence hook (simplified page-level presence)
export { usePresence } from "./usePresence";
export type { PresenceUser, UsePresenceOptions } from "./usePresence";
export { useSmartViews, inferColumnType, columnsToDefinitions } from "./useSmartViews";
export type { ViewType, ViewConfig, ColumnDefinition, SmartViewConfig } from "./useSmartViews";

// Activity feed hook
export { useActivityFeed } from './useActivityFeed';
export type { ActivityItem } from './useActivityFeed';

// System health hook
export { useSystemHealth, getHealthStatusColor, getHealthStatusLabel } from './useSystemHealth';
export type { SystemHealthMetrics } from './useSystemHealth';

// Command palette hook
export {
  useCommandPalette,
  buildNavigationCommands,
  buildActionCommands,
} from './useCommandPalette';
export type {
  CommandItem,
  CommandCategory,
  UseCommandPaletteOptions,
  UseCommandPaletteReturn,
  QuickAction,
} from './useCommandPalette';

// Tab state hook (URL-synced tabs)
export { useTabState, useLocalTabState } from './useTabState';
export type {
  UseTabStateOptions,
  UseTabStateReturn,
  UseLocalTabStateOptions,
} from './useTabState';

// Favorites and keyboard shortcuts hooks
export { useFavorites, useKeyboardShortcuts } from './useFavorites';

// Asset scanning hooks
export {
  useAssetScan,
  useAssetLookup,
  useScanHistory,
  useRecordScan,
} from './useAssetScan';
export type {
  ScannedAsset,
  ScanHistory,
  ScanAssetParams,
} from './useAssetScan';

// Calibration hooks
export {
  useCalibration,
  useCalibrationSchedules,
  useCreateCalibration,
  useDeleteCalibrations,
} from './useCalibration';
export type {
  CalibrationRecord,
  CreateCalibrationParams,
} from './useCalibration';
export type {
  FavoriteItem,
  UseFavoritesOptions,
  UseFavoritesReturn,
  KeyboardShortcut,
  UseKeyboardShortcutsOptions,
} from './useFavorites';

// Analytics reports hooks
export {
  useAnalyticsReports,
  useAnalyticsReportsQuery,
  useRunReport,
  useToggleReportStatus,
  useDeleteReports,
} from './useAnalyticsReports';
export type { AnalyticsReport } from './useAnalyticsReports';

// Optimistic updates hook
export {
  useOptimisticUpdate,
  createOptimisticDelete,
  createOptimisticAdd,
  createOptimisticItemUpdate,
} from './useOptimisticUpdate';
export type {
  OptimisticUpdateOptions,
  OptimisticUpdateReturn,
} from './useOptimisticUpdate';

// Enhanced navigation hook
export {
  useEnhancedNavigation,
  useNavigationBadges,
} from './useEnhancedNavigation';
export type {
  UseEnhancedNavigationOptions,
  UseEnhancedNavigationResult,
  UseBadgeOptions,
} from './useEnhancedNavigation';

// Cookie consent hook
export { useCookieConsent } from './useCookieConsent';
export type {
  CookiePreferences,
  CookieConsentState,
  UseCookieConsentOptions,
  UseCookieConsentReturn,
} from './useCookieConsent';
