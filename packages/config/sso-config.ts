/**
 * SSO/SAML Configuration for Enterprise Authentication
 * Implements Single Sign-On capabilities using Supabase Auth
 */

import { createClient } from '@supabase/supabase-js';

// =============================================================================
// TYPES
// =============================================================================

export type SSOProvider = 'saml' | 'oidc' | 'azure' | 'okta' | 'google-workspace';

export interface SSOProviderConfig {
  /** Provider type */
  type: SSOProvider;
  /** Provider display name */
  displayName: string;
  /** Provider identifier (domain or entity ID) */
  identifier: string;
  /** Whether provider is enabled */
  enabled: boolean;
  /** Provider-specific metadata */
  metadata?: Record<string, unknown>;
}

export interface SAMLConfig {
  /** SAML Entity ID */
  entityId: string;
  /** Assertion Consumer Service URL */
  acsUrl: string;
  /** Single Logout URL */
  sloUrl?: string;
  /** Identity Provider Metadata URL */
  idpMetadataUrl?: string;
  /** Identity Provider Certificate */
  idpCertificate?: string;
  /** Attribute mappings */
  attributeMapping?: {
    email?: string;
    firstName?: string;
    lastName?: string;
    groups?: string;
  };
}

export interface OIDCConfig {
  /** OIDC Client ID */
  clientId: string;
  /** OIDC Client Secret */
  clientSecret: string;
  /** OIDC Issuer URL */
  issuerUrl: string;
  /** Scopes to request */
  scopes?: string[];
  /** Claim mappings */
  claimMapping?: {
    email?: string;
    name?: string;
    groups?: string;
  };
}

export interface SSOSession {
  /** Session ID */
  id: string;
  /** User ID */
  userId: string;
  /** SSO Provider used */
  provider: SSOProvider;
  /** Provider session ID */
  providerSessionId?: string;
  /** Session expiry */
  expiresAt: Date;
  /** Organization ID */
  organizationId: string;
}

export interface SSOLoginResult {
  success: boolean;
  redirectUrl?: string;
  error?: string;
  session?: SSOSession;
}

// =============================================================================
// SSO PROVIDER REGISTRY
// =============================================================================

/**
 * Registry of supported SSO providers
 */
export const SSO_PROVIDERS: Record<SSOProvider, { name: string; icon: string; description: string }> = {
  saml: {
    name: 'SAML 2.0',
    icon: 'Shield',
    description: 'Enterprise SAML 2.0 Single Sign-On',
  },
  oidc: {
    name: 'OpenID Connect',
    icon: 'Key',
    description: 'OpenID Connect (OIDC) authentication',
  },
  azure: {
    name: 'Microsoft Entra ID',
    icon: 'Building2',
    description: 'Microsoft Azure Active Directory / Entra ID',
  },
  okta: {
    name: 'Okta',
    icon: 'Shield',
    description: 'Okta Identity Provider',
  },
  'google-workspace': {
    name: 'Google Workspace',
    icon: 'Mail',
    description: 'Google Workspace SSO',
  },
};

// =============================================================================
// SSO CONFIGURATION HELPERS
// =============================================================================

/**
 * Get SSO configuration for an organization
 */
export async function getOrganizationSSOConfig(
  supabaseUrl: string,
  supabaseKey: string,
  organizationId: string
): Promise<SSOProviderConfig | null> {
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  const { data, error } = await supabase
    .from('organization_sso_configs')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('enabled', true)
    .single();
  
  if (error || !data) {
    return null;
  }
  
  return {
    type: data.provider_type as SSOProvider,
    displayName: data.display_name,
    identifier: data.identifier,
    enabled: data.enabled,
    metadata: data.metadata,
  };
}

/**
 * Check if email domain has SSO configured
 */
export async function checkDomainSSO(
  supabaseUrl: string,
  supabaseKey: string,
  email: string
): Promise<SSOProviderConfig | null> {
  const domain = email.split('@')[1];
  if (!domain) return null;
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  const { data, error } = await supabase
    .from('organization_sso_configs')
    .select('*, organizations!inner(domain)')
    .eq('organizations.domain', domain)
    .eq('enabled', true)
    .single();
  
  if (error || !data) {
    return null;
  }
  
  return {
    type: data.provider_type as SSOProvider,
    displayName: data.display_name,
    identifier: data.identifier,
    enabled: data.enabled,
    metadata: data.metadata,
  };
}

// =============================================================================
// SSO LOGIN FLOW
// =============================================================================

/**
 * Initiate SSO login flow
 */
export async function initiateSSOLogin(
  supabaseUrl: string,
  supabaseKey: string,
  config: SSOProviderConfig,
  redirectTo: string
): Promise<SSOLoginResult> {
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    // For SAML, use Supabase's built-in SAML support
    if (config.type === 'saml') {
      const { data, error } = await supabase.auth.signInWithSSO({
        domain: config.identifier,
        options: {
          redirectTo,
        },
      });
      
      if (error) {
        return { success: false, error: error.message };
      }
      
      return {
        success: true,
        redirectUrl: data.url,
      };
    }
    
    // For OIDC providers
    if (config.type === 'oidc' || config.type === 'azure' || config.type === 'okta') {
      const { data, error } = await supabase.auth.signInWithSSO({
        domain: config.identifier,
        options: {
          redirectTo,
        },
      });
      
      if (error) {
        return { success: false, error: error.message };
      }
      
      return {
        success: true,
        redirectUrl: data.url,
      };
    }
    
    // For Google Workspace
    if (config.type === 'google-workspace') {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          queryParams: {
            hd: config.identifier, // Restrict to workspace domain
          },
        },
      });
      
      if (error) {
        return { success: false, error: error.message };
      }
      
      return {
        success: true,
        redirectUrl: data.url,
      };
    }
    
    return { success: false, error: 'Unsupported SSO provider' };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'SSO login failed';
    return { success: false, error: message };
  }
}

/**
 * Handle SSO callback
 */
export async function handleSSOCallback(
  supabaseUrl: string,
  supabaseKey: string,
  code: string
): Promise<SSOLoginResult> {
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (error) {
      return { success: false, error: error.message };
    }
    
    if (!data.session) {
      return { success: false, error: 'No session returned' };
    }
    
    return {
      success: true,
      session: {
        id: data.session.access_token,
        userId: data.session.user.id,
        provider: (data.session.user.app_metadata?.provider as SSOProvider) || 'saml',
        expiresAt: new Date(data.session.expires_at || Date.now() + 3600000),
        organizationId: data.session.user.user_metadata?.organization_id || '',
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'SSO callback failed';
    return { success: false, error: message };
  }
}

// =============================================================================
// SSO MANAGEMENT
// =============================================================================

/**
 * Create or update SSO configuration for an organization
 */
export async function upsertSSOConfig(
  supabaseUrl: string,
  supabaseServiceKey: string,
  organizationId: string,
  config: Omit<SSOProviderConfig, 'enabled'> & { 
    samlConfig?: SAMLConfig;
    oidcConfig?: OIDCConfig;
  }
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  try {
    const { error } = await supabase
      .from('organization_sso_configs')
      .upsert({
        organization_id: organizationId,
        provider_type: config.type,
        display_name: config.displayName,
        identifier: config.identifier,
        enabled: true,
        metadata: {
          ...config.metadata,
          samlConfig: config.samlConfig,
          oidcConfig: config.oidcConfig,
        },
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'organization_id',
      });
    
    if (error) {
      return { success: false, error: error.message };
    }
    
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to save SSO config';
    return { success: false, error: message };
  }
}

/**
 * Disable SSO for an organization
 */
export async function disableSSOConfig(
  supabaseUrl: string,
  supabaseServiceKey: string,
  organizationId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  try {
    const { error } = await supabase
      .from('organization_sso_configs')
      .update({
        enabled: false,
        updated_at: new Date().toISOString(),
      })
      .eq('organization_id', organizationId);
    
    if (error) {
      return { success: false, error: error.message };
    }
    
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to disable SSO';
    return { success: false, error: message };
  }
}

// =============================================================================
// SSO VALIDATION
// =============================================================================

/**
 * Validate SAML configuration
 */
export function validateSAMLConfig(config: SAMLConfig): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!config.entityId) {
    errors.push('Entity ID is required');
  }
  
  if (!config.acsUrl) {
    errors.push('Assertion Consumer Service URL is required');
  } else if (!config.acsUrl.startsWith('https://')) {
    errors.push('ACS URL must use HTTPS');
  }
  
  if (!config.idpMetadataUrl && !config.idpCertificate) {
    errors.push('Either IDP Metadata URL or IDP Certificate is required');
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate OIDC configuration
 */
export function validateOIDCConfig(config: OIDCConfig): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!config.clientId) {
    errors.push('Client ID is required');
  }
  
  if (!config.clientSecret) {
    errors.push('Client Secret is required');
  }
  
  if (!config.issuerUrl) {
    errors.push('Issuer URL is required');
  } else if (!config.issuerUrl.startsWith('https://')) {
    errors.push('Issuer URL must use HTTPS');
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}
