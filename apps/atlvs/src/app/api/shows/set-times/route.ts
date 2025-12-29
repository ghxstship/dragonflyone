export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { withAuth, PlatformRole } from '@ghxstship/config';
import { z } from 'zod';

const createSetTimeSchema = z.object({
  event_id: z.string().uuid(),
  artist_id: z.string().uuid().optional(),
  stage: z.string(),
  start_time: z.string(),
  end_time: z.string(),
  status: z.enum(['scheduled', 'confirmed', 'cancelled', 'completed']).optional(),
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const ATLVS_ROLES = [
  PlatformRole.ATLVS_SUPER_ADMIN, PlatformRole.ATLVS_ADMIN, PlatformRole.ATLVS_TEAM_MEMBER, PlatformRole.ATLVS_VIEWER,
  PlatformRole.LEGEND_SUPER_ADMIN, PlatformRole.LEGEND_ADMIN, PlatformRole.LEGEND_DEVELOPER,
];

export async function GET(request: NextRequest) {
  try {
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;
    
    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden - ATLVS access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('event_id');
    const stage = searchParams.get('stage');

    let query = supabase
      .from('set_times')
      .select('*')
      .order('start_time', { ascending: true });

    if (eventId) {
      query = query.eq('event_id', eventId);
    }
    if (stage) {
      query = query.eq('stage', stage);
    }

    const { data, error } = await query;

    if (error) {
      logger.error('Error fetching set times:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: data || [] });
  } catch (error) {
    logger.error('Error in GET /api/shows/set-times:', error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json({ error: 'Failed to fetch set times' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;
    
    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden - ATLVS access required' }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = createSetTimeSchema.parse(body);

    const { data, error } = await supabase
      .from('set_times')
      .insert({
        event_id: validatedData.event_id,
        artist_id: validatedData.artist_id,
        stage: validatedData.stage,
        start_time: validatedData.start_time,
        end_time: validatedData.end_time,
        status: validatedData.status || 'scheduled',
      })
      .select()
      .single();

    if (error) {
      logger.error('Error creating set time:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    logger.error('Error in POST /api/shows/set-times:', error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json({ error: 'Failed to create set time' }, { status: 500 });
  }
}
