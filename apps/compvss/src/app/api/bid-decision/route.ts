import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Bid/no-bid decision workflow with scoring
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const rfpId = searchParams.get('rfp_id');

    let query = supabase.from('bid_decisions').select(`
      *, scores:bid_decision_scores(criterion, score, weight, notes),
      approvals:bid_decision_approvals(user:platform_users(first_name, last_name), approved, comment)
    `);

    if (rfpId) query = query.eq('rfp_id', rfpId);

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ decisions: data });
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

    if (action === 'evaluate') {
      const { rfp_id, scores, notes } = body;

      // Calculate weighted score
      const totalWeight = scores.reduce((s: number, sc: any) => s + (sc.weight || 1), 0);
      const weightedScore = scores.reduce((s: number, sc: any) => s + sc.score * (sc.weight || 1), 0) / totalWeight;

      const { data, error } = await supabase.from('bid_decisions').insert({
        rfp_id, weighted_score: weightedScore, notes, status: 'pending_approval',
        recommendation: weightedScore >= 70 ? 'bid' : 'no_bid', created_by: user.id
      }).select().single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });

      // Save individual scores
      await supabase.from('bid_decision_scores').insert(
        scores.map((s: any) => ({ decision_id: data.id, criterion: s.criterion, score: s.score, weight: s.weight, notes: s.notes }))
      );

      return NextResponse.json({ decision: data }, { status: 201 });
    }

    if (action === 'approve') {
      const { decision_id, approved, comment } = body;

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
