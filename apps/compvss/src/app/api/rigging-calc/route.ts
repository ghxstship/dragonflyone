export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase, withAuth, PlatformRole } from '@ghxstship/config';
import { z } from 'zod';

const createPlanSchema = z.object({
  action: z.literal('create_plan'),
  project_id: z.string().uuid(),
  name: z.string().min(1),
  venue_capacity_kg: z.number().min(0).optional(),
  safety_factor: z.number().min(1).optional(),
});

const addPointSchema = z.object({
  action: z.literal('add_point'),
  project_id: z.string().uuid().optional(),
  plan_id: z.string().uuid(),
  point_id: z.string().min(1),
  x: z.number(),
  y: z.number(),
  z: z.number().optional(),
  load_kg: z.number().min(0),
  hardware: z.string().optional(),
  notes: z.string().optional(),
});

const calculateSchema = z.object({
  action: z.literal('calculate'),
  project_id: z.string().uuid().optional(),
  plan_id: z.string().uuid(),
  type: z.enum(['point_load', 'bridle', 'distributed']),
  input_values: z.object({
    load_kg: z.number().min(0),
    angle_deg: z.number().optional(),
  }),
});

const riggingActionSchema = z.union([createPlanSchema, addPointSchema, calculateSchema]);

// Rigging calculations and documentation
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

    const { data, error } = await supabase.from('rigging_plans').select(`
      *, points:rigging_points(id, point_id, x, y, z, load_kg, hardware, notes),
      calculations:rigging_calculations(id, type, input_values, result, safety_factor)
    `).eq('project_id', projectId);

    if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
    return NextResponse.json({ plans: data });
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
    const validatedData = riggingActionSchema.parse(body);
    const { action } = validatedData;

    if (action === 'create_plan') {
      const { project_id, name, venue_capacity_kg, safety_factor } = validatedData as z.infer<typeof createPlanSchema>;

      const { data, error } = await supabase.from('rigging_plans').insert({
        project_id, name, venue_capacity_kg, safety_factor: safety_factor || 5,
        status: 'draft', created_by: user.id
      }).select().single();

      if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
      return NextResponse.json({ plan: data }, { status: 201 });
    }

    if (action === 'add_point') {
      const { plan_id, point_id, x, y, z, load_kg, hardware, notes } = validatedData as z.infer<typeof addPointSchema>;

      const { data, error } = await supabase.from('rigging_points').insert({
        plan_id, point_id, x, y, z, load_kg, hardware, notes
      }).select().single();

      if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
      return NextResponse.json({ point: data }, { status: 201 });
    }

    if (action === 'calculate') {
      const { plan_id, type, input_values } = validatedData as z.infer<typeof calculateSchema>;

      // Perform calculation based on type
      interface RiggingResult { vertical_force?: number; horizontal_force?: number; wll_required?: number; leg_load?: number; wll_per_leg?: number }
      let result: RiggingResult = {};
      const safetyFactor = 5;

      if (type === 'point_load') {
        const { load_kg, angle_deg } = input_values;
        const angleRad = (angle_deg || 0) * Math.PI / 180;
        result = {
          vertical_force: load_kg * Math.cos(angleRad),
          horizontal_force: load_kg * Math.sin(angleRad),
          wll_required: load_kg * safetyFactor
        };
      } else if (type === 'bridle') {
        const { load_kg, angle_deg } = input_values;
        const angleRad = (angle_deg || 30) * Math.PI / 180;
        result = {
          leg_load: load_kg / (2 * Math.cos(angleRad)),
          wll_per_leg: (load_kg / (2 * Math.cos(angleRad))) * safetyFactor
        };
      }

      const { data, error } = await supabase.from('rigging_calculations').insert({
        plan_id, type, input_values, result, safety_factor: safetyFactor
      }).select().single();

      if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
      return NextResponse.json({ calculation: data }, { status: 201 });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 });
  }
}
