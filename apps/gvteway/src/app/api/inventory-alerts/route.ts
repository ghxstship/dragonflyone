import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Real-time inventory tracking with low-stock alerts
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('product_id');
    const lowStockOnly = searchParams.get('low_stock') === 'true';

    let query = supabase.from('variant_inventory').select(`
      *, variant:product_variants(*, product:products(id, name, category))
    `);

    if (productId) {
      query = query.eq('variant.product_id', productId);
    }

    const { data, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Get low stock thresholds
    const { data: thresholds } = await supabase.from('inventory_thresholds').select('*');
    const defaultThreshold = 10;

    const inventoryWithStatus = data?.map(item => {
      const threshold = thresholds?.find(t => t.product_id === item.variant?.product?.id)?.low_stock_threshold || defaultThreshold;
      return {
        ...item,
        low_stock_threshold: threshold,
        is_low_stock: item.quantity <= threshold,
        is_out_of_stock: item.quantity === 0,
        available: item.quantity - (item.reserved || 0)
      };
    });

    const filtered = lowStockOnly 
      ? inventoryWithStatus?.filter(i => i.is_low_stock) 
      : inventoryWithStatus;

    return NextResponse.json({
      inventory: filtered,
      summary: {
        total_items: data?.length || 0,
        low_stock: inventoryWithStatus?.filter(i => i.is_low_stock && !i.is_out_of_stock).length || 0,
        out_of_stock: inventoryWithStatus?.filter(i => i.is_out_of_stock).length || 0
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch inventory' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { action, product_id, variant_id, quantity, reason } = body;

    if (action === 'adjust') {
      const { data: current } = await supabase.from('variant_inventory').select('quantity')
        .eq('variant_id', variant_id).single();

      const newQuantity = (current?.quantity || 0) + quantity;

      await supabase.from('variant_inventory').update({ quantity: newQuantity }).eq('variant_id', variant_id);

      // Log adjustment
      await supabase.from('inventory_adjustments').insert({
        variant_id, previous_quantity: current?.quantity || 0,
        adjustment: quantity, new_quantity: newQuantity,
        reason, adjusted_by: user.id
      });

      // Check for low stock alert
      const { data: threshold } = await supabase.from('inventory_thresholds').select('low_stock_threshold')
        .eq('product_id', product_id).single();

      if (newQuantity <= (threshold?.low_stock_threshold || 10)) {
        await supabase.from('inventory_alerts').insert({
          variant_id, alert_type: 'low_stock', quantity: newQuantity,
          threshold: threshold?.low_stock_threshold || 10
        });
      }

      return NextResponse.json({ success: true, new_quantity: newQuantity });
    }

    if (action === 'set_threshold') {
      const { low_stock_threshold } = body;
      await supabase.from('inventory_thresholds').upsert({
        product_id, low_stock_threshold, updated_by: user.id
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 });
  }
}
