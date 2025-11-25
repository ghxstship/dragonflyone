import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Transportation and logistics provider database
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const serviceType = searchParams.get('service_type');
    const location = searchParams.get('location');

    let query = supabase.from('transportation_providers').select(`
      *, ratings:provider_ratings(rating, review)
    `);

    if (serviceType) query = query.contains('services', [serviceType]);
    if (location) query = query.ilike('service_area', `%${location}%`);

    const { data, error } = await query.order('name', { ascending: true });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const withRatings = data?.map(p => ({
      ...p,
      avg_rating: p.ratings?.length ? p.ratings.reduce((s: number, r: any) => s + r.rating, 0) / p.ratings.length : null
    }));

    return NextResponse.json({ providers: withRatings });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { name, services, service_area, contact_name, phone, email, website, fleet_info } = body;

    const { data, error } = await supabase.from('transportation_providers').insert({
      name, services: services || [], service_area, contact_name, phone, email, website, fleet_info
    }).select().single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ provider: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
  }
}
