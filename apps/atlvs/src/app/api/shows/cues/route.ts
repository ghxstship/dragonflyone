export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { withAuth, PlatformRole, logger } from '@ghxstship/config';

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
    const cueType = searchParams.get('cue_type');

    let query = supabase
      .from('show_cues')
      .select('*')
      .order('cue_number', { ascending: true });

    if (eventId) {
      query = query.eq('event_id', eventId);
    }
    if (cueType) {
      query = query.eq('cue_type', cueType);
    }

    const { data, error } = await query;

    if (error) {
      logger.error('Error fetching show cues:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: data || [] });
  } catch (error) {
    logger.error('Error in GET /api/shows/cues:', error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json({ error: 'Failed to fetch show cues' }, { status: 500 });
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

    const { data, error } = await supabase
      .from('show_cues')
      .insert({
        event_id: body.event_id,
        cue_number: body.cue_number,
        cue_type: body.cue_type || 'other',
        description: body.description,
        trigger_time: body.trigger_time,
        status: body.status || 'pending',
      })
      .select()
      .single();

    if (error) {
      logger.error('Error creating show cue:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    logger.error('Error in POST /api/shows/cues:', error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json({ error: 'Failed to create show cue' }, { status: 500 });
  }
}
