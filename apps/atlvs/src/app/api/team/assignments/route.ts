export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { withAuth, PlatformRole } from '@ghxstship/config';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const ATLVS_ROLES = [
  PlatformRole.ATLVS_SUPER_ADMIN, PlatformRole.ATLVS_ADMIN, PlatformRole.ATLVS_TEAM_MEMBER, PlatformRole.ATLVS_VIEWER,
  PlatformRole.LEGEND_SUPER_ADMIN, PlatformRole.LEGEND_ADMIN, PlatformRole.LEGEND_DEVELOPER,
];

const createAssignmentSchema = z.object({
  team_member_id: z.string().uuid(),
  project_id: z.string().uuid().optional(),
  event_id: z.string().uuid().optional(),
  role: z.string().min(1),
  department: z.string().min(1),
  start_date: z.string(),
  end_date: z.string().optional(),
  status: z.enum(['assigned', 'confirmed', 'in_progress', 'completed', 'cancelled']).default('assigned'),
  notes: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;
    
    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden - ATLVS access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const teamMemberId = searchParams.get('team_member_id');
    const projectId = searchParams.get('project_id');
    const status = searchParams.get('status');

    let query = supabase
      .from('workforce_shift_assignments')
      .select('*, crew:crew_members(id, full_name, email), project:projects(id, name)')
      .order('start_date', { ascending: true });

    if (teamMemberId) {
      query = query.eq('crew_id', teamMemberId);
    }
    if (projectId) {
      query = query.eq('project_id', projectId);
    }
    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      logger.error('Error fetching team assignments:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const mapped = (data || []).map(item => ({
      id: item.id,
      team_member_id: item.crew_id,
      project_id: item.project_id,
      event_id: item.event_id,
      role: item.role || item.position,
      department: item.department || 'General',
      start_date: item.start_date,
      end_date: item.end_date,
      status: item.status || 'assigned',
      notes: item.notes,
      created_at: item.created_at,
      updated_at: item.updated_at,
      team_member: item.crew ? { id: item.crew.id, full_name: item.crew.full_name, email: item.crew.email } : undefined,
      project: item.project ? { id: item.project.id, name: item.project.name } : undefined,
    }));

    return NextResponse.json({ data: mapped });
  } catch (error) {
    logger.error('Error in GET /api/team/assignments:', error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json({ error: 'Failed to fetch assignments' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;
    
    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden - ATLVS access required' }, { status: 403 });
    }

    const body = await request.json();
    const validationResult = createAssignmentSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json({ error: 'Validation failed', details: validationResult.error.errors }, { status: 400 });
    }

    const insertData = {
      crew_id: validationResult.data.team_member_id,
      project_id: validationResult.data.project_id,
      event_id: validationResult.data.event_id,
      role: validationResult.data.role,
      department: validationResult.data.department,
      start_date: validationResult.data.start_date,
      end_date: validationResult.data.end_date,
      status: validationResult.data.status,
      notes: validationResult.data.notes,
    };

    const { data, error } = await supabase
      .from('workforce_shift_assignments')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      logger.error('Error creating team assignment:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    logger.error('Error in POST /api/team/assignments:', error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json({ error: 'Failed to create assignment' }, { status: 500 });
  }
}
