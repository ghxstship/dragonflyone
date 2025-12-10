import { describe, it, expect } from 'vitest';
import type {
  MFAEnrollmentResult,
  MFAVerifyResult,
  MFAStatus,
} from '../mfa';

describe('mfa', () => {
  describe('MFAEnrollmentResult interface', () => {
    it('should represent successful enrollment', () => {
      const result: MFAEnrollmentResult = {
        success: true,
        factorId: 'factor-123',
        qrCode: 'data:image/png;base64,abc123...',
        secret: 'JBSWY3DPEHPK3PXP',
      };

      expect(result.success).toBe(true);
      expect(result.factorId).toBe('factor-123');
      expect(result.qrCode).toBeDefined();
      expect(result.secret).toBeDefined();
      expect(result.error).toBeUndefined();
    });

    it('should represent failed enrollment', () => {
      const result: MFAEnrollmentResult = {
        success: false,
        error: 'MFA enrollment failed: User already has maximum factors',
      };

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.factorId).toBeUndefined();
      expect(result.qrCode).toBeUndefined();
    });

    it('should have optional fields', () => {
      const result: MFAEnrollmentResult = {
        success: true,
      };

      expect(result.success).toBe(true);
      expect(result.factorId).toBeUndefined();
      expect(result.qrCode).toBeUndefined();
      expect(result.secret).toBeUndefined();
      expect(result.error).toBeUndefined();
    });
  });

  describe('MFAVerifyResult interface', () => {
    it('should represent successful verification', () => {
      const result: MFAVerifyResult = {
        success: true,
      };

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should represent failed verification', () => {
      const result: MFAVerifyResult = {
        success: false,
        error: 'Invalid verification code',
      };

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid verification code');
    });

    it('should handle expired code error', () => {
      const result: MFAVerifyResult = {
        success: false,
        error: 'Verification code has expired',
      };

      expect(result.success).toBe(false);
      expect(result.error).toContain('expired');
    });
  });

  describe('MFAStatus interface', () => {
    it('should represent MFA enabled status', () => {
      const status: MFAStatus = {
        enabled: true,
        factors: [
          { id: 'factor-1', status: 'verified', friendly_name: 'My Phone', factor_type: 'totp', created_at: '', updated_at: '' },
        ],
        verifiedFactors: [
          { id: 'factor-1', status: 'verified', friendly_name: 'My Phone', factor_type: 'totp', created_at: '', updated_at: '' },
        ],
        unverifiedFactors: [],
      };

      expect(status.enabled).toBe(true);
      expect(status.factors.length).toBe(1);
      expect(status.verifiedFactors.length).toBe(1);
      expect(status.unverifiedFactors.length).toBe(0);
    });

    it('should represent MFA disabled status', () => {
      const status: MFAStatus = {
        enabled: false,
        factors: [],
        verifiedFactors: [],
        unverifiedFactors: [],
      };

      expect(status.enabled).toBe(false);
      expect(status.factors.length).toBe(0);
    });

    it('should represent pending enrollment', () => {
      const status: MFAStatus = {
        enabled: false,
        factors: [
          { id: 'factor-1', status: 'unverified', friendly_name: 'Pending', factor_type: 'totp', created_at: '', updated_at: '' },
        ],
        verifiedFactors: [],
        unverifiedFactors: [
          { id: 'factor-1', status: 'unverified', friendly_name: 'Pending', factor_type: 'totp', created_at: '', updated_at: '' },
        ],
      };

      expect(status.enabled).toBe(false);
      expect(status.factors.length).toBe(1);
      expect(status.verifiedFactors.length).toBe(0);
      expect(status.unverifiedFactors.length).toBe(1);
    });

    it('should support multiple factors', () => {
      const status: MFAStatus = {
        enabled: true,
        factors: [
          { id: 'factor-1', status: 'verified', friendly_name: 'Phone', factor_type: 'totp', created_at: '', updated_at: '' },
          { id: 'factor-2', status: 'verified', friendly_name: 'Tablet', factor_type: 'totp', created_at: '', updated_at: '' },
        ],
        verifiedFactors: [
          { id: 'factor-1', status: 'verified', friendly_name: 'Phone', factor_type: 'totp', created_at: '', updated_at: '' },
          { id: 'factor-2', status: 'verified', friendly_name: 'Tablet', factor_type: 'totp', created_at: '', updated_at: '' },
        ],
        unverifiedFactors: [],
      };

      expect(status.factors.length).toBe(2);
      expect(status.verifiedFactors.length).toBe(2);
    });
  });
});
