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
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('user_favorites')
      .select(`
        id,
        created_at,
        events (
          id,
          title,
          date,
          venue,
          city,
          category,
          image,
          ticket_types (
            price
          )
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
    }

    interface TicketTypeInfo { price: number }
    interface FavoriteEventInfo { id?: string; title?: string; date?: string; venue?: string; city?: string; category?: string; image?: string; ticket_types?: TicketTypeInfo[] }
    const favorites = data?.map(fav => {
      const event = fav.events as FavoriteEventInfo | null;
      const ticketTypes = (event?.ticket_types || []) as TicketTypeInfo[];
      const prices = ticketTypes.map((t: TicketTypeInfo) => t.price);
      const minPrice = prices.length > 0 ? Math.min(...prices) : 0;

      return {
        id: fav.id,
        event_id: event?.id,
        title: event?.title,
        date: event?.date,
        venue: event?.venue,
        city: event?.city,
        category: event?.category,
        price_min: minPrice,
        image: event?.image,
        tickets_available: true, // Would check actual availability
        added_at: fav.created_at,
      };
    }) || [];

    return NextResponse.json({ favorites });
  } catch (error) {
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

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    const { data, error } = await supabase
      .from('user_favorites')
      .insert({
        user_id: user.id,
        event_id: body.event_id,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'Already in favorites' }, { status: 400 });
      }
      return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
    }

    return NextResponse.json({ favorite: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
