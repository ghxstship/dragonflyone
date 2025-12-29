export const dynamic = 'force-dynamic';

import { withAuth, PlatformRole } from '@ghxstship/config';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const VenueSpaceSchema = z.object({
  venue_id: z.string().uuid(),
  organization_id: z.string().uuid(),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  space_type: z.enum(['room', 'outdoor', 'hall', 'tent', 'rooftop', 'patio', 'other']).default('room'),
  photos: z.array(z.string().url()).default([]),
  floor_number: z.number().int().optional(),
  square_footage: z.number().positive().optional(),
  ceiling_height: z.number().positive().optional(),
  amenities: z.array(z.string()).default([]),
  restrictions: z.object({
    noise_curfew: z.string().optional(),
    max_capacity: z.number().optional(),
    no_open_flame: z.boolean().optional(),
    no_red_wine: z.boolean().optional(),
    no_glitter: z.boolean().optional(),
    other: z.array(z.string()).optional(),
  }).default({}),
  base_rental_rate: z.number().min(0).optional(),
  rental_rate_type: z.enum(['flat', 'hourly', 'per_person']).default('flat'),
  minimum_spend: z.number().min(0).optional(),
  setup_time_minutes: z.number().int().min(0).default(60),
  breakdown_time_minutes: z.number().int().min(0).default(60),
  is_combinable: z.boolean().default(false),
  combine_with: z.array(z.string().uuid()).default([]),
  active: z.boolean().default(true),
  sort_order: z.number().int().default(0),
});

const ATLVS_ROLES = [
  PlatformRole.ATLVS_SUPER_ADMIN, PlatformRole.ATLVS_ADMIN, PlatformRole.ATLVS_TEAM_MEMBER, PlatformRole.ATLVS_VIEWER,
  PlatformRole.LEGEND_SUPER_ADMIN, PlatformRole.LEGEND_ADMIN, PlatformRole.LEGEND_DEVELOPER,
];

export async function GET(request: NextRequest) {
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organization_id');
    const venueId = searchParams.get('venue_id');
    const activeOnly = searchParams.get('active') === 'true';

    let query = supabase
      .from('venue_spaces')
      .select(`
        *,
        venue:venues(id, name),
        capacity_configs:space_capacity_configs(*),
        pricing_rules:space_pricing_rules(*)
      `)
      .order('sort_order', { ascending: true });

    if (organizationId) {
      query = query.eq('organization_id', organizationId);
    }
    if (venueId) {
      query = query.eq('venue_id', venueId);
    }
    if (activeOnly) {
      query = query.eq('active', true);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ spaces: data || [] });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch venue spaces' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = VenueSpaceSchema.parse(body);

    const { data, error } = await supabase
      .from('venue_spaces')
      .insert(validatedData)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ space: data }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create venue space' }, { status: 500 });
  }
}
