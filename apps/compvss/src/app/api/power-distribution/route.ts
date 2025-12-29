export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase, withAuth, PlatformRole } from '@ghxstship/config';
import { z } from 'zod';

const createPlanSchema = z.object({
  action: z.literal('create_plan'),
  project_id: z.string().uuid(),
  venue_capacity_amps: z.number().optional(),
  voltage: z.number().optional(),
  phases: z.number().optional(),
});

const addCircuitSchema = z.object({
  action: z.literal('add_circuit'),
  project_id: z.string().uuid().optional(),
  plan_id: z.string().uuid(),
  name: z.string().min(1),
  amperage: z.number(),
  voltage: z.number().optional(),
  phase: z.number().optional(),
  location: z.string().optional(),
  loads: z.array(z.string()).optional(),
});

const powerDistributionActionSchema = z.union([createPlanSchema, addCircuitSchema]);

// Power distribution planning
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

    const { data, error } = await supabase.from('power_plans').select(`
      *, circuits:power_circuits(id, name, amperage, voltage, phase, location, loads)
    `).eq('project_id', projectId);

    if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });

    // Calculate totals
    interface CircuitEntry { amperage?: number }
    const plan = data?.[0];
    const totalAmps = plan?.circuits?.reduce((s: number, c: CircuitEntry) => s + (c.amperage || 0), 0) || 0;

    return NextResponse.json({
      plan,
      totals: {
        circuits: plan?.circuits?.length || 0,
        total_amps: totalAmps,
        available_amps: (plan?.venue_capacity_amps || 0) - totalAmps
      }
    });
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
    const validatedData = powerDistributionActionSchema.parse(body);
    const { action } = validatedData;

    if (action === 'create_plan') {
      const { project_id, venue_capacity_amps, voltage, phases } = validatedData as z.infer<typeof createPlanSchema>;

      const { data, error } = await supabase.from('power_plans').insert({
        project_id, venue_capacity_amps, voltage, phases, created_by: user.id
      }).select().single();

      if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
      return NextResponse.json({ plan: data }, { status: 201 });
    }

    if (action === 'add_circuit') {
      const { plan_id, name, amperage, voltage, phase, location, loads } = validatedData as z.infer<typeof addCircuitSchema>;

      const { data, error } = await supabase.from('power_circuits').insert({
        plan_id, name, amperage, voltage, phase, location, loads: loads || []
      }).select().single();

      if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
      return NextResponse.json({ circuit: data }, { status: 201 });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 });
  }
}
