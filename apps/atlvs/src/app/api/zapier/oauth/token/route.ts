export const dynamic = 'force-dynamic';

import { withAuth, PlatformRole } from '@ghxstship/config';
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import crypto from 'crypto';
import { z } from 'zod';

const oauthTokenSchema = z.object({
  grant_type: z.enum(['authorization_code', 'refresh_token']),
  client_id: z.string().min(1),
  client_secret: z.string().min(1),
  code: z.string().optional(),
  redirect_uri: z.string().optional(),
  refresh_token: z.string().optional(),
});

function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

const ATLVS_ROLES = [
  PlatformRole.ATLVS_SUPER_ADMIN, PlatformRole.ATLVS_ADMIN, PlatformRole.ATLVS_TEAM_MEMBER, PlatformRole.ATLVS_VIEWER,
  PlatformRole.LEGEND_SUPER_ADMIN, PlatformRole.LEGEND_ADMIN, PlatformRole.LEGEND_DEVELOPER,
];

export async function POST(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.formData();
    const formObject = {
      grant_type: body.get('grant_type') as string,
      client_id: body.get('client_id') as string,
      client_secret: body.get('client_secret') as string,
      code: body.get('code') as string | undefined,
      redirect_uri: body.get('redirect_uri') as string | undefined,
      refresh_token: body.get('refresh_token') as string | undefined,
    };
    const validatedData = oauthTokenSchema.parse(formObject);
    const { grant_type, client_id, client_secret, code, redirect_uri, refresh_token } = validatedData;

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
      if (!code || !redirect_uri) {
        return NextResponse.json(
          { error: 'invalid_request', error_description: 'Code and redirect_uri required for authorization_code grant' },
          { status: 400 }
        );
      }
      // Exchange authorization code for tokens
      const { data: authCode, error: codeError } = await supabase
        .from('oauth_authorization_codes')
        .select('*')
        .eq('code_hash', crypto.createHash('sha256').update(code).digest('hex'))
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
      const scopes = authCode.scopes?.join(' ') || '';

      // Store tokens
      await supabase.from('oauth_access_tokens').insert({
        token_hash: crypto.createHash('sha256').update(accessToken).digest('hex'),
        client_id: oauthClient.id,
        user_id: authCode.user_id,
        scopes: authCode.scopes,
        expires_at: new Date(Date.now() + expiresIn * 1000).toISOString(),
      } as never);

      await supabase.from('oauth_refresh_tokens').insert({
        token_hash: crypto.createHash('sha256').update(newRefreshToken).digest('hex'),
        access_token_id: null,
        expires_at: refreshExpiresAt.toISOString(),
      } as never);

      return NextResponse.json({
        access_token: accessToken,
        token_type: 'Bearer',
        expires_in: expiresIn,
        refresh_token: newRefreshToken,
        scope: scopes,
      });
    } else if (grant_type === 'refresh_token') {
      if (!refresh_token) {
        return NextResponse.json(
          { error: 'invalid_request', error_description: 'Refresh token required' },
          { status: 400 }
        );
      }
      // Refresh access token
      const tokenHash = crypto.createHash('sha256').update(refresh_token).digest('hex');
      
      const { data: storedToken, error: tokenError } = await supabase
        .from('oauth_refresh_tokens')
        .select('*, access_token:oauth_access_tokens(user_id, scopes)')
        .eq('token_hash', tokenHash)
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
      const accessTokenData = storedToken.access_token as { user_id: string; scopes: string[] } | null;
      const scopes = accessTokenData?.scopes?.join(' ') || '';

      await supabase.from('oauth_access_tokens').insert({
        token_hash: crypto.createHash('sha256').update(accessToken).digest('hex'),
        client_id: oauthClient.id,
        user_id: accessTokenData?.user_id,
        scopes: accessTokenData?.scopes,
        expires_at: new Date(Date.now() + expiresIn * 1000).toISOString(),
      } as never);

      return NextResponse.json({
        access_token: accessToken,
        token_type: 'Bearer',
        expires_in: expiresIn,
        scope: scopes,
      });
    } else {
      return NextResponse.json(
        { error: 'unsupported_grant_type', error_description: 'Grant type not supported' },
        { status: 400 }
      );
    }
  } catch (error) {
    logger.error('OAuth token error:', error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json(
      { error: 'server_error', error_description: 'Internal server error' },
      { status: 500 }
    );
  }
}
