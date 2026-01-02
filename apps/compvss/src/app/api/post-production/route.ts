export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase, withAuth, PlatformRole } from '@ghxstship/config';
import { z } from 'zod';

const initiateSettlementSchema = z.object({
  action: z.literal('initiate'),
  project_id: z.string().uuid(),
});

const finalizeSettlementSchema = z.object({
  action: z.literal('finalize'),
  project_id: z.string().uuid(),
  settlement_id: z.string().uuid(),
  notes: z.string().optional(),
});

const settlementActionSchema = z.union([initiateSettlementSchema, finalizeSettlementSchema]);

// Post-production settlement and financial closeout
const COMPVSS_ROLES = [
  PlatformRole.COMPVSS_ADMIN, PlatformRole.COMPVSS_TEAM_MEMBER, PlatformRole.COMPVSS_VIEWER,
  PlatformRole.LEGEND_SUPER_ADMIN, PlatformRole.LEGEND_ADMIN, PlatformRole.LEGEND_DEVELOPER,
];

export async function GET(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!COMPVSS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('project_id');

    const { data: settlement } = await supabase.from('project_settlements').select(`
      *, items:settlement_items(id, category, description, budgeted, actual, variance)
    `).eq('project_id', projectId).single();

    // Get pending items
    const { data: pendingInvoices } = await supabase.from('docs_profile_invoice').select('*')
      .eq('project_id', projectId).eq('status', 'pending');

    const { data: pendingExpenses } = await supabase.from('finance_expenses').select('*')
      .eq('project_id', projectId).eq('status', 'pending');

    return NextResponse.json({
      settlement,
      pending: {
        invoices: pendingInvoices,
        expenses: pendingExpenses
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!COMPVSS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const userId = authResult.user?.id;
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const validatedData = settlementActionSchema.parse(body);
    const { action, project_id } = validatedData;

    if (action === 'initiate') {
      // Get budget vs actual
      const { data: budget } = await supabase.from('project_budgets').select('*').eq('project_id', project_id);
      const { data: expenses } = await supabase.from('finance_expenses').select('*').eq('project_id', project_id);

      const totalBudget = budget?.reduce((s, b) => s + b.amount, 0) || 0;
      const totalActual = expenses?.reduce((s, e) => s + e.amount, 0) || 0;

      const { data: settlement, error } = await supabase.from('project_settlements').insert({
        project_id, status: 'in_progress', total_budget: totalBudget,
        total_actual: totalActual, variance: totalBudget - totalActual,
        initiated_by: userId, initiated_at: new Date().toISOString()
      }).select().single();

      if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
      return NextResponse.json({ settlement }, { status: 201 });
    }

    if (action === 'finalize') {
      const { settlement_id, notes } = validatedData as z.infer<typeof finalizeSettlementSchema>;

      await supabase.from('project_settlements').update({
        status: 'completed', finalized_by: userId,
        finalized_at: new Date().toISOString(), notes
      }).eq('id', settlement_id);

      // Update project status
      await supabase.from('projects').update({ status: 'closed' }).eq('id', project_id);

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 });
  }
}
