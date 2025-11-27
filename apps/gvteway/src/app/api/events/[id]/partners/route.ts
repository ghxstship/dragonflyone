import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

const associationSchema = z.object({
  partner_id: z.string().uuid(),
  association_type: z.enum(['sponsor', 'vendor', 'accommodation', 'transportation', 'dining', 'attraction', 'promotion']),
  partnership_level: z.string().max(50).optional(),
  benefits: z.array(z.string()).optional(),
  obligations: z.array(z.string()).optional(),
  fee: z.number().optional(),
  revenue_share: z.number().optional(),
  notes: z.string().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const association_type = searchParams.get('association_type');
    const status = searchParams.get('status');

    let query = supabase
      .from('partner_event_associations')
      .select(`
        *,
        partner:local_partners(
          id, name, logo_url, website_url, city, partnership_tier,
          partner_type:partner_types(name, code, icon),
          offers:partner_offers(id, title, promo_code, discount_value, valid_until)
        )
      `)
      .eq('event_id', params.id);

    if (association_type) {
      query = query.eq('association_type', association_type);
    }
    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query.order('association_type');

    if (error) throw error;

    // Group by association type
    const grouped: Record<string, unknown[]> = {};
    (data || []).forEach((assoc: { association_type: string }) => {
      if (!grouped[assoc.association_type]) {
        grouped[assoc.association_type] = [];
      }
      grouped[assoc.association_type].push(assoc);
    });

    return NextResponse.json({
      data,
      grouped,
    });
  } catch (error) {
    console.error('Error fetching event partners:', error);
    return NextResponse.json(
      { error: 'Failed to fetch event partners' },
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
    const validated = associationSchema.parse(body);

    // Verify event exists
    const { data: event } = await supabase
      .from('events')
      .select('id')
      .eq('id', params.id)
      .single();

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    // Verify partner exists
    const { data: partner } = await supabase
      .from('local_partners')
      .select('id')
      .eq('id', validated.partner_id)
      .single();

    if (!partner) {
      return NextResponse.json(
        { error: 'Partner not found' },
        { status: 404 }
      );
    }

    // Check if association already exists
    const { data: existing } = await supabase
      .from('partner_event_associations')
      .select('id')
      .eq('event_id', params.id)
      .eq('partner_id', validated.partner_id)
      .eq('association_type', validated.association_type)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'Association already exists' },
        { status: 409 }
      );
    }

    const { data, error } = await supabase
      .from('partner_event_associations')
      .insert({
        event_id: params.id,
        ...validated,
        status: 'pending',
      })
      .select(`
        *,
        partner:local_partners(id, name, logo_url)
      `)
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
    console.error('Error creating event partner association:', error);
    return NextResponse.json(
      { error: 'Failed to create event partner association' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const partner_id = searchParams.get('partner_id');
    const association_type = searchParams.get('association_type');

    if (!partner_id) {
      return NextResponse.json(
        { error: 'partner_id is required' },
        { status: 400 }
      );
    }

    let query = supabase
      .from('partner_event_associations')
      .delete()
      .eq('event_id', params.id)
      .eq('partner_id', partner_id);

    if (association_type) {
      query = query.eq('association_type', association_type);
    }

    const { error } = await query;

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing event partner:', error);
    return NextResponse.json(
      { error: 'Failed to remove event partner' },
      { status: 500 }
    );
  }
}
