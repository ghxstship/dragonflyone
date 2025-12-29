export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase, withAuth, PlatformRole } from '@ghxstship/config';
import { z } from 'zod';

const createDisposalSchema = z.object({
  project_id: z.string().uuid(),
  waste_type: z.string(),
  quantity: z.number().optional(),
  unit: z.string().optional(),
  vendor_id: z.string().uuid().optional(),
  scheduled_at: z.string().optional(),
  location: z.string().optional(),
});

const updateDisposalSchema = z.object({
  id: z.string().uuid(),
  status: z.string().optional(),
  actual_quantity: z.number().optional(),
  manifest_number: z.string().optional(),
});

// Waste disposal and recycling coordination
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

    const { data, error } = await supabase.from('waste_disposal').select(`
      *, vendor:vendors(id, name, contact_phone)
    `).eq('project_id', projectId).order('scheduled_at', { ascending: true });

    if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });

    // Calculate totals by type
    const totals = {
      general: data?.filter(d => d.waste_type === 'general').reduce((s, d) => s + (d.quantity || 0), 0) || 0,
      recycling: data?.filter(d => d.waste_type === 'recycling').reduce((s, d) => s + (d.quantity || 0), 0) || 0,
      hazardous: data?.filter(d => d.waste_type === 'hazardous').reduce((s, d) => s + (d.quantity || 0), 0) || 0
    };

    return NextResponse.json({ disposals: data, totals });
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
    const validatedData = createDisposalSchema.parse(body);
    const { project_id, waste_type, quantity, unit, vendor_id, scheduled_at, location } = validatedData;

    const { data, error } = await supabase.from('waste_disposal').insert({
      project_id, waste_type, quantity, unit, vendor_id,
      scheduled_at, location, status: 'scheduled', created_by: user.id
    }).select().single();

    if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
    return NextResponse.json({ disposal: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
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

    const body = await request.json();
    const validatedData = updateDisposalSchema.parse(body);
    const { id, status, actual_quantity, manifest_number } = validatedData;

    await supabase.from('waste_disposal').update({
      status, actual_quantity, manifest_number,
      completed_at: status === 'completed' ? new Date().toISOString() : null
    }).eq('id', id);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}
