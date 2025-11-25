import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const entrySchema = z.object({
  payroll_period_id: z.string().uuid(),
  employee_id: z.string().uuid(),
  regular_hours: z.number().optional(),
  overtime_hours: z.number().optional(),
  double_time_hours: z.number().optional(),
  pto_hours: z.number().optional(),
  sick_hours: z.number().optional(),
  holiday_hours: z.number().optional(),
  regular_rate: z.number().optional(),
  overtime_rate: z.number().optional(),
  bonus: z.number().optional(),
  commission: z.number().optional(),
  other_earnings: z.number().optional(),
  payment_method: z.enum(['direct_deposit', 'check', 'cash', 'paycard']).default('direct_deposit'),
  notes: z.string().optional(),
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

    const { searchParams } = new URL(request.url);
    const period_id = searchParams.get('period_id');
    const employee_id = searchParams.get('employee_id');
    const my_entries = searchParams.get('my_entries') === 'true';

    const isAdmin = platformUser.platform_roles?.some((role: string) =>
      ['ATLVS_ADMIN', 'LEGEND_SUPER_ADMIN'].includes(role)
    );

    let query = supabase
      .from('payroll_entries')
      .select(`
        *,
        employee:platform_users!employee_id(id, full_name, email),
        payroll_period:payroll_periods(id, period_name, start_date, end_date, pay_date, status),
        adjustments:payroll_adjustments(id, adjustment_type, description, amount, is_taxable)
      `);

    if (period_id) {
      query = query.eq('payroll_period_id', period_id);
    }

    if (my_entries || !isAdmin) {
      // Non-admins can only see their own entries
      query = query.eq('employee_id', platformUser.id);
    } else if (employee_id) {
      query = query.eq('employee_id', employee_id);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Get payroll entries error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payroll entries' },
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
    const validated = entrySchema.parse(body);

    // Verify payroll period exists and is open
    const { data: period } = await supabase
      .from('payroll_periods')
      .select('id, status, organization_id')
      .eq('id', validated.payroll_period_id)
      .single();

    if (!period) {
      return NextResponse.json(
        { error: 'Payroll period not found' },
        { status: 404 }
      );
    }

    if (period.status !== 'open') {
      return NextResponse.json(
        { error: 'Payroll period is not open for entries' },
        { status: 400 }
      );
    }

    // Get employee's payroll settings for rates
    const { data: employeeSettings } = await supabase
      .from('employee_payroll_settings')
      .select('pay_rate')
      .eq('employee_id', validated.employee_id)
      .single();

    const regularRate = validated.regular_rate || employeeSettings?.pay_rate || 0;

    const { data, error } = await supabase
      .from('payroll_entries')
      .insert({
        ...validated,
        regular_rate: regularRate,
        overtime_rate: validated.overtime_rate || regularRate * 1.5,
        status: 'pending',
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
    console.error('Create payroll entry error:', error);
    return NextResponse.json(
      { error: 'Failed to create payroll entry' },
      { status: 500 }
    );
  }
}
