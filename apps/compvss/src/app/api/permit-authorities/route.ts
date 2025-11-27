import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@ghxstship/config';

// Permitting authority contacts by jurisdiction
export async function GET(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city');
    const state = searchParams.get('state');
    const permitType = searchParams.get('permit_type');

    let query = supabase.from('permit_authorities').select(`
      *, contacts:authority_contacts(id, name, title, phone, email)
    `);

    if (city) query = query.ilike('city', `%${city}%`);
    if (state) query = query.eq('state', state);
    if (permitType) query = query.contains('permit_types', [permitType]);

    const { data, error } = await query.order('state', { ascending: true });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ authorities: data });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { name, city, state, permit_types, phone, email, website, processing_time, contacts } = body;

    const { data, error } = await supabase.from('permit_authorities').insert({
      name, city, state, permit_types: permit_types || [], phone, email, website, processing_time
    }).select().single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    if (contacts?.length) {
      await supabase.from('authority_contacts').insert(
        contacts.map((c: any) => ({ authority_id: data.id, ...c }))
      );
    }

    return NextResponse.json({ authority: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
  }
}
