import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const samlProviderSchema = z.object({
  provider_type: z.literal('saml'),
  name: z.string().min(1).max(255),
  saml_entity_id: z.string().url(),
  saml_sso_url: z.string().url(),
  saml_slo_url: z.string().url().optional(),
  saml_certificate: z.string(),
  saml_signature_algorithm: z.enum(['sha256', 'sha512']).default('sha256'),
  attribute_mapping: z.record(z.string()).optional(),
  role_mapping: z.record(z.string()).optional(),
  default_role: z.string().default('ATLVS_VIEWER'),
  auto_provision_users: z.boolean().default(true),
  require_sso: z.boolean().default(false),
});

const oidcProviderSchema = z.object({
  provider_type: z.literal('oidc'),
  name: z.string().min(1).max(255),
  oidc_issuer: z.string().url(),
  oidc_client_id: z.string(),
  oidc_client_secret: z.string(),
  oidc_scopes: z.array(z.string()).default(['openid', 'email', 'profile']),
  attribute_mapping: z.record(z.string()).optional(),
  role_mapping: z.record(z.string()).optional(),
  default_role: z.string().default('ATLVS_VIEWER'),
  auto_provision_users: z.boolean().default(true),
  require_sso: z.boolean().default(false),
});

const providerSchema = z.discriminatedUnion('provider_type', [
  samlProviderSchema,
  oidcProviderSchema,
]);

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: platformUser } = await supabase
      .from('platform_users')
      .select('id, organization_id, platform_roles')
      .eq('auth_user_id', user.id)
      .single();

    if (!platformUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check admin access
    const isAdmin = platformUser.platform_roles?.some((role: string) =>
      ['ATLVS_ADMIN', 'LEGEND_ADMIN', 'LEGEND_SUPER_ADMIN'].includes(role)
    );

    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data, error } = await supabase
      .from('sso_providers')
      .select(`
        id, organization_id, provider_type, name, is_enabled, is_default,
        saml_entity_id, saml_sso_url, saml_slo_url,
        oidc_issuer, oidc_client_id, oidc_scopes,
        attribute_mapping, role_mapping, default_role,
        auto_provision_users, auto_update_user_info, require_sso,
        allowed_domains, created_at, updated_at
      `)
      .eq('organization_id', platformUser.organization_id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Get SSO providers error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch SSO providers' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: platformUser } = await supabase
      .from('platform_users')
      .select('id, organization_id, platform_roles')
      .eq('auth_user_id', user.id)
      .single();

    if (!platformUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const isAdmin = platformUser.platform_roles?.some((role: string) =>
      ['ATLVS_ADMIN', 'LEGEND_SUPER_ADMIN'].includes(role)
    );

    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const validated = providerSchema.parse(body);

    // Prepare insert data
    const insertData: Record<string, unknown> = {
      organization_id: platformUser.organization_id,
      provider_type: validated.provider_type,
      name: validated.name,
      attribute_mapping: validated.attribute_mapping || {},
      role_mapping: validated.role_mapping || {},
      default_role: validated.default_role,
      auto_provision_users: validated.auto_provision_users,
      require_sso: validated.require_sso,
      created_by: platformUser.id,
    };

    if (validated.provider_type === 'saml') {
      insertData.saml_entity_id = validated.saml_entity_id;
      insertData.saml_sso_url = validated.saml_sso_url;
      insertData.saml_slo_url = validated.saml_slo_url;
      insertData.saml_certificate = validated.saml_certificate;
      insertData.saml_signature_algorithm = validated.saml_signature_algorithm;
    } else {
      insertData.oidc_issuer = validated.oidc_issuer;
      insertData.oidc_client_id = validated.oidc_client_id;
      // In production, encrypt the client secret
      insertData.oidc_client_secret_encrypted = validated.oidc_client_secret;
      insertData.oidc_scopes = validated.oidc_scopes;
    }

    const { data, error } = await supabase
      .from('sso_providers')
      .insert(insertData)
      .select()
      .single();

    if (error) throw error;

    // Log the event
    await supabase.rpc('log_sso_event', {
      p_provider_id: data.id,
      p_user_id: platformUser.id,
      p_event_type: 'config_updated',
      p_event_details: { action: 'created' },
    });

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Create SSO provider error:', error);
    return NextResponse.json(
      { error: 'Failed to create SSO provider' },
      { status: 500 }
    );
  }
}
