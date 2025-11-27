import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('start_date') || new Date().toISOString().split('T')[0];

    const { data: allocations, error } = await supabase
      .from('resource_allocations')
      .select(`*, project:projects(id, name), employee:employees(id, first_name, last_name)`)
      .gte('start_date', startDate);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

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
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { data, error } = await supabase
      .from('resource_allocations')
      .insert({ ...body, created_by: user.id })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ allocation: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create allocation' }, { status: 500 });
  }
}

function calculateUtilization(allocations: any[]) {
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

function generateRecommendations(utilization: any[]) {
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
