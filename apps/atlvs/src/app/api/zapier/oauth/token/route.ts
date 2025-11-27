import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import crypto from 'crypto';

function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export async function POST(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const body = await request.formData();
    const grant_type = body.get('grant_type') as string;
    const client_id = body.get('client_id') as string;
    const client_secret = body.get('client_secret') as string;
    const code = body.get('code') as string;
    const redirect_uri = body.get('redirect_uri') as string;
    const refresh_token = body.get('refresh_token') as string;

    // Validate client credentials
    const { data: oauthClient } = await supabase
      .from('oauth_clients')
      .select('id, client_secret_hash')
      .eq('client_id', client_id)
      .eq('is_active', true)
      .single();

    if (!oauthClient) {
      return NextResponse.json(
        { error: 'invalid_client', error_description: 'Unknown client' },
        { status: 401 }
      );
    }

    // Verify client secret
    const secretHash = crypto.createHash('sha256').update(client_secret).digest('hex');
    if (secretHash !== oauthClient.client_secret_hash) {
      return NextResponse.json(
        { error: 'invalid_client', error_description: 'Invalid client credentials' },
        { status: 401 }
      );
    }

    if (grant_type === 'authorization_code') {
      // Exchange authorization code for tokens
      const { data: authCode, error: codeError } = await supabase
        .from('oauth_authorization_codes')
        .select('*')
        .eq('code', code)
        .eq('client_id', oauthClient.id)
        .eq('redirect_uri', redirect_uri)
        .gt('expires_at', new Date().toISOString())
        .is('used_at', null)
        .single();

      if (codeError || !authCode) {
        return NextResponse.json(
          { error: 'invalid_grant', error_description: 'Invalid or expired authorization code' },
          { status: 400 }
        );
      }

      // Mark code as used
      await supabase
        .from('oauth_authorization_codes')
        .update({ used_at: new Date().toISOString() })
        .eq('id', authCode.id);

      // Generate tokens
      const accessToken = generateToken();
      const newRefreshToken = generateToken();
      const expiresIn = 3600; // 1 hour
      const refreshExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

      // Store tokens
      await supabase.from('oauth_access_tokens').insert({
        token_hash: crypto.createHash('sha256').update(accessToken).digest('hex'),
        client_id: oauthClient.id,
        user_id: authCode.user_id,
        scope: authCode.scope,
        expires_at: new Date(Date.now() + expiresIn * 1000).toISOString(),
      });

      await supabase.from('oauth_refresh_tokens').insert({
        token_hash: crypto.createHash('sha256').update(newRefreshToken).digest('hex'),
        client_id: oauthClient.id,
        user_id: authCode.user_id,
        scope: authCode.scope,
        expires_at: refreshExpiresAt.toISOString(),
      });

      return NextResponse.json({
        access_token: accessToken,
        token_type: 'Bearer',
        expires_in: expiresIn,
        refresh_token: newRefreshToken,
        scope: authCode.scope,
      });
    } else if (grant_type === 'refresh_token') {
      // Refresh access token
      const tokenHash = crypto.createHash('sha256').update(refresh_token).digest('hex');
      
      const { data: storedToken, error: tokenError } = await supabase
        .from('oauth_refresh_tokens')
        .select('*')
        .eq('token_hash', tokenHash)
        .eq('client_id', oauthClient.id)
        .gt('expires_at', new Date().toISOString())
        .is('revoked_at', null)
        .single();

      if (tokenError || !storedToken) {
        return NextResponse.json(
          { error: 'invalid_grant', error_description: 'Invalid or expired refresh token' },
          { status: 400 }
        );
      }

      // Generate new access token
      const accessToken = generateToken();
      const expiresIn = 3600;

      await supabase.from('oauth_access_tokens').insert({
        token_hash: crypto.createHash('sha256').update(accessToken).digest('hex'),
        client_id: oauthClient.id,
        user_id: storedToken.user_id,
        scope: storedToken.scope,
        expires_at: new Date(Date.now() + expiresIn * 1000).toISOString(),
      });

      return NextResponse.json({
        access_token: accessToken,
        token_type: 'Bearer',
        expires_in: expiresIn,
        scope: storedToken.scope,
      });
    } else {
      return NextResponse.json(
        { error: 'unsupported_grant_type', error_description: 'Grant type not supported' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('OAuth token error:', error);
    return NextResponse.json(
      { error: 'server_error', error_description: 'Internal server error' },
      { status: 500 }
    );
  }
}
