import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}


// Lazy getter for supabase client - only accessed at runtime
const supabase = new Proxy({} as ReturnType<typeof getSupabaseClient>, {
  get(_target, prop) {
    return (getSupabaseClient() as any)[prop];
  }
});

// Size, color, and variant management
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('product_id');

    if (!productId) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
    }

    const { data: product } = await supabase.from('products').select('*').eq('id', productId).single();
    const { data: variants, error } = await supabase.from('product_variants').select('*')
      .eq('product_id', productId).order('sort_order', { ascending: true });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Group variants by type
    const sizes = variants?.filter(v => v.variant_type === 'size') || [];
    const colors = variants?.filter(v => v.variant_type === 'color') || [];
    const other = variants?.filter(v => !['size', 'color'].includes(v.variant_type)) || [];

    // Get inventory for each variant
    const { data: inventory } = await supabase.from('variant_inventory').select('*')
      .in('variant_id', variants?.map(v => v.id) || []);

    const variantsWithInventory = variants?.map(v => ({
      ...v,
      inventory: inventory?.find(i => i.variant_id === v.id)?.quantity || 0,
      in_stock: (inventory?.find(i => i.variant_id === v.id)?.quantity || 0) > 0
    }));

    return NextResponse.json({
      product,
      variants: variantsWithInventory,
      grouped: { sizes, colors, other },
      available_combinations: generateCombinations(sizes, colors)
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch variants' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { product_id, variant_type, value, sku, price_modifier, image_url, sort_order } = body;

    const { data, error } = await supabase.from('product_variants').insert({
      product_id, variant_type, value, sku, price_modifier: price_modifier || 0,
      image_url, sort_order: sort_order || 0, status: 'active'
    }).select().single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Initialize inventory
    await supabase.from('variant_inventory').insert({
      variant_id: data.id, quantity: 0, reserved: 0
    });

    return NextResponse.json({ variant: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create variant' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { id, action, quantity } = body;

    if (action === 'update_inventory') {
      await supabase.from('variant_inventory').update({ quantity }).eq('variant_id', id);
      return NextResponse.json({ success: true });
    }

    const { error } = await supabase.from('product_variants').update(body).eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}

function generateCombinations(sizes: any[], colors: any[]): any[] {
  if (sizes.length === 0) return colors.map(c => ({ color: c.value }));
  if (colors.length === 0) return sizes.map(s => ({ size: s.value }));
  
  const combinations: any[] = [];
  sizes.forEach(s => {
    colors.forEach(c => {
      combinations.push({ size: s.value, color: c.value });
    });
  });
  return combinations;
}
