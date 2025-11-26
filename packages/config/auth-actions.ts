/**
 * Auth Actions
 * Server-side authentication actions for all platforms
 * 
 * Note: Uses untyped Supabase client for tables not yet in generated types
 * (profiles, user_settings, user_invitations). These tables exist in migrations
 * but types need regeneration.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type {
  SignUpInput,
  SignInInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  MagicLinkInput,
  ProfileSetupInput,
  PreferencesInput,
  OAuthProvider,
  AuthResponse,
  AuthError,
  AuthErrorCode,
} from './auth-schemas';

// Untyped Supabase client for flexibility with tables not in generated types
type UntypedSupabaseClient = SupabaseClient<Record<string, unknown>>;

// Create Supabase client for server-side operations
function getSupabaseAdmin(): UntypedSupabaseClient {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase configuration');
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// Create Supabase client for client-side operations
function getSupabaseClient(): UntypedSupabaseClient {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase configuration');
  }

  return createClient(supabaseUrl, supabaseAnonKey);
}

// Helper to create auth error
function createAuthError(code: AuthErrorCode, message?: string): AuthError {
  const defaultMessages: Record<AuthErrorCode, string> = {
    invalid_credentials: 'Invalid email or password',
    email_exists: 'An account with this email already exists',
    invalid_token: 'Invalid or malformed token',
    expired_token: 'Your session has expired',
    rate_limited: 'Too many attempts. Please try again later.',
    network_error: 'Network error. Please check your connection.',
    server_error: 'An unexpected error occurred',
    oauth_error: 'OAuth authentication failed',
    session_expired: 'Your session has expired',
    validation_error: 'Please check your input',
    permission_denied: 'Permission denied',
    user_not_found: 'No account found with this email',
    weak_password: 'Password does not meet requirements',
    email_not_verified: 'Please verify your email address',
  };

  return {
    code,
    message: message || defaultMessages[code],
  };
}

/**
 * Sign up a new user
 */
export async function signUp(
  input: SignUpInput,
  platform: 'atlvs' | 'compvss' | 'gvteway',
  redirectUrl?: string
): Promise<{ success: true; data: AuthResponse } | { success: false; error: AuthError }> {
  try {
    const supabase = getSupabaseAdmin();

    // Check if email already exists
    const { data: existingUser } = await supabase
      .from('platform_users')
      .select('id')
      .eq('email', input.email)
      .single();

    if (existingUser) {
      return { success: false, error: createAuthError('email_exists') };
    }

    // Validate invite code if provided
    let organizationId = input.organizationId;
    let assignedRoles: string[] = getDefaultRoles(platform);

    if (input.inviteCode) {
      const { data: invite } = await supabase
        .from('user_invitations')
        .select('id, organization_id, role, expires_at, used_at')
        .eq('invite_code', input.inviteCode)
        .single();

      if (!invite) {
        return { success: false, error: createAuthError('invalid_token', 'Invalid invite code') };
      }

      if (invite.used_at) {
        return { success: false, error: createAuthError('invalid_token', 'Invite code already used') };
      }

      if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
        return { success: false, error: createAuthError('expired_token', 'Invite code expired') };
      }

      organizationId = invite.organization_id;
      if (invite.role) {
        assignedRoles = [invite.role];
      }

      // Mark invite as used
      await supabase
        .from('user_invitations')
        .update({ used_at: new Date().toISOString() })
        .eq('id', invite.id);
    }

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: input.email,
      password: input.password,
      email_confirm: false,
      user_metadata: {
        full_name: `${input.firstName} ${input.lastName}`,
        first_name: input.firstName,
        last_name: input.lastName,
      },
      app_metadata: {
        platform,
      },
    });

    if (authError) {
      if (authError.message.includes('already registered')) {
        return { success: false, error: createAuthError('email_exists') };
      }
      return { success: false, error: createAuthError('server_error', authError.message) };
    }

    // Create platform user
    const { data: platformUser, error: platformError } = await supabase
      .from('platform_users')
      .insert({
        auth_user_id: authData.user.id,
        email: input.email,
        full_name: `${input.firstName} ${input.lastName}`,
        organization_id: organizationId,
        platform_roles: assignedRoles,
        status: 'active',
      })
      .select()
      .single();

    if (platformError) {
      // Rollback auth user creation
      await supabase.auth.admin.deleteUser(authData.user.id);
      return { success: false, error: createAuthError('server_error', 'Failed to create user profile') };
    }

    // Send verification email using invite link instead of signup link
    const baseUrl = redirectUrl || process.env.NEXT_PUBLIC_APP_URL || '';
    await supabase.auth.admin.generateLink({
      type: 'invite',
      email: input.email,
      options: {
        redirectTo: `${baseUrl}/auth/callback?type=signup`,
      },
    });

    return {
      success: true,
      data: {
        user: {
          id: authData.user.id,
          email: authData.user.email || input.email,
          fullName: `${input.firstName} ${input.lastName}`,
          platformRoles: assignedRoles,
          organizationId,
          onboardingCompleted: false,
        },
        session: {
          accessToken: '',
          refreshToken: '',
          expiresAt: 0,
        },
      },
    };
  } catch (error) {
    console.error('Sign up error:', error);
    return { success: false, error: createAuthError('server_error') };
  }
}

/**
 * Sign in with email and password
 */
export async function signIn(
  input: SignInInput,
  platform: 'atlvs' | 'compvss' | 'gvteway'
): Promise<{ success: true; data: AuthResponse } | { success: false; error: AuthError }> {
  try {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email: input.email,
      password: input.password,
    });

    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        return { success: false, error: createAuthError('invalid_credentials') };
      }
      if (error.message.includes('Email not confirmed')) {
        return { success: false, error: createAuthError('email_not_verified') };
      }
      return { success: false, error: createAuthError('server_error', error.message) };
    }

    // Get platform user details
    const { data: platformUser } = await supabase
      .from('platform_users')
      .select('id, email, full_name, avatar_url, platform_roles, organization_id')
      .eq('auth_user_id', data.user.id)
      .single();

    // Get onboarding status
    const { data: profile } = await supabase
      .from('profiles')
      .select('onboarding_completed')
      .eq('id', data.user.id)
      .single();

    return {
      success: true,
      data: {
        user: {
          id: data.user.id,
          email: data.user.email || input.email,
          fullName: platformUser?.full_name || data.user.user_metadata?.full_name,
          avatarUrl: platformUser?.avatar_url,
          platformRoles: platformUser?.platform_roles || getDefaultRoles(platform),
          organizationId: platformUser?.organization_id,
          onboardingCompleted: profile?.onboarding_completed || false,
        },
        session: {
          accessToken: data.session.access_token,
          refreshToken: data.session.refresh_token,
          expiresAt: data.session.expires_at || 0,
        },
      },
    };
  } catch (error) {
    console.error('Sign in error:', error);
    return { success: false, error: createAuthError('server_error') };
  }
}

/**
 * Sign out current user
 */
export async function signOut(): Promise<{ success: boolean; error?: AuthError }> {
  try {
    const supabase = getSupabaseClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      return { success: false, error: createAuthError('server_error', error.message) };
    }

    return { success: true };
  } catch (error) {
    console.error('Sign out error:', error);
    return { success: false, error: createAuthError('server_error') };
  }
}

/**
 * Request password reset
 */
export async function forgotPassword(
  input: ForgotPasswordInput,
  redirectUrl: string
): Promise<{ success: boolean; error?: AuthError }> {
  try {
    const supabase = getSupabaseClient();

    const { error } = await supabase.auth.resetPasswordForEmail(input.email, {
      redirectTo: `${redirectUrl}/auth/reset-password`,
    });

    // Always return success to prevent email enumeration
    if (error) {
      console.error('Password reset error:', error);
    }

    return { success: true };
  } catch (error) {
    console.error('Forgot password error:', error);
    return { success: true }; // Still return success to prevent enumeration
  }
}

/**
 * Reset password with token
 */
export async function resetPassword(
  input: ResetPasswordInput
): Promise<{ success: boolean; error?: AuthError }> {
  try {
    const supabase = getSupabaseClient();

    const { error } = await supabase.auth.updateUser({
      password: input.password,
    });

    if (error) {
      if (error.message.includes('weak')) {
        return { success: false, error: createAuthError('weak_password') };
      }
      return { success: false, error: createAuthError('server_error', error.message) };
    }

    return { success: true };
  } catch (error) {
    console.error('Reset password error:', error);
    return { success: false, error: createAuthError('server_error') };
  }
}

/**
 * Send magic link
 */
export async function sendMagicLink(
  input: MagicLinkInput,
  redirectUrl: string
): Promise<{ success: boolean; error?: AuthError }> {
  try {
    const supabase = getSupabaseClient();

    const { error } = await supabase.auth.signInWithOtp({
      email: input.email,
      options: {
        emailRedirectTo: `${redirectUrl}/auth/callback?type=magiclink`,
      },
    });

    if (error) {
      if (error.message.includes('rate limit')) {
        return { success: false, error: createAuthError('rate_limited') };
      }
      return { success: false, error: createAuthError('server_error', error.message) };
    }

    return { success: true };
  } catch (error) {
    console.error('Magic link error:', error);
    return { success: false, error: createAuthError('server_error') };
  }
}

/**
 * Sign in with OAuth provider
 */
export async function signInWithOAuth(
  provider: OAuthProvider,
  redirectUrl: string
): Promise<{ success: true; url: string } | { success: false; error: AuthError }> {
  try {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${redirectUrl}/auth/callback?type=oauth`,
        queryParams: provider === 'google' ? {
          access_type: 'offline',
          prompt: 'consent',
        } : undefined,
      },
    });

    if (error) {
      return { success: false, error: createAuthError('oauth_error', error.message) };
    }

    return { success: true, url: data.url };
  } catch (error) {
    console.error('OAuth error:', error);
    return { success: false, error: createAuthError('oauth_error') };
  }
}

/**
 * Handle OAuth callback
 */
export async function handleOAuthCallback(
  code: string,
  platform: 'atlvs' | 'compvss' | 'gvteway'
): Promise<{ success: true; data: AuthResponse } | { success: false; error: AuthError }> {
  try {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      return { success: false, error: createAuthError('oauth_error', error.message) };
    }

    // Check if platform user exists, create if not
    const supabaseAdmin = getSupabaseAdmin();
    let { data: platformUser } = await supabaseAdmin
      .from('platform_users')
      .select('*')
      .eq('auth_user_id', data.user.id)
      .single();

    if (!platformUser) {
      // Create platform user for OAuth sign-in
      const { data: newPlatformUser, error: createError } = await supabaseAdmin
        .from('platform_users')
        .insert({
          auth_user_id: data.user.id,
          email: data.user.email || '',
          full_name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0],
          avatar_url: data.user.user_metadata?.avatar_url,
          platform_roles: getDefaultRoles(platform),
          status: 'active',
        })
        .select()
        .single();

      if (createError) {
        console.error('Failed to create platform user:', createError);
        return { success: false, error: createAuthError('server_error') };
      }

      platformUser = newPlatformUser;
    }

    // Get onboarding status
    const { data: profile } = await supabase
      .from('profiles')
      .select('onboarding_completed')
      .eq('id', data.user.id)
      .single();

    return {
      success: true,
      data: {
        user: {
          id: data.user.id,
          email: data.user.email || '',
          fullName: platformUser?.full_name,
          avatarUrl: platformUser?.avatar_url,
          platformRoles: platformUser?.platform_roles || getDefaultRoles(platform),
          organizationId: platformUser?.organization_id,
          onboardingCompleted: profile?.onboarding_completed || false,
        },
        session: {
          accessToken: data.session.access_token,
          refreshToken: data.session.refresh_token,
          expiresAt: data.session.expires_at || 0,
        },
      },
    };
  } catch (error) {
    console.error('OAuth callback error:', error);
    return { success: false, error: createAuthError('oauth_error') };
  }
}

/**
 * Verify email with token
 */
export async function verifyEmail(
  token: string,
  type: string
): Promise<{ success: boolean; error?: AuthError }> {
  try {
    const supabase = getSupabaseClient();

    const { error } = await supabase.auth.verifyOtp({
      token_hash: token,
      type: type as 'signup' | 'email',
    });

    if (error) {
      if (error.message.includes('expired')) {
        return { success: false, error: createAuthError('expired_token') };
      }
      return { success: false, error: createAuthError('invalid_token', error.message) };
    }

    return { success: true };
  } catch (error) {
    console.error('Verify email error:', error);
    return { success: false, error: createAuthError('server_error') };
  }
}

/**
 * Refresh session
 */
export async function refreshSession(
  refreshToken: string
): Promise<{ success: true; data: { accessToken: string; refreshToken: string; expiresAt: number } } | { success: false; error: AuthError }> {
  try {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase.auth.refreshSession({
      refresh_token: refreshToken,
    });

    if (error || !data.session) {
      return { success: false, error: createAuthError('session_expired') };
    }

    return {
      success: true,
      data: {
        accessToken: data.session.access_token,
        refreshToken: data.session.refresh_token,
        expiresAt: data.session.expires_at || 0,
      },
    };
  } catch (error) {
    console.error('Refresh session error:', error);
    return { success: false, error: createAuthError('server_error') };
  }
}

/**
 * Update user profile
 */
export async function updateProfile(
  userId: string,
  input: ProfileSetupInput
): Promise<{ success: boolean; error?: AuthError }> {
  try {
    const supabase = getSupabaseAdmin();

    // Update platform_users
    const { error: platformError } = await supabase
      .from('platform_users')
      .update({
        full_name: `${input.firstName} ${input.lastName}`,
        avatar_url: input.avatarUrl || null,
      })
      .eq('auth_user_id', userId);

    if (platformError) {
      return { success: false, error: createAuthError('server_error', platformError.message) };
    }

    // Update profiles
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        first_name: input.firstName,
        last_name: input.lastName,
        display_name: input.displayName || `${input.firstName} ${input.lastName}`,
        phone: input.phone || null,
        bio: input.bio || null,
        avatar_url: input.avatarUrl || null,
        onboarding_step: 1,
      })
      .eq('id', userId);

    if (profileError) {
      console.error('Profile update error:', profileError);
    }

    return { success: true };
  } catch (error) {
    console.error('Update profile error:', error);
    return { success: false, error: createAuthError('server_error') };
  }
}

/**
 * Update user preferences
 */
export async function updatePreferences(
  userId: string,
  input: PreferencesInput
): Promise<{ success: boolean; error?: AuthError }> {
  try {
    const supabase = getSupabaseAdmin();

    const { error } = await supabase
      .from('user_settings')
      .upsert({
        user_id: userId,
        theme: input.theme,
        language: input.language,
        timezone: input.timezone,
        email_notifications: {
          marketing: input.marketingEmails,
          order_updates: input.emailNotifications,
          event_reminders: input.emailNotifications,
        },
        push_notifications: {
          enabled: input.pushNotifications,
          order_updates: input.pushNotifications,
          event_reminders: input.pushNotifications,
        },
      })
      .eq('user_id', userId);

    if (error) {
      return { success: false, error: createAuthError('server_error', error.message) };
    }

    return { success: true };
  } catch (error) {
    console.error('Update preferences error:', error);
    return { success: false, error: createAuthError('server_error') };
  }
}

/**
 * Complete onboarding
 */
export async function completeOnboarding(
  userId: string
): Promise<{ success: boolean; error?: AuthError }> {
  try {
    const supabase = getSupabaseAdmin();

    const { error } = await supabase
      .from('profiles')
      .update({
        onboarding_completed: true,
        onboarding_step: 5,
      })
      .eq('id', userId);

    if (error) {
      return { success: false, error: createAuthError('server_error', error.message) };
    }

    return { success: true };
  } catch (error) {
    console.error('Complete onboarding error:', error);
    return { success: false, error: createAuthError('server_error') };
  }
}

/**
 * Get current session
 */
export async function getSession(): Promise<{
  user: AuthResponse['user'] | null;
  session: AuthResponse['session'] | null;
}> {
  try {
    const supabase = getSupabaseClient();

    const { data: { session }, error } = await supabase.auth.getSession();

    if (error || !session) {
      return { user: null, session: null };
    }

    const { data: platformUser } = await supabase
      .from('platform_users')
      .select('*')
      .eq('auth_user_id', session.user.id)
      .single();

    const { data: profile } = await supabase
      .from('profiles')
      .select('onboarding_completed')
      .eq('id', session.user.id)
      .single();

    return {
      user: {
        id: session.user.id,
        email: session.user.email || '',
        fullName: platformUser?.full_name,
        avatarUrl: platformUser?.avatar_url,
        platformRoles: platformUser?.platform_roles || [],
        organizationId: platformUser?.organization_id,
        onboardingCompleted: profile?.onboarding_completed || false,
      },
      session: {
        accessToken: session.access_token,
        refreshToken: session.refresh_token,
        expiresAt: session.expires_at || 0,
      },
    };
  } catch (error) {
    console.error('Get session error:', error);
    return { user: null, session: null };
  }
}

// Helper to get default roles for platform
function getDefaultRoles(platform: 'atlvs' | 'compvss' | 'gvteway'): string[] {
  switch (platform) {
    case 'atlvs':
      return ['ATLVS_VIEWER'];
    case 'compvss':
      return ['COMPVSS_VIEWER'];
    case 'gvteway':
      return ['GVTEWAY_MEMBER'];
    default:
      return ['GVTEWAY_MEMBER'];
  }
}
