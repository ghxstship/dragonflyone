import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Rate cards and pricing information
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const vendorId = searchParams.get('vendor_id');
    const freelancerId = searchParams.get('freelancer_id');
    const serviceType = searchParams.get('service_type');

    let query = supabase.from('rate_cards').select('*');

    if (vendorId) query = query.eq('vendor_id', vendorId);
    if (freelancerId) query = query.eq('freelancer_id', freelancerId);
    if (serviceType) query = query.eq('service_type', serviceType);

    const { data, error } = await query.order('service_type', { ascending: true });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ rate_cards: data });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { vendor_id, freelancer_id, service_type, rate_type, rate, currency, minimum_hours, notes } = body;

    const { data, error } = await supabase.from('rate_cards').insert({
      vendor_id, freelancer_id, service_type, rate_type,
      rate, currency: currency || 'USD', minimum_hours, notes
    }).select().single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ rate_card: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { id, rate, notes } = body;

    await supabase.from('rate_cards').update({ rate, notes, updated_at: new Date().toISOString() }).eq('id', id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}
