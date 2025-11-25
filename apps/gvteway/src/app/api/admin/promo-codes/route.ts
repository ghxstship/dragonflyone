import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const createPromoCodeSchema = z.object({
  code: z.string().min(3).max(20),
  discount_type: z.enum(['percentage', 'fixed']),
  discount_value: z.number().positive(),
  max_uses: z.number().int().positive().nullable().optional(),
  valid_from: z.string(),
  valid_until: z.string(),
  event_id: z.string().uuid().nullable().optional(),
  min_purchase: z.number().positive().nullable().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const eventId = searchParams.get('event_id');

    let query = supabase
      .from('promo_codes')
      .select(`
        *,
        events (
          id,
          title
        )
      `)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    if (eventId) {
      query = query.eq('event_id', eventId);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const promoCodes = data?.map(promo => ({
      ...promo,
      event_title: promo.events?.title,
    })) || [];

    return NextResponse.json({ promo_codes: promoCodes });
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
    const validated = createPromoCodeSchema.parse(body);

    // Check if code already exists
    const { data: existing } = await supabase
      .from('promo_codes')
      .select('id')
      .eq('code', validated.code.toUpperCase())
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'Promo code already exists' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('promo_codes')
      .insert({
        code: validated.code.toUpperCase(),
        discount_type: validated.discount_type,
        discount_value: validated.discount_value,
        max_uses: validated.max_uses || null,
        current_uses: 0,
        valid_from: validated.valid_from,
        valid_until: validated.valid_until,
        event_id: validated.event_id || null,
        min_purchase: validated.min_purchase || null,
        status: 'active',
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ promo_code: data }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
