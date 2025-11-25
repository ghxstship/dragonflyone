import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const productId = searchParams.get('product_id');
    const locationId = searchParams.get('location_id');

    if (type === 'status') {
      const { data: syncs, error } = await supabase
        .from('inventory_sync_logs')
        .select('*')
        .order('synced_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return NextResponse.json({ recent_syncs: syncs });
    }

    if (type === 'by_location') {
      const { data: inventory, error } = await supabase
        .from('inventory_locations')
        .select(`*, product:products(id, name, sku)`)
        .order('product_id');

      if (error) throw error;

      // Group by location
      const byLocation = inventory?.reduce((acc: Record<string, any[]>, item) => {
        if (!acc[item.location_id]) acc[item.location_id] = [];
        acc[item.location_id].push(item);
        return acc;
      }, {});

      return NextResponse.json({ inventory_by_location: byLocation });
    }

    if (productId) {
      const { data: locations, error } = await supabase
        .from('inventory_locations')
        .select(`*, location:locations(id, name, type)`)
        .eq('product_id', productId);

      if (error) throw error;

      const totalStock = locations?.reduce((sum, l) => sum + l.quantity, 0) || 0;

      return NextResponse.json({ product_id: productId, locations, total_stock: totalStock });
    }

    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const action = body.action;

    if (action === 'sync') {
      const { product_id, location_id, quantity, source } = body.data;

      // Update inventory at location
      const { data: existing } = await supabase
        .from('inventory_locations')
        .select('id, quantity')
        .eq('product_id', product_id)
        .eq('location_id', location_id)
        .single();

      let result;
      if (existing) {
        const { data, error } = await supabase
          .from('inventory_locations')
          .update({ quantity, last_synced_at: new Date().toISOString() })
          .eq('id', existing.id)
          .select()
          .single();
        if (error) throw error;
        result = data;
      } else {
        const { data, error } = await supabase
          .from('inventory_locations')
          .insert({
            product_id,
            location_id,
            quantity,
            last_synced_at: new Date().toISOString(),
          })
          .select()
          .single();
        if (error) throw error;
        result = data;
      }

      // Log sync
      await supabase.from('inventory_sync_logs').insert({
        product_id,
        location_id,
        previous_quantity: existing?.quantity || 0,
        new_quantity: quantity,
        source,
        synced_at: new Date().toISOString(),
      });

      // Update main product stock
      const { data: allLocations } = await supabase
        .from('inventory_locations')
        .select('quantity')
        .eq('product_id', product_id);

      const totalStock = allLocations?.reduce((sum, l) => sum + l.quantity, 0) || 0;

      await supabase
        .from('products')
        .update({ stock_quantity: totalStock })
        .eq('id', product_id);

      return NextResponse.json({ inventory: result, total_stock: totalStock });
    }

    if (action === 'bulk_sync') {
      const { updates, source } = body.data;

      for (const update of updates) {
        await supabase
          .from('inventory_locations')
          .upsert({
            product_id: update.product_id,
            location_id: update.location_id,
            quantity: update.quantity,
            last_synced_at: new Date().toISOString(),
          }, { onConflict: 'product_id,location_id' });
      }

      // Log bulk sync
      await supabase.from('inventory_sync_logs').insert({
        sync_type: 'bulk',
        items_synced: updates.length,
        source,
        synced_at: new Date().toISOString(),
      });

      return NextResponse.json({ success: true, items_synced: updates.length });
    }

    if (action === 'transfer') {
      const { product_id, from_location_id, to_location_id, quantity } = body.data;

      // Decrease from source
      const { data: source } = await supabase
        .from('inventory_locations')
        .select('quantity')
        .eq('product_id', product_id)
        .eq('location_id', from_location_id)
        .single();

      if (!source || source.quantity < quantity) {
        return NextResponse.json({ error: 'Insufficient stock at source location' }, { status: 400 });
      }

      await supabase
        .from('inventory_locations')
        .update({ quantity: source.quantity - quantity })
        .eq('product_id', product_id)
        .eq('location_id', from_location_id);

      // Increase at destination
      const { data: dest } = await supabase
        .from('inventory_locations')
        .select('quantity')
        .eq('product_id', product_id)
        .eq('location_id', to_location_id)
        .single();

      if (dest) {
        await supabase
          .from('inventory_locations')
          .update({ quantity: dest.quantity + quantity })
          .eq('product_id', product_id)
          .eq('location_id', to_location_id);
      } else {
        await supabase.from('inventory_locations').insert({
          product_id,
          location_id: to_location_id,
          quantity,
        });
      }

      return NextResponse.json({ success: true, transferred: quantity });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
