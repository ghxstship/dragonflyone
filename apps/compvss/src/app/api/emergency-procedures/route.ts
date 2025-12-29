export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase, withAuth, PlatformRole } from '@ghxstship/config';
import { z } from 'zod';

const createProcedureSchema = z.object({
  venue_id: z.string().uuid(),
  emergency_type: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  contact_tree: z.array(z.record(z.unknown())).optional(),
  evacuation_routes: z.array(z.string()).optional(),
  steps: z.array(z.object({
    action: z.string(),
    responsible_party: z.string().optional(),
  })).optional(),
});

// Emergency response procedures
const COMPVSS_ROLES = [
  PlatformRole.COMPVSS_ADMIN, PlatformRole.COMPVSS_TEAM_MEMBER, PlatformRole.COMPVSS_VIEWER,
  PlatformRole.LEGEND_SUPER_ADMIN, PlatformRole.LEGEND_ADMIN, PlatformRole.LEGEND_DEVELOPER,
];

export async function GET(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!COMPVSS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const emergencyType = searchParams.get('type');
    const venueId = searchParams.get('venue_id');

    let query = supabase.from('emergency_procedures').select(`
      *, steps:procedure_steps(id, step_number, action, responsible_party)
    `);

    if (emergencyType) query = query.eq('emergency_type', emergencyType);
    if (venueId) query = query.eq('venue_id', venueId);

    const { data, error } = await query.order('emergency_type', { ascending: true });
    if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });

    return NextResponse.json({ procedures: data });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!COMPVSS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const validatedData = createProcedureSchema.parse(body);
    const { venue_id, emergency_type, title, description, contact_tree, evacuation_routes, steps } = validatedData;

    const { data, error } = await supabase.from('emergency_procedures').insert({
      venue_id, emergency_type, title, description,
      contact_tree: contact_tree || [], evacuation_routes: evacuation_routes || [],
      created_by: user.id
    }).select().single();

    if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });

    interface ProcedureStep { action: string; responsible_party?: string }
    if (steps?.length) {
      await supabase.from('procedure_steps').insert(
        steps.map((s: ProcedureStep, i: number) => ({
          procedure_id: data.id, step_number: i + 1,
          action: s.action, responsible_party: s.responsible_party
        }))
      );
    }

    return NextResponse.json({ procedure: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
  }
}
