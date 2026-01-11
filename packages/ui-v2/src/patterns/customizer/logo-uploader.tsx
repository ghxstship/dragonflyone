/**
 * Logo Uploader Component
 * File upload with drag-and-drop, preview, and validation
 */

'use client';

import React, { useState, useCallback, useRef } from 'react';
import './logo-uploader.css';

interface LogoUploaderProps {
  label: string;
  value?: string; // Current logo URL
  onChange: (url: string) => void;
  onFileSelect?: (file: File) => void;
  description?: string;
  maxSizeMB?: number;
  acceptedFormats?: string[];
}

export function LogoUploader({
  label,
  value,
  onChange,
  onFileSelect,
  description,
  maxSizeMB = 5,
  acceptedFormats = ['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp'],
}: LogoUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(value || null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Validate file
  const validateFile = useCallback(
    (file: File): string | null => {
      // Check file type
      if (!acceptedFormats.includes(file.type)) {
        return `Invalid file type. Accepted formats: ${acceptedFormats
          .map((f) => f.split('/')[1].toUpperCase())
          .join(', ')}`;
      }

      // Check file size
      const maxBytes = maxSizeMB * 1024 * 1024;
      if (file.size > maxBytes) {
        return `File too large. Maximum size: ${maxSizeMB}MB`;
      }

      return null;
    },
    [acceptedFormats, maxSizeMB]
  );

  // Handle file selection
  const handleFile = useCallback(
    async (file: File) => {
      setError(null);

      // Validate
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Notify parent component
      if (onFileSelect) {
        onFileSelect(file);
      }

      // Upload file
      setUploading(true);
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', 'logos');

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Upload failed');
        }

        const data = await response.json();
        onChange(data.url);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to upload logo');
        setPreview(null);
      } finally {
        setUploading(false);
      }
    },
    [validateFile, onChange, onFileSelect]
  );

  // Handle drag events
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        handleFile(files[0]);
      }
    },
    [handleFile]
  );

  // Handle file input change
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      if (files.length > 0) {
        handleFile(files[0]);
      }
    },
    [handleFile]
  );

  // Handle remove logo
  const handleRemove = useCallback(() => {
    setPreview(null);
    setError(null);
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [onChange]);

  return (
    <div className="logo-uploader">
      <div className="logo-uploader__header">
        <label className="logo-uploader__label">{label}</label>
        {description && <p className="logo-uploader__description">{description}</p>}
      </div>

      {/* Upload Area */}
      <div
        className={`logo-uploader__area ${
          isDragging ? 'logo-uploader__area--dragging' : ''
        } ${preview ? 'logo-uploader__area--has-preview' : ''}`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {preview ? (
          // Preview State
          <div className="logo-uploader__preview">
            <img
              src={preview}
              alt="Logo preview"
              className="logo-uploader__preview-image"
            />
            <div className="logo-uploader__preview-actions">
              <button
                type="button"
                className="logo-uploader__change-btn"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                Change
              </button>
              <button
                type="button"
                className="logo-uploader__remove-btn"
                onClick={handleRemove}
                disabled={uploading}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
                Remove
              </button>
            </div>
            {uploading && (
              <div className="logo-uploader__uploading">
                <div className="logo-uploader__spinner" />
                <span>Uploading...</span>
              </div>
            )}
          </div>
        ) : (
          // Empty State
          <div className="logo-uploader__empty">
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="logo-uploader__icon"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            <p className="logo-uploader__text">
              <button
                type="button"
                className="logo-uploader__browse"
                onClick={() => fileInputRef.current?.click()}
              >
                Click to upload
              </button>{' '}
              or drag and drop
            </p>
            <p className="logo-uploader__hint">
              PNG, JPG, SVG or WebP (max {maxSizeMB}MB)
            </p>
          </div>
        )}

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          className="logo-uploader__input"
          accept={acceptedFormats.join(',')}
          onChange={handleInputChange}
          disabled={uploading}
        />
      </div>

      {/* Error Message */}
      {error && <div className="logo-uploader__error">{error}</div>}
    </div>
  );
}

LogoUploader.displayName = 'LogoUploader';
