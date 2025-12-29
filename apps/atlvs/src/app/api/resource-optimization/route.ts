export const dynamic = 'force-dynamic';

import { withAuth, PlatformRole } from '@ghxstship/config';
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { z } from 'zod';

const createAllocationSchema = z.object({
  resource_id: z.string().uuid(),
  project_id: z.string().uuid(),
  allocation_percent: z.number().min(0).max(100),
  start_date: z.string(),
  end_date: z.string().optional(),
  role: z.string().optional(),
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
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('start_date') || new Date().toISOString().split('T')[0];

    const { data: allocations, error } = await supabase
      .from('resource_allocations')
      .select(`*, project:projects(id, name), employee:employees(id, first_name, last_name)`)
      .gte('start_date', startDate);

    if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });

    const utilization = calculateUtilization(allocations || []);
    const recommendations = generateRecommendations(utilization);

    return NextResponse.json({ allocations, utilization, recommendations });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch resources' }, { status: 500 });
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
    const validatedData = createAllocationSchema.parse(body);
    const { data, error } = await supabase
      .from('resource_allocations')
      .insert({ ...validatedData, created_by: user.id })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
    return NextResponse.json({ allocation: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create allocation' }, { status: 500 });
  }
}

function calculateUtilization(allocations: unknown[]) {
  const map = new Map();
  allocations.forEach(a => {
    const key = a.resource_id;
    if (!map.has(key)) map.set(key, { resource_id: key, total: 0, projects: [] });
    const r = map.get(key);
    r.total += a.allocation_percent || 0;
    r.projects.push(a.project?.name);
  });
  return Array.from(map.values()).map(r => ({
    ...r,
    status: r.total > 100 ? 'overallocated' : r.total < 50 ? 'underutilized' : 'optimal'
  }));
}

function generateRecommendations(utilization: unknown[]) {
  return utilization
    .filter(u => u.status !== 'optimal')
    .map(u => ({
      resource_id: u.resource_id,
      type: u.status,
      message: u.status === 'overallocated' 
        ? `Resource at ${u.total}% - redistribute workload`
        : `Resource at ${u.total}% - consider additional assignments`
    }));
}
