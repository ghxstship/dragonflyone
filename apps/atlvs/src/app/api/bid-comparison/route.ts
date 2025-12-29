export const dynamic = 'force-dynamic';

import { withAuth, PlatformRole } from '@ghxstship/config';
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { z } from 'zod';

const createBidSchema = z.object({
  rfp_id: z.string().uuid(),
  vendor_id: z.string().uuid(),
  price: z.number().positive(),
  delivery_time: z.number().positive(),
  quality_score: z.number().min(0).max(100).optional(),
  experience_score: z.number().min(0).max(100).optional(),
  terms: z.string().optional(),
  notes: z.string().optional(),
});

const selectBidSchema = z.object({
  bid_id: z.string().uuid(),
  action: z.literal('select'),
});

// Bid comparison tools with weighted scoring
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
      const totalScore = Object.values(scores).reduce((s: number, v: { weighted: number }) => s + v.weighted, 0);
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
    const validatedData = createBidSchema.parse(body);
    const { rfp_id, vendor_id, price, delivery_time, quality_score, experience_score, terms, notes } = validatedData;

    const { data, error } = await supabase.from('vendor_bids').insert({
      rfp_id, vendor_id, price, delivery_time, quality_score, experience_score,
      terms, notes, submitted_at: new Date().toISOString(), status: 'submitted'
    }).select().single();

    if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
    return NextResponse.json({ bid: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to submit bid' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
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
    const validatedData = selectBidSchema.parse(body);
    const { bid_id, action } = validatedData;

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

interface Bid { price: number; quality_score?: number; delivery_time: number; experience_score?: number }
interface Criterion { weight: number; description: string }
interface Criteria { price: Criterion; quality: Criterion; delivery: Criterion; experience: Criterion; terms: Criterion }
interface Score { raw: number; weighted: number }

function calculateBidScores(bid: Bid, criteria: Criteria): Record<string, Score> {
  const scores: Record<string, Score> = {};

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
