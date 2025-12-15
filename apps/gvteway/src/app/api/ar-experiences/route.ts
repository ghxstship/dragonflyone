export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { withAuth, PlatformRole } from '@ghxstship/config';
import { createClient } from '@supabase/supabase-js';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

const GVTEWAY_ROLES = [
  PlatformRole.GVTEWAY_ADMIN, PlatformRole.GVTEWAY_EXPERIENCE_CREATOR, PlatformRole.GVTEWAY_VENUE_MANAGER,
  PlatformRole.GVTEWAY_MEMBER_EXTRA, PlatformRole.GVTEWAY_MEMBER_PLUS, PlatformRole.GVTEWAY_MEMBER,
  PlatformRole.LEGEND_SUPER_ADMIN, PlatformRole.LEGEND_ADMIN, PlatformRole.LEGEND_DEVELOPER,
];



// AR experiences (venue preview, artist filters)
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('event_id');
    const venueId = searchParams.get('venue_id');
    const type = searchParams.get('type'); // 'venue_preview', 'artist_filter', 'seat_view'

    let query = supabase.from('ar_experiences').select('*').eq('status', 'active');

    if (eventId) query = query.eq('event_id', eventId);
    if (venueId) query = query.eq('venue_id', venueId);
    if (type) query = query.eq('type', type);

    const { data, error } = await query;
    if (error) {
      if (error.message?.includes('does not exist') || error.code === '42P01') {
        return NextResponse.json({ experiences: [], types: ['venue_preview', 'artist_filter', 'seat_view', 'stage_view', 'merch_preview'] });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      experiences: data,
      types: ['venue_preview', 'artist_filter', 'seat_view', 'stage_view', 'merch_preview']
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : '';
    if (msg.includes('does not exist') || msg.includes('42P01')) {
      return NextResponse.json({ experiences: [], types: [] });
    }
    return NextResponse.json({ error: 'Failed to fetch AR experiences' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;
    const userRoles = authResult.user?.platformRoles || [];
    if (!GVTEWAY_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    const user = authResult.user;

    const supabase = getSupabaseClient();
    const body = await request.json();
    const { action, experience_id, seat_id, venue_id } = body;

    if (action === 'log_interaction') {
      await supabase.from('ar_interactions').insert({
        user_id: user.id, experience_id, interaction_type: body.interaction_type,
        duration_seconds: body.duration, metadata: body.metadata || {}
      });

      return NextResponse.json({ success: true });
    }

    if (action === 'get_seat_view') {
      // Return AR data for seat view preview
      const { data: seatData } = await supabase.from('venue_seats').select(`
        *, venue:venues(id, name, ar_model_url)
      `).eq('id', seat_id).single();

      return NextResponse.json({
        seat: seatData,
        ar_config: {
          model_url: seatData?.venue?.ar_model_url,
          camera_position: seatData?.ar_camera_position,
          view_angle: seatData?.view_angle
        }
      });
    }

    if (action === 'get_venue_experiences') {
      // Return all AR experiences for a venue
      const { data: experiences } = await supabase.from('ar_experiences').select(`
        *, venue:venues(id, name)
      `).eq('venue_id', venue_id).eq('enabled', true);

      return NextResponse.json({ experiences: experiences || [] });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 });
  }
}
