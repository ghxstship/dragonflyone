export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase, withAuth, PlatformRole } from '@ghxstship/config';
import { z } from 'zod';

const recordOutcomeSchema = z.object({
  action: z.literal('record_outcome'),
  rfp_id: z.string().uuid(),
  outcome: z.enum(['won', 'lost', 'no_decision']),
  outcome_date: z.string(),
  loss_reason: z.string().optional(),
  winning_competitor: z.string().optional(),
  feedback: z.string().optional(),
  lessons_learned: z.string().optional(),
});

const addCompetitorAnalysisSchema = z.object({
  action: z.literal('add_competitor_analysis'),
  outcome_id: z.string().uuid(),
  competitor: z.string().min(1),
  strengths: z.array(z.string()).optional(),
  weaknesses: z.array(z.string()).optional(),
  pricing_intel: z.string().optional(),
  strategy_notes: z.string().optional(),
});

const winLossActionSchema = z.union([recordOutcomeSchema, addCompetitorAnalysisSchema]);

// Win/loss tracking and competitive analysis
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
    const period = searchParams.get('period') || '12m';

    // Calculate date range based on period
    const now = new Date();
    const periodMonths = period === '3m' ? 3 : period === '6m' ? 6 : period === '12m' ? 12 : 12;
    const startDate = new Date(now.getFullYear(), now.getMonth() - periodMonths, now.getDate()).toISOString();

    const { data, error } = await supabase.from('bid_outcomes').select(`
      *, rfp:rfps(title, client, value), competitor_analysis:competitor_analyses(competitor, strengths, weaknesses)
    `).gte('outcome_date', startDate).order('outcome_date', { ascending: false });

    if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });

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
  const supabase = getServerSupabase();
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!COMPVSS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const validatedData = winLossActionSchema.parse(body);
    const { action } = validatedData;

    if (action === 'record_outcome') {
      const { rfp_id, outcome, outcome_date, loss_reason, winning_competitor, feedback, lessons_learned } = validatedData as z.infer<typeof recordOutcomeSchema>;

      const { data, error } = await supabase.from('bid_outcomes').insert({
        rfp_id, outcome, outcome_date, loss_reason, winning_competitor,
        feedback, lessons_learned, recorded_by: user.id
      }).select().single();

      if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
      return NextResponse.json({ outcome: data }, { status: 201 });
    }

    if (action === 'add_competitor_analysis') {
      const { outcome_id, competitor, strengths, weaknesses, pricing_intel, strategy_notes } = validatedData as z.infer<typeof addCompetitorAnalysisSchema>;

      const { data, error } = await supabase.from('competitor_analyses').insert({
        outcome_id, competitor, strengths: strengths || [], weaknesses: weaknesses || [],
        pricing_intel, strategy_notes
      }).select().single();

      if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
      return NextResponse.json({ analysis: data }, { status: 201 });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 });
  }
}
