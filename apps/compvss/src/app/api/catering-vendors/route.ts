import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@ghxstship/config';

// Catering and hospitality vendor listings
export async function GET(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const cuisine = searchParams.get('cuisine');
    const location = searchParams.get('location');

    let query = supabase.from('catering_vendors').select(`
      *, ratings:vendor_ratings(rating, review), menus:catering_menus(id, name, price_per_person)
    `);

    if (cuisine) query = query.contains('cuisines', [cuisine]);
    if (location) query = query.ilike('service_area', `%${location}%`);

    const { data, error } = await query.order('name', { ascending: true });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const withRatings = data?.map(v => ({
      ...v,
      avg_rating: v.ratings?.length ? v.ratings.reduce((s: number, r: any) => s + r.rating, 0) / v.ratings.length : null
    }));

    return NextResponse.json({ vendors: withRatings });
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
    const { name, cuisines, service_area, min_guests, max_guests, contact_name, phone, email, dietary_options } = body;

    const { data, error } = await supabase.from('catering_vendors').insert({
      name, cuisines: cuisines || [], service_area, min_guests, max_guests,
      contact_name, phone, email, dietary_options: dietary_options || []
    }).select().single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ vendor: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
  }
}
