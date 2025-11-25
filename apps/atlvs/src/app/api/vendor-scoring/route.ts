import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const vendorId = searchParams.get('vendor_id');

    let query = supabase.from('vendor_scores').select(`
      *, vendor:vendors(id, name, category)
    `);

    if (vendorId) query = query.eq('vendor_id', vendorId);

    const { data, error } = await query.order('evaluation_date', { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Calculate aggregate scores per vendor
    const vendorScores = new Map();
    data?.forEach(score => {
      if (!vendorScores.has(score.vendor_id)) {
        vendorScores.set(score.vendor_id, { scores: [], vendor: score.vendor });
      }
      vendorScores.get(score.vendor_id).scores.push(score);
    });

    const aggregated = Array.from(vendorScores.entries()).map(([id, data]) => {
      const scores = data.scores;
      const avg = (field: string) => scores.reduce((sum: number, s: any) => sum + (s[field] || 0), 0) / scores.length;
      return {
        vendor_id: id,
        vendor: data.vendor,
        overall_score: Math.round((avg('quality_score') + avg('delivery_score') + avg('price_score') + avg('communication_score')) / 4),
        quality_score: Math.round(avg('quality_score')),
        delivery_score: Math.round(avg('delivery_score')),
        price_score: Math.round(avg('price_score')),
        communication_score: Math.round(avg('communication_score')),
        evaluation_count: scores.length
      };
    });

    return NextResponse.json({
      scores: data,
      vendor_rankings: aggregated.sort((a, b) => b.overall_score - a.overall_score),
      top_performers: aggregated.filter(v => v.overall_score >= 80),
      needs_review: aggregated.filter(v => v.overall_score < 60)
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch scores' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { vendor_id, project_id, quality_score, delivery_score, price_score, communication_score, comments } = body;

    const { data, error } = await supabase.from('vendor_scores').insert({
      vendor_id, project_id, quality_score, delivery_score, price_score, communication_score,
      comments, evaluation_date: new Date().toISOString(), evaluated_by: user.id
    }).select().single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Update vendor's average score
    const { data: allScores } = await supabase.from('vendor_scores')
      .select('quality_score, delivery_score, price_score, communication_score')
      .eq('vendor_id', vendor_id);

    if (allScores && allScores.length > 0) {
      const avgScore = allScores.reduce((sum, s) => 
        sum + (s.quality_score + s.delivery_score + s.price_score + s.communication_score) / 4, 0
      ) / allScores.length;

      await supabase.from('vendors').update({ 
        performance_score: Math.round(avgScore),
        last_evaluation_date: new Date().toISOString()
      }).eq('id', vendor_id);
    }

    return NextResponse.json({ score: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create score' }, { status: 500 });
  }
}
