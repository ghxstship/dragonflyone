import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const providerSchema = z.object({
  provider_type: z.enum(['adp', 'gusto', 'paychex', 'quickbooks_payroll', 'rippling', 'zenefits', 'custom']),
  name: z.string().min(1).max(255),
  api_endpoint: z.string().url().optional(),
  api_key: z.string().optional(),
  api_secret: z.string().optional(),
  sync_frequency: z.enum(['realtime', 'hourly', 'daily', 'weekly', 'manual']).default('daily'),
  department_mapping: z.record(z.string()).optional(),
  job_code_mapping: z.record(z.string()).optional(),
  pay_type_mapping: z.record(z.string()).optional(),
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

    const { data, error } = await supabase
      .from('payroll_providers')
      .select(`
        id, provider_type, name, is_active, is_default,
        sync_frequency, last_sync_at, last_sync_status,
        department_mapping, job_code_mapping, pay_type_mapping,
        created_at, updated_at
      `)
      .eq('organization_id', platformUser.organization_id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Get payroll providers error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payroll providers' },
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

    // In production, encrypt sensitive data
    const insertData: Record<string, unknown> = {
      organization_id: platformUser.organization_id,
      provider_type: validated.provider_type,
      name: validated.name,
      api_endpoint: validated.api_endpoint,
      api_key_encrypted: validated.api_key, // Should be encrypted
      api_secret_encrypted: validated.api_secret, // Should be encrypted
      sync_frequency: validated.sync_frequency,
      department_mapping: validated.department_mapping || {},
      job_code_mapping: validated.job_code_mapping || {},
      pay_type_mapping: validated.pay_type_mapping || {},
      created_by: platformUser.id,
    };

    const { data, error } = await supabase
      .from('payroll_providers')
      .insert(insertData)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Create payroll provider error:', error);
    return NextResponse.json(
      { error: 'Failed to create payroll provider' },
      { status: 500 }
    );
  }
}
