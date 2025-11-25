import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Asset location tracking (GPS/RFID integration, warehouse management)
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

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
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

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
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { asset_id, warehouse_id, zone, shelf, bin, gps_lat, gps_lng, rfid_tag, notes } = body;

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

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ location: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update location' }, { status: 500 });
  }
}
