export const dynamic = 'force-dynamic';

import { withAuth, PlatformRole } from '@ghxstship/config';
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { z } from 'zod';

const createPlanSchema = z.object({
  action: z.literal('create_plan'),
  position_id: z.string().uuid(),
  incumbent_id: z.string().uuid().optional(),
  risk_level: z.enum(['low', 'medium', 'high', 'critical']),
  target_date: z.string().optional(),
  notes: z.string().optional(),
});

const addCandidateSchema = z.object({
  action: z.literal('add_candidate'),
  plan_id: z.string().uuid(),
  employee_id: z.string().uuid(),
  readiness: z.enum(['ready_now', 'ready_1_year', 'ready_2_years', 'developing']),
  development_areas: z.array(z.string()).optional(),
  timeline: z.string().optional(),
  notes: z.string().optional(),
});

const updateReadinessSchema = z.object({
  action: z.literal('update_readiness'),
  candidate_id: z.string().uuid(),
  readiness: z.enum(['ready_now', 'ready_1_year', 'ready_2_years', 'developing']),
  development_progress: z.number().min(0).max(100).optional(),
  notes: z.string().optional(),
});

const createDevelopmentPlanSchema = z.object({
  action: z.literal('create_development_plan'),
  candidate_id: z.string().uuid(),
  goals: z.array(z.string()).optional(),
  activities: z.array(z.string()).optional(),
  timeline: z.string().optional(),
});

const successionActionSchema = z.union([
  createPlanSchema,
  addCandidateSchema,
  updateReadinessSchema,
  createDevelopmentPlanSchema,
]);

// Succession planning tools
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
    const positionId = searchParams.get('position_id');
    const employeeId = searchParams.get('employee_id');

    if (positionId) {
      const { data } = await supabase.from('succession_plans').select(`
        *, candidates:succession_candidates(
          employee:employees(id, first_name, last_name, title),
          readiness, development_areas, timeline
        )
      `).eq('position_id', positionId).single();

      return NextResponse.json({ plan: data });
    }

    if (employeeId) {
      // Get positions this employee is a candidate for
      const { data } = await supabase.from('succession_candidates').select(`
        *, plan:succession_plans(position:positions(id, title, department))
      `).eq('employee_id', employeeId);

      return NextResponse.json({ candidacies: data });
    }

    const { data, error } = await supabase.from('succession_plans').select(`
      *, position:positions(id, title, department),
      incumbent:employees(id, first_name, last_name),
      candidate_count:succession_candidates(count)
    `).order('risk_level', { ascending: false });

    if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });

    return NextResponse.json({ plans: data });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
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
    const validatedData = successionActionSchema.parse(body);
    const { action } = validatedData;

    if (action === 'create_plan') {
      const { position_id, incumbent_id, risk_level, target_date, notes } = validatedData as z.infer<typeof createPlanSchema>;

      const { data, error } = await supabase.from('succession_plans').insert({
        position_id, incumbent_id, risk_level, target_date, notes,
        status: 'active', created_by: user.id
      }).select().single();

      if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
      return NextResponse.json({ plan: data }, { status: 201 });
    }

    if (action === 'add_candidate') {
      const { plan_id, employee_id, readiness, development_areas, timeline, notes } = validatedData as z.infer<typeof addCandidateSchema>;

      const { data, error } = await supabase.from('succession_candidates').insert({
        plan_id, employee_id, readiness, development_areas: development_areas || [],
        timeline, notes, added_by: user.id
      }).select().single();

      if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
      return NextResponse.json({ candidate: data }, { status: 201 });
    }

    if (action === 'update_readiness') {
      const { candidate_id, readiness, development_progress, notes } = validatedData as z.infer<typeof updateReadinessSchema>;

      await supabase.from('succession_candidates').update({
        readiness, development_progress, notes, updated_at: new Date().toISOString()
      }).eq('id', candidate_id);

      return NextResponse.json({ success: true });
    }

    if (action === 'create_development_plan') {
      const { candidate_id, goals, activities, timeline } = validatedData as z.infer<typeof createDevelopmentPlanSchema>;

      const { data, error } = await supabase.from('development_plans').insert({
        succession_candidate_id: candidate_id, goals: goals || [],
        activities: activities || [], timeline, status: 'active', created_by: user.id
      }).select().single();

      if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
      return NextResponse.json({ development_plan: data }, { status: 201 });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 });
  }
}
