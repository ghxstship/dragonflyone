import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { z } from 'zod';

// Validation schemas
const locationUpdateSchema = z.object({
  asset_id: z.string().uuid(),
  location_type: z.enum(['gps', 'rfid', 'manual', 'warehouse', 'venue', 'transit']),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  address: z.string().optional(),
  warehouse_id: z.string().uuid().optional(),
  warehouse_zone: z.string().optional(),
  warehouse_shelf: z.string().optional(),
  venue_id: z.string().uuid().optional(),
  project_id: z.string().uuid().optional(),
  rfid_tag: z.string().optional(),
  notes: z.string().optional(),
  reported_by: z.string().uuid(),
});

const warehouseSchema = z.object({
  name: z.string().min(1).max(200),
  address: z.string(),
  city: z.string(),
  state: z.string(),
  zip_code: z.string(),
  country: z.string().default('USA'),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  capacity_sqft: z.number().optional(),
  zones: z.array(z.object({
    name: z.string(),
    type: z.enum(['storage', 'staging', 'maintenance', 'shipping', 'receiving']),
    capacity: z.number().optional(),
  })).optional(),
  contact_name: z.string().optional(),
  contact_phone: z.string().optional(),
  contact_email: z.string().email().optional(),
});

const rfidScanSchema = z.object({
  rfid_tag: z.string(),
  scanner_id: z.string(),
  location_id: z.string().uuid().optional(),
  scan_type: z.enum(['checkin', 'checkout', 'inventory', 'transit']),
  scanned_by: z.string().uuid(),
});

// GET - Get asset locations and tracking data
export async function GET(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'locations' | 'history' | 'warehouses' | 'map' | 'alerts'
    const assetId = searchParams.get('asset_id');
    const warehouseId = searchParams.get('warehouse_id');
    const projectId = searchParams.get('project_id');

    if (type === 'locations') {
      // Get current locations of all assets or filtered
      let query = supabase
        .from('asset_locations')
        .select(`
          *,
          asset:assets(id, name, asset_tag, category, status),
          warehouse:warehouses(id, name, address),
          venue:venues(id, name, address),
          project:projects(id, name)
        `)
        .eq('is_current', true);

      if (assetId) {
        query = query.eq('asset_id', assetId);
      }
      if (warehouseId) {
        query = query.eq('warehouse_id', warehouseId);
      }
      if (projectId) {
        query = query.eq('project_id', projectId);
      }

      const { data: locations, error } = await query.order('updated_at', { ascending: false });

      if (error) throw error;

      return NextResponse.json({ locations });
    }

    if (type === 'history' && assetId) {
      // Get location history for an asset
      const page = parseInt(searchParams.get('page') || '1');
      const limit = parseInt(searchParams.get('limit') || '50');
      const offset = (page - 1) * limit;

      const { data: history, error, count } = await supabase
        .from('asset_location_history')
        .select(`
          *,
          warehouse:warehouses(id, name),
          venue:venues(id, name),
          project:projects(id, name),
          reporter:platform_users(id, email, first_name, last_name)
        `, { count: 'exact' })
        .eq('asset_id', assetId)
        .order('recorded_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      return NextResponse.json({
        history,
        total: count,
        page,
        limit,
      });
    }

    if (type === 'warehouses') {
      // Get all warehouses with inventory counts
      const { data: warehouses, error } = await supabase
        .from('warehouses')
        .select(`
          *,
          asset_count:asset_locations(count)
        `)
        .eq('status', 'active');

      if (error) throw error;

      // Get zone utilization for each warehouse
      const warehouseIds = warehouses?.map(w => w.id) || [];
      const { data: zoneData } = await supabase
        .from('asset_locations')
        .select('warehouse_id, warehouse_zone')
        .in('warehouse_id', warehouseIds)
        .eq('is_current', true);

      const zoneUtilization = zoneData?.reduce((acc: Record<string, Record<string, number>>, loc) => {
        if (!acc[loc.warehouse_id]) acc[loc.warehouse_id] = {};
        const zone = loc.warehouse_zone || 'unassigned';
        acc[loc.warehouse_id][zone] = (acc[loc.warehouse_id][zone] || 0) + 1;
        return acc;
      }, {});

      const enrichedWarehouses = warehouses?.map(w => ({
        ...w,
        zone_utilization: zoneUtilization?.[w.id] || {},
      }));

      return NextResponse.json({ warehouses: enrichedWarehouses });
    }

    if (type === 'map') {
      // Get all assets with GPS coordinates for map view
      const { data: locations, error } = await supabase
        .from('asset_locations')
        .select(`
          asset_id,
          latitude,
          longitude,
          address,
          location_type,
          updated_at,
          asset:assets(id, name, asset_tag, category, status)
        `)
        .eq('is_current', true)
        .not('latitude', 'is', null)
        .not('longitude', 'is', null);

      if (error) throw error;

      // Group by location for clustering
      const clusters = locations?.reduce((acc: Record<string, any[]>, loc) => {
        const key = `${Math.round(loc.latitude! * 100) / 100},${Math.round(loc.longitude! * 100) / 100}`;
        if (!acc[key]) acc[key] = [];
        acc[key].push(loc);
        return acc;
      }, {});

      return NextResponse.json({
        locations,
        clusters: Object.entries(clusters || {}).map(([key, assets]) => {
          const [lat, lng] = key.split(',').map(Number);
          return {
            latitude: lat,
            longitude: lng,
            count: assets.length,
            assets: assets.slice(0, 10), // Limit for performance
          };
        }),
      });
    }

    if (type === 'alerts') {
      // Get location-related alerts
      const { data: alerts, error } = await supabase
        .from('asset_location_alerts')
        .select(`
          *,
          asset:assets(id, name, asset_tag)
        `)
        .eq('resolved', false)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return NextResponse.json({ alerts });
    }

    if (type === 'rfid_inventory') {
      // Get RFID tag inventory
      const { data: tags, error } = await supabase
        .from('asset_rfid_tags')
        .select(`
          *,
          asset:assets(id, name, asset_tag, category),
          last_scan:rfid_scans(scanned_at, scan_type, location_id)
        `)
        .order('last_scanned_at', { ascending: false });

      if (error) throw error;

      return NextResponse.json({ tags });
    }

    // Default: return summary
    const [locationsResult, warehousesResult, alertsResult, transitResult] = await Promise.all([
      supabase.from('asset_locations').select('location_type', { count: 'exact' }).eq('is_current', true),
      supabase.from('warehouses').select('id', { count: 'exact' }).eq('status', 'active'),
      supabase.from('asset_location_alerts').select('id', { count: 'exact' }).eq('resolved', false),
      supabase.from('asset_locations').select('id', { count: 'exact' }).eq('is_current', true).eq('location_type', 'transit'),
    ]);

    // Location type distribution
    const locationTypes = locationsResult.data?.reduce((acc: Record<string, number>, loc) => {
      acc[loc.location_type] = (acc[loc.location_type] || 0) + 1;
      return acc;
    }, {});

    return NextResponse.json({
      summary: {
        total_tracked: locationsResult.count || 0,
        warehouses: warehousesResult.count || 0,
        active_alerts: alertsResult.count || 0,
        in_transit: transitResult.count || 0,
        location_distribution: locationTypes,
      },
    });
  } catch (error: any) {
    console.error('Asset tracking error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Update location or create warehouse
export async function POST(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const body = await request.json();
    const action = body.action;

    if (action === 'update_location') {
      const validated = locationUpdateSchema.parse(body.data);

      // Mark previous location as not current
      await supabase
        .from('asset_locations')
        .update({ is_current: false })
        .eq('asset_id', validated.asset_id)
        .eq('is_current', true);

      // Insert new location
      const { data: location, error } = await supabase
        .from('asset_locations')
        .insert({
          ...validated,
          is_current: true,
          recorded_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      // Also insert into history
      await supabase.from('asset_location_history').insert({
        asset_id: validated.asset_id,
        location_type: validated.location_type,
        latitude: validated.latitude,
        longitude: validated.longitude,
        address: validated.address,
        warehouse_id: validated.warehouse_id,
        warehouse_zone: validated.warehouse_zone,
        venue_id: validated.venue_id,
        project_id: validated.project_id,
        notes: validated.notes,
        reported_by: validated.reported_by,
        recorded_at: new Date().toISOString(),
      });

      // Update asset status if needed
      if (validated.location_type === 'transit') {
        await supabase
          .from('assets')
          .update({ status: 'in_transit', updated_at: new Date().toISOString() })
          .eq('id', validated.asset_id);
      }

      return NextResponse.json({ location }, { status: 201 });
    }

    if (action === 'create_warehouse') {
      const validated = warehouseSchema.parse(body.data);

      const { data: warehouse, error } = await supabase
        .from('warehouses')
        .insert({
          ...validated,
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json({ warehouse }, { status: 201 });
    }

    if (action === 'rfid_scan') {
      const validated = rfidScanSchema.parse(body.data);

      // Find asset by RFID tag
      const { data: tagData } = await supabase
        .from('asset_rfid_tags')
        .select('asset_id')
        .eq('rfid_tag', validated.rfid_tag)
        .single();

      if (!tagData) {
        return NextResponse.json({ error: 'RFID tag not found' }, { status: 404 });
      }

      // Record scan
      const { data: scan, error } = await supabase
        .from('rfid_scans')
        .insert({
          ...validated,
          asset_id: tagData.asset_id,
          scanned_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      // Update last scanned timestamp
      await supabase
        .from('asset_rfid_tags')
        .update({ last_scanned_at: new Date().toISOString() })
        .eq('rfid_tag', validated.rfid_tag);

      // If location_id provided, update asset location
      if (validated.location_id) {
        const { data: locationInfo } = await supabase
          .from('warehouse_zones')
          .select('warehouse_id, name')
          .eq('id', validated.location_id)
          .single();

        if (locationInfo) {
          await supabase
            .from('asset_locations')
            .update({ is_current: false })
            .eq('asset_id', tagData.asset_id)
            .eq('is_current', true);

          await supabase.from('asset_locations').insert({
            asset_id: tagData.asset_id,
            location_type: 'rfid',
            warehouse_id: locationInfo.warehouse_id,
            warehouse_zone: locationInfo.name,
            is_current: true,
            reported_by: validated.scanned_by,
            recorded_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        }
      }

      return NextResponse.json({ scan, asset_id: tagData.asset_id }, { status: 201 });
    }

    if (action === 'bulk_location_update') {
      // Update multiple assets at once (e.g., truck load)
      const { assets, location_data, reported_by } = body.data;

      const updates = assets.map((assetId: string) => ({
        asset_id: assetId,
        ...location_data,
        reported_by,
        is_current: true,
        recorded_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));

      // Mark all previous locations as not current
      await supabase
        .from('asset_locations')
        .update({ is_current: false })
        .in('asset_id', assets)
        .eq('is_current', true);

      // Insert new locations
      const { data: locations, error } = await supabase
        .from('asset_locations')
        .insert(updates)
        .select();

      if (error) throw error;

      return NextResponse.json({ locations, count: locations?.length }, { status: 201 });
    }

    if (action === 'register_rfid') {
      // Register RFID tag to asset
      const { asset_id, rfid_tag } = body.data;

      // Check if tag already exists
      const { data: existing } = await supabase
        .from('asset_rfid_tags')
        .select('id')
        .eq('rfid_tag', rfid_tag)
        .single();

      if (existing) {
        return NextResponse.json({ error: 'RFID tag already registered' }, { status: 409 });
      }

      const { data: tag, error } = await supabase
        .from('asset_rfid_tags')
        .insert({
          asset_id,
          rfid_tag,
          registered_at: new Date().toISOString(),
          status: 'active',
        })
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json({ tag }, { status: 201 });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    console.error('Asset tracking error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH - Update warehouse or resolve alert
export async function PATCH(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const body = await request.json();
    const { id, type, ...updates } = body;

    if (type === 'warehouse') {
      const { data: warehouse, error } = await supabase
        .from('warehouses')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json({ warehouse });
    }

    if (type === 'alert') {
      const { data: alert, error } = await supabase
        .from('asset_location_alerts')
        .update({
          resolved: true,
          resolved_at: new Date().toISOString(),
          resolved_by: updates.resolved_by,
          resolution_notes: updates.resolution_notes,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json({ alert });
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  } catch (error: any) {
    console.error('Asset tracking error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Deactivate warehouse or remove RFID tag
export async function DELETE(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const type = searchParams.get('type');

    if (!id || !type) {
      return NextResponse.json({ error: 'id and type are required' }, { status: 400 });
    }

    if (type === 'warehouse') {
      const { error } = await supabase
        .from('warehouses')
        .update({ status: 'inactive', updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
    } else if (type === 'rfid_tag') {
      const { error } = await supabase
        .from('asset_rfid_tags')
        .update({ status: 'deactivated' })
        .eq('id', id);

      if (error) throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Asset tracking error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
