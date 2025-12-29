export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase, withAuth, PlatformRole } from '@ghxstship/config';
import { z } from 'zod';

// Schema: Aligned with Supabase merch_booths table - uses booth_name not booth_number
const setupBoothSchema = z.object({
  action: z.literal('setup_booth'),
  event_id: z.string().uuid(),
  location: z.string().min(1),
  booth_name: z.string().min(1),
});

// Schema: Aligned with Supabase merch_inventory table - uses item_id, quantity_start
const inventoryItemSchema = z.object({
  item_id: z.string().uuid(),
  quantity_start: z.number().min(1),
  color: z.string().optional(),
  size: z.string().optional(),
});

const loadInventorySchema = z.object({
  action: z.literal('load_inventory'),
  event_id: z.string().uuid(),
  booth_id: z.string().uuid(),
  items: z.array(inventoryItemSchema),
});

// Schema: Aligned with Supabase merch_sales table - uses item_id, quantity, unit_price
const saleItemSchema = z.object({
  item_id: z.string().uuid(),
  quantity: z.number().min(1),
  unit_price: z.number().min(0),
  color: z.string().optional(),
  size: z.string().optional(),
});

// Schema: Aligned with Supabase merch_sales table - each sale is one item
const recordSaleSchema = z.object({
  action: z.literal('record_sale'),
  event_id: z.string().uuid(),
  booth_id: z.string().uuid(),
  items: z.array(saleItemSchema),
  payment_method: z.enum(['cash', 'card', 'mobile']),
});

const merchActionSchema = z.union([setupBoothSchema, loadInventorySchema, recordSaleSchema]);

// Merchandise coordination
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
    const eventId = searchParams.get('event_id');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = (page - 1) * limit;

    // Validate eventId is provided
    if (!eventId) {
      return NextResponse.json({ error: 'event_id is required' }, { status: 400 });
    }

    // Schema: Select booth_name (not booth_number) to match Supabase merch_booths table
    const { data: booths, count: boothCount } = await supabase
      .from('merch_booths')
      .select(`
        id, location, booth_name, status, created_at
      `, { count: 'exact' })
      .eq('event_id', eventId)
      .range(offset, offset + limit - 1);

    // Schema: Aligned with merch_inventory table columns
    const { data: inventory, count: invCount } = await supabase
      .from('merch_inventory')
      .select('id, item_id, booth_id, quantity_start, quantity_remaining, quantity_sold, color, size', { count: 'exact' })
      .eq('event_id', eventId)
      .range(offset, offset + limit - 1);

    // Schema: Aligned with merch_sales table columns - uses total_price not amount
    const { data: sales, count: salesCount } = await supabase
      .from('merch_sales')
      .select('id, item_id, quantity, unit_price, total_price, payment_method, sold_at', { count: 'exact' })
      .eq('event_id', eventId)
      .range(offset, offset + limit - 1);

    const totalSales = sales?.reduce((s, sale) => s + (sale.total_price || 0), 0) || 0;

    const pagination = {
      page,
      limit,
      booths_total: boothCount || 0,
      inventory_total: invCount || 0,
      sales_total: salesCount || 0,
    };

    return NextResponse.json({
      booths,
      inventory,
      sales_summary: {
        total_sales: totalSales,
        transactions: sales?.length || 0
      },
      pagination,
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

    const body = await request.json();
    const validatedData = merchActionSchema.parse(body);
    const { action, event_id } = validatedData;

    if (action === 'setup_booth') {
      const { location, booth_name } = validatedData as z.infer<typeof setupBoothSchema>;

      const { data, error } = await supabase.from('merch_booths').insert({
        event_id, location, booth_name, status: 'setup'
      }).select().single();

      if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
      return NextResponse.json({ booth: data }, { status: 201 });
    }

    if (action === 'load_inventory') {
      const { booth_id, items } = validatedData as z.infer<typeof loadInventorySchema>;

      // Schema: Aligned with merch_inventory table - uses item_id, quantity_start
      const records = items.map((item) => ({
        event_id,
        booth_id,
        item_id: item.item_id,
        quantity_start: item.quantity_start,
        quantity_remaining: item.quantity_start,
        quantity_sold: 0,
        color: item.color || null,
        size: item.size || null,
      }));

      const { error } = await supabase.from('merch_inventory').insert(records);
      if (error) {
        return NextResponse.json({ error: 'Failed to load inventory' }, { status: 500 });
      }
      return NextResponse.json({ success: true });
    }

    if (action === 'record_sale') {
      const { booth_id, items, payment_method } = validatedData as z.infer<typeof recordSaleSchema>;

      // Schema: Aligned with merch_sales table - each item is a separate sale record
      const saleRecords = items.map((item) => ({
        event_id,
        booth_id,
        item_id: item.item_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.quantity * item.unit_price,
        payment_method,
        color: item.color || null,
        size: item.size || null,
        sold_at: new Date().toISOString(),
      }));

      const { data, error } = await supabase.from('merch_sales').insert(saleRecords).select();

      if (error) {
        return NextResponse.json({ error: 'Failed to record sale' }, { status: 500 });
      }

      // Update inventory quantities using raw SQL for atomic decrement/increment
      for (const item of items) {
        // First get current inventory values
        const { data: currentInv } = await supabase
          .from('merch_inventory')
          .select('quantity_remaining, quantity_sold')
          .eq('event_id', event_id)
          .eq('item_id', item.item_id)
          .single();

        if (currentInv) {
          await supabase
            .from('merch_inventory')
            .update({
              quantity_remaining: (currentInv.quantity_remaining || 0) - item.quantity,
              quantity_sold: (currentInv.quantity_sold || 0) + item.quantity,
            })
            .eq('event_id', event_id)
            .eq('item_id', item.item_id);
        }
      }

      return NextResponse.json({ sales: data }, { status: 201 });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 });
  }
}
