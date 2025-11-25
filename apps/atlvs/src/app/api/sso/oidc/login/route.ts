import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function generateCodeVerifier(): string {
  return crypto.randomBytes(32).toString('base64url');
}

function generateCodeChallenge(verifier: string): string {
  return crypto.createHash('sha256').update(verifier).digest('base64url');
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const provider_id = searchParams.get('provider_id');
    const redirect_uri = searchParams.get('redirect_uri') || '/';

    if (!provider_id) {
      return NextResponse.json(
        { error: 'provider_id is required' },
        { status: 400 }
      );
    }

    // Get provider configuration
    const { data: provider, error: providerError } = await supabase
      .from('sso_providers')
      .select('*')
      .eq('id', provider_id)
      .eq('provider_type', 'oidc')
      .eq('is_enabled', true)
      .single();

    if (providerError || !provider) {
      return NextResponse.json(
        { error: 'SSO provider not found or not enabled' },
        { status: 404 }
      );
    }

    // Generate PKCE values
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = generateCodeChallenge(codeVerifier);
    const state = crypto.randomBytes(16).toString('hex');
    const nonce = crypto.randomBytes(16).toString('hex');

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://atlvs.ghxstship.com';
    const callbackUrl = `${baseUrl}/api/sso/oidc/callback`;

    // Store the auth request for later validation
    await supabase.from('sso_auth_requests').insert({
      provider_id: provider.id,
      request_id: state,
      redirect_uri,
      state,
      nonce,
      code_verifier: codeVerifier,
      expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 minutes
    });

    // Determine authorization endpoint
    let authorizationEndpoint = provider.oidc_authorization_endpoint;
    
    // If not explicitly set, try to discover from issuer
    if (!authorizationEndpoint && provider.oidc_issuer) {
      authorizationEndpoint = `${provider.oidc_issuer}/authorize`;
    }

    // Build authorization URL
    const authUrl = new URL(authorizationEndpoint);
    authUrl.searchParams.set('client_id', provider.oidc_client_id);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('redirect_uri', callbackUrl);
    authUrl.searchParams.set('scope', (provider.oidc_scopes || ['openid', 'email', 'profile']).join(' '));
    authUrl.searchParams.set('state', state);
    authUrl.searchParams.set('nonce', nonce);
    authUrl.searchParams.set('code_challenge', codeChallenge);
    authUrl.searchParams.set('code_challenge_method', 'S256');

    // Log the login initiation
    await supabase.rpc('log_sso_event', {
      p_provider_id: provider.id,
      p_user_id: null,
      p_event_type: 'login_initiated',
      p_event_details: { state },
      p_ip_address: request.headers.get('x-forwarded-for'),
      p_user_agent: request.headers.get('user-agent'),
    });

    return NextResponse.redirect(authUrl.toString());
  } catch (error) {
    console.error('OIDC login error:', error);
    return NextResponse.json(
      { error: 'OIDC login failed' },
      { status: 500 }
    );
  }
}
