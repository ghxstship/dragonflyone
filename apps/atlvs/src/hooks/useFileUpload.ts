import { useMutation, useQueryClient } from '@tanstack/react-query';

export interface UploadedFile {
  id: string;
  name: string;
  original_name: string;
  mime_type: string;
  size: number;
  url: string;
  thumbnail_url?: string;
  folder?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
  uploaded_by: string;
  created_at: string;
}

export interface UploadProgress {
  file_name: string;
  progress: number;
  status: 'pending' | 'uploading' | 'processing' | 'completed' | 'failed';
  error?: string;
}

export interface UploadOptions {
  folder?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
  resize?: {
    width?: number;
    height?: number;
    fit?: 'cover' | 'contain' | 'fill';
  };
  generateThumbnail?: boolean;
  maxSizeMB?: number;
  allowedTypes?: string[];
}

async function uploadFile(file: File, options?: UploadOptions): Promise<UploadedFile> {
  const formData = new FormData();
  formData.append('file', file);
  if (options?.folder) formData.append('folder', options.folder);
  if (options?.tags) formData.append('tags', JSON.stringify(options.tags));
  if (options?.metadata) formData.append('metadata', JSON.stringify(options.metadata));
  if (options?.resize) formData.append('resize', JSON.stringify(options.resize));
  if (options?.generateThumbnail !== undefined) {
    formData.append('generate_thumbnail', String(options.generateThumbnail));
  }

  const response = await fetch('/api/files/upload', {
    method: 'POST',
    body: formData,
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to upload file');
  }
  return response.json();
}

async function uploadMultipleFiles(files: File[], options?: UploadOptions): Promise<{
  uploaded: UploadedFile[];
  failed: Array<{ name: string; error: string }>;
}> {
  const formData = new FormData();
  files.forEach((file) => formData.append('files', file));
  if (options?.folder) formData.append('folder', options.folder);
  if (options?.tags) formData.append('tags', JSON.stringify(options.tags));

  const response = await fetch('/api/files/upload-multiple', {
    method: 'POST',
    body: formData,
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to upload files');
  }
  return response.json();
}

async function deleteFile(fileId: string): Promise<void> {
  const response = await fetch(`/api/files/${fileId}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete file');
  }
}

async function getSignedUploadUrl(input: {
  fileName: string;
  mimeType: string;
  folder?: string;
}): Promise<{ upload_url: string; file_url: string; expires_at: string }> {
  const response = await fetch('/api/files/signed-url', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    throw new Error('Failed to get signed URL');
  }
  return response.json();
}

export function useUploadFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ file, options }: { file: File; options?: UploadOptions }) => uploadFile(file, options),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
    },
  });
}

export function useUploadMultipleFiles() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ files, options }: { files: File[]; options?: UploadOptions }) => uploadMultipleFiles(files, options),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
    },
  });
}

export function useDeleteFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteFile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
    },
  });
}

export function useGetSignedUploadUrl() {
  return useMutation({
    mutationFn: getSignedUploadUrl,
  });
}
