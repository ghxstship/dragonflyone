import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

const offerSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  offer_type: z.enum(['discount', 'package', 'exclusive', 'promotion', 'bundle']),
  discount_type: z.enum(['percentage', 'fixed', 'bogo', 'free_item']).optional(),
  discount_value: z.number().optional(),
  minimum_purchase: z.number().optional(),
  promo_code: z.string().max(50).optional(),
  terms_conditions: z.string().optional(),
  valid_from: z.string().optional(),
  valid_until: z.string().optional(),
  max_redemptions: z.number().int().optional(),
  is_exclusive_to_events: z.boolean().default(false),
  applicable_events: z.array(z.string().uuid()).optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const is_active = searchParams.get('is_active');
    const include_expired = searchParams.get('include_expired') === 'true';

    let query = supabase
      .from('partner_offers')
      .select('*')
      .eq('partner_id', params.id);

    if (is_active !== null) {
      query = query.eq('is_active', is_active === 'true');
    }

    if (!include_expired) {
      query = query.or(`valid_until.is.null,valid_until.gte.${new Date().toISOString().split('T')[0]}`);
    }

    const { data, error } = await query.order('valid_until', { ascending: true, nullsFirst: false });

    if (error) throw error;

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error fetching partner offers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch partner offers' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getSupabaseClient();
    const body = await request.json();
    const validated = offerSchema.parse(body);

    // Verify partner exists
    const { data: partner } = await supabase
      .from('local_partners')
      .select('id')
      .eq('id', params.id)
      .single();

    if (!partner) {
      return NextResponse.json(
        { error: 'Partner not found' },
        { status: 404 }
      );
    }

    const { data, error } = await supabase
      .from('partner_offers')
      .insert({
        partner_id: params.id,
        ...validated,
        is_active: true,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error creating partner offer:', error);
    return NextResponse.json(
      { error: 'Failed to create partner offer' },
      { status: 500 }
    );
  }
}
