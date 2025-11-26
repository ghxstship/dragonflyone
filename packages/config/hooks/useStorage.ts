'use client';

import { useState, useCallback } from 'react';
import { supabase } from '../supabase-client';
import {
  STORAGE_BUCKETS,
  BUCKET_CONFIG,
  StorageBucket,
  UploadResult,
  formatFileSize,
  generateStoragePath,
} from '../storage-client';

export interface UseStorageOptions {
  bucket: StorageBucket;
  userId?: string;
  organizationId?: string;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface UseStorageReturn {
  upload: (file: File, subfolder?: string) => Promise<UploadResult>;
  uploadMultiple: (files: File[], subfolder?: string) => Promise<UploadResult[]>;
  remove: (path: string) => Promise<void>;
  getUrl: (path: string) => string;
  getSignedUrl: (path: string, expiresIn?: number) => Promise<string>;
  validateFile: (file: File) => { valid: boolean; error?: string };
  isUploading: boolean;
  progress: UploadProgress | null;
  error: string | null;
  bucketConfig: typeof BUCKET_CONFIG[StorageBucket];
}

/**
 * React hook for Supabase storage operations
 */
export function useStorage(options: UseStorageOptions): UseStorageReturn {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState<UploadProgress | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { bucket, userId, organizationId } = options;
  const bucketConfig = BUCKET_CONFIG[bucket];

  const validateFile = useCallback(
    (file: File): { valid: boolean; error?: string } => {
      if (file.size > bucketConfig.maxSize) {
        return {
          valid: false,
          error: `File size (${formatFileSize(file.size)}) exceeds maximum of ${formatFileSize(bucketConfig.maxSize)}`,
        };
      }
      if (!bucketConfig.allowedTypes.includes(file.type)) {
        return {
          valid: false,
          error: `File type "${file.type}" is not allowed`,
        };
      }
      return { valid: true };
    },
    [bucketConfig]
  );

  const upload = useCallback(
    async (file: File, subfolder?: string): Promise<UploadResult> => {
      setError(null);
      setIsUploading(true);
      setProgress({ loaded: 0, total: file.size, percentage: 0 });

      try {
        const validation = validateFile(file);
        if (!validation.valid) {
          throw new Error(validation.error);
        }

        const filePath = generateStoragePath(bucket, file.name, {
          userId,
          organizationId,
          subfolder,
        });

        const { data, error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(filePath, file, { contentType: file.type, upsert: false });

        if (uploadError) throw new Error(uploadError.message);

        const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(data.path);
        setProgress({ loaded: file.size, total: file.size, percentage: 100 });

        return {
          path: data.path,
          url: urlData.publicUrl,
          size: file.size,
          type: file.type,
          bucket,
        };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Upload failed';
        setError(message);
        throw new Error(message);
      } finally {
        setIsUploading(false);
      }
    },
    [bucket, userId, organizationId, validateFile]
  );

  const uploadMultiple = useCallback(
    async (files: File[], subfolder?: string): Promise<UploadResult[]> => {
      const results: UploadResult[] = [];
      for (const file of files) {
        const result = await upload(file, subfolder);
        results.push(result);
      }
      return results;
    },
    [upload]
  );

  const remove = useCallback(
    async (path: string): Promise<void> => {
      setError(null);
      try {
        const { error: removeError } = await supabase.storage.from(bucket).remove([path]);
        if (removeError) throw new Error(removeError.message);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Delete failed';
        setError(message);
        throw new Error(message);
      }
    },
    [bucket]
  );

  const getUrl = useCallback(
    (path: string): string => {
      const { data } = supabase.storage.from(bucket).getPublicUrl(path);
      return data.publicUrl;
    },
    [bucket]
  );

  const getSignedUrl = useCallback(
    async (path: string, expiresIn: number = 3600): Promise<string> => {
      const { data, error: urlError } = await supabase.storage
        .from(bucket)
        .createSignedUrl(path, expiresIn);
      if (urlError) throw new Error(urlError.message);
      return data.signedUrl;
    },
    [bucket]
  );

  return {
    upload,
    uploadMultiple,
    remove,
    getUrl,
    getSignedUrl,
    validateFile,
    isUploading,
    progress,
    error,
    bucketConfig,
  };
}

export { STORAGE_BUCKETS, BUCKET_CONFIG, type StorageBucket };
