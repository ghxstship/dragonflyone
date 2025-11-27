import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const { searchParams } = new URL(request.url);
    const qualification = searchParams.get('qualification');
    const source = searchParams.get('source');
    const minScore = searchParams.get('min_score');

    let query = supabase
      .from('leads')
      .select('*')
      .order('score', { ascending: false });

    if (qualification) {
      query = query.eq('qualification_status', qualification);
    }

    if (source) {
      query = query.eq('source', source);
    }

    if (minScore) {
      query = query.gte('score', parseInt(minScore));
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ leads: data || [] });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { lead_id, action } = body;

    if (!lead_id) {
      return NextResponse.json({ error: 'Lead ID required' }, { status: 400 });
    }

    // Get lead and scoring rules
    const { data: lead } = await supabase
      .from('leads')
      .select('*')
      .eq('id', lead_id)
      .single();

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    if (action === 'recalculate') {
      // Get active scoring rules
      const { data: rules } = await supabase
        .from('lead_scoring_rules')
        .select('*')
        .eq('is_active', true);

      // Calculate score based on rules
      let score = 0;
      const breakdown = {
        demographic: 0,
        behavioral: 0,
        engagement: 0,
        fit: 0,
      };

      // Apply rules (simplified - in production would evaluate conditions)
      rules?.forEach(rule => {
        // Add points based on category
        breakdown[rule.category as keyof typeof breakdown] += rule.points;
        score += rule.points;
      });

      // Update lead score
      const { data: updated, error: updateError } = await supabase
        .from('leads')
        .update({
          score,
          score_breakdown: breakdown,
          updated_at: new Date().toISOString(),
        })
        .eq('id', lead_id)
        .select()
        .single();

      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 });
      }

      return NextResponse.json({ lead: updated });
    }

    if (action === 'qualify') {
      const { qualification_status } = body;

      const { data: updated, error: updateError } = await supabase
        .from('leads')
        .update({
          qualification_status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', lead_id)
        .select()
        .single();

      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 });
      }

      return NextResponse.json({ lead: updated });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
