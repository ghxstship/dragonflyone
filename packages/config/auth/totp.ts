/**
 * Gap 3 Remediation: TOTP Two-Factor Authentication
 * Enterprise-grade TOTP implementation with otplib
 */

import { authenticator } from 'otplib';
import { createHmac, randomBytes } from 'crypto';
import type { SupabaseClient } from '@supabase/supabase-js';

// ============================================================================
// TYPES
// ============================================================================

export interface TOTPSetupResult {
  secret: string;
  otpauthUrl: string;
  qrCodeDataUrl: string;
  backupCodes: string[];
}

export interface TOTPVerifyResult {
  success: boolean;
  error?: string;
  remainingAttempts?: number;
  lockedUntil?: Date;
}

export interface TwoFactorStatus {
  enabled: boolean;
  required: boolean;
  setupComplete: boolean;
  backupCodesRemaining: number;
  lastVerifiedAt: Date | null;
  isLocked: boolean;
}

// ============================================================================
// CONFIGURATION
// ============================================================================

// Configure authenticator
authenticator.options = {
  digits: 6,
  step: 30, // 30 second window
  window: 1, // Allow 1 step before/after for clock drift
};

const ISSUER = 'GHXSTSHIP';
const BACKUP_CODE_COUNT = 8;
const BACKUP_CODE_LENGTH = 8;
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MINUTES = 15;

// ============================================================================
// TOTP CORE FUNCTIONS
// ============================================================================

/**
 * Generate a new TOTP secret
 */
export function generateTOTPSecret(): string {
  return authenticator.generateSecret(20); // 160-bit secret
}

/**
 * Generate the otpauth URL for QR code
 */
export function generateOTPAuthURL(
  secret: string,
  userEmail: string,
  issuer: string = ISSUER
): string {
  return authenticator.keyuri(userEmail, issuer, secret);
}

/**
 * Verify a TOTP token
 */
export function verifyTOTPToken(token: string, secret: string): boolean {
  try {
    return authenticator.verify({ token, secret });
  } catch {
    return false;
  }
}

/**
 * Generate backup codes
 */
export function generateBackupCodes(count: number = BACKUP_CODE_COUNT): string[] {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    // Generate cryptographically secure random code
    const bytes = randomBytes(BACKUP_CODE_LENGTH / 2);
    const code = bytes.toString('hex').toUpperCase();
    codes.push(code);
  }
  return codes;
}

/**
 * Hash a backup code for storage
 */
export function hashBackupCode(code: string): string {
  const hmac = createHmac('sha256', process.env.BACKUP_CODE_SECRET || 'default-secret');
  hmac.update(code.toUpperCase());
  return hmac.digest('hex');
}

/**
 * Verify a backup code against stored hashes
 */
export function verifyBackupCode(code: string, hashedCodes: string[]): number {
  const hashedInput = hashBackupCode(code);
  return hashedCodes.findIndex(hash => hash === hashedInput);
}

// ============================================================================
// QR CODE GENERATION
// ============================================================================

/**
 * Generate QR code as data URL
 * Uses a simple SVG-based QR code for zero dependencies
 */
export async function generateQRCodeDataURL(otpauthUrl: string): Promise<string> {
  // For enterprise, use a proper QR library. This is a placeholder that returns
  // a URL that can be used with Google Charts API or similar
  // In production, use 'qrcode' npm package
  const encodedUrl = encodeURIComponent(otpauthUrl);
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodedUrl}`;
}

// ============================================================================
// SUPABASE INTEGRATION
// ============================================================================

/**
 * Initialize 2FA setup for a user
 */
export async function initializeTwoFactorSetup(
  supabase: SupabaseClient,
  userId: string,
  userEmail: string
): Promise<TOTPSetupResult> {
  // Generate new secret and backup codes
  const secret = generateTOTPSecret();
  const backupCodes = generateBackupCodes();
  const hashedBackupCodes = backupCodes.map(hashBackupCode);
  const otpauthUrl = generateOTPAuthURL(secret, userEmail);
  const qrCodeDataUrl = await generateQRCodeDataURL(otpauthUrl);

  // Store in database (secret should be encrypted in production)
  const { error } = await supabase
    .from('user_2fa_config')
    .upsert({
      user_id: userId,
      totp_secret: secret, // In production, encrypt this
      backup_codes: hashedBackupCodes,
      totp_enabled: false,
      backup_codes_used: 0,
      failed_attempts: 0,
      locked_until: null,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'user_id',
    });

  if (error) {
    throw new Error(`Failed to initialize 2FA: ${error.message}`);
  }

  return {
    secret,
    otpauthUrl,
    qrCodeDataUrl,
    backupCodes, // Show these to user ONCE
  };
}

/**
 * Enable 2FA after user verifies their first token
 */
export async function enableTwoFactor(
  supabase: SupabaseClient,
  userId: string,
  token: string
): Promise<TOTPVerifyResult> {
  // Get current config
  const { data: config, error: fetchError } = await supabase
    .from('user_2fa_config')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (fetchError || !config) {
    return { success: false, error: '2FA setup not initialized' };
  }

  // Check if locked
  if (config.locked_until && new Date(config.locked_until) > new Date()) {
    return {
      success: false,
      error: 'Account is temporarily locked',
      lockedUntil: new Date(config.locked_until),
    };
  }

  // Verify the token
  const isValid = verifyTOTPToken(token, config.totp_secret);

  if (!isValid) {
    // Increment failed attempts
    const newAttempts = (config.failed_attempts || 0) + 1;
    const shouldLock = newAttempts >= MAX_FAILED_ATTEMPTS;

    await supabase
      .from('user_2fa_config')
      .update({
        failed_attempts: newAttempts,
        locked_until: shouldLock
          ? new Date(Date.now() + LOCKOUT_DURATION_MINUTES * 60 * 1000).toISOString()
          : null,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    // Log failed attempt
    await logVerificationAttempt(supabase, userId, 'totp', false, 'Invalid token');

    return {
      success: false,
      error: 'Invalid verification code',
      remainingAttempts: MAX_FAILED_ATTEMPTS - newAttempts,
    };
  }

  // Enable 2FA
  const { error: updateError } = await supabase
    .from('user_2fa_config')
    .update({
      totp_enabled: true,
      last_verified_at: new Date().toISOString(),
      failed_attempts: 0,
      locked_until: null,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId);

  if (updateError) {
    return { success: false, error: 'Failed to enable 2FA' };
  }

  // Log successful verification
  await logVerificationAttempt(supabase, userId, 'totp', true);

  return { success: true };
}

/**
 * Verify a TOTP token for login
 */
export async function verifyTwoFactorToken(
  supabase: SupabaseClient,
  userId: string,
  token: string,
  ipAddress?: string,
  userAgent?: string
): Promise<TOTPVerifyResult> {
  // Get current config
  const { data: config, error: fetchError } = await supabase
    .from('user_2fa_config')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (fetchError || !config) {
    return { success: false, error: '2FA not configured' };
  }

  if (!config.totp_enabled) {
    return { success: false, error: '2FA not enabled' };
  }

  // Check if locked
  if (config.locked_until && new Date(config.locked_until) > new Date()) {
    return {
      success: false,
      error: 'Account is temporarily locked due to too many failed attempts',
      lockedUntil: new Date(config.locked_until),
    };
  }

  // Verify the token
  const isValid = verifyTOTPToken(token, config.totp_secret);

  if (!isValid) {
    // Increment failed attempts
    const newAttempts = (config.failed_attempts || 0) + 1;
    const shouldLock = newAttempts >= MAX_FAILED_ATTEMPTS;

    await supabase
      .from('user_2fa_config')
      .update({
        failed_attempts: newAttempts,
        locked_until: shouldLock
          ? new Date(Date.now() + LOCKOUT_DURATION_MINUTES * 60 * 1000).toISOString()
          : null,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    // Log failed attempt
    await logVerificationAttempt(supabase, userId, 'totp', false, 'Invalid token', ipAddress, userAgent);

    return {
      success: false,
      error: 'Invalid verification code',
      remainingAttempts: Math.max(0, MAX_FAILED_ATTEMPTS - newAttempts),
    };
  }

  // Success - reset failed attempts
  await supabase
    .from('user_2fa_config')
    .update({
      last_verified_at: new Date().toISOString(),
      failed_attempts: 0,
      locked_until: null,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId);

  // Log successful verification
  await logVerificationAttempt(supabase, userId, 'totp', true, undefined, ipAddress, userAgent);

  return { success: true };
}

/**
 * Verify and use a backup code
 */
export async function verifyBackupCodeAndUse(
  supabase: SupabaseClient,
  userId: string,
  code: string,
  ipAddress?: string,
  userAgent?: string
): Promise<TOTPVerifyResult> {
  // Get current config
  const { data: config, error: fetchError } = await supabase
    .from('user_2fa_config')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (fetchError || !config) {
    return { success: false, error: '2FA not configured' };
  }

  // Check if locked
  if (config.locked_until && new Date(config.locked_until) > new Date()) {
    return {
      success: false,
      error: 'Account is temporarily locked',
      lockedUntil: new Date(config.locked_until),
    };
  }

  // Verify backup code
  const codeIndex = verifyBackupCode(code, config.backup_codes || []);

  if (codeIndex === -1) {
    // Increment failed attempts
    const newAttempts = (config.failed_attempts || 0) + 1;
    const shouldLock = newAttempts >= MAX_FAILED_ATTEMPTS;

    await supabase
      .from('user_2fa_config')
      .update({
        failed_attempts: newAttempts,
        locked_until: shouldLock
          ? new Date(Date.now() + LOCKOUT_DURATION_MINUTES * 60 * 1000).toISOString()
          : null,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    await logVerificationAttempt(supabase, userId, 'backup_code', false, 'Invalid backup code', ipAddress, userAgent);

    return {
      success: false,
      error: 'Invalid backup code',
      remainingAttempts: Math.max(0, MAX_FAILED_ATTEMPTS - newAttempts),
    };
  }

  // Remove used backup code
  const updatedCodes = [...(config.backup_codes || [])];
  updatedCodes.splice(codeIndex, 1);

  await supabase
    .from('user_2fa_config')
    .update({
      backup_codes: updatedCodes,
      backup_codes_used: (config.backup_codes_used || 0) + 1,
      last_verified_at: new Date().toISOString(),
      failed_attempts: 0,
      locked_until: null,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId);

  await logVerificationAttempt(supabase, userId, 'backup_code', true, undefined, ipAddress, userAgent);

  return { success: true };
}

/**
 * Get 2FA status for a user
 */
export async function getTwoFactorStatus(
  supabase: SupabaseClient,
  userId: string
): Promise<TwoFactorStatus> {
  // Check if 2FA is required for this user
  const { data: user } = await supabase
    .from('platform_users')
    .select('platform_roles')
    .eq('id', userId)
    .single();

  const adminRoles = [
    'LEGEND_SUPER_ADMIN', 'LEGEND_ADMIN', 'LEGEND_DEVELOPER', 'LEGEND_SUPPORT',
    'ATLVS_SUPER_ADMIN', 'ATLVS_ADMIN',
    'COMPVSS_ADMIN',
    'GVTEWAY_ADMIN',
  ];

  const userRoles = (user?.platform_roles || []) as string[];
  const isRequired = userRoles.some(role => adminRoles.includes(role));

  // Get 2FA config
  const { data: config } = await supabase
    .from('user_2fa_config')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (!config) {
    return {
      enabled: false,
      required: isRequired,
      setupComplete: false,
      backupCodesRemaining: 0,
      lastVerifiedAt: null,
      isLocked: false,
    };
  }

  return {
    enabled: config.totp_enabled,
    required: isRequired,
    setupComplete: config.totp_enabled,
    backupCodesRemaining: (config.backup_codes || []).length,
    lastVerifiedAt: config.last_verified_at ? new Date(config.last_verified_at) : null,
    isLocked: config.locked_until ? new Date(config.locked_until) > new Date() : false,
  };
}

/**
 * Disable 2FA for a user
 */
export async function disableTwoFactor(
  supabase: SupabaseClient,
  userId: string,
  requestingUserId: string
): Promise<{ success: boolean; error?: string }> {
  // Check if requesting user is super admin
  const { data: requestingUser } = await supabase
    .from('platform_users')
    .select('platform_roles')
    .eq('id', requestingUserId)
    .single();

  const isSuperAdmin = ((requestingUser?.platform_roles || []) as string[])
    .includes('LEGEND_SUPER_ADMIN');

  // Check if target user requires 2FA
  const status = await getTwoFactorStatus(supabase, userId);

  if (status.required && !isSuperAdmin && userId !== requestingUserId) {
    return {
      success: false,
      error: '2FA is required for admin accounts and can only be disabled by a super admin',
    };
  }

  // Disable 2FA
  const { error } = await supabase
    .from('user_2fa_config')
    .update({
      totp_enabled: false,
      totp_secret: null,
      backup_codes: null,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Regenerate backup codes
 */
export async function regenerateBackupCodes(
  supabase: SupabaseClient,
  userId: string
): Promise<{ success: boolean; backupCodes?: string[]; error?: string }> {
  const backupCodes = generateBackupCodes();
  const hashedBackupCodes = backupCodes.map(hashBackupCode);

  const { error } = await supabase
    .from('user_2fa_config')
    .update({
      backup_codes: hashedBackupCodes,
      backup_codes_used: 0,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, backupCodes };
}

// ============================================================================
// LOGGING
// ============================================================================

async function logVerificationAttempt(
  supabase: SupabaseClient,
  userId: string,
  verificationType: 'totp' | 'backup_code' | 'recovery',
  success: boolean,
  failureReason?: string,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  await supabase
    .from('user_2fa_verification_log')
    .insert({
      user_id: userId,
      verification_type: verificationType,
      success,
      failure_reason: failureReason,
      ip_address: ipAddress,
      user_agent: userAgent,
    });
}

// ============================================================================
// EXPORTS
// ============================================================================

export const totp = {
  generateSecret: generateTOTPSecret,
  generateOTPAuthURL,
  verify: verifyTOTPToken,
  generateBackupCodes,
  hashBackupCode,
  verifyBackupCode,
  generateQRCodeDataURL,
};

export const twoFactor = {
  initialize: initializeTwoFactorSetup,
  enable: enableTwoFactor,
  verify: verifyTwoFactorToken,
  verifyBackupCode: verifyBackupCodeAndUse,
  getStatus: getTwoFactorStatus,
  disable: disableTwoFactor,
  regenerateBackupCodes,
};
