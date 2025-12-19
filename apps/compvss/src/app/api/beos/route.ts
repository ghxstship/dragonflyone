export const dynamic = 'force-dynamic';

import { logger, withAuth, PlatformRole } from '@ghxstship/config';
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { z } from 'zod';

const COMPVSS_ROLES = [
  PlatformRole.COMPVSS_ADMIN, PlatformRole.COMPVSS_TEAM_MEMBER, 
  PlatformRole.COMPVSS_COLLABORATOR, PlatformRole.COMPVSS_VIEWER,
  PlatformRole.LEGEND_SUPER_ADMIN, PlatformRole.LEGEND_ADMIN, PlatformRole.LEGEND_DEVELOPER,
];

const COMPVSS_WRITE_ROLES = [
  PlatformRole.COMPVSS_ADMIN, PlatformRole.COMPVSS_TEAM_MEMBER, PlatformRole.COMPVSS_COLLABORATOR,
  PlatformRole.LEGEND_SUPER_ADMIN, PlatformRole.LEGEND_ADMIN, PlatformRole.LEGEND_DEVELOPER,
];

const createBEOSchema = z.object({
  organization_id: z.string(),
  booking_id: z.string().uuid().optional(),
  event_id: z.string().uuid().optional(),
  template_id: z.string().uuid().optional(),
  name: z.string().min(1, 'Name is required'),
  event_date: z.string(),
  event_start_time: z.string().optional(),
  event_end_time: z.string().optional(),
  venue_name: z.string().optional(),
  room_name: z.string().optional(),
  guest_count: z.number().int().min(0).optional(),
  sections: z.record(z.unknown()).optional(),
  notes: z.string().optional(),
});

// GET /api/beos - List BEOs
export async function GET(request: NextRequest) {
  const supabase = supabaseAdmin;
  try {
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;
    
    const userRoles = authResult.user?.platformRoles || [];
    if (!COMPVSS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden - COMPVSS access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const eventDateFrom = searchParams.get('event_date_from');
    const eventDateTo = searchParams.get('event_date_to');
    const bookingId = searchParams.get('booking_id');

    let query = supabase
      .from('beos')
      .select(`
        *,
        booking:bookings(id, booking_number, event_name),
        event:events(id, name)
      `)
      .order('event_date', { ascending: true });

    if (status) {
      query = query.eq('status', status);
    }

    if (eventDateFrom) {
      query = query.gte('event_date', eventDateFrom);
    }

    if (eventDateTo) {
      query = query.lte('event_date', eventDateTo);
    }

    if (bookingId) {
      query = query.eq('booking_id', bookingId);
    }

    const { data, error } = await query;

    if (error) {
      logger.error('Failed to fetch BEOs', { error });
      return NextResponse.json({ error: 'Failed to fetch BEOs' }, { status: 500 });
    }

    return NextResponse.json({ beos: data || [], total: data?.length || 0 });
  } catch (error) {
    logger.error('BEOs GET error', { error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/beos - Create BEO
export async function POST(request: NextRequest) {
  const supabase = supabaseAdmin;
  try {
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;
    
    const userRoles = authResult.user?.platformRoles || [];
    if (!COMPVSS_WRITE_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden - COMPVSS write access required' }, { status: 403 });
    }

    const body = await request.json();
    const validation = createBEOSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ 
        error: 'Validation failed', 
        details: validation.error.errors 
      }, { status: 400 });
    }

    const input = validation.data;

    // Get organization ID from user context if 'current'
    let organizationId = input.organization_id;
    if (organizationId === 'current') {
      const { data: membership } = await supabase
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', authResult.user?.id)
        .limit(1)
        .single();
      
      if (membership) {
        organizationId = membership.organization_id;
      }
    }

    const { data, error } = await supabase
      .from('beos')
      .insert([{
        organization_id: organizationId,
        booking_id: input.booking_id,
        event_id: input.event_id,
        template_id: input.template_id,
        name: input.name,
        event_date: input.event_date,
        event_start_time: input.event_start_time,
        event_end_time: input.event_end_time,
        venue_name: input.venue_name,
        room_name: input.room_name,
        guest_count: input.guest_count,
        sections: input.sections || {},
        notes: input.notes,
        created_by: authResult.user?.id,
        status: 'draft',
        version: 1,
      }])
      .select()
      .single();

    if (error) {
      logger.error('Failed to create BEO', { error });
      return NextResponse.json({ error: 'Failed to create BEO' }, { status: 500 });
    }

    logger.info('BEO created', { beoId: data.id, name: input.name });
    return NextResponse.json({ beo: data }, { status: 201 });
  } catch (error) {
    logger.error('BEOs POST error', { error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
