export const dynamic = 'force-dynamic';

import { withAuth, PlatformRole } from '@ghxstship/config';
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { z } from 'zod';

const connectSchema = z.object({
  action: z.literal('connect'),
  provider: z.enum(['adp', 'gusto', 'paychex', 'quickbooks_payroll']),
  credentials: z.record(z.unknown()),
});

const syncEmployeesSchema = z.object({
  action: z.literal('sync_employees'),
  provider: z.string(),
});

const createPayrollRunSchema = z.object({
  action: z.literal('create_payroll_run'),
  pay_period_start: z.string(),
  pay_period_end: z.string(),
  pay_date: z.string(),
  employee_ids: z.array(z.string().uuid()).optional(),
});

const submitPayrollSchema = z.object({
  action: z.literal('submit_payroll'),
  payroll_run_id: z.string().uuid(),
});

const exportPayrollSchema = z.object({
  action: z.literal('export_payroll'),
  payroll_run_id: z.string().uuid(),
  format: z.enum(['csv', 'json']).optional(),
});

const payrollActionSchema = z.discriminatedUnion('action', [
  connectSchema,
  syncEmployeesSchema,
  createPayrollRunSchema,
  submitPayrollSchema,
  exportPayrollSchema,
]);

/**
 * Payroll Integration API
 * Integrates with payroll providers (ADP, Gusto, Paychex) for automated payroll processing
 */
const ATLVS_ROLES = [
  PlatformRole.ATLVS_SUPER_ADMIN, PlatformRole.ATLVS_ADMIN, PlatformRole.ATLVS_TEAM_MEMBER, PlatformRole.ATLVS_VIEWER,
  PlatformRole.LEGEND_SUPER_ADMIN, PlatformRole.LEGEND_ADMIN, PlatformRole.LEGEND_DEVELOPER,
];

export async function GET(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const provider = searchParams.get('provider');
    const payPeriod = searchParams.get('pay_period');

    if (type === 'providers') {
      // List available payroll providers
      const providers = [
        { id: 'adp', name: 'ADP', status: 'available', features: ['direct_deposit', 'tax_filing', 'benefits'] },
        { id: 'gusto', name: 'Gusto', status: 'available', features: ['direct_deposit', 'tax_filing', 'onboarding'] },
        { id: 'paychex', name: 'Paychex', status: 'available', features: ['direct_deposit', 'tax_filing', 'hr'] },
        { id: 'quickbooks_payroll', name: 'QuickBooks Payroll', status: 'available', features: ['direct_deposit', 'tax_filing'] }
      ];
      return NextResponse.json({ providers });
    }

    if (type === 'connection') {
      // Get payroll connection status
      const { data, error } = await supabase
        .from('payroll_connections')
        .select('*')
        .eq('provider', provider || '')
        .single();

      if (error && error.code !== 'PGRST116') {
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
      }

      return NextResponse.json({ connection: data || null });
    }

    if (type === 'payroll_runs') {
      // Get payroll run history
      let query = supabase
        .from('payroll_runs')
        .select(`
          *,
          employees:payroll_run_employees(
            employee_id,
            gross_pay,
            net_pay,
            deductions,
            taxes
          )
        `)
        .order('pay_date', { ascending: false });

      if (payPeriod) {
        query = query.eq('pay_period', payPeriod);
      }

      const { data, error } = await query.limit(20);

      if (error) {
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
      }

      return NextResponse.json({ payroll_runs: data });
    }

    if (type === 'pending') {
      // Get pending payroll items
      const { data, error } = await supabase
        .from('timesheets')
        .select(`
          *,
          employee:profiles(id, full_name, email),
          project:projects(id, name)
        `)
        .eq('payroll_status', 'pending')
        .order('week_ending', { ascending: false });

      if (error) {
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
      }

      return NextResponse.json({ pending_items: data });
    }

    // Default: return payroll summary
    const [runsCount, pendingCount, totalPaid] = await Promise.all([
      supabase.from('payroll_runs').select('id', { count: 'exact', head: true }),
      supabase.from('timesheets').select('id', { count: 'exact', head: true }).eq('payroll_status', 'pending'),
      supabase.from('payroll_runs').select('total_amount').eq('status', 'completed')
    ]);

    const totalAmount = totalPaid.data?.reduce((sum, r) => sum + (r.total_amount || 0), 0) || 0;

    return NextResponse.json({
      summary: {
        total_runs: runsCount.count || 0,
        pending_items: pendingCount.count || 0,
        total_paid_ytd: totalAmount
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch payroll data' }, { status: 500 });
  }
}

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
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = payrollActionSchema.parse(body);

    if (validatedData.action === 'connect') {
      // Connect to payroll provider
      const { provider, credentials } = validatedData;

      // Store connection (in production, would exchange for OAuth tokens)
      const { data, error } = await supabase
        .from('payroll_connections')
        .upsert({
          provider,
          status: 'connected',
          credentials_encrypted: credentials, // Would be encrypted in production
          connected_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
      }

      return NextResponse.json({ connection: data }, { status: 201 });
    }

    if (validatedData.action === 'sync_employees') {
      // Sync employees from payroll provider
      const { provider } = validatedData;

      // In production, would call provider API
      // For now, return mock sync result
      return NextResponse.json({
        sync_result: {
          provider,
          employees_synced: 0,
          employees_added: 0,
          employees_updated: 0,
          errors: [],
          synced_at: new Date().toISOString()
        }
      });
    }

    if (validatedData.action === 'create_payroll_run') {
      // Create a new payroll run
      const { pay_period_start, pay_period_end, pay_date, employee_ids } = validatedData;

      // Get timesheet data for employees
      const { data: timesheets, error: tsError } = await supabase
        .from('timesheets')
        .select('*')
        .in('employee_id', employee_ids || [])
        .gte('week_ending', pay_period_start)
        .lte('week_ending', pay_period_end)
        .eq('payroll_status', 'pending');

      if (tsError) {
        return NextResponse.json({ error: tsError.message }, { status: 500 });
      }

      // Calculate payroll
      const employeePayroll = (timesheets || []).reduce((acc: Record<string, unknown>, ts) => {
        if (!acc[ts.employee_id]) {
          acc[ts.employee_id] = { hours: 0, gross_pay: 0 };
        }
        acc[ts.employee_id].hours += ts.total_hours || 0;
        acc[ts.employee_id].gross_pay += (ts.total_hours || 0) * (ts.hourly_rate || 0);
        return acc;
      }, {});

      interface EmployeePayrollData { hours: number; gross_pay: number }
      const totalAmount = Object.values(employeePayroll).reduce((sum: number, emp: EmployeePayrollData) => sum + emp.gross_pay, 0);

      // Create payroll run
      const { data: payrollRun, error: prError } = await supabase
        .from('payroll_runs')
        .insert({
          pay_period_start,
          pay_period_end,
          pay_date,
          status: 'draft',
          total_amount: totalAmount,
          employee_count: Object.keys(employeePayroll).length
        })
        .select()
        .single();

      if (prError) {
        return NextResponse.json({ error: prError.message }, { status: 500 });
      }

      return NextResponse.json({ payroll_run: payrollRun }, { status: 201 });
    }

    if (validatedData.action === 'submit_payroll') {
      // Submit payroll to provider
      const { payroll_run_id } = validatedData;

      // Update status
      const { data, error } = await supabase
        .from('payroll_runs')
        .update({
          status: 'submitted',
          submitted_at: new Date().toISOString()
        })
        .eq('id', payroll_run_id)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
      }

      // In production, would submit to payroll provider API
      return NextResponse.json({ payroll_run: data, message: 'Payroll submitted successfully' });
    }

    if (validatedData.action === 'export_payroll') {
      // Export payroll data for manual processing
      const { payroll_run_id, format } = validatedData;

      const { data: payrollRun, error } = await supabase
        .from('payroll_runs')
        .select(`
          *,
          employees:payroll_run_employees(*)
        `)
        .eq('id', payroll_run_id)
        .single();

      if (error) {
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
      }

      if (format === 'csv') {
        // Generate CSV
        const headers = ['Employee ID', 'Name', 'Hours', 'Gross Pay', 'Deductions', 'Net Pay'];
        const rows = (payrollRun.employees || []).map((e: Record<string, unknown>) =>
          [e.employee_id, e.name, e.hours, e.gross_pay, e.deductions, e.net_pay].join(',')
        );
        const csv = [headers.join(','), ...rows].join('\n');

        return new NextResponse(csv, {
          headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': `attachment; filename="payroll-${payroll_run_id}.csv"`
          }
        });
      }

      return NextResponse.json({ payroll_run: payrollRun });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process payroll' }, { status: 500 });
  }
}
