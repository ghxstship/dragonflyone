export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase, withAuth, PlatformRole } from '@ghxstship/config';
import { z } from 'zod';

const createStagingAreaSchema = z.object({
  project_id: z.string().uuid(),
  venue_id: z.string().uuid().optional(),
  name: z.string().min(1),
  location: z.string().optional(),
  capacity: z.number().min(0).optional(),
  dimensions: z.string().optional(),
  access_notes: z.string().optional(),
});

const assignSchema = z.object({
  id: z.string().uuid(),
  action: z.literal('assign'),
  equipment_ids: z.array(z.string().uuid()),
  department: z.string().optional(),
  time_slot: z.string().optional(),
});

const releaseSchema = z.object({
  id: z.string().uuid(),
  action: z.literal('release'),
});

const updateStagingAreaSchema = z.object({
  id: z.string().uuid(),
  name: z.string().optional(),
  location: z.string().optional(),
  capacity: z.number().min(0).optional(),
  dimensions: z.string().optional(),
  access_notes: z.string().optional(),
  status: z.enum(['available', 'occupied', 'reserved']).optional(),
});

const stagingPatchSchema = z.union([assignSchema, releaseSchema, updateStagingAreaSchema]);

// Staging area assignment and management
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
    const projectId = searchParams.get('project_id');
    const venueId = searchParams.get('venue_id');

    let query = supabase.from('staging_areas').select(`
      *, assignments:staging_assignments(*, equipment:equipment(id, name))
    `);

    if (projectId) query = query.eq('project_id', projectId);
    if (venueId) query = query.eq('venue_id', venueId);

    const { data, error } = await query;
    if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });

    return NextResponse.json({
      staging_areas: data,
      available: data?.filter(a => a.status === 'available') || [],
      occupied: data?.filter(a => a.status === 'occupied') || []
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch staging areas' }, { status: 500 });
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

    const userId = authResult.user?.id;
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const validatedData = createStagingAreaSchema.parse(body);
    const { project_id, venue_id, name, location, capacity, dimensions, access_notes } = validatedData;

    const { data, error } = await supabase.from('staging_areas').insert({
      project_id, venue_id, name, location, capacity, dimensions, access_notes,
      status: 'available', created_by: userId
    }).select().single();

    if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
    return NextResponse.json({ staging_area: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create staging area' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!COMPVSS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const userId = authResult.user?.id;
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const validatedData = stagingPatchSchema.parse(body);
    const { id } = validatedData;

    if ('action' in validatedData && validatedData.action === 'assign') {
      const { equipment_ids, department, time_slot } = validatedData as z.infer<typeof assignSchema>;
      await supabase.from('staging_areas').update({ status: 'occupied' }).eq('id', id);

      const assignments = equipment_ids.map((eqId: string) => ({
        staging_area_id: id, equipment_id: eqId, department, time_slot, assigned_by: userId
      }));

      await supabase.from('staging_assignments').insert(assignments);
      return NextResponse.json({ success: true });
    }

    if ('action' in validatedData && validatedData.action === 'release') {
      await supabase.from('staging_areas').update({ status: 'available' }).eq('id', id);
      await supabase.from('staging_assignments').delete().eq('staging_area_id', id);
      return NextResponse.json({ success: true });
    }

    const { error } = await supabase.from('staging_areas').update(body).eq('id', id);
    if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}
