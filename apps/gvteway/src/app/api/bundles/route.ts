export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}



export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('event_id');
    const isActive = searchParams.get('is_active');

    // Use addon_bundles table which exists in the schema
    let query = supabase
      .from('addon_bundles')
      .select('*')
      .order('created_at', { ascending: false });

    if (eventId) {
      query = query.eq('event_id', eventId);
    }

    if (isActive !== null) {
      query = query.eq('is_active', isActive === 'true');
    }

    const { data, error } = await query;

    if (error) {
      if (error.message?.includes('does not exist') || error.code === '42P01') {
        return NextResponse.json({ bundles: [] });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const bundles = data?.map(b => ({
      id: b.id,
      name: b.name,
      description: b.description,
      bundle_price: b.bundle_price,
      original_price: b.original_price,
      savings_percent: b.original_price && b.bundle_price 
        ? Math.round(((b.original_price - b.bundle_price) / b.original_price) * 100) 
        : 0,
      is_active: b.is_active,
      event_id: b.event_id,
    })) || [];

    return NextResponse.json({ bundles });
  } catch (error) {
    const msg = error instanceof Error ? error.message : '';
    if (msg.includes('does not exist') || msg.includes('42P01')) {
      return NextResponse.json({ bundles: [] });
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, product_ids, bundle_price, available_quantity, event_id, valid_from, valid_until } = body;

    if (!name || !product_ids || product_ids.length === 0 || !bundle_price) {
      return NextResponse.json(
        { error: 'Name, products, and bundle price are required' },
        { status: 400 }
      );
    }

    // Get product prices to calculate original price
    const { data: products } = await supabase
      .from('products')
      .select('id, price')
      .in('id', product_ids);

    const originalPrice = products?.reduce((sum, p) => sum + p.price, 0) || 0;

    // Create bundle
    const { data: bundle, error: bundleError } = await supabase
      .from('product_bundles')
      .insert({
        name,
        description,
        original_price: originalPrice,
        bundle_price,
        available_quantity,
        event_id,
        valid_from,
        valid_until,
        is_active: true,
      })
      .select()
      .single();

    if (bundleError) {
      return NextResponse.json({ error: bundleError.message }, { status: 500 });
    }

    // Add products to bundle
    const bundleProducts = product_ids.map((productId: string) => ({
      bundle_id: bundle.id,
      product_id: productId,
    }));

    await supabase
      .from('bundle_products')
      .insert(bundleProducts);

    return NextResponse.json({ bundle }, { status: 201 });
  } catch (error) {
    const msg = error instanceof Error ? error.message : '';
    if (msg.includes('does not exist') || msg.includes('42P01')) {
      return NextResponse.json({ bundle: null });
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, name, description, bundle_price, available_quantity, is_active } = body;

    if (!id) {
      return NextResponse.json({ error: 'Bundle ID required' }, { status: 400 });
    }

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (name) updates.name = name;
    if (description) updates.description = description;
    if (bundle_price) updates.bundle_price = bundle_price;
    if (available_quantity !== undefined) updates.available_quantity = available_quantity;
    if (is_active !== undefined) updates.is_active = is_active;

    const { data, error } = await supabase
      .from('product_bundles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
    }

    return NextResponse.json({ bundle: data });
  } catch (error) {
    const msg = error instanceof Error ? error.message : '';
    if (msg.includes('does not exist') || msg.includes('42P01')) {
      return NextResponse.json({ bundle: null });
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
