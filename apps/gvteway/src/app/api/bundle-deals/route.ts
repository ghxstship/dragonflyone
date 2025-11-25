import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

const bundleSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  products: z.array(z.object({
    product_id: z.string().uuid(),
    quantity: z.number().min(1).default(1),
  })),
  discount_type: z.enum(['percentage', 'fixed']),
  discount_value: z.number().min(0),
  valid_from: z.string().datetime().optional(),
  valid_to: z.string().datetime().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const productId = searchParams.get('product_id');

    if (type === 'cross_sell' && productId) {
      // Get frequently bought together products
      const { data: orderItems } = await supabase
        .from('order_items')
        .select('order_id')
        .eq('product_id', productId);

      const orderIds = orderItems?.map(i => i.order_id) || [];

      if (orderIds.length > 0) {
        const { data: relatedItems } = await supabase
          .from('order_items')
          .select('product_id, product:products(id, name, price, image_url)')
          .in('order_id', orderIds)
          .neq('product_id', productId);

        // Count frequency
        const frequency: Record<string, { count: number; product: any }> = {};
        relatedItems?.forEach(item => {
          if (!frequency[item.product_id]) {
            frequency[item.product_id] = { count: 0, product: item.product };
          }
          frequency[item.product_id].count++;
        });

        const recommendations = Object.values(frequency)
          .sort((a, b) => b.count - a.count)
          .slice(0, 5)
          .map(f => f.product);

        return NextResponse.json({ cross_sell_recommendations: recommendations });
      }

      return NextResponse.json({ cross_sell_recommendations: [] });
    }

    if (type === 'active') {
      const now = new Date().toISOString();
      const { data: bundles, error } = await supabase
        .from('bundle_deals')
        .select(`*, items:bundle_deal_items(*, product:products(id, name, price, image_url))`)
        .eq('status', 'active')
        .or(`valid_from.is.null,valid_from.lte.${now}`)
        .or(`valid_to.is.null,valid_to.gte.${now}`);

      if (error) throw error;
      return NextResponse.json({ bundles });
    }

    const { data: bundles, error } = await supabase
      .from('bundle_deals')
      .select(`*, items:bundle_deal_items(*, product:products(id, name, price, image_url))`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json({ bundles });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = bundleSchema.parse(body);

    // Calculate original total price
    const productIds = validated.products.map(p => p.product_id);
    const { data: products } = await supabase
      .from('products')
      .select('id, price')
      .in('id', productIds);

    let originalTotal = 0;
    validated.products.forEach(p => {
      const product = products?.find(pr => pr.id === p.product_id);
      if (product) {
        originalTotal += product.price * p.quantity;
      }
    });

    const discountAmount = validated.discount_type === 'percentage'
      ? originalTotal * (validated.discount_value / 100)
      : validated.discount_value;

    const bundlePrice = originalTotal - discountAmount;

    // Create bundle
    const { data: bundle, error } = await supabase
      .from('bundle_deals')
      .insert({
        name: validated.name,
        description: validated.description,
        discount_type: validated.discount_type,
        discount_value: validated.discount_value,
        original_price: originalTotal,
        bundle_price: bundlePrice,
        valid_from: validated.valid_from,
        valid_to: validated.valid_to,
        status: 'active',
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    // Create bundle items
    const items = validated.products.map(p => ({
      bundle_id: bundle.id,
      product_id: p.product_id,
      quantity: p.quantity,
    }));

    await supabase.from('bundle_deal_items').insert(items);

    return NextResponse.json({ bundle }, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    const { data: bundle, error } = await supabase
      .from('bundle_deals')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ bundle });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    const { error } = await supabase
      .from('bundle_deals')
      .update({ status: 'inactive' })
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
