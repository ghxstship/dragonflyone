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
    const type = searchParams.get('type');
    const sortParam = searchParams.get('sort') || 'discount';
    const limit = parseInt(searchParams.get('limit') || '50');

    // Sort parameter determines ordering - 'discount' for highest discount first, 'created_at' for newest
    const orderColumn = sortParam === 'discount' ? 'discount_percent' : 'created_at';
    
    let query = supabase
      .from('deals')
      .select('*')
      .order(orderColumn, { ascending: false })
      .limit(limit);

    if (type && type !== 'all') {
      query = query.eq('deal_type', type);
    }

    const { data, error } = await query;

    if (error) {
      if (error.message?.includes('does not exist') || error.code === '42P01') {
        return NextResponse.json({ deals: [] });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ deals: data || [] });
  } catch (error) {
    const msg = error instanceof Error ? error.message : '';
    if (msg.includes('does not exist') || msg.includes('42P01')) {
      return NextResponse.json({ deals: [] });
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
      if (error.message?.includes('does not exist') || error.code === '42P01') {
        return NextResponse.json({ deal: null });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ deal: data }, { status: 201 });
  } catch (error) {
    const msg = error instanceof Error ? error.message : '';
    if (msg.includes('does not exist') || msg.includes('42P01')) {
      return NextResponse.json({ deal: null });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
