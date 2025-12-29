export const dynamic = 'force-dynamic';

import { withAuth, PlatformRole } from '@ghxstship/config';
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { z } from 'zod';

const createCycleSchema = z.object({
  action: z.literal('create_cycle'),
  name: z.string().min(1),
  fiscal_year: z.string(),
  budget: z.number().optional(),
  effective_date: z.string(),
  deadline: z.string().optional(),
});

const proposeAdjustmentSchema = z.object({
  action: z.literal('propose_adjustment'),
  plan_id: z.string().uuid(),
  employee_id: z.string().uuid(),
  current_salary: z.number(),
  proposed_salary: z.number(),
  equity_grant: z.number().optional(),
  justification: z.string().optional(),
});

const approveEntrySchema = z.object({
  action: z.literal('approve_entry'),
  entry_id: z.string().uuid(),
  approved: z.boolean(),
  comment: z.string().optional(),
});

const finalizeSchema = z.object({
  action: z.literal('finalize'),
  plan_id: z.string().uuid(),
});

const compensationActionSchema = z.discriminatedUnion('action', [
  createCycleSchema,
  proposeAdjustmentSchema,
  approveEntrySchema,
  finalizeSchema,
]);

// Compensation planning and equity management
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

    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employee_id');
    const cycleId = searchParams.get('cycle_id');

    if (employeeId) {
      const { data } = await supabase.from('compensation_records').select(`
        *, adjustments:compensation_adjustments(id, type, amount, effective_date, reason)
      `).eq('employee_id', employeeId).order('effective_date', { ascending: false });

      return NextResponse.json({ records: data });
    }

    if (cycleId) {
      const { data } = await supabase.from('compensation_plans').select(`
        *, entries:compensation_plan_entries(
          employee:employees(id, first_name, last_name, department),
          current_salary, proposed_salary, increase_percent, equity_grant
        )
      `).eq('id', cycleId).single();

      return NextResponse.json({ plan: data });
    }

    const { data, error } = await supabase.from('compensation_plans').select('*')
      .order('created_at', { ascending: false });

    if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });

    return NextResponse.json({ plans: data });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
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

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const validatedData = compensationActionSchema.parse(body);

    if (validatedData.action === 'create_cycle') {
      const { name, fiscal_year, budget, effective_date, deadline } = validatedData;

      const { data, error } = await supabase.from('compensation_plans').insert({
        name, fiscal_year, budget, effective_date, deadline,
        status: 'draft', created_by: user.id
      }).select().single();

      if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
      return NextResponse.json({ plan: data }, { status: 201 });
    }

    if (validatedData.action === 'propose_adjustment') {
      const { plan_id, employee_id, current_salary, proposed_salary, equity_grant, justification } = validatedData;

      const increase = ((proposed_salary - current_salary) / current_salary * 100).toFixed(2);

      const { data, error } = await supabase.from('compensation_plan_entries').insert({
        plan_id, employee_id, current_salary, proposed_salary,
        increase_percent: parseFloat(increase), equity_grant, justification,
        status: 'pending', proposed_by: user.id
      }).select().single();

      if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
      return NextResponse.json({ entry: data }, { status: 201 });
    }

    if (validatedData.action === 'approve_entry') {
      const { entry_id, approved, comment } = validatedData;

      await supabase.from('compensation_plan_entries').update({
        status: approved ? 'approved' : 'rejected',
        reviewer_comment: comment, reviewed_by: user.id,
        reviewed_at: new Date().toISOString()
      }).eq('id', entry_id);

      return NextResponse.json({ success: true });
    }

    if (validatedData.action === 'finalize') {
      const { plan_id } = validatedData;

      // Get all approved entries
      const { data: entries } = await supabase.from('compensation_plan_entries').select('*')
        .eq('plan_id', plan_id).eq('status', 'approved');

      // Create compensation adjustments
      for (const entry of entries || []) {
        await supabase.from('compensation_adjustments').insert({
          employee_id: entry.employee_id, type: 'salary',
          amount: entry.proposed_salary - entry.current_salary,
          effective_date: entry.effective_date, plan_id
        });

        if (entry.equity_grant) {
          await supabase.from('equity_grants').insert({
            employee_id: entry.employee_id, shares: entry.equity_grant,
            grant_date: entry.effective_date, plan_id
          });
        }
      }

      await supabase.from('compensation_plans').update({ status: 'finalized' }).eq('id', plan_id);

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 });
  }
}
