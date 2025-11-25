import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const client_id = searchParams.get('client_id');
    const redirect_uri = searchParams.get('redirect_uri');
    const state = searchParams.get('state');
    const response_type = searchParams.get('response_type');
    const scope = searchParams.get('scope');

    // Validate required parameters
    if (!client_id || !redirect_uri || !response_type) {
      return NextResponse.json(
        { error: 'invalid_request', error_description: 'Missing required parameters' },
        { status: 400 }
      );
    }

    if (response_type !== 'code') {
      return NextResponse.json(
        { error: 'unsupported_response_type', error_description: 'Only code response type is supported' },
        { status: 400 }
      );
    }

    // Validate client_id
    const { data: oauthClient } = await supabase
      .from('oauth_clients')
      .select('id, name, redirect_uris, allowed_scopes')
      .eq('client_id', client_id)
      .eq('is_active', true)
      .single();

    if (!oauthClient) {
      return NextResponse.json(
        { error: 'invalid_client', error_description: 'Unknown client' },
        { status: 401 }
      );
    }

    // Validate redirect_uri
    const allowedRedirects = oauthClient.redirect_uris || [];
    if (!allowedRedirects.includes(redirect_uri)) {
      return NextResponse.json(
        { error: 'invalid_request', error_description: 'Invalid redirect_uri' },
        { status: 400 }
      );
    }

    // Validate scopes
    const requestedScopes = scope?.split(' ') || ['read'];
    const allowedScopes = oauthClient.allowed_scopes || ['read'];
    const invalidScopes = requestedScopes.filter(s => !allowedScopes.includes(s));
    
    if (invalidScopes.length > 0) {
      return NextResponse.json(
        { error: 'invalid_scope', error_description: `Invalid scopes: ${invalidScopes.join(', ')}` },
        { status: 400 }
      );
    }

    // Generate authorization code
    const authCode = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store authorization code
    await supabase.from('oauth_authorization_codes').insert({
      code: authCode,
      client_id: oauthClient.id,
      redirect_uri,
      scope: requestedScopes.join(' '),
      state,
      expires_at: expiresAt.toISOString(),
    });

    // Build redirect URL with authorization code
    const redirectUrl = new URL(redirect_uri);
    redirectUrl.searchParams.set('code', authCode);
    if (state) {
      redirectUrl.searchParams.set('state', state);
    }

    // In production, this would redirect to a login/consent page first
    // For now, we'll redirect directly (assuming user is authenticated)
    return NextResponse.redirect(redirectUrl.toString());
  } catch (error) {
    console.error('OAuth authorize error:', error);
    return NextResponse.json(
      { error: 'server_error', error_description: 'Internal server error' },
      { status: 500 }
    );
  }
}
