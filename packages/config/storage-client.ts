import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from './supabase-types';

export interface UploadOptions {
  bucket?: string;
  path?: string;
  upsert?: boolean;
}

export interface UploadResult {
  path: string;
  url: string;
  size: number;
  type: string;
}

export class StorageManager {
  constructor(private supabase: SupabaseClient<Database>) {}

  async uploadFile(file: File, options: UploadOptions = {}): Promise<UploadResult> {
    const { bucket = 'uploads', path = '', upsert = false } = options;

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
    };
  }

  async deleteFile(bucket: string, path: string): Promise<void> {
    const { error } = await this.supabase.storage
      .from(bucket)
      .remove([path]);

    if (error) {
      throw new Error(`Delete failed: ${error.message}`);
    }
  }

  async listFiles(bucket: string, path?: string): Promise<Array<{ name: string; id: string }>> {
    const { data, error } = await this.supabase.storage
      .from(bucket)
      .list(path);

    if (error) {
      throw new Error(`List failed: ${error.message}`);
    }

    return data || [];
  }

  getPublicUrl(bucket: string, path: string): string {
    const { data } = this.supabase.storage
      .from(bucket)
      .getPublicUrl(path);

    return data.publicUrl;
  }

  async createSignedUrl(bucket: string, path: string, expiresIn: number = 3600): Promise<string> {
    const { data, error } = await this.supabase.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn);

    if (error) {
      throw new Error(`Signed URL creation failed: ${error.message}`);
    }

    return data.signedUrl;
  }

  async downloadFile(bucket: string, path: string): Promise<Blob> {
    const { data, error } = await this.supabase.storage
      .from(bucket)
      .download(path);

    if (error) {
      throw new Error(`Download failed: ${error.message}`);
    }

    return data;
  }

  validateFile(file: File, options?: {
    maxSize?: number;
    allowedTypes?: string[];
  }): { valid: boolean; error?: string } {
    const maxSize = options?.maxSize || 10 * 1024 * 1024; // 10MB default
    const allowedTypes = options?.allowedTypes || [
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
