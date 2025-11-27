import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@ghxstship/config';

// Post-production settlement and financial closeout
export async function GET(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('project_id');

    const { data: settlement } = await supabase.from('project_settlements').select(`
      *, items:settlement_items(id, category, description, budgeted, actual, variance)
    `).eq('project_id', projectId).single();

    // Get pending items
    const { data: pendingInvoices } = await supabase.from('invoices').select('*')
      .eq('project_id', projectId).eq('status', 'pending');

    const { data: pendingExpenses } = await supabase.from('expenses').select('*')
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
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { action, project_id } = body;

    if (action === 'initiate') {
      // Get budget vs actual
      const { data: budget } = await supabase.from('project_budgets').select('*').eq('project_id', project_id);
      const { data: expenses } = await supabase.from('expenses').select('*').eq('project_id', project_id);

      const totalBudget = budget?.reduce((s, b) => s + b.amount, 0) || 0;
      const totalActual = expenses?.reduce((s, e) => s + e.amount, 0) || 0;

      const { data: settlement, error } = await supabase.from('project_settlements').insert({
        project_id, status: 'in_progress', total_budget: totalBudget,
        total_actual: totalActual, variance: totalBudget - totalActual,
        initiated_by: user.id, initiated_at: new Date().toISOString()
      }).select().single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ settlement }, { status: 201 });
    }

    if (action === 'finalize') {
      const { settlement_id, notes } = body;

      await supabase.from('project_settlements').update({
        status: 'completed', finalized_by: user.id,
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
