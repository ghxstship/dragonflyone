import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const sort = searchParams.get('sort') || 'discount';
    const limit = parseInt(searchParams.get('limit') || '50');

    let query = supabase
      .from('deals')
      .select(`
        *,
        events (
          id,
          title,
          date,
          venue,
          image
        ),
        ticket_types (
          id,
          name,
          price
        )
      `)
      .eq('is_active', true)
      .gte('expires_at', new Date().toISOString())
      .limit(limit);

    if (type && type !== 'all') {
      query = query.eq('deal_type', type);
    }

    // Apply sorting
    switch (sort) {
      case 'discount':
        query = query.order('discount_percent', { ascending: false });
        break;
      case 'expiring':
        query = query.order('expires_at', { ascending: true });
        break;
      case 'price':
        query = query.order('deal_price', { ascending: true });
        break;
      case 'date':
        query = query.order('events(date)', { ascending: true });
        break;
      default:
        query = query.order('created_at', { ascending: false });
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const deals = data?.map(deal => ({
      id: deal.id,
      event_id: deal.event_id,
      event_title: deal.events?.title,
      event_date: deal.events?.date,
      event_venue: deal.events?.venue,
      event_image: deal.events?.image,
      original_price: deal.original_price,
      deal_price: deal.deal_price,
      discount_percent: deal.discount_percent,
      deal_type: deal.deal_type,
      expires_at: deal.expires_at,
      quantity_available: deal.quantity_available,
      promo_code: deal.promo_code,
    })) || [];

    return NextResponse.json({ deals });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { data, error } = await supabase
      .from('deals')
      .insert({
        event_id: body.event_id,
        ticket_type_id: body.ticket_type_id,
        original_price: body.original_price,
        deal_price: body.deal_price,
        discount_percent: Math.round(((body.original_price - body.deal_price) / body.original_price) * 100),
        deal_type: body.deal_type,
        expires_at: body.expires_at,
        quantity_available: body.quantity_available,
        promo_code: body.promo_code,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ deal: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
