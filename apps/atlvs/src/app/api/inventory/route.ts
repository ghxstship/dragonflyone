export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { withAuth, PlatformRole } from '@ghxstship/config';
import { z } from 'zod';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const InventoryItemSchema = z.object({
  product_id: z.string().uuid(),
  location_id: z.string().uuid().optional(),
  quantity: z.number().int().min(0),
  sku: z.string().optional(),
  name: z.string().min(1),
  category: z.string().optional(),
  unit_cost: z.number().optional(),
  reorder_point: z.number().int().optional(),
  reorder_quantity: z.number().int().optional(),
});

const AdjustmentSchema = z.object({
  product_id: z.string().uuid(),
  location_id: z.string().uuid().optional(),
  adjustment_type: z.enum(['add', 'remove', 'transfer', 'count', 'damage', 'return']),
  quantity: z.number().int(),
  reason: z.string().optional(),
});

const ATLVS_ROLES = [
  PlatformRole.ATLVS_SUPER_ADMIN, PlatformRole.ATLVS_ADMIN, PlatformRole.ATLVS_TEAM_MEMBER, PlatformRole.ATLVS_VIEWER,
  PlatformRole.LEGEND_SUPER_ADMIN, PlatformRole.LEGEND_ADMIN, PlatformRole.LEGEND_DEVELOPER,
];

const ATLVS_ADMIN_ROLES = [
  PlatformRole.ATLVS_SUPER_ADMIN, PlatformRole.ATLVS_ADMIN,
  PlatformRole.LEGEND_SUPER_ADMIN, PlatformRole.LEGEND_ADMIN, PlatformRole.LEGEND_DEVELOPER,
];

export async function GET(request: NextRequest) {
  try {
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;
    
    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden - ATLVS access required' }, { status: 403 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { searchParams } = new URL(request.url);
    
    const locationId = searchParams.get('location_id');
    const category = searchParams.get('category');
    const lowStock = searchParams.get('low_stock') === 'true';
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('inventory_thresholds')
      .select(`
        *,
        location:inventory_locations(id, name, type)
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (locationId) {
      query = query.eq('location_id', locationId);
    }

    if (category) {
      query = query.eq('category', category);
    }

    if (lowStock) {
      query = query.lte('current_quantity', supabase.rpc('get_min_quantity'));
    }

    const { data, error, count } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const items = data || [];
    
    const { data: alerts } = await supabase
      .from('inventory_alerts')
      .select('*')
      .eq('status', 'active');

    const summary = {
      total_items: count || 0,
      low_stock_alerts: alerts?.filter(a => a.alert_type === 'low_stock').length || 0,
      out_of_stock_alerts: alerts?.filter(a => a.alert_type === 'out_of_stock').length || 0,
      total_alerts: alerts?.length || 0,
    };

    return NextResponse.json({
      inventory: items,
      alerts: alerts || [],
      summary,
      pagination: { limit, offset, total: count || 0 },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch inventory' }, { status: 500 });
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

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const body = await request.json();
    
    const { action } = body;
    
    if (action === 'adjust') {
      const validatedData = AdjustmentSchema.parse(body);
      
      const { data, error } = await supabase
        .from('inventory_adjustments')
        .insert(validatedData)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ adjustment: data }, { status: 201 });
    }
    
    const validatedData = InventoryItemSchema.parse(body);

    const { data, error } = await supabase
      .from('inventory_thresholds')
      .insert({
        product_id: validatedData.product_id,
        location_id: validatedData.location_id,
        min_quantity: validatedData.reorder_point || 0,
        reorder_point: validatedData.reorder_point,
        reorder_quantity: validatedData.reorder_quantity,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ item: data }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    logger.error('Error in POST /api/inventory:', error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json({ error: 'Failed to create inventory item' }, { status: 500 });
  }
}
