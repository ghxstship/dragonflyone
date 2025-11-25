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
      .eq('provider_type', 'saml')
      .eq('is_enabled', true)
      .single();

    if (providerError || !provider) {
      return NextResponse.json(
        { error: 'SSO provider not found or not enabled' },
        { status: 404 }
      );
    }

    // Generate SAML AuthnRequest
    const requestId = `_${crypto.randomBytes(16).toString('hex')}`;
    const issueInstant = new Date().toISOString();
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://atlvs.ghxstship.com';
    const acsUrl = `${baseUrl}/api/sso/saml/callback`;

    // Store the auth request for later validation
    const relayState = crypto.randomBytes(16).toString('hex');
    await supabase.from('sso_auth_requests').insert({
      provider_id: provider.id,
      request_id: requestId,
      relay_state: relayState,
      redirect_uri,
      expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 minutes
    });

    // Build SAML AuthnRequest XML
    const authnRequest = `
      <samlp:AuthnRequest
        xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol"
        xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion"
        ID="${requestId}"
        Version="2.0"
        IssueInstant="${issueInstant}"
        Destination="${provider.saml_sso_url}"
        AssertionConsumerServiceURL="${acsUrl}"
        ProtocolBinding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST">
        <saml:Issuer>${baseUrl}</saml:Issuer>
        <samlp:NameIDPolicy
          Format="${provider.saml_name_id_format}"
          AllowCreate="true"/>
      </samlp:AuthnRequest>
    `.trim();

    // Encode the request
    const encodedRequest = Buffer.from(authnRequest).toString('base64');

    // Build redirect URL
    const ssoUrl = new URL(provider.saml_sso_url);
    ssoUrl.searchParams.set('SAMLRequest', encodedRequest);
    ssoUrl.searchParams.set('RelayState', relayState);

    // Log the login initiation
    await supabase.rpc('log_sso_event', {
      p_provider_id: provider.id,
      p_user_id: null,
      p_event_type: 'login_initiated',
      p_event_details: { request_id: requestId },
      p_ip_address: request.headers.get('x-forwarded-for'),
      p_user_agent: request.headers.get('user-agent'),
    });

    return NextResponse.redirect(ssoUrl.toString());
  } catch (error) {
    console.error('SAML login error:', error);
    return NextResponse.json(
      { error: 'SAML login failed' },
      { status: 500 }
    );
  }
}
