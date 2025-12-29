export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase, withAuth, PlatformRole } from '@ghxstship/config';
import { z } from 'zod';

const createVendorSchema = z.object({
  name: z.string(),
  cuisines: z.array(z.string()).optional(),
  service_area: z.string().optional(),
  min_guests: z.number().optional(),
  max_guests: z.number().optional(),
  contact_name: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  dietary_options: z.array(z.string()).optional(),
});

// Catering and hospitality vendor listings
const COMPVSS_ROLES = [
  PlatformRole.COMPVSS_ADMIN, PlatformRole.COMPVSS_TEAM_MEMBER, PlatformRole.COMPVSS_VIEWER,
  PlatformRole.LEGEND_SUPER_ADMIN, PlatformRole.LEGEND_ADMIN, PlatformRole.LEGEND_DEVELOPER,
];

export async function GET(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!COMPVSS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const cuisine = searchParams.get('cuisine');
    const location = searchParams.get('location');

    let query = supabase.from('catering_vendors').select(`
      *, ratings:vendor_ratings(rating, review), menus:catering_menus(id, name, price_per_person)
    `);

    if (cuisine) query = query.contains('cuisines', [cuisine]);
    if (location) query = query.ilike('service_area', `%${location}%`);

    const { data, error } = await query.order('name', { ascending: true });
    if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });

    interface RatingEntry { rating: number }
    interface VendorData { ratings?: RatingEntry[] }
    const withRatings = data?.map((v: VendorData) => ({
      ...v,
      avg_rating: v.ratings?.length ? v.ratings.reduce((s: number, r: RatingEntry) => s + r.rating, 0) / v.ratings.length : null
    }));

    return NextResponse.json({ vendors: withRatings });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!COMPVSS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = createVendorSchema.parse(body);
    const { name, cuisines, service_area, min_guests, max_guests, contact_name, phone, email, dietary_options } = validatedData;

    const { data, error } = await supabase.from('catering_vendors').insert({
      name, cuisines: cuisines || [], service_area, min_guests, max_guests,
      contact_name, phone, email, dietary_options: dietary_options || []
    }).select().single();

    if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
    return NextResponse.json({ vendor: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
  }
}
