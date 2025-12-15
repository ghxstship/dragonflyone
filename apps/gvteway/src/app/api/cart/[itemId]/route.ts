export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { withAuth, logger } from '@ghxstship/config';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

const updateQuantitySchema = z.object({
  quantity: z.number().int().min(1).max(10),
});

// GET /api/cart/[itemId] - Get single cart item
export async function GET(
  request: NextRequest,
  { params }: { params: { itemId: string } }
) {
  try {
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;
    
    const userId = authResult.user?.id;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getSupabaseClient();
    
    const { data, error } = await supabase
      .from('cart_items')
      .select(`
        id,
        quantity,
        unit_price,
        event:events(id, name, start_date, venue_name),
        ticket_type:ticket_types(id, name, price)
      `)
      .eq('id', params.itemId)
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Cart item not found' }, { status: 404 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ item: data });
  } catch (error) {
    logger.error('Error in GET /api/cart/[itemId]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/cart/[itemId] - Update cart item quantity
export async function PATCH(
  request: NextRequest,
  { params }: { params: { itemId: string } }
) {
  try {
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;
    
    const userId = authResult.user?.id;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validated = updateQuantitySchema.parse(body);

    const supabase = getSupabaseClient();

    // Verify ownership
    const { data: existingItem } = await supabase
      .from('cart_items')
      .select('id')
      .eq('id', params.itemId)
      .eq('user_id', userId)
      .single();

    if (!existingItem) {
      return NextResponse.json({ error: 'Cart item not found' }, { status: 404 });
    }

    const { data, error } = await supabase
      .from('cart_items')
      .update({ 
        quantity: validated.quantity,
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.itemId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ item: data, message: 'Quantity updated' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    logger.error('Error in PATCH /api/cart/[itemId]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/cart/[itemId] - Remove item from cart
export async function DELETE(
  request: NextRequest,
  { params }: { params: { itemId: string } }
) {
  try {
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;
    
    const userId = authResult.user?.id;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getSupabaseClient();

    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', params.itemId)
      .eq('user_id', userId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Item removed from cart' });
  } catch (error) {
    logger.error('Error in DELETE /api/cart/[itemId]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
