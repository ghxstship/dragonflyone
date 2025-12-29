export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase, withAuth, PlatformRole } from '@ghxstship/config';
import { z } from 'zod';

const evaluateBidSchema = z.object({
  action: z.literal('evaluate'),
  rfp_id: z.string().uuid(),
  scores: z.array(z.object({
    criterion: z.string().optional(),
    score: z.number(),
    weight: z.number().optional(),
    notes: z.string().optional(),
  })),
  notes: z.string().optional(),
});

const approveBidSchema = z.object({
  action: z.literal('approve'),
  decision_id: z.string().uuid(),
  approved: z.boolean(),
  comment: z.string().optional(),
});

const bidActionSchema = z.union([evaluateBidSchema, approveBidSchema]);

// Bid/no-bid decision workflow with scoring
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
    const rfpId = searchParams.get('rfp_id');

    let query = supabase.from('bid_decisions').select(`
      *, scores:bid_decision_scores(criterion, score, weight, notes),
      approvals:bid_decision_approvals(user:platform_users(first_name, last_name), approved, comment)
    `);

    if (rfpId) query = query.eq('rfp_id', rfpId);

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });

    return NextResponse.json({ decisions: data });
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
    const validatedData = bidActionSchema.parse(body);
    const { action } = validatedData;

    if (action === 'evaluate') {
      const { rfp_id, scores, notes } = validatedData as z.infer<typeof evaluateBidSchema>;

      // Calculate weighted score
      interface ScoreEntry { score: number; weight?: number; criterion?: string; notes?: string }
      const totalWeight = scores.reduce((s: number, sc: ScoreEntry) => s + (sc.weight || 1), 0);
      const weightedScore = scores.reduce((s: number, sc: ScoreEntry) => s + sc.score * (sc.weight || 1), 0) / totalWeight;

      const { data, error } = await supabase.from('bid_decisions').insert({
        rfp_id, weighted_score: weightedScore, notes, status: 'pending_approval',
        recommendation: weightedScore >= 70 ? 'bid' : 'no_bid', created_by: user.id
      }).select().single();

      if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });

      // Save individual scores
      await supabase.from('bid_decision_scores').insert(
        scores.map((s: Record<string, unknown>) => ({ decision_id: data.id, criterion: s.criterion, score: s.score, weight: s.weight, notes: s.notes }))
      );

      return NextResponse.json({ decision: data }, { status: 201 });
    }

    if (action === 'approve') {
      const { decision_id, approved, comment } = validatedData as z.infer<typeof approveBidSchema>;

      await supabase.from('bid_decision_approvals').insert({
        decision_id, user_id: user.id, approved, comment
      });

      // Check if all required approvals received
      const { data: approvals } = await supabase.from('bid_decision_approvals').select('approved').eq('decision_id', decision_id);
      const allApproved = approvals?.every(a => a.approved);

      if (allApproved) {
        const { data: decision } = await supabase.from('bid_decisions').select('recommendation').eq('id', decision_id).single();
        await supabase.from('bid_decisions').update({
          status: decision?.recommendation === 'bid' ? 'approved_to_bid' : 'no_bid_confirmed'
        }).eq('id', decision_id);
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 });
  }
}
