export const dynamic = 'force-dynamic';

import { withAuth, PlatformRole } from '@ghxstship/config';
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { z } from 'zod';

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
    logger.error('Error fetching key positions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch key positions' },
      { status: 500 }
    );
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
    logger.error('Error creating key position:', error);
    return NextResponse.json(
      { error: 'Failed to create key position' },
      { status: 500 }
    );
  }
}
