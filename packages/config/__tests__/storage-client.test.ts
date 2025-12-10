import { describe, it, expect } from 'vitest';
import {
  STORAGE_BUCKETS,
  BUCKET_CONFIG,
  getBucketConfig,
  isBucketPublic,
  suggestBucket,
  formatFileSize,
  generateStoragePath,
} from '../storage-client';

describe('storage-client', () => {
  describe('STORAGE_BUCKETS', () => {
    it('should have all expected buckets defined', () => {
      expect(STORAGE_BUCKETS.AVATARS).toBe('avatars');
      expect(STORAGE_BUCKETS.DOCUMENTS).toBe('documents');
      expect(STORAGE_BUCKETS.UPLOADS).toBe('uploads');
      expect(STORAGE_BUCKETS.PHOTOS).toBe('photos');
      expect(STORAGE_BUCKETS.MEDIA_KITS).toBe('media-kits');
      expect(STORAGE_BUCKETS.ASSETS).toBe('assets');
      expect(STORAGE_BUCKETS.LOGOS).toBe('logos');
      expect(STORAGE_BUCKETS.ATTACHMENTS).toBe('attachments');
      expect(STORAGE_BUCKETS.CONTRACTS).toBe('contracts');
      expect(STORAGE_BUCKETS.INVOICES).toBe('invoices');
      expect(STORAGE_BUCKETS.RECEIPTS).toBe('receipts');
      expect(STORAGE_BUCKETS.CERTIFICATIONS).toBe('certifications');
      expect(STORAGE_BUCKETS.TEMPLATES).toBe('templates');
      expect(STORAGE_BUCKETS.EXPORTS).toBe('exports');
      expect(STORAGE_BUCKETS.BACKUPS).toBe('backups');
    });
  });

  describe('BUCKET_CONFIG', () => {
    it('should have config for all buckets', () => {
      Object.values(STORAGE_BUCKETS).forEach(bucket => {
        expect(BUCKET_CONFIG[bucket]).toBeDefined();
        expect(BUCKET_CONFIG[bucket].maxSize).toBeGreaterThan(0);
        expect(Array.isArray(BUCKET_CONFIG[bucket].allowedTypes)).toBe(true);
        expect(typeof BUCKET_CONFIG[bucket].isPublic).toBe('boolean');
        expect(typeof BUCKET_CONFIG[bucket].description).toBe('string');
      });
    });

    it('should have correct size limits', () => {
      expect(BUCKET_CONFIG.avatars.maxSize).toBe(5 * 1024 * 1024); // 5MB
      expect(BUCKET_CONFIG.documents.maxSize).toBe(50 * 1024 * 1024); // 50MB
      expect(BUCKET_CONFIG.uploads.maxSize).toBe(100 * 1024 * 1024); // 100MB
      expect(BUCKET_CONFIG.backups.maxSize).toBe(1024 * 1024 * 1024); // 1GB
    });

    it('should mark public buckets correctly', () => {
      expect(BUCKET_CONFIG.avatars.isPublic).toBe(true);
      expect(BUCKET_CONFIG.photos.isPublic).toBe(true);
      expect(BUCKET_CONFIG.logos.isPublic).toBe(true);
      expect(BUCKET_CONFIG['media-kits'].isPublic).toBe(true);
      expect(BUCKET_CONFIG.documents.isPublic).toBe(false);
      expect(BUCKET_CONFIG.contracts.isPublic).toBe(false);
    });
  });

  describe('getBucketConfig', () => {
    it('should return config for valid bucket', () => {
      const config = getBucketConfig('avatars');
      expect(config).toBeDefined();
      expect(config.maxSize).toBe(5 * 1024 * 1024);
      expect(config.isPublic).toBe(true);
    });

    it('should return config with allowed types', () => {
      const config = getBucketConfig('avatars');
      expect(config.allowedTypes).toContain('image/jpeg');
      expect(config.allowedTypes).toContain('image/png');
    });
  });

  describe('isBucketPublic', () => {
    it('should return true for public buckets', () => {
      expect(isBucketPublic('avatars')).toBe(true);
      expect(isBucketPublic('photos')).toBe(true);
      expect(isBucketPublic('logos')).toBe(true);
      expect(isBucketPublic('media-kits')).toBe(true);
    });

    it('should return false for private buckets', () => {
      expect(isBucketPublic('documents')).toBe(false);
      expect(isBucketPublic('contracts')).toBe(false);
      expect(isBucketPublic('invoices')).toBe(false);
      expect(isBucketPublic('backups')).toBe(false);
    });
  });

  describe('suggestBucket', () => {
    it('should suggest avatars bucket for image types', () => {
      const bucket = suggestBucket('image/jpeg');
      expect(bucket).toBeDefined();
      // Should return first matching bucket (avatars allows images)
      expect(bucket).toBe('avatars');
    });

    it('should suggest appropriate bucket for PDF', () => {
      const bucket = suggestBucket('application/pdf');
      expect(bucket).toBeDefined();
    });

    it('should return null for unsupported types', () => {
      const bucket = suggestBucket('application/x-unknown-type');
      expect(bucket).toBeNull();
    });

    it('should suggest bucket for video types', () => {
      const bucket = suggestBucket('video/mp4');
      expect(bucket).toBeDefined();
    });
  });

  describe('formatFileSize', () => {
    it('should format 0 bytes', () => {
      expect(formatFileSize(0)).toBe('0 Bytes');
    });

    it('should format bytes', () => {
      expect(formatFileSize(500)).toBe('500 Bytes');
    });

    it('should format kilobytes', () => {
      expect(formatFileSize(1024)).toBe('1 KB');
      expect(formatFileSize(2048)).toBe('2 KB');
      expect(formatFileSize(1536)).toBe('1.5 KB');
    });

    it('should format megabytes', () => {
      expect(formatFileSize(1024 * 1024)).toBe('1 MB');
      expect(formatFileSize(5 * 1024 * 1024)).toBe('5 MB');
      expect(formatFileSize(2.5 * 1024 * 1024)).toBe('2.5 MB');
    });

    it('should format gigabytes', () => {
      expect(formatFileSize(1024 * 1024 * 1024)).toBe('1 GB');
      expect(formatFileSize(2 * 1024 * 1024 * 1024)).toBe('2 GB');
    });
  });

  describe('generateStoragePath', () => {
    it('should generate path for user-scoped bucket with userId', () => {
      const path = generateStoragePath('avatars', 'profile.jpg', { userId: 'user-123' });
      expect(path).toContain('user-123');
      expect(path).toContain('profile');
      expect(path).toMatch(/\.jpg$/);
    });

    it('should generate path for org-scoped bucket with organizationId', () => {
      const path = generateStoragePath('documents', 'contract.pdf', { organizationId: 'org-456' });
      expect(path).toContain('org-456');
      expect(path).toContain('contract');
    });

    it('should include subfolder when provided', () => {
      const path = generateStoragePath('uploads', 'file.txt', {
        userId: 'user-123',
        subfolder: 'reports',
      });
      expect(path).toContain('user-123');
      expect(path).toContain('reports');
      expect(path).toContain('file');
    });

    it('should sanitize filename', () => {
      const path = generateStoragePath('uploads', 'my file (1).pdf', { userId: 'user-123' });
      expect(path).not.toContain(' ');
      expect(path).not.toContain('(');
      expect(path).not.toContain(')');
    });

    it('should add timestamp to filename', () => {
      const before = Date.now();
      const path = generateStoragePath('avatars', 'test.jpg', { userId: 'user-123' });
      const after = Date.now();
      
      // Extract timestamp from path
      const match = path.match(/(\d+)_/);
      expect(match).toBeTruthy();
      const timestamp = parseInt(match![1], 10);
      expect(timestamp).toBeGreaterThanOrEqual(before);
      expect(timestamp).toBeLessThanOrEqual(after);
    });

    it('should handle photos bucket with userId', () => {
      const path = generateStoragePath('photos', 'event.jpg', { userId: 'user-123' });
      expect(path).toContain('user-123');
    });

    it('should handle photos bucket without userId', () => {
      const path = generateStoragePath('photos', 'event.jpg', {});
      expect(path).not.toContain('undefined');
    });
  });
});
