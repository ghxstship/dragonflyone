export const dynamic = 'force-dynamic';

import { withAuth, PlatformRole } from '@ghxstship/config';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const SUPPORTED_PROVIDERS = [
  { id: 'quickbooks', name: 'QuickBooks', category: 'accounting', icon: 'receipt' },
  { id: 'xero', name: 'Xero', category: 'accounting', icon: 'receipt' },
  { id: 'stripe', name: 'Stripe', category: 'payments', icon: 'credit-card' },
  { id: 'mailchimp', name: 'Mailchimp', category: 'marketing', icon: 'mail' },
  { id: 'google_calendar', name: 'Google Calendar', category: 'calendar', icon: 'calendar' },
  { id: 'slack', name: 'Slack', category: 'communication', icon: 'message-square' },
  { id: 'zapier', name: 'Zapier', category: 'automation', icon: 'zap' },
];

const connectIntegrationSchema = z.object({
  organization_id: z.string().uuid(),
  provider: z.string().min(1),
  credentials: z.record(z.unknown()).optional(),
  settings: z.record(z.unknown()).optional(),
  scopes: z.array(z.string()).optional(),
});

const ATLVS_ROLES = [
  PlatformRole.ATLVS_SUPER_ADMIN, PlatformRole.ATLVS_ADMIN, PlatformRole.ATLVS_TEAM_MEMBER, PlatformRole.ATLVS_VIEWER,
  PlatformRole.LEGEND_SUPER_ADMIN, PlatformRole.LEGEND_ADMIN, PlatformRole.LEGEND_DEVELOPER,
];

export async function GET(request: NextRequest) {
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { searchParams } = new URL(request.url);

    const orgId = searchParams.get('organization_id');
    const includeAvailable = searchParams.get('include_available') === 'true';

    if (!orgId) {
      return NextResponse.json({ error: 'organization_id required' }, { status: 400 });
    }

    const { data: connected, error } = await supabase
      .from('integrations')
      .select('*')
      .eq('organization_id', orgId)
      .order('provider');

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const connectedProviders = new Set((connected || []).map(i => i.provider));

    const result: Record<string, unknown> = {
      connected: connected || [],
    };

    if (includeAvailable) {
      result.available = SUPPORTED_PROVIDERS.filter(p => !connectedProviders.has(p.id));
      result.all_providers = SUPPORTED_PROVIDERS;
    }

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const body = await request.json();
    const payload = connectIntegrationSchema.parse(body);

    const provider = SUPPORTED_PROVIDERS.find(p => p.id === payload.provider);
    if (!provider) {
      return NextResponse.json({ error: 'Unsupported provider' }, { status: 400 });
    }

    const { data: existing } = await supabase
      .from('integrations')
      .select('id')
      .eq('organization_id', payload.organization_id)
      .eq('provider', payload.provider)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ error: 'Integration already exists' }, { status: 409 });
    }

    const { data, error } = await supabase
      .from('integrations')
      .insert({
        organization_id: payload.organization_id,
        provider: payload.provider,
        provider_display_name: provider.name,
        credentials: payload.credentials || {},
        settings: payload.settings || {},
        scopes: payload.scopes || [],
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ integration: data }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 422 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
