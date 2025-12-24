export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { withAuth, PlatformRole, logger } from '@ghxstship/config';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const COMPVSS_ROLES = [
  PlatformRole.COMPVSS_ADMIN, PlatformRole.COMPVSS_TEAM_MEMBER,
  PlatformRole.LEGEND_SUPER_ADMIN, PlatformRole.LEGEND_ADMIN, PlatformRole.LEGEND_DEVELOPER,
];

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;
    
    const userRoles = authResult.user?.platformRoles || [];
    if (!COMPVSS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden - COMPVSS access required' }, { status: 403 });
    }

    const { id: bookingId } = await params;

    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('*, client:clients(*), venue:venues(*), spaces:booking_spaces(*)')
      .eq('id', bookingId)
      .single();

    if (bookingError || !booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    const beoSections = {
      event_details: {
        name: booking.event_name,
        date: booking.event_date,
        start_time: booking.start_time,
        end_time: booking.end_time,
        guest_count: booking.guest_count,
        event_type: booking.event_type,
      },
      client_info: {
        name: booking.client?.company_name || booking.client?.contact_name,
        contact: booking.client?.contact_name,
        email: booking.client?.email,
        phone: booking.client?.phone,
      },
      venue_info: {
        name: booking.venue?.name,
        address: booking.venue?.address,
        spaces: booking.spaces?.map((s: { space_name: string; setup_style: string }) => ({
          name: s.space_name,
          setup: s.setup_style,
        })),
      },
      timeline: [],
      catering: { menu_items: [], dietary_requirements: [] },
      av_requirements: { items: [] },
      setup_requirements: { items: [] },
      notes: booking.notes || '',
    };

    const { data: beo, error: beoError } = await supabase
      .from('beos')
      .insert({
        booking_id: bookingId,
        organization_id: booking.organization_id,
        title: `BEO - ${booking.event_name}`,
        event_date: booking.event_date,
        sections: beoSections,
        status: 'draft',
        version: 1,
        created_by: authResult.user?.id,
      })
      .select()
      .single();

    if (beoError) {
      logger.error('Error generating BEO:', beoError);
      return NextResponse.json({ error: beoError.message }, { status: 500 });
    }

    return NextResponse.json({ data: beo }, { status: 201 });
  } catch (error) {
    logger.error('Error in POST /api/beos/[id]/generate:', error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json({ error: 'Failed to generate BEO' }, { status: 500 });
  }
}
