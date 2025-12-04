import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Factor } from '@supabase/supabase-js';

/**
 * MFA (Multi-Factor Authentication) utilities for Supabase Auth
 * 
 * Supabase supports TOTP (Time-based One-Time Password) as the MFA method.
 * Users can use apps like Google Authenticator, Authy, or 1Password.
 */

export type MFAFactor = Factor;

export interface MFAEnrollmentResult {
  success: boolean;
  factorId?: string;
  qrCode?: string;
  secret?: string;
  error?: string;
}

export interface MFAVerifyResult {
  success: boolean;
  error?: string;
}

export interface MFAStatus {
  enabled: boolean;
  factors: MFAFactor[];
  verifiedFactors: MFAFactor[];
  unverifiedFactors: MFAFactor[];
}

/**
 * Get the current MFA status for the authenticated user
 */
export async function getMFAStatus(): Promise<MFAStatus> {
  const supabase = createClientComponentClient();
  
  const { data, error } = await supabase.auth.mfa.listFactors();
  
  if (error || !data) {
    return {
      enabled: false,
      factors: [],
      verifiedFactors: [],
      unverifiedFactors: [],
    };
  }
  
  const verifiedFactors = data.totp.filter((f) => f.status === 'verified');
  const unverifiedFactors = data.totp.filter((f) => (f.status as string) !== 'verified');
  
  return {
    enabled: verifiedFactors.length > 0,
    factors: data.totp,
    verifiedFactors,
    unverifiedFactors,
  };
}

/**
 * Start MFA enrollment - generates QR code and secret
 * User must verify with a code from their authenticator app to complete enrollment
 */
export async function enrollMFA(friendlyName?: string): Promise<MFAEnrollmentResult> {
  const supabase = createClientComponentClient();
  
  const { data, error } = await supabase.auth.mfa.enroll({
    factorType: 'totp',
    friendlyName: friendlyName || 'Authenticator App',
  });
  
  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }
  
  return {
    success: true,
    factorId: data.id,
    qrCode: data.totp.qr_code,
    secret: data.totp.secret,
  };
}

/**
 * Verify MFA enrollment with a code from the authenticator app
 * This completes the enrollment process
 */
export async function verifyMFAEnrollment(
  factorId: string,
  code: string
): Promise<MFAVerifyResult> {
  const supabase = createClientComponentClient();
  
  const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
    factorId,
  });
  
  if (challengeError) {
    return {
      success: false,
      error: challengeError.message,
    };
  }
  
  const { error: verifyError } = await supabase.auth.mfa.verify({
    factorId,
    challengeId: challengeData.id,
    code,
  });
  
  if (verifyError) {
    return {
      success: false,
      error: verifyError.message,
    };
  }
  
  return { success: true };
}

/**
 * Verify MFA during login (after password authentication)
 */
export async function verifyMFALogin(
  factorId: string,
  code: string
): Promise<MFAVerifyResult> {
  const supabase = createClientComponentClient();
  
  const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
    factorId,
  });
  
  if (challengeError) {
    return {
      success: false,
      error: challengeError.message,
    };
  }
  
  const { error: verifyError } = await supabase.auth.mfa.verify({
    factorId,
    challengeId: challengeData.id,
    code,
  });
  
  if (verifyError) {
    return {
      success: false,
      error: verifyError.message,
    };
  }
  
  return { success: true };
}

/**
 * Unenroll (disable) MFA for a specific factor
 */
export async function unenrollMFA(factorId: string): Promise<MFAVerifyResult> {
  const supabase = createClientComponentClient();
  
  const { error } = await supabase.auth.mfa.unenroll({
    factorId,
  });
  
  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }
  
  return { success: true };
}

/**
 * Check if the current session requires MFA verification
 * Returns the factor ID that needs verification, or null if MFA is not required
 */
export async function checkMFARequired(): Promise<string | null> {
  const supabase = createClientComponentClient();
  
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    return null;
  }
  
  // Check the AAL (Authenticator Assurance Level)
  const { data: aalData, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  
  if (error || !aalData) {
    return null;
  }
  
  // If current level is aal1 but next level is aal2, MFA is required
  if (aalData.currentLevel === 'aal1' && aalData.nextLevel === 'aal2') {
    // Get the factor that needs verification
    const { data: factorsData } = await supabase.auth.mfa.listFactors();
    
    if (factorsData && factorsData.totp.length > 0) {
      const verifiedFactor = factorsData.totp.find((f) => f.status === 'verified');
      return verifiedFactor?.id || null;
    }
  }
  
  return null;
}

/**
 * Get the current Authenticator Assurance Level
 * - aal1: Password only
 * - aal2: Password + MFA verified
 */
export async function getAAL(): Promise<'aal1' | 'aal2' | null> {
  const supabase = createClientComponentClient();
  
  const { data, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  
  if (error || !data) {
    return null;
  }
  
  return data.currentLevel;
}

/**
 * Check if the user has completed MFA verification for this session
 */
export async function isMFAVerified(): Promise<boolean> {
  const aal = await getAAL();
  return aal === 'aal2';
}
