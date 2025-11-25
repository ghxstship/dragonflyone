import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Win/loss tracking and competitive analysis
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '12m';

    const { data, error } = await supabase.from('bid_outcomes').select(`
      *, rfp:rfps(title, client, value), competitor_analysis:competitor_analyses(competitor, strengths, weaknesses)
    `).order('outcome_date', { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Calculate metrics
    const wins = data?.filter(d => d.outcome === 'won') || [];
    const losses = data?.filter(d => d.outcome === 'lost') || [];
    const winRate = data?.length ? (wins.length / data.length * 100).toFixed(1) : 0;
    const totalValue = wins.reduce((s, w) => s + (w.rfp?.value || 0), 0);

    // Group by loss reason
    const lossReasons: Record<string, number> = {};
    losses.forEach(l => {
      const reason = l.loss_reason || 'Unknown';
      lossReasons[reason] = (lossReasons[reason] || 0) + 1;
    });

    return NextResponse.json({
      outcomes: data,
      metrics: {
        total_bids: data?.length || 0,
        wins: wins.length,
        losses: losses.length,
        win_rate: winRate,
        total_value_won: totalValue,
        loss_reasons: lossReasons
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { action } = body;

    if (action === 'record_outcome') {
      const { rfp_id, outcome, outcome_date, loss_reason, winning_competitor, feedback, lessons_learned } = body;

      const { data, error } = await supabase.from('bid_outcomes').insert({
        rfp_id, outcome, outcome_date, loss_reason, winning_competitor,
        feedback, lessons_learned, recorded_by: user.id
      }).select().single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ outcome: data }, { status: 201 });
    }

    if (action === 'add_competitor_analysis') {
      const { outcome_id, competitor, strengths, weaknesses, pricing_intel, strategy_notes } = body;

      const { data, error } = await supabase.from('competitor_analyses').insert({
        outcome_id, competitor, strengths: strengths || [], weaknesses: weaknesses || [],
        pricing_intel, strategy_notes
      }).select().single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ analysis: data }, { status: 201 });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 });
  }
}
