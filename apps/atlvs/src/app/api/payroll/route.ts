import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { z } from 'zod';

const payrollRunSchema = z.object({
  pay_period_start: z.string(),
  pay_period_end: z.string(),
  pay_date: z.string(),
  employee_ids: z.array(z.string().uuid()).optional(),
  include_all_active: z.boolean().default(true),
  notes: z.string().optional(),
});

// GET /api/payroll - List payroll runs and summary
export async function GET(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const year = searchParams.get('year');
    const employeeId = searchParams.get('employee_id');

    let query = supabase
      .from('payroll_runs')
      .select(`
        *,
        created_by_user:platform_users!created_by(id, full_name),
        approved_by_user:platform_users!approved_by(id, full_name),
        payroll_items:payroll_items(
          id, employee_id, gross_pay, net_pay, status,
          employee:employees(id, first_name, last_name, employee_number)
        )
      `)
      .order('pay_date', { ascending: false });

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }
    if (year) {
      query = query.gte('pay_period_start', `${year}-01-01`).lte('pay_period_end', `${year}-12-31`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching payroll runs:', error);
      return NextResponse.json(
        { error: 'Failed to fetch payroll runs', details: error.message },
        { status: 500 }
      );
    }

    interface PayrollRun {
      id: string;
      status: string;
      total_gross: number;
      total_net: number;
      total_taxes: number;
      employee_count: number;
      [key: string]: unknown;
    }
    const payrollRuns = (data || []) as unknown as PayrollRun[];

    const summary = {
      total_runs: payrollRuns.length,
      by_status: {
        draft: payrollRuns.filter(r => r.status === 'draft').length,
        pending_approval: payrollRuns.filter(r => r.status === 'pending_approval').length,
        approved: payrollRuns.filter(r => r.status === 'approved').length,
        processing: payrollRuns.filter(r => r.status === 'processing').length,
        completed: payrollRuns.filter(r => r.status === 'completed').length,
        cancelled: payrollRuns.filter(r => r.status === 'cancelled').length,
      },
      ytd_gross: payrollRuns
        .filter(r => r.status === 'completed')
        .reduce((sum, r) => sum + (r.total_gross || 0), 0),
      ytd_net: payrollRuns
        .filter(r => r.status === 'completed')
        .reduce((sum, r) => sum + (r.total_net || 0), 0),
      ytd_taxes: payrollRuns
        .filter(r => r.status === 'completed')
        .reduce((sum, r) => sum + (r.total_taxes || 0), 0),
    };

    return NextResponse.json({ payroll_runs: data, summary });
  } catch (error) {
    console.error('Error in GET /api/payroll:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/payroll - Create new payroll run
export async function POST(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const body = await request.json();
    const validated = payrollRunSchema.parse(body);

    const organizationId = body.organization_id || '00000000-0000-0000-0000-000000000000';
    const userId = body.user_id || '00000000-0000-0000-0000-000000000000';

    // Generate payroll run number
    const { data: runNumber } = await supabase.rpc('generate_payroll_run_number', {
      org_id: organizationId,
    });

    // Create payroll run
    const { data: payrollRun, error: runError } = await supabase
      .from('payroll_runs')
      .insert({
        run_number: runNumber,
        organization_id: organizationId,
        pay_period_start: validated.pay_period_start,
        pay_period_end: validated.pay_period_end,
        pay_date: validated.pay_date,
        status: 'draft',
        notes: validated.notes,
        created_by: userId,
      })
      .select()
      .single();

    if (runError) {
      console.error('Error creating payroll run:', runError);
      return NextResponse.json(
        { error: 'Failed to create payroll run', details: runError.message },
        { status: 500 }
      );
    }

    // Get employees to include
    let employeeQuery = supabase
      .from('employees')
      .select('id, first_name, last_name, employee_number, pay_rate, pay_type, department_id')
      .eq('organization_id', organizationId)
      .eq('status', 'active');

    if (validated.employee_ids && validated.employee_ids.length > 0) {
      employeeQuery = employeeQuery.in('id', validated.employee_ids);
    }

    const { data: employees } = await employeeQuery;

    if (employees && employees.length > 0) {
      // Get timekeeping data for the pay period
      const { data: timesheets } = await supabase
        .from('timesheets')
        .select('*')
        .in('employee_id', employees.map(e => e.id))
        .gte('work_date', validated.pay_period_start)
        .lte('work_date', validated.pay_period_end)
        .eq('status', 'approved');

      // Calculate payroll items
      const payrollItems = employees.map(employee => {
        const employeeTimesheets = timesheets?.filter(t => t.employee_id === employee.id) || [];
        const totalHours = employeeTimesheets.reduce((sum, t) => sum + (t.regular_hours || 0), 0);
        const overtimeHours = employeeTimesheets.reduce((sum, t) => sum + (t.overtime_hours || 0), 0);

        const regularPay = employee.pay_type === 'hourly' 
          ? totalHours * (employee.pay_rate || 0)
          : (employee.pay_rate || 0) / 26; // Bi-weekly salary

        const overtimePay = overtimeHours * (employee.pay_rate || 0) * 1.5;
        const grossPay = regularPay + overtimePay;

        // Calculate taxes (simplified)
        const federalTax = grossPay * 0.22;
        const stateTax = grossPay * 0.05;
        const socialSecurity = grossPay * 0.062;
        const medicare = grossPay * 0.0145;
        const totalTaxes = federalTax + stateTax + socialSecurity + medicare;
        const netPay = grossPay - totalTaxes;

        return {
          payroll_run_id: payrollRun.id,
          employee_id: employee.id,
          regular_hours: totalHours,
          overtime_hours: overtimeHours,
          regular_pay: regularPay,
          overtime_pay: overtimePay,
          gross_pay: grossPay,
          federal_tax: federalTax,
          state_tax: stateTax,
          social_security: socialSecurity,
          medicare: medicare,
          total_deductions: totalTaxes,
          net_pay: netPay,
          status: 'pending',
        };
      });

      // Insert payroll items
      const { error: itemsError } = await supabase
        .from('payroll_items')
        .insert(payrollItems);

      if (itemsError) {
        console.error('Error creating payroll items:', itemsError);
      }

      // Update payroll run totals
      const totalGross = payrollItems.reduce((sum, item) => sum + item.gross_pay, 0);
      const totalNet = payrollItems.reduce((sum, item) => sum + item.net_pay, 0);
      const totalTaxes = payrollItems.reduce((sum, item) => sum + item.total_deductions, 0);

      await supabase
        .from('payroll_runs')
        .update({
          total_gross: totalGross,
          total_net: totalNet,
          total_taxes: totalTaxes,
          employee_count: payrollItems.length,
        })
        .eq('id', payrollRun.id);
    }

    // Log activity
    await supabase.from('payroll_activity_log').insert({
      payroll_run_id: payrollRun.id,
      activity_type: 'created',
      user_id: userId,
      description: 'Payroll run created',
    });

    return NextResponse.json(payrollRun, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error in POST /api/payroll:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
