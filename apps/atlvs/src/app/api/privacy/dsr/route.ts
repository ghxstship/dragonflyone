import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { z } from 'zod';

const dsrSchema = z.object({
  request_type: z.enum([
    'access', 'rectification', 'erasure', 'restriction',
    'portability', 'objection', 'automated_decision_opt_out'
  ]),
  ccpa_request_type: z.enum([
    'know', 'delete', 'opt_out_sale', 'opt_in_sale', 'non_discrimination'
  ]).optional(),
  description: z.string().optional(),
  verification_method: z.enum(['email', 'id_document', 'account_login', 'other']).optional(),
});

export async function GET(request: NextRequest) {
  const supabase = createAdminClient();
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
      .select('id, organization_id, platform_roles, email, full_name')
      .eq('auth_user_id', user.id)
      .single();

    if (!platformUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const my_requests = searchParams.get('my_requests') === 'true';

    const isAdmin = platformUser.platform_roles?.some((role: string) =>
      ['ATLVS_ADMIN', 'LEGEND_SUPER_ADMIN'].includes(role)
    );

    let query = supabase
      .from('data_subject_requests')
      .select(`
        *,
        requester:platform_users!user_id(id, full_name, email),
        assignee:platform_users!assigned_to(id, full_name),
        verifier:platform_users!verified_by(id, full_name),
        completer:platform_users!completed_by(id, full_name)
      `);

    if (my_requests || !isAdmin) {
      query = query.eq('user_id', platformUser.id);
    } else if (platformUser.organization_id) {
      query = query.eq('organization_id', platformUser.organization_id);
    }

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Get DSR error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data subject requests' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const supabase = createAdminClient();
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
      .select('id, organization_id, email, full_name')
      .eq('auth_user_id', user.id)
      .single();

    if (!platformUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const validated = dsrSchema.parse(body);

    // Calculate deadline (GDPR: 30 days, CCPA: 45 days)
    const deadlineDays = validated.ccpa_request_type ? 45 : 30;
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + deadlineDays);

    const { data, error } = await supabase
      .from('data_subject_requests')
      .insert({
        organization_id: platformUser.organization_id,
        user_id: platformUser.id,
        email: platformUser.email,
        full_name: platformUser.full_name,
        request_type: validated.request_type,
        ccpa_request_type: validated.ccpa_request_type,
        description: validated.description,
        verification_method: validated.verification_method || 'account_login',
        verified_at: new Date().toISOString(), // Auto-verified for logged-in users
        deadline_at: deadline.toISOString(),
        status: 'verified',
      })
      .select()
      .single();

    if (error) throw error;

    // Log the action
    await supabase.rpc('log_privacy_action', {
      p_organization_id: platformUser.organization_id,
      p_user_id: platformUser.id,
      p_action_type: 'dsr_created',
      p_entity_type: 'data_subject_requests',
      p_entity_id: data.id,
      p_details: { request_type: validated.request_type },
    });

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Create DSR error:', error);
    return NextResponse.json(
      { error: 'Failed to create data subject request' },
      { status: 500 }
    );
  }
}
