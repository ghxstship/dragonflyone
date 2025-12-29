export const dynamic = 'force-dynamic';

import { withAuth, PlatformRole } from '@ghxstship/config';
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { z } from 'zod';

const updateLocationSchema = z.object({
  asset_id: z.string().uuid(),
  warehouse_id: z.string().uuid().optional(),
  zone: z.string().optional(),
  shelf: z.string().optional(),
  bin: z.string().optional(),
  gps_lat: z.number().optional(),
  gps_lng: z.number().optional(),
  rfid_tag: z.string().optional(),
  notes: z.string().optional(),
});

// Asset location tracking (GPS/RFID integration, warehouse management)
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
    const assetId = searchParams.get('asset_id');
    const warehouseId = searchParams.get('warehouse_id');

    let query = supabase.from('asset_locations').select(`
      *, asset:assets(id, name, category, serial_number),
      warehouse:warehouses(id, name, address)
    `);

    if (assetId) query = query.eq('asset_id', assetId);
    if (warehouseId) query = query.eq('warehouse_id', warehouseId);

    const { data, error } = await query.order('updated_at', { ascending: false });
    if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });

    // Get location history for tracking
    const { data: history } = await supabase.from('asset_location_history').select('*')
      .in('asset_id', data?.map(d => d.asset_id) || [])
      .order('recorded_at', { ascending: false }).limit(100);

    return NextResponse.json({
      locations: data,
      history,
      warehouses: [...new Set(data?.map(d => d.warehouse) || [])]
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch locations' }, { status: 500 });
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
    const validatedData = updateLocationSchema.parse(body);
    const { asset_id, warehouse_id, zone, shelf, bin, gps_lat, gps_lng, rfid_tag, notes } = validatedData;

    // Record history
    const { data: current } = await supabase.from('asset_locations').select('*').eq('asset_id', asset_id).single();
    if (current) {
      await supabase.from('asset_location_history').insert({
        asset_id, previous_warehouse_id: current.warehouse_id, previous_zone: current.zone,
        new_warehouse_id: warehouse_id, new_zone: zone, moved_by: user.id
      });
    }

    // Update or insert location
    const { data, error } = await supabase.from('asset_locations').upsert({
      asset_id, warehouse_id, zone, shelf, bin, gps_lat, gps_lng, rfid_tag, notes,
      updated_by: user.id, updated_at: new Date().toISOString()
    }).select().single();

    if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
    return NextResponse.json({ location: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update location' }, { status: 500 });
  }
}
