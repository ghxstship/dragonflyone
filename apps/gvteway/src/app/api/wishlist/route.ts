import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

const WishlistItemSchema = z.object({
  event_id: z.string().uuid(),
  notify_price_drop: z.boolean().default(true),
  notify_availability: z.boolean().default(true),
  notes: z.string().optional(),
});

// GET /api/wishlist - Get user's wishlist
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');

    if (!userId) {
      return NextResponse.json({ error: 'user_id required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('wishlists')
      .select(`
        *,
        event:events(
          id,
          name,
          start_date,
          end_date,
          venue_id,
          status,
          capacity,
          tickets_sold,
          venue:venues(id, name, city, state, country),
          ticket_types:event_ticket_types(
            id,
            name,
            price,
            available_quantity,
            sold_quantity
          )
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching wishlist:', error);
      return NextResponse.json(
        { error: 'Failed to fetch wishlist', details: error.message },
        { status: 500 }
      );
    }

    interface WishlistRecord {
      id: string;
      event: {
        id: string;
        name: string;
        start_date: string;
        capacity: number;
        tickets_sold: number;
        ticket_types: Array<{
          price: number;
          available_quantity: number;
          sold_quantity: number;
        }>;
        venue: {
          city: string;
          state: string;
        };
      };
      [key: string]: unknown;
    }

    // Enrich with availability info
    const wishlist = (data || []).map((item: WishlistRecord) => {
      const event = item.event;
      const lowestPrice = event?.ticket_types?.reduce((min: number, tt: { price: number }) => 
        tt.price < min ? tt.price : min, Infinity) || 0;
      const totalAvailable = event?.ticket_types?.reduce((sum: number, tt: { available_quantity: number; sold_quantity: number }) => 
        sum + (tt.available_quantity - tt.sold_quantity), 0) || 0;

      return {
        ...item,
        lowest_price: lowestPrice === Infinity ? null : lowestPrice,
        tickets_available: totalAvailable,
        is_available: totalAvailable > 0,
        is_sold_out: event?.capacity && event.tickets_sold >= event.capacity,
      };
    });

    return NextResponse.json({ 
      wishlist, 
      total: wishlist.length,
      available_count: wishlist.filter((w: { is_available: boolean }) => w.is_available).length,
    });
  } catch (error) {
    console.error('Error in GET /api/wishlist:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/wishlist - Add to wishlist
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const body = await request.json();
    const validated = WishlistItemSchema.parse(body);
    const userId = body.user_id;

    if (!userId) {
      return NextResponse.json({ error: 'user_id required' }, { status: 400 });
    }

    // Check if already in wishlist
    const { data: existing } = await supabase
      .from('wishlists')
      .select('id')
      .eq('user_id', userId)
      .eq('event_id', validated.event_id)
      .single();

    if (existing) {
      return NextResponse.json({ error: 'Event already in wishlist' }, { status: 409 });
    }

    const { data: item, error } = await supabase
      .from('wishlists')
      .insert({
        user_id: userId,
        ...validated,
      })
      .select(`
        *,
        event:events(id, name, start_date)
      `)
      .single();

    if (error) {
      console.error('Error adding to wishlist:', error);
      return NextResponse.json(
        { error: 'Failed to add to wishlist', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error in POST /api/wishlist:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/wishlist - Update wishlist item preferences
export async function PATCH(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const body = await request.json();
    const { item_id, updates } = body;

    if (!item_id) {
      return NextResponse.json({ error: 'item_id required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('wishlists')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', item_id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to update wishlist item', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, item: data });
  } catch (error) {
    console.error('Error in PATCH /api/wishlist:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/wishlist - Remove from wishlist
export async function DELETE(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('id');
    const eventId = searchParams.get('event_id');
    const userId = searchParams.get('user_id');

    if (itemId) {
      const { error } = await supabase
        .from('wishlists')
        .delete()
        .eq('id', itemId);

      if (error) {
        return NextResponse.json(
          { error: 'Failed to remove from wishlist', details: error.message },
          { status: 500 }
        );
      }
    } else if (eventId && userId) {
      const { error } = await supabase
        .from('wishlists')
        .delete()
        .eq('event_id', eventId)
        .eq('user_id', userId);

      if (error) {
        return NextResponse.json(
          { error: 'Failed to remove from wishlist', details: error.message },
          { status: 500 }
        );
      }
    } else {
      return NextResponse.json({ error: 'id or (event_id and user_id) required' }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: 'Removed from wishlist' });
  } catch (error) {
    console.error('Error in DELETE /api/wishlist:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
