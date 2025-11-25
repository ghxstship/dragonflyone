import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const periodSchema = z.object({
  period_name: z.string().min(1).max(100),
  period_type: z.enum(['weekly', 'biweekly', 'semimonthly', 'monthly']),
  start_date: z.string(),
  end_date: z.string(),
  pay_date: z.string(),
  provider_id: z.string().uuid().optional(),
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

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const year = searchParams.get('year');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    let query = supabase
      .from('payroll_periods')
      .select(`
        *,
        provider:payroll_providers(id, name, provider_type),
        approved_by_user:platform_users!approved_by(id, full_name)
      `, { count: 'exact' })
      .eq('organization_id', platformUser.organization_id);

    if (status) {
      query = query.eq('status', status);
    }

    if (year) {
      query = query.gte('start_date', `${year}-01-01`).lte('end_date', `${year}-12-31`);
    }

    const { data, error, count } = await query
      .order('start_date', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return NextResponse.json({
      data,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error('Get payroll periods error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payroll periods' },
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
    const validated = periodSchema.parse(body);

    const { data, error } = await supabase
      .from('payroll_periods')
      .insert({
        organization_id: platformUser.organization_id,
        ...validated,
        status: 'open',
      })
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
    console.error('Create payroll period error:', error);
    return NextResponse.json(
      { error: 'Failed to create payroll period' },
      { status: 500 }
    );
  }
}
