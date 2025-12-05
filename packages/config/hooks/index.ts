// Shared hooks for all GHXSTSHIP apps
export { useAuth } from './useAuth';
export type { User, UseAuthReturn } from './useAuth';
export { useRealtime } from './useRealtime';
export type { UseRealtimeOptions } from './useRealtime';
export { useAdvancingCatalog } from './useAdvancingCatalog';
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
