export const dynamic = 'force-dynamic';

import { withAuth, PlatformRole } from '@ghxstship/config';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const convertHoldSchema = z.object({
  event_name: z.string().optional(),
  event_type: z.string().optional(),
  guest_count_expected: z.number().optional(),
  special_requests: z.string().optional(),
});

const ATLVS_ROLES = [
  PlatformRole.ATLVS_SUPER_ADMIN, PlatformRole.ATLVS_ADMIN, PlatformRole.ATLVS_TEAM_MEMBER, PlatformRole.ATLVS_VIEWER,
  PlatformRole.LEGEND_SUPER_ADMIN, PlatformRole.LEGEND_ADMIN, PlatformRole.LEGEND_DEVELOPER,
];

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const body = await request.json();
    const payload = convertHoldSchema.parse(body);

    const { data: hold, error: holdError } = await supabase
      .from('space_holds')
      .select(`
        *,
        space:venue_spaces(id, name, venue_id, base_price)
      `)
      .eq('id', id)
      .single();

    if (holdError || !hold) {
      return NextResponse.json({ error: 'Hold not found' }, { status: 404 });
    }

    if (hold.status !== 'active') {
      return NextResponse.json({ error: 'Hold is not active' }, { status: 400 });
    }

    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        organization_id: hold.organization_id,
        contact_id: hold.contact_id,
        venue_id: hold.space?.venue_id,
        event_date: hold.hold_date,
        start_time: hold.start_time,
        end_time: hold.end_time,
        event_name: payload.event_name,
        event_type: payload.event_type,
        guest_count_expected: payload.guest_count_expected,
        special_requests: payload.special_requests,
        status: 'pending',
        converted_from_hold_id: id,
      })
      .select()
      .single();

    if (bookingError) {
      return NextResponse.json({ error: bookingError.message }, { status: 500 });
    }

    await supabase.from('booking_spaces').insert({
      booking_id: booking.id,
      space_id: hold.space_id,
      start_time: hold.start_time,
      end_time: hold.end_time,
      price: hold.space?.base_price || 0,
    });

    await supabase
      .from('space_holds')
      .update({ 
        status: 'converted', 
        converted_to_booking_id: booking.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    return NextResponse.json({ booking, hold_released: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 422 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
