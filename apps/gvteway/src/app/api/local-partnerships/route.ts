import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}


// Lazy getter for supabase client - only accessed at runtime
const supabase = new Proxy({} as ReturnType<typeof getSupabaseClient>, {
  get(_target, prop) {
    return (getSupabaseClient() as any)[prop];
  }
});

const partnershipSchema = z.object({
  event_id: z.string().uuid().optional(),
  partner_name: z.string().min(1),
  partner_type: z.enum(['restaurant', 'hotel', 'transport', 'tourism', 'retail', 'entertainment', 'other']),
  contact_name: z.string().optional(),
  contact_email: z.string().email().optional(),
  contact_phone: z.string().optional(),
  offer_description: z.string().optional(),
  discount_code: z.string().optional(),
  discount_percent: z.number().min(0).max(100).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('event_id');
    const partnerType = searchParams.get('partner_type');
    const type = searchParams.get('type');

    if (type === 'offers' && eventId) {
      const { data: offers, error } = await supabase
        .from('local_partnerships')
        .select('id, partner_name, partner_type, offer_description, discount_code, discount_percent')
        .eq('event_id', eventId)
        .eq('status', 'active')
        .not('offer_description', 'is', null);

      if (error) throw error;
      return NextResponse.json({ offers });
    }

    if (type === 'tourism_board') {
      const { data: boards, error } = await supabase
        .from('tourism_board_partnerships')
        .select('*')
        .eq('status', 'active');

      if (error) throw error;
      return NextResponse.json({ tourism_boards: boards });
    }

    let query = supabase.from('local_partnerships').select('*').order('partner_name');
    if (eventId) query = query.eq('event_id', eventId);
    if (partnerType) query = query.eq('partner_type', partnerType);

    const { data: partnerships, error } = await query;
    if (error) throw error;

    return NextResponse.json({ partnerships });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const body = await request.json();
    const action = body.action;

    if (action === 'create') {
      const validated = partnershipSchema.parse(body.data);

      const { data: partnership, error } = await supabase
        .from('local_partnerships')
        .insert({
          ...validated,
          status: 'pending',
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ partnership }, { status: 201 });
    }

    if (action === 'add_tourism_board') {
      const { name, region, contact_email, website, partnership_level } = body.data;

      const { data: board, error } = await supabase
        .from('tourism_board_partnerships')
        .insert({
          name,
          region,
          contact_email,
          website,
          partnership_level,
          status: 'active',
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ tourism_board: board }, { status: 201 });
    }

    if (action === 'track_redemption') {
      const { partnership_id, discount_code, user_id, order_id } = body.data;

      const { data: redemption, error } = await supabase
        .from('partnership_redemptions')
        .insert({
          partnership_id,
          discount_code,
          user_id,
          order_id,
          redeemed_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ redemption }, { status: 201 });
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
    const supabase = getSupabaseClient();
    const body = await request.json();
    const { id, action, ...updates } = body;

    if (action === 'activate') {
      const { data, error } = await supabase
        .from('local_partnerships')
        .update({ status: 'active' })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ partnership: data });
    }

    const { data, error } = await supabase
      .from('local_partnerships')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ partnership: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    const { error } = await supabase
      .from('local_partnerships')
      .update({ status: 'inactive' })
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
