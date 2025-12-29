export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase, withAuth, PlatformRole } from '@ghxstship/config';
import { z } from 'zod';

const createProviderSchema = z.object({
  name: z.string().min(1),
  services: z.array(z.string()).optional(),
  service_area: z.string().optional(),
  contact_name: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  website: z.string().url().optional(),
  fleet_info: z.record(z.unknown()).optional(),
});

// Transportation and logistics provider database
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
    const serviceType = searchParams.get('service_type');
    const location = searchParams.get('location');

    let query = supabase.from('transportation_providers').select(`
      *, ratings:provider_ratings(rating, review)
    `);

    if (serviceType) query = query.contains('services', [serviceType]);
    if (location) query = query.ilike('service_area', `%${location}%`);

    const { data, error } = await query.order('name', { ascending: true });
    if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });

    interface RatingEntry { rating: number }
    interface ProviderData { ratings?: RatingEntry[] }
    const withRatings = data?.map((p: ProviderData) => ({
      ...p,
      avg_rating: p.ratings?.length ? p.ratings.reduce((s: number, r: RatingEntry) => s + r.rating, 0) / p.ratings.length : null
    }));

    return NextResponse.json({ providers: withRatings });
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
    const validatedData = createProviderSchema.parse(body);
    const { name, services, service_area, contact_name, phone, email, website, fleet_info } = validatedData;

    const { data, error } = await supabase.from('transportation_providers').insert({
      name, services: services || [], service_area, contact_name, phone, email, website, fleet_info
    }).select().single();

    if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
    return NextResponse.json({ provider: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
  }
}
