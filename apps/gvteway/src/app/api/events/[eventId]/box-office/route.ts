import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { log } from '@ghxstship/config';

export async function GET(
  _request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const supabase = supabaseAdmin;
    const { eventId } = params;

    // Get ticket tiers and sales data
    const { data: tiers, error: tiersError } = await supabase
      .from('ticket_tiers')
      .select(`
        id,
        name,
        price,
        capacity,
        sold_count,
        available_count
      `)
      .eq('event_id', eventId);

    if (tiersError) {
      log.error('Failed to fetch ticket tiers', { error: tiersError, eventId });
      return NextResponse.json({ error: 'Failed to fetch box office data' }, { status: 500 });
    }

    // Calculate totals
    const totals = tiers?.reduce(
      (acc, tier) => ({
        capacity: acc.capacity + (tier.capacity || 0),
        sold: acc.sold + (tier.sold_count || 0),
        available: acc.available + (tier.available_count || 0),
        revenue: acc.revenue + ((tier.sold_count || 0) * (tier.price || 0)),
      }),
      { capacity: 0, sold: 0, available: 0, revenue: 0 }
    );

    return NextResponse.json({ tiers, totals });
  } catch (error) {
    log.error('Error in box office GET', { error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
