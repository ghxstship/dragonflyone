export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { withAuth, PlatformRole, log } from '@ghxstship/config';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const ATLVS_ROLES = [
  PlatformRole.ATLVS_SUPER_ADMIN, PlatformRole.ATLVS_ADMIN, PlatformRole.ATLVS_TEAM_MEMBER, PlatformRole.ATLVS_VIEWER,
  PlatformRole.LEGEND_SUPER_ADMIN, PlatformRole.LEGEND_ADMIN, PlatformRole.LEGEND_DEVELOPER,
];

const ATLVS_ADMIN_ROLES = [
  PlatformRole.ATLVS_SUPER_ADMIN, PlatformRole.ATLVS_ADMIN,
  PlatformRole.LEGEND_SUPER_ADMIN, PlatformRole.LEGEND_ADMIN, PlatformRole.LEGEND_DEVELOPER,
];

const EventSchema = z.object({
  organization_id: z.string().uuid(),
  project_id: z.string().uuid().optional(),
  name: z.string().min(1),
  description: z.string().optional(),
  event_type: z.enum(['concert', 'festival', 'corporate', 'theater', 'sports', 'conference', 'other']).default('concert'),
  category: z.string().optional(),
  venue_name: z.string().optional(),
  venue_address: z.string().optional(),
  venue_city: z.string().optional(),
  venue_state: z.string().optional(),
  venue_country: z.string().default('USA'),
  start_date: z.string(),
  end_date: z.string().optional(),
  start_time: z.string().optional(),
  end_time: z.string().optional(),
  status: z.enum(['draft', 'scheduled', 'on_sale', 'sold_out', 'completed', 'cancelled']).default('draft'),
  visibility: z.enum(['public', 'private', 'unlisted']).default('public'),
  capacity: z.number().optional(),
  min_price: z.number().optional(),
  max_price: z.number().optional(),
  is_featured: z.boolean().default(false),
  tags: z.array(z.string()).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;
    
    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden - ATLVS access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organization_id');
    const status = searchParams.get('status');
    const eventType = searchParams.get('event_type');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('events')
      .select('*', { count: 'exact' })
      .order('start_date', { ascending: true })
      .range(offset, offset + limit - 1);

    if (organizationId) {
      query = query.eq('organization_id', organizationId);
    }
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }
    if (eventType && eventType !== 'all') {
      query = query.eq('event_type', eventType);
    }
    if (startDate) {
      query = query.gte('start_date', startDate);
    }
    if (endDate) {
      query = query.lte('start_date', endDate);
    }

    const { data, error, count } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const events = data || [];
    const summary = {
      total: count || 0,
      by_status: {
        draft: events.filter(e => e.status === 'draft').length,
        scheduled: events.filter(e => e.status === 'scheduled').length,
        on_sale: events.filter(e => e.status === 'on_sale').length,
        sold_out: events.filter(e => e.status === 'sold_out').length,
        completed: events.filter(e => e.status === 'completed').length,
      },
      by_type: {
        concert: events.filter(e => e.event_type === 'concert').length,
        festival: events.filter(e => e.event_type === 'festival').length,
        corporate: events.filter(e => e.event_type === 'corporate').length,
        theater: events.filter(e => e.event_type === 'theater').length,
      },
      total_capacity: events.reduce((sum, e) => sum + (e.capacity || 0), 0),
      total_tickets_sold: events.reduce((sum, e) => sum + (e.tickets_sold || 0), 0),
    };

    return NextResponse.json({
      events,
      summary,
      pagination: { limit, offset, total: count || 0 },
    });
  } catch (error: unknown) {
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;
    
    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ADMIN_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = EventSchema.parse(body);

    const { data, error } = await supabase
      .from('events')
      .insert(validatedData)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ event: data }, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    log.error('Error in POST /api/events', error, { endpoint: '/api/events', method: 'POST' });
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
  }
}
