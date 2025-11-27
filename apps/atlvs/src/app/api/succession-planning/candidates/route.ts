import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { z } from 'zod';

const candidateSchema = z.object({
  position_id: z.string().uuid(),
  candidate_id: z.string().uuid(),
  readiness_level: z.enum(['ready_now', 'ready_1_year', 'ready_2_years', 'ready_3_plus_years', 'not_suitable']),
  priority_rank: z.number().int().default(1),
  strengths: z.array(z.string()).optional(),
  development_needs: z.array(z.string()).optional(),
  competency_gaps: z.array(z.string()).optional(),
  potential_rating: z.enum(['high', 'medium', 'low']).optional(),
  performance_rating: z.enum(['exceptional', 'exceeds', 'meets', 'below', 'unsatisfactory']).optional(),
  flight_risk: z.enum(['high', 'medium', 'low']).default('low'),
  retention_actions: z.array(z.string()).optional(),
  assessment_date: z.string().optional(),
  notes: z.string().optional(),
});

export async function GET(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const { searchParams } = new URL(request.url);
    const position_id = searchParams.get('position_id');
    const candidate_id = searchParams.get('candidate_id');
    const readiness_level = searchParams.get('readiness_level');
    const status = searchParams.get('status') || 'active';

    let query = supabase
      .from('succession_candidates')
      .select(`
        *,
        position:key_positions(id, title, department_id, criticality_level),
        candidate:platform_users!candidate_id(id, email, full_name, avatar_url, hire_date),
        assessed_by_user:platform_users!assessed_by(id, email, full_name),
        development_plans:succession_development_plans(
          id, plan_name, status, progress_percentage, start_date, target_completion_date
        )
      `)
      .eq('status', status);

    if (position_id) {
      query = query.eq('position_id', position_id);
    }
    if (candidate_id) {
      query = query.eq('candidate_id', candidate_id);
    }
    if (readiness_level) {
      query = query.eq('readiness_level', readiness_level);
    }

    const { data, error } = await query.order('priority_rank');

    if (error) throw error;

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error fetching succession candidates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch succession candidates' },
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

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validated = candidateSchema.parse(body);

    // Check if candidate already exists for this position
    const { data: existing } = await supabase
      .from('succession_candidates')
      .select('id')
      .eq('position_id', validated.position_id)
      .eq('candidate_id', validated.candidate_id)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'Candidate already exists for this position' },
        { status: 409 }
      );
    }

    const { data, error } = await supabase
      .from('succession_candidates')
      .insert({
        ...validated,
        assessed_by: user.id,
        status: 'active',
      })
      .select()
      .single();

    if (error) throw error;

    // Update position succession readiness based on candidates
    await updatePositionReadiness(validated.position_id);

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error creating succession candidate:', error);
    return NextResponse.json(
      { error: 'Failed to create succession candidate' },
      { status: 500 }
    );
  }
}

async function updatePositionReadiness(positionId: string) {
  // Get all active candidates for this position
  const { data: candidates } = await supabase
    .from('succession_candidates')
    .select('readiness_level')
    .eq('position_id', positionId)
    .eq('status', 'active');

  if (!candidates || candidates.length === 0) {
    await supabase
      .from('key_positions')
      .update({ succession_readiness: 'not_ready' })
      .eq('id', positionId);
    return;
  }

  // Determine best readiness level
  const readinessOrder = ['ready_now', 'ready_1_year', 'ready_2_years', 'not_ready'];
  let bestReadiness = 'not_ready';

  for (const candidate of candidates) {
    const candidateIndex = readinessOrder.indexOf(candidate.readiness_level);
    const bestIndex = readinessOrder.indexOf(bestReadiness);
    if (candidateIndex !== -1 && candidateIndex < bestIndex) {
      bestReadiness = candidate.readiness_level;
    }
  }

  // Map candidate readiness to position readiness
  const positionReadiness = bestReadiness === 'ready_3_plus_years' ? 'not_ready' : bestReadiness;

  await supabase
    .from('key_positions')
    .update({ succession_readiness: positionReadiness })
    .eq('id', positionId);
}
