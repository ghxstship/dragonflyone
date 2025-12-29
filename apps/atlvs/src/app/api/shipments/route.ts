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

const ATLVS_ADMIN_ROLES = [
  PlatformRole.ATLVS_SUPER_ADMIN, PlatformRole.ATLVS_ADMIN,
  PlatformRole.LEGEND_SUPER_ADMIN, PlatformRole.LEGEND_ADMIN, PlatformRole.LEGEND_DEVELOPER,
];

const ShipmentSchema = z.object({
  organization_id: z.string().uuid().optional(),
  project_id: z.string().uuid().optional(),
  origin: z.string().min(1),
  destination: z.string().min(1),
  carrier: z.string().min(1),
  tracking_number: z.string().optional(),
  ship_date: z.string(),
  expected_delivery: z.string(),
  items_count: z.number().int().min(1),
  weight: z.number().min(0),
  cost: z.number().min(0),
  status: z.enum(['scheduled', 'in_transit', 'delivered', 'delayed', 'cancelled']).default('scheduled'),
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
    const status = searchParams.get('status');
    const carrier = searchParams.get('carrier');
    const projectId = searchParams.get('project_id');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('shipments')
      .select(`
        *,
        project:projects(id, name)
      `, { count: 'exact' })
      .order('ship_date', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }
    if (carrier && carrier !== 'All') {
      query = query.eq('carrier', carrier);
    }
    if (projectId) {
      query = query.eq('project_id', projectId);
    }

    const { data, error, count } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const shipments = data || [];
    const summary = {
      total: count || 0,
      active: shipments.filter(s => s.status !== 'delivered' && s.status !== 'cancelled').length,
      in_transit: shipments.filter(s => s.status === 'in_transit').length,
      delayed: shipments.filter(s => s.status === 'delayed').length,
      total_cost: shipments.reduce((sum, s) => sum + (s.cost || 0), 0),
    };

    return NextResponse.json({
      shipments,
      summary,
      pagination: { limit, offset, total: count || 0 },
    });
  } catch (error: unknown) {
    logger.error('Error in GET /api/shipments:', error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json({ error: 'Failed to fetch shipments' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;
    
    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ADMIN_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = ShipmentSchema.parse(body);

    const organizationId = validatedData.organization_id || '00000000-0000-0000-0000-000000000000';

    const { data, error } = await supabase
      .from('shipments')
      .insert({
        ...validatedData,
        organization_id: organizationId,
      })
      .select(`
        *,
        project:projects(id, name)
      `)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ shipment: data }, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    logger.error('Error in POST /api/shipments:', error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json({ error: 'Failed to create shipment' }, { status: 500 });
  }
}
