import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';

// Lead scoring and qualification automation
export async function GET(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const minScore = searchParams.get('min_score');

    let query = supabase.from('leads').select(`
      *, contact:contacts(id, name, email, company), assigned_to:platform_users(id, first_name, last_name)
    `);

    if (minScore) query = query.gte('score', parseInt(minScore));

    const { data, error } = await query.order('score', { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({
      leads: data,
      hot_leads: data?.filter(l => l.score >= 80) || [],
      warm_leads: data?.filter(l => l.score >= 50 && l.score < 80) || [],
      cold_leads: data?.filter(l => l.score < 50) || []
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 500 });
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
    const { contact_id, source, budget_range, timeline, decision_maker, company_size, industry } = body;

    // Calculate lead score
    const score = calculateLeadScore({ budget_range, timeline, decision_maker, company_size, industry });
    const qualification = score >= 80 ? 'hot' : score >= 50 ? 'warm' : 'cold';

    const { data, error } = await supabase.from('leads').insert({
      contact_id, source, budget_range, timeline, decision_maker, company_size, industry,
      score, qualification, status: 'new', created_by: user.id
    }).select().single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ lead: data, score, qualification }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create lead' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { id, action, ...updateData } = body;

    if (action === 'recalculate') {
      const { data: lead } = await supabase.from('leads').select('*').eq('id', id).single();
      if (lead) {
        const newScore = calculateLeadScore(lead);
        await supabase.from('leads').update({
          score: newScore, qualification: newScore >= 80 ? 'hot' : newScore >= 50 ? 'warm' : 'cold'
        }).eq('id', id);
      }
      return NextResponse.json({ success: true });
    }

    const { error } = await supabase.from('leads').update(updateData).eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}

function calculateLeadScore(data: any): number {
  let score = 0;

  // Budget scoring (0-30 points)
  if (data.budget_range === 'over_100k') score += 30;
  else if (data.budget_range === '50k_100k') score += 25;
  else if (data.budget_range === '25k_50k') score += 15;
  else if (data.budget_range === 'under_25k') score += 5;

  // Timeline scoring (0-25 points)
  if (data.timeline === 'immediate') score += 25;
  else if (data.timeline === '1_3_months') score += 20;
  else if (data.timeline === '3_6_months') score += 10;
  else if (data.timeline === '6_plus_months') score += 5;

  // Decision maker (0-20 points)
  if (data.decision_maker === true) score += 20;
  else if (data.decision_maker === 'influencer') score += 10;

  // Company size (0-15 points)
  if (data.company_size === 'enterprise') score += 15;
  else if (data.company_size === 'mid_market') score += 12;
  else if (data.company_size === 'small_business') score += 8;

  // Industry fit (0-10 points)
  const targetIndustries = ['entertainment', 'events', 'hospitality', 'media'];
  if (targetIndustries.includes(data.industry)) score += 10;

  return Math.min(score, 100);
}
