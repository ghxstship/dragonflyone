import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const positionSchema = z.object({
  title: z.string().min(1).max(255),
  department_id: z.string().uuid().optional(),
  current_holder_id: z.string().uuid().optional(),
  criticality_level: z.enum(['critical', 'high', 'medium', 'low']).default('medium'),
  risk_of_vacancy: z.enum(['high', 'medium', 'low']).default('medium'),
  impact_of_vacancy: z.string().optional(),
  required_competencies: z.array(z.string()).optional(),
  required_certifications: z.array(z.string()).optional(),
  minimum_experience_years: z.number().int().optional(),
  job_description: z.string().optional(),
  salary_range: z.object({
    min: z.number().optional(),
    max: z.number().optional(),
    currency: z.string().default('USD'),
  }).optional(),
  notes: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const department_id = searchParams.get('department_id');
    const criticality_level = searchParams.get('criticality_level');
    const succession_readiness = searchParams.get('succession_readiness');
    const include_candidates = searchParams.get('include_candidates') === 'true';

    let selectQuery = `
      *,
      department:departments(id, name, code),
      current_holder:platform_users!current_holder_id(id, email, full_name, avatar_url)
    `;

    if (include_candidates) {
      selectQuery += `,
        candidates:succession_candidates(
          id, readiness_level, priority_rank, potential_rating, performance_rating, flight_risk,
          candidate:platform_users!candidate_id(id, email, full_name, avatar_url)
        )
      `;
    }

    let query = supabase
      .from('key_positions')
      .select(selectQuery)
      .eq('is_active', true);

    if (department_id) {
      query = query.eq('department_id', department_id);
    }
    if (criticality_level) {
      query = query.eq('criticality_level', criticality_level);
    }
    if (succession_readiness) {
      query = query.eq('succession_readiness', succession_readiness);
    }

    const { data, error } = await query.order('criticality_level').order('title');

    if (error) throw error;

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error fetching key positions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch key positions' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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
    const validated = positionSchema.parse(body);

    const { data, error } = await supabase
      .from('key_positions')
      .insert({
        ...validated,
        succession_readiness: 'not_ready',
        is_active: true,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error creating key position:', error);
    return NextResponse.json(
      { error: 'Failed to create key position' },
      { status: 500 }
    );
  }
}
