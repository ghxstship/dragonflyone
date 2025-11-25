import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

const customizationSchema = z.object({
  product_id: z.string().uuid(),
  customizations: z.array(z.object({
    type: z.enum(['text', 'image', 'color', 'size', 'engraving', 'monogram']),
    field_name: z.string(),
    value: z.string(),
    additional_cost: z.number().min(0).optional(),
  })),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('product_id');
    const type = searchParams.get('type');

    if (type === 'options' && productId) {
      const { data: options, error } = await supabase
        .from('product_customization_options')
        .select('*')
        .eq('product_id', productId)
        .eq('status', 'active')
        .order('display_order');

      if (error) throw error;
      return NextResponse.json({ customization_options: options });
    }

    if (type === 'templates') {
      const { data: templates, error } = await supabase
        .from('customization_templates')
        .select('*')
        .eq('status', 'active');

      if (error) throw error;
      return NextResponse.json({ templates });
    }

    return NextResponse.json({ error: 'product_id and type required' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const action = body.action;

    if (action === 'create_option') {
      const { product_id, option_type, field_name, required, additional_cost, options, display_order } = body.data;

      const { data: option, error } = await supabase
        .from('product_customization_options')
        .insert({
          product_id,
          option_type,
          field_name,
          required: required || false,
          additional_cost: additional_cost || 0,
          options,
          display_order: display_order || 0,
          status: 'active',
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ option }, { status: 201 });
    }

    if (action === 'preview') {
      const validated = customizationSchema.parse(body.data);

      // Calculate total additional cost
      const additionalCost = validated.customizations.reduce(
        (sum, c) => sum + (c.additional_cost || 0), 0
      );

      // Get base product price
      const { data: product } = await supabase
        .from('products')
        .select('price, name')
        .eq('id', validated.product_id)
        .single();

      return NextResponse.json({
        preview: {
          product_name: product?.name,
          base_price: product?.price || 0,
          customizations: validated.customizations,
          additional_cost: additionalCost,
          total_price: (product?.price || 0) + additionalCost,
        },
      });
    }

    if (action === 'save_to_cart') {
      const validated = customizationSchema.parse(body.data);
      const userId = body.user_id;

      const additionalCost = validated.customizations.reduce(
        (sum, c) => sum + (c.additional_cost || 0), 0
      );

      const { data: cartItem, error } = await supabase
        .from('cart_items')
        .insert({
          user_id: userId,
          product_id: validated.product_id,
          quantity: 1,
          customizations: validated.customizations,
          additional_cost: additionalCost,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ cart_item: cartItem }, { status: 201 });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
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

    const { data: option, error } = await supabase
      .from('product_customization_options')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ option });
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
      .from('product_customization_options')
      .update({ status: 'inactive' })
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
