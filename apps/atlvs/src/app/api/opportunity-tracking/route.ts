import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Opportunity tracking with probability weighting
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const stage = searchParams.get('stage');
    const ownerId = searchParams.get('owner_id');

    let query = supabase.from('opportunities').select(`
      *, contact:contacts(id, name, company), owner:platform_users(id, first_name, last_name)
    `);

    if (stage) query = query.eq('stage', stage);
    if (ownerId) query = query.eq('owner_id', ownerId);

    const { data, error } = await query.order('expected_close_date', { ascending: true });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Calculate weighted pipeline
    const weightedTotal = data?.reduce((sum, opp) => sum + (opp.value * (opp.probability / 100)), 0) || 0;
    const totalValue = data?.reduce((sum, opp) => sum + opp.value, 0) || 0;

    // Group by stage
    const byStage = data?.reduce((acc: any, opp) => {
      if (!acc[opp.stage]) acc[opp.stage] = { count: 0, value: 0, weighted: 0 };
      acc[opp.stage].count++;
      acc[opp.stage].value += opp.value;
      acc[opp.stage].weighted += opp.value * (opp.probability / 100);
      return acc;
    }, {}) || {};

    return NextResponse.json({
      opportunities: data,
      pipeline: {
        total_value: totalValue,
        weighted_value: Math.round(weightedTotal),
        by_stage: byStage,
        count: data?.length || 0
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch opportunities' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { contact_id, name, value, stage, probability, expected_close_date, source, notes } = body;

    const { data, error } = await supabase.from('opportunities').insert({
      contact_id, name, value, stage: stage || 'qualification',
      probability: probability || getStageProbability(stage || 'qualification'),
      expected_close_date, source, notes, owner_id: user.id
    }).select().single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ opportunity: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create opportunity' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { id, stage, probability, ...updateData } = body;

    // Auto-update probability based on stage if not manually set
    const newProbability = probability || (stage ? getStageProbability(stage) : undefined);

    const { error } = await supabase.from('opportunities').update({
      ...updateData,
      stage,
      probability: newProbability,
      updated_at: new Date().toISOString()
    }).eq('id', id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}

function getStageProbability(stage: string): number {
  const probabilities: Record<string, number> = {
    'lead': 10,
    'qualification': 20,
    'needs_analysis': 40,
    'proposal': 60,
    'negotiation': 80,
    'closed_won': 100,
    'closed_lost': 0
  };
  return probabilities[stage] || 20;
}
