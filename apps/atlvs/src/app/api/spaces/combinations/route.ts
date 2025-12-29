import { withAuth, PlatformRole } from '@ghxstship/config';
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { z } from 'zod';

const combinationSchema = z.object({
  name: z.string().min(1),
  space_ids: z.array(z.string().uuid()).min(2),
  combined_capacity: z.number().min(1),
  description: z.string().optional(),
  setup_time_minutes: z.number().min(0).optional(),
  breakdown_time_minutes: z.number().min(0).optional(),
  price_adjustment: z.number().optional(),
  price_adjustment_type: z.enum(['flat', 'percentage']).default('flat'),
  is_active: z.boolean().default(true),
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

    const supabase = createAdminClient();
    const { searchParams } = new URL(request.url);

    const venueId = searchParams.get('venue_id');
    const minCapacity = searchParams.get('min_capacity');

    let query = supabase
      .from('space_combinations')
      .select(`
        id,
        name,
        space_ids,
        combined_capacity,
        description,
        setup_time_minutes,
        breakdown_time_minutes,
        price_adjustment,
        price_adjustment_type,
        is_active,
        venue_id,
        venue:venues(id, name),
        created_at
      `)
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (venueId) {
      query = query.eq('venue_id', venueId);
    }
    if (minCapacity) {
      query = query.gte('combined_capacity', parseInt(minCapacity));
    }

    const { data: combinations, error } = await query;

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch combinations' },
        { status: 500 }
      );
    }

    // Get space details for each combination
    const allSpaceIds = [...new Set(combinations?.flatMap(c => c.space_ids) || [])];
    const { data: spaces } = await supabase
      .from('spaces')
      .select('id, name, capacity')
      .in('id', allSpaceIds);

    const combinationsWithSpaces = combinations?.map(combo => ({
      ...combo,
      spaces: combo.space_ids.map((id: string) => 
        spaces?.find(s => s.id === id) || { id, name: 'Unknown', capacity: 0 }
      ),
    }));

    return NextResponse.json({
      combinations: combinationsWithSpaces || [],
      count: combinations?.length || 0,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
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

    const supabase = createAdminClient();

    const body = await request.json();
    const validatedData = combinationSchema.parse(body);

    // Verify all spaces exist and get venue_id
    const { data: spaces, error: spacesError } = await supabase
      .from('spaces')
      .select('id, name, venue_id, capacity')
      .in('id', validatedData.space_ids);

    if (spacesError) {
      return NextResponse.json(
        { error: 'Failed to verify spaces' },
        { status: 500 }
      );
    }

    if (!spaces || spaces.length !== validatedData.space_ids.length) {
      return NextResponse.json(
        { error: 'One or more spaces not found' },
        { status: 400 }
      );
    }

    // Verify all spaces are from the same venue
    const venueIds = [...new Set(spaces.map(s => s.venue_id))];
    if (venueIds.length > 1) {
      return NextResponse.json(
        { error: 'All spaces must be from the same venue' },
        { status: 400 }
      );
    }

    const venueId = venueIds[0];

    // Calculate total capacity if not provided
    const totalCapacity = validatedData.combined_capacity || 
      spaces.reduce((sum, s) => sum + (s.capacity || 0), 0);

    const { data: combination, error } = await supabase
      .from('space_combinations')
      .insert({
        name: validatedData.name,
        space_ids: validatedData.space_ids,
        combined_capacity: totalCapacity,
        description: validatedData.description || null,
        setup_time_minutes: validatedData.setup_time_minutes || 0,
        breakdown_time_minutes: validatedData.breakdown_time_minutes || 0,
        price_adjustment: validatedData.price_adjustment || 0,
        price_adjustment_type: validatedData.price_adjustment_type,
        venue_id: venueId,
        is_active: validatedData.is_active,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to create combination' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      combination: {
        ...combination,
        spaces,
      },
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
