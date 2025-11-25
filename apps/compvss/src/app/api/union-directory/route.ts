import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Union local contacts and representatives
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const union = searchParams.get('union');
    const location = searchParams.get('location');

    let query = supabase.from('union_locals').select(`
      *, contacts:union_contacts(id, name, title, phone, email)
    `);

    if (union) query = query.ilike('union_name', `%${union}%`);
    if (location) query = query.or(`city.ilike.%${location}%,state.ilike.%${location}%`);

    const { data, error } = await query.order('union_name', { ascending: true });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ unions: data });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { union_name, local_number, city, state, phone, email, website, jurisdiction, contacts } = body;

    const { data, error } = await supabase.from('union_locals').insert({
      union_name, local_number, city, state, phone, email, website, jurisdiction
    }).select().single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    if (contacts?.length) {
      await supabase.from('union_contacts').insert(
        contacts.map((c: any) => ({ local_id: data.id, name: c.name, title: c.title, phone: c.phone, email: c.email }))
      );
    }

    return NextResponse.json({ union: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
  }
}
