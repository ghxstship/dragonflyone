import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from './supabase-types';

// =====================================================
// STORAGE BUCKET CONSTANTS
// =====================================================

/**
 * Available storage buckets in the platform
 */
export const STORAGE_BUCKETS = {
  /** User profile pictures - public read */
  AVATARS: 'avatars',
  /** General document storage - org scoped */
  DOCUMENTS: 'documents',
  /** General file uploads - user scoped */
  UPLOADS: 'uploads',
  /** Event and crew photos - public read */
  PHOTOS: 'photos',
  /** Press and marketing materials - public read */
  MEDIA_KITS: 'media-kits',
  /** Equipment and inventory images - org scoped */
  ASSETS: 'assets',
  /** Organization and event logos - public read */
  LOGOS: 'logos',
  /** Email and message attachments - user scoped */
  ATTACHMENTS: 'attachments',
  /** Contract documents - org scoped, no delete */
  CONTRACTS: 'contracts',
  /** Invoice documents - org scoped */
  INVOICES: 'invoices',
  /** Receipt images and documents - user scoped */
  RECEIPTS: 'receipts',
  /** Certification and license documents - user scoped */
  CERTIFICATIONS: 'certifications',
  /** Document and email templates - org scoped */
  TEMPLATES: 'templates',
  /** Generated export files - user scoped, auto-cleanup */
  EXPORTS: 'exports',
  /** System backup files - admin only */
  BACKUPS: 'backups',
} as const;

export type StorageBucket = typeof STORAGE_BUCKETS[keyof typeof STORAGE_BUCKETS];

/**
 * Bucket configuration with size limits and allowed types
 */
export const BUCKET_CONFIG: Record<StorageBucket, {
  maxSize: number;
  allowedTypes: string[];
  isPublic: boolean;
  description: string;
}> = {
  [STORAGE_BUCKETS.AVATARS]: {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    isPublic: true,
    description: 'User profile pictures',
  },
  [STORAGE_BUCKETS.DOCUMENTS]: {
    maxSize: 50 * 1024 * 1024, // 50MB
    allowedTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain',
      'text/csv',
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
    ],
    isPublic: false,
    description: 'General document storage',
  },
  [STORAGE_BUCKETS.UPLOADS]: {
    maxSize: 100 * 1024 * 1024, // 100MB
    allowedTypes: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml',
      'application/pdf',
      'application/zip',
      'application/x-zip-compressed',
      'video/mp4',
      'video/quicktime',
      'audio/mpeg',
      'audio/wav',
    ],
    isPublic: false,
    description: 'General file uploads',
  },
  [STORAGE_BUCKETS.PHOTOS]: {
    maxSize: 20 * 1024 * 1024, // 20MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/heic', 'image/heif'],
    isPublic: true,
    description: 'Event and crew photos',
  },
  [STORAGE_BUCKETS.MEDIA_KITS]: {
    maxSize: 100 * 1024 * 1024, // 100MB
    allowedTypes: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml',
      'application/pdf',
      'application/zip',
      'video/mp4',
      'video/quicktime',
    ],
    isPublic: true,
    description: 'Press and marketing materials',
  },
  [STORAGE_BUCKETS.ASSETS]: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    isPublic: false,
    description: 'Equipment and inventory images',
  },
  [STORAGE_BUCKETS.LOGOS]: {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
    isPublic: true,
    description: 'Organization and event logos',
  },
  [STORAGE_BUCKETS.ATTACHMENTS]: {
    maxSize: 25 * 1024 * 1024, // 25MB
    allowedTypes: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'text/csv',
    ],
    isPublic: false,
    description: 'Email and message attachments',
  },
  [STORAGE_BUCKETS.CONTRACTS]: {
    maxSize: 50 * 1024 * 1024, // 50MB
    allowedTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png',
    ],
    isPublic: false,
    description: 'Contract documents',
  },
  [STORAGE_BUCKETS.INVOICES]: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['application/pdf', 'image/jpeg', 'image/png'],
    isPublic: false,
    description: 'Invoice documents',
  },
  [STORAGE_BUCKETS.RECEIPTS]: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'image/heic'],
    isPublic: false,
    description: 'Receipt images and documents',
  },
  [STORAGE_BUCKETS.CERTIFICATIONS]: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['application/pdf', 'image/jpeg', 'image/png'],
    isPublic: false,
    description: 'Certification and license documents',
  },
  [STORAGE_BUCKETS.TEMPLATES]: {
    maxSize: 25 * 1024 * 1024, // 25MB
    allowedTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/html',
      'text/plain',
      'image/jpeg',
      'image/png',
      'image/svg+xml',
    ],
    isPublic: false,
    description: 'Document and email templates',
  },
  [STORAGE_BUCKETS.EXPORTS]: {
    maxSize: 100 * 1024 * 1024, // 100MB
    allowedTypes: [
      'application/pdf',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv',
      'application/zip',
      'application/json',
    ],
    isPublic: false,
    description: 'Generated export files',
  },
  [STORAGE_BUCKETS.BACKUPS]: {
    maxSize: 1024 * 1024 * 1024, // 1GB
    allowedTypes: ['application/zip', 'application/x-zip-compressed', 'application/gzip', 'application/json'],
    isPublic: false,
    description: 'System backup files',
  },
};

// =====================================================
// INTERFACES
// =====================================================

export interface UploadOptions {
  bucket?: StorageBucket;
  path?: string;
  upsert?: boolean;
  /** User ID for user-scoped buckets */
  userId?: string;
  /** Organization ID for org-scoped buckets */
  organizationId?: string;
}

export interface UploadResult {
  path: string;
  url: string;
  size: number;
  type: string;
  bucket: StorageBucket;
}

// =====================================================
// STORAGE MANAGER CLASS
// =====================================================

export class StorageManager {
  constructor(private supabase: SupabaseClient<Database>) {}

  /**
   * Get the appropriate path prefix based on bucket type
   */
  private getPathPrefix(bucket: StorageBucket, options: UploadOptions): string {
    const config = BUCKET_CONFIG[bucket];
    
    // User-scoped buckets
    if (['avatars', 'uploads', 'attachments', 'receipts', 'certifications', 'exports'].includes(bucket)) {
      if (!options.userId) {
        throw new Error(`User ID required for ${bucket} bucket`);
      }
      return options.userId;
    }
    
    // Org-scoped buckets
    if (['documents', 'assets', 'contracts', 'invoices', 'templates', 'logos', 'media-kits'].includes(bucket)) {
      if (!options.organizationId) {
        throw new Error(`Organization ID required for ${bucket} bucket`);
      }
      return options.organizationId;
    }
    
    // Public buckets (photos) - use user ID if provided
    if (options.userId) {
      return options.userId;
    }
    
    return '';
  }

  async uploadFile(file: File, options: UploadOptions = {}): Promise<UploadResult> {
    const { bucket = STORAGE_BUCKETS.UPLOADS, path = '', upsert = false } = options;

    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${crypto.randomUUID()}.${fileExt}`;
    const filePath = path ? `${path}/${fileName}` : fileName;

    const { data, error } = await this.supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        contentType: file.type,
        upsert,
      });

    if (error) {
      throw new Error(`Upload failed: ${error.message}`);
    }

    const { data: urlData } = this.supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return {
      path: data.path,
      url: urlData.publicUrl,
      size: file.size,
      type: file.type,
      bucket,
    };
  }

  async deleteFile(bucket: StorageBucket, path: string): Promise<void> {
    const { error } = await this.supabase.storage
      .from(bucket)
      .remove([path]);

    if (error) {
      throw new Error(`Delete failed: ${error.message}`);
    }
  }

  async listFiles(bucket: StorageBucket, path?: string): Promise<Array<{ name: string; id: string }>> {
    const { data, error } = await this.supabase.storage
      .from(bucket)
      .list(path);

    if (error) {
      throw new Error(`List failed: ${error.message}`);
    }

    return data || [];
  }

  getPublicUrl(bucket: StorageBucket, path: string): string {
    const { data } = this.supabase.storage
      .from(bucket)
      .getPublicUrl(path);

    return data.publicUrl;
  }

  async createSignedUrl(bucket: StorageBucket, path: string, expiresIn: number = 3600): Promise<string> {
    const { data, error } = await this.supabase.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn);

    if (error) {
      throw new Error(`Signed URL creation failed: ${error.message}`);
    }

    return data.signedUrl;
  }

  async downloadFile(bucket: StorageBucket, path: string): Promise<Blob> {
    const { data, error } = await this.supabase.storage
      .from(bucket)
      .download(path);

    if (error) {
      throw new Error(`Download failed: ${error.message}`);
    }

    return data;
  }

  /**
   * Validate a file against bucket configuration
   */
  validateFile(file: File, bucket?: StorageBucket): { valid: boolean; error?: string } {
    const config = bucket ? BUCKET_CONFIG[bucket] : null;
    const maxSize = config?.maxSize || 10 * 1024 * 1024; // 10MB default
    const allowedTypes = config?.allowedTypes || [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
    ];

    if (file.size > maxSize) {
      return {
        valid: false,
        error: `File size exceeds maximum of ${Math.floor(maxSize / 1024 / 1024)}MB`,
      };
    }

    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: `File type ${file.type} is not allowed`,
      };
    }

    return { valid: true };
  }
}

export function createStorageManager(supabase: SupabaseClient<Database>): StorageManager {
  return new StorageManager(supabase);
}

// =====================================================
// UTILITY FUNCTIONS
// =====================================================

/**
 * Get bucket configuration
 */
export function getBucketConfig(bucket: StorageBucket) {
  return BUCKET_CONFIG[bucket];
}

/**
 * Check if a bucket is public
 */
export function isBucketPublic(bucket: StorageBucket): boolean {
  return BUCKET_CONFIG[bucket].isPublic;
}

/**
 * Get the appropriate bucket for a file type
 */
export function suggestBucket(mimeType: string): StorageBucket | null {
  // Check each bucket's allowed types
  for (const [bucket, config] of Object.entries(BUCKET_CONFIG)) {
    if (config.allowedTypes.includes(mimeType)) {
      return bucket as StorageBucket;
    }
  }
  return null;
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Generate a storage path with proper structure
 */
export function generateStoragePath(
  bucket: StorageBucket,
  filename: string,
  options: { userId?: string; organizationId?: string; subfolder?: string }
): string {
  const parts: string[] = [];
  
  // Add scope prefix based on bucket type
  if (['avatars', 'uploads', 'attachments', 'receipts', 'certifications', 'exports'].includes(bucket)) {
    if (options.userId) parts.push(options.userId);
  } else if (['documents', 'assets', 'contracts', 'invoices', 'templates', 'logos', 'media-kits'].includes(bucket)) {
    if (options.organizationId) parts.push(options.organizationId);
  } else if (bucket === 'photos' && options.userId) {
    parts.push(options.userId);
  }
  
  // Add subfolder if provided
  if (options.subfolder) {
    parts.push(options.subfolder);
  }
  
  // Add timestamped filename
  const ext = filename.split('.').pop();
  const sanitizedName = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
  const uniqueName = `${Date.now()}_${sanitizedName}`;
  parts.push(uniqueName);
  
  return parts.join('/');
}
