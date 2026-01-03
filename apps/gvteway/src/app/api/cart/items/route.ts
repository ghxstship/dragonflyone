export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { withAuth } from '@ghxstship/config';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

const addItemSchema = z.object({
  product_id: z.string().min(1),
  quantity: z.number().int().min(1).default(1),
  variant_id: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const supabase = getSupabaseClient();
    
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const validated = addItemSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validated.error.flatten().fieldErrors },
        { status: 422 }
      );
    }

    const userId = authResult.user?.id;
    if (!userId) {
      return NextResponse.json({ error: 'User ID not found' }, { status: 401 });
    }

    // Get or create cart for user
    let { data: cart } = await supabase
      .from('carts')
      .select('id')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    if (!cart) {
      const { data: newCart, error: cartError } = await supabase
        .from('carts')
        .insert({ user_id: userId, status: 'active' })
        .select('id')
        .single();

      if (cartError) {
        return NextResponse.json({ error: 'Failed to create cart' }, { status: 500 });
      }
      cart = newCart;
    }

    // Add item to cart
    const { data: item, error: itemError } = await supabase
      .from('cart_items')
      .insert({
        cart_id: cart.id,
        product_id: validated.data.product_id,
        quantity: validated.data.quantity,
        variant_id: validated.data.variant_id,
      })
      .select()
      .single();

    if (itemError) {
      return NextResponse.json({ error: 'Failed to add item to cart' }, { status: 500 });
    }

    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const supabase = getSupabaseClient();
    const userId = authResult.user?.id;

    if (!userId) {
      return NextResponse.json({ error: 'User ID not found' }, { status: 401 });
    }

    const { data: cart } = await supabase
      .from('carts')
      .select('id')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    if (!cart) {
      return NextResponse.json({ items: [] });
    }

    const { data: items, error } = await supabase
      .from('cart_items')
      .select('*')
      .eq('cart_id', cart.id);

    if (error) {
      return NextResponse.json({ items: [] });
    }

    return NextResponse.json({ items: items || [] });
  } catch (error) {
    return NextResponse.json({ items: [] });
  }
}
