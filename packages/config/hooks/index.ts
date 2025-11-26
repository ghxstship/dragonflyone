// Shared hooks for all GHXSTSHIP apps
export { useAuth } from './useAuth';
export type { User, UseAuthReturn } from './useAuth';
export { useRealtime } from './useRealtime';
export type { UseRealtimeOptions } from './useRealtime';
export { useAdvancingCatalog } from './useAdvancingCatalog';
export { useStorage, STORAGE_BUCKETS, BUCKET_CONFIG } from './useStorage';
export type { UseStorageOptions, UseStorageReturn, UploadProgress, StorageBucket } from './useStorage';
