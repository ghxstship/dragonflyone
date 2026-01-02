export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase, withAuth, PlatformRole } from '@ghxstship/config';
import { z } from 'zod';

const createSettlementSchema = z.object({
  action: z.literal('create'),
  event_id: z.string().uuid(),
  line_items: z.array(z.object({
    type: z.string(),
    amount: z.number(),
    category: z.string().optional(),
    description: z.string().optional(),
  })).optional(),
});

const finalizeSettlementSchema = z.object({
  action: z.literal('finalize'),
  event_id: z.string().uuid(),
  settlement_id: z.string().uuid(),
});

const settlementActionSchema = z.union([createSettlementSchema, finalizeSettlementSchema]);

// Settlement calculations
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
    const eventId = searchParams.get('event_id');

    const { data: settlement } = await supabase.from('event_settlements').select(`
      *, line_items:settlement_line_items(id, category, description, amount, type)
    `).eq('event_id', eventId).single();

    if (!settlement) {
      // Calculate from source data
      const { data: tickets } = await supabase.from('ticket_sales').select('total_amount')
        .eq('event_id', eventId);
      const { data: merch } = await supabase.from('merch_sales').select('amount')
        .eq('event_id', eventId);
      const { data: expenses } = await supabase.from('event_expenses').select('amount')
        .eq('event_id', eventId);

      const ticketRevenue = tickets?.reduce((s, t) => s + t.total_amount, 0) || 0;
      const merchRevenue = merch?.reduce((s, m) => s + m.amount, 0) || 0;
      const totalExpenses = expenses?.reduce((s, e) => s + e.amount, 0) || 0;

      return NextResponse.json({
        calculated: {
          ticket_revenue: ticketRevenue,
          merch_revenue: merchRevenue,
          total_revenue: ticketRevenue + merchRevenue,
          total_expenses: totalExpenses,
          net: ticketRevenue + merchRevenue - totalExpenses
        }
      });
    }

    return NextResponse.json({ settlement });
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
    const { action, event_id } = validatedData;

    if (action === 'create') {
      const { line_items } = validatedData as z.infer<typeof createSettlementSchema>;

      interface LineItem { type: string; amount: number }
      const revenue = line_items?.filter((i: LineItem) => i.type === 'revenue').reduce((s: number, i: LineItem) => s + i.amount, 0) || 0;
      const expenses = line_items?.filter((i: LineItem) => i.type === 'expense').reduce((s: number, i: LineItem) => s + i.amount, 0) || 0;

      const { data, error } = await supabase.from('event_settlements').insert({
        event_id, total_revenue: revenue, total_expenses: expenses,
        net_amount: revenue - expenses, status: 'draft', created_by: userId
      }).select().single();

      if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });

      if (line_items?.length) {
        await supabase.from('settlement_line_items').insert(
          line_items.map((i: Record<string, unknown>) => ({ settlement_id: data.id, ...i }))
        );
      }

      return NextResponse.json({ settlement: data }, { status: 201 });
    }

    if (action === 'finalize') {
      const { settlement_id } = validatedData as z.infer<typeof finalizeSettlementSchema>;

      await supabase.from('event_settlements').update({
        status: 'finalized', finalized_by: userId, finalized_at: new Date().toISOString()
      }).eq('id', settlement_id);

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 });
  }
}
