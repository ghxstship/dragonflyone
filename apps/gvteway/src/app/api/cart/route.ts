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

const addToCartSchema = z.object({
  event_id: z.string().uuid(),
  ticket_type_id: z.string().uuid(),
  quantity: z.number().int().min(1).max(10),
});

// GET /api/cart - Get cart items for current user
export async function GET(request: NextRequest) {
  try {
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;
    
    const userId = authResult.user?.id;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getSupabaseClient();
    
    // Fetch cart items with event and ticket type details
    const { data: items, error } = await supabase
      .from('cart_items')
      .select(`
        id,
        quantity,
        unit_price,
        created_at,
        event:events(id, name, start_date, venue_name),
        ticket_type:ticket_types(id, name, price)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      if (error.message?.includes('does not exist') || error.code === '42P01') {
        return NextResponse.json({ 
          items: [], 
          summary: { item_count: 0, subtotal: 0, service_fees: 0, taxes: 0, total: 0 } 
        });
      }
      logger.error('Error fetching cart:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Transform items for frontend
    const cartItems = (items || []).map((item: Record<string, unknown>) => {
      const event = item.event as Record<string, unknown> | null;
      const ticketType = item.ticket_type as Record<string, unknown> | null;
      const quantity = item.quantity as number;
      const unitPrice = (item.unit_price as number) || (ticketType?.price as number) || 0;
      const subtotal = unitPrice * quantity;
      const fees = subtotal * 0.1; // 10% service fee

      return {
        id: item.id,
        event_id: event?.id || '',
        event_name: event?.name || 'Unknown Event',
        event_date: event?.start_date || '',
        venue_name: event?.venue_name || '',
        ticket_type_id: ticketType?.id || '',
        ticket_type_name: ticketType?.name || '',
        quantity,
        unit_price: unitPrice,
        subtotal,
        fees,
        total: subtotal + fees,
      };
    });

    // Calculate summary
    const subtotal = cartItems.reduce((sum, item) => sum + item.subtotal, 0);
    const serviceFees = cartItems.reduce((sum, item) => sum + item.fees, 0);
    const taxes = subtotal * 0.08; // 8% tax
    const total = subtotal + serviceFees + taxes;

    const summary = {
      item_count: cartItems.reduce((sum, item) => sum + item.quantity, 0),
      subtotal,
      service_fees: serviceFees,
      taxes,
      total,
    };

    return NextResponse.json({ items: cartItems, summary });
  } catch (error) {
    const msg = error instanceof Error ? error.message : '';
    if (msg.includes('does not exist') || msg.includes('42P01')) {
      return NextResponse.json({ 
        items: [], 
        summary: { item_count: 0, subtotal: 0, service_fees: 0, taxes: 0, total: 0 } 
      });
    }
    logger.error('Error in GET /api/cart:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/cart - Add item to cart
export async function POST(request: NextRequest) {
  try {
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;
    
    const userId = authResult.user?.id;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validated = addToCartSchema.parse(body);

    const supabase = getSupabaseClient();

    // Get ticket type price
    const { data: ticketType } = await supabase
      .from('legend_products')
      .select('price')
      .eq('id', validated.ticket_type_id)
      .single();

    // Check if item already exists in cart
    const { data: existingItem } = await supabase
      .from('cart_items')
      .select('id, quantity')
      .eq('user_id', userId)
      .eq('event_id', validated.event_id)
      .eq('ticket_type_id', validated.ticket_type_id)
      .single();

    if (existingItem) {
      // Update quantity
      const { data, error } = await supabase
        .from('cart_items')
        .update({ quantity: existingItem.quantity + validated.quantity })
        .eq('id', existingItem.id)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      return NextResponse.json({ item: data, message: 'Cart updated' });
    }

    // Insert new item
    const { data, error } = await supabase
      .from('cart_items')
      .insert({
        user_id: userId,
        event_id: validated.event_id,
        ticket_type_id: validated.ticket_type_id,
        quantity: validated.quantity,
        unit_price: ticketType?.price || 0,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ item: data, message: 'Added to cart' }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    logger.error('Error in POST /api/cart:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/cart - Clear cart
export async function DELETE(request: NextRequest) {
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
      .eq('user_id', userId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Cart cleared' });
  } catch (error) {
    logger.error('Error in DELETE /api/cart:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
