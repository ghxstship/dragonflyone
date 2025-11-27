import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { z } from 'zod';

const updateSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  department_id: z.string().uuid().optional().nullable(),
  current_holder_id: z.string().uuid().optional().nullable(),
  criticality_level: z.enum(['critical', 'high', 'medium', 'low']).optional(),
  risk_of_vacancy: z.enum(['high', 'medium', 'low']).optional(),
  impact_of_vacancy: z.string().optional().nullable(),
  required_competencies: z.array(z.string()).optional(),
  required_certifications: z.array(z.string()).optional(),
  minimum_experience_years: z.number().int().optional().nullable(),
  job_description: z.string().optional().nullable(),
  salary_range: z.object({
    min: z.number().optional(),
    max: z.number().optional(),
    currency: z.string().default('USD'),
  }).optional(),
  succession_readiness: z.enum(['ready_now', 'ready_1_year', 'ready_2_years', 'not_ready']).optional(),
  notes: z.string().optional().nullable(),
  is_active: z.boolean().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createAdminClient();
  try {
    const { data, error } = await supabase
      .from('key_positions')
      .select(`
        *,
        department:departments(id, name, code),
        current_holder:platform_users!current_holder_id(id, email, full_name, avatar_url, hire_date),
        candidates:succession_candidates(
          id, readiness_level, priority_rank, strengths, development_needs, 
          competency_gaps, potential_rating, performance_rating, flight_risk,
          retention_actions, assessment_date, status,
          candidate:platform_users!candidate_id(id, email, full_name, avatar_url),
          assessed_by_user:platform_users!assessed_by(id, email, full_name),
          development_plans:succession_development_plans(
            id, plan_name, status, progress_percentage, target_completion_date
          )
        )
      `)
      .eq('id', params.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Position not found' },
          { status: 404 }
        );
      }
      throw error;
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error fetching key position:', error);
    return NextResponse.json(
      { error: 'Failed to fetch key position' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createAdminClient();
  try {
    const body = await request.json();
    const validated = updateSchema.parse(body);

    const { data, error } = await supabase
      .from('key_positions')
      .update(validated)
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Position not found' },
          { status: 404 }
        );
      }
      throw error;
    }

    return NextResponse.json({ data });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error updating key position:', error);
    return NextResponse.json(
      { error: 'Failed to update key position' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createAdminClient();
  try {
    // Soft delete
    const { error } = await supabase
      .from('key_positions')
      .update({ is_active: false })
      .eq('id', params.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting key position:', error);
    return NextResponse.json(
      { error: 'Failed to delete key position' },
      { status: 500 }
    );
  }
}
