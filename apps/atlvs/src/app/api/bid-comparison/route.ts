import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';

// Bid comparison tools with weighted scoring
export async function GET(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const rfpId = searchParams.get('rfp_id');

    if (!rfpId) return NextResponse.json({ error: 'RFP ID required' }, { status: 400 });

    const { data: rfp } = await supabase.from('rfps').select('*').eq('id', rfpId).single();
    const { data: bids } = await supabase.from('vendor_bids').select(`
      *, vendor:vendors(id, name, rating)
    `).eq('rfp_id', rfpId);

    if (!rfp || !bids) return NextResponse.json({ error: 'RFP not found' }, { status: 404 });

    // Score bids based on criteria
    const scoredBids = bids.map(bid => {
      const scores = calculateBidScores(bid, rfp.scoring_criteria || defaultCriteria);
      const totalScore = Object.values(scores).reduce((s: number, v: any) => s + v.weighted, 0);
      return { ...bid, scores, total_score: Math.round(totalScore * 100) / 100 };
    }).sort((a, b) => b.total_score - a.total_score);

    return NextResponse.json({
      rfp,
      bids: scoredBids,
      recommended: scoredBids[0],
      criteria: rfp.scoring_criteria || defaultCriteria
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch comparison' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { rfp_id, vendor_id, price, delivery_time, quality_score, experience_score, terms, notes } = body;

    const { data, error } = await supabase.from('vendor_bids').insert({
      rfp_id, vendor_id, price, delivery_time, quality_score, experience_score,
      terms, notes, submitted_at: new Date().toISOString(), status: 'submitted'
    }).select().single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ bid: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to submit bid' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { bid_id, action } = body;

    if (action === 'select') {
      await supabase.from('vendor_bids').update({ status: 'selected', selected_by: user.id }).eq('id', bid_id);
      
      const { data: bid } = await supabase.from('vendor_bids').select('rfp_id').eq('id', bid_id).single();
      await supabase.from('vendor_bids').update({ status: 'rejected' }).eq('rfp_id', bid?.rfp_id).neq('id', bid_id);
      await supabase.from('rfps').update({ status: 'awarded' }).eq('id', bid?.rfp_id);

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}

const defaultCriteria = {
  price: { weight: 35, description: 'Cost competitiveness' },
  quality: { weight: 25, description: 'Quality and specifications' },
  delivery: { weight: 20, description: 'Delivery timeline' },
  experience: { weight: 15, description: 'Vendor experience' },
  terms: { weight: 5, description: 'Payment and contract terms' }
};

function calculateBidScores(bid: any, criteria: any): any {
  const scores: any = {};

  // Price score (lower is better, normalized 0-100)
  scores.price = { raw: bid.price, weighted: (100 - Math.min(bid.price / 1000, 100)) * (criteria.price.weight / 100) };
  
  // Quality score (0-100)
  scores.quality = { raw: bid.quality_score || 0, weighted: (bid.quality_score || 0) * (criteria.quality.weight / 100) };
  
  // Delivery score (faster is better)
  scores.delivery = { raw: bid.delivery_time, weighted: Math.max(0, 100 - bid.delivery_time) * (criteria.delivery.weight / 100) };
  
  // Experience score (0-100)
  scores.experience = { raw: bid.experience_score || 0, weighted: (bid.experience_score || 0) * (criteria.experience.weight / 100) };
  
  // Terms score
  scores.terms = { raw: 80, weighted: 80 * (criteria.terms.weight / 100) };

  return scores;
}
