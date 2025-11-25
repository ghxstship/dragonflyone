import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const consentSchema = z.object({
  consent_type: z.enum([
    'marketing_email', 'marketing_sms', 'marketing_push',
    'analytics', 'personalization', 'third_party_sharing',
    'terms_of_service', 'privacy_policy', 'cookie_policy'
  ]),
  is_granted: z.boolean(),
  source: z.string().max(100),
  legal_basis: z.enum(['consent', 'contract', 'legal_obligation', 'vital_interests', 'public_task', 'legitimate_interests']).optional(),
  policy_version: z.string().max(50).optional(),
});

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
      .select('id')
      .eq('auth_user_id', user.id)
      .single();

    if (!platformUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { data, error } = await supabase
      .from('consent_records')
      .select('*')
      .eq('user_id', platformUser.id)
      .order('consent_type');

    if (error) throw error;

    // Group by consent type for easier consumption
    const consentMap = (data || []).reduce((acc, record) => {
      acc[record.consent_type] = {
        is_granted: record.is_granted,
        granted_at: record.granted_at,
        revoked_at: record.revoked_at,
        policy_version: record.policy_version,
      };
      return acc;
    }, {} as Record<string, unknown>);

    return NextResponse.json({ data: consentMap, records: data });
  } catch (error) {
    console.error('Get consent error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch consent records' },
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
      .select('id')
      .eq('auth_user_id', user.id)
      .single();

    if (!platformUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const validated = consentSchema.parse(body);

    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip');
    const userAgent = request.headers.get('user-agent');

    // Upsert consent record
    const { data, error } = await supabase
      .from('consent_records')
      .upsert({
        user_id: platformUser.id,
        consent_type: validated.consent_type,
        is_granted: validated.is_granted,
        granted_at: validated.is_granted ? new Date().toISOString() : null,
        revoked_at: !validated.is_granted ? new Date().toISOString() : null,
        source: validated.source,
        legal_basis: validated.legal_basis,
        policy_version: validated.policy_version,
        ip_address: ipAddress,
        user_agent: userAgent,
      }, {
        onConflict: 'user_id,consent_type',
      })
      .select()
      .single();

    if (error) throw error;

    // Log the action
    await supabase.rpc('log_privacy_action', {
      p_organization_id: null,
      p_user_id: platformUser.id,
      p_action_type: validated.is_granted ? 'consent_granted' : 'consent_revoked',
      p_entity_type: 'consent_records',
      p_entity_id: data.id,
      p_details: { consent_type: validated.consent_type },
      p_ip_address: ipAddress,
      p_user_agent: userAgent,
    });

    return NextResponse.json({ data });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Update consent error:', error);
    return NextResponse.json(
      { error: 'Failed to update consent' },
      { status: 500 }
    );
  }
}
