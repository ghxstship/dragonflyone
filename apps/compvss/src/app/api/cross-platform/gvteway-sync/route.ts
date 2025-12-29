export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase, withAuth, PlatformRole } from '@ghxstship/config';
import { z } from 'zod';

const createLinkSchema = z.object({
  action: z.literal('create_link').optional().default('create_link'),
  compvss_project_id: z.string().uuid(),
  gvteway_event_id: z.string().uuid(),
});

const syncScheduleSchema = z.object({
  action: z.literal('sync_schedule'),
  compvss_project_id: z.string().uuid(),
  gvteway_event_id: z.string().uuid(),
});

const syncVenueSchema = z.object({
  action: z.literal('sync_venue'),
  compvss_project_id: z.string().uuid(),
  gvteway_event_id: z.string().uuid(),
});

const syncCrewSchema = z.object({
  action: z.literal('sync_crew_to_event'),
  compvss_project_id: z.string().uuid(),
  gvteway_event_id: z.string().uuid(),
});

const pullTicketDataSchema = z.object({
  action: z.literal('pull_ticket_data'),
  compvss_project_id: z.string().uuid(),
  gvteway_event_id: z.string().uuid(),
});

const gvtewaySyncActionSchema = z.union([
  createLinkSchema,
  syncScheduleSchema,
  syncVenueSchema,
  syncCrewSchema,
  pullTicketDataSchema,
]);

// GET /api/cross-platform/gvteway-sync - Get event sync status
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
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const projectId = searchParams.get('project_id');

    if (action === 'linked_events') {
      // Get all linked COMPVSS projects to GVTEWAY events
      const { data: links } = await supabase
        .from('cross_platform_links')
        .select(`
          *,
          compvss_project:compvss_projects!compvss_project_id(id, name, status, start_date, end_date),
          gvteway_event:events!gvteway_event_id(id, name, status, event_date, venue_name)
        `)
        .eq('link_type', 'compvss_gvteway');

      return NextResponse.json({ linked_events: links || [] });
    }

    if (action === 'event_details' && projectId) {
      // Get linked event details for a COMPVSS project
      const { data: link } = await supabase
        .from('cross_platform_links')
        .select('gvteway_event_id')
        .eq('compvss_project_id', projectId)
        .eq('link_type', 'compvss_gvteway')
        .single();

      if (!link) {
        return NextResponse.json({ error: 'No linked event' }, { status: 404 });
      }

      const { data: event } = await supabase
        .from('events')
        .select('*')
        .eq('id', link.gvteway_event_id)
        .single();

      // Get ticket sales summary
      const { data: tickets } = await supabase
        .from('orders')
        .select('total_amount, status')
        .eq('event_id', link.gvteway_event_id);

      const soldTickets = tickets?.filter(t => t.status === 'completed').length || 0;
      const totalRevenue = tickets?.filter(t => t.status === 'completed')
        .reduce((sum, t) => sum + (t.total_amount || 0), 0) || 0;

      return NextResponse.json({
        event,
        ticket_summary: {
          sold: soldTickets,
          revenue: totalRevenue,
        },
      });
    }

    // Default: Get sync overview
    const { data: links } = await supabase
      .from('cross_platform_links')
      .select('id')
      .eq('link_type', 'compvss_gvteway');

    return NextResponse.json({
      total_linked_events: links?.length || 0,
      sync_types: ['schedule', 'crew', 'run_of_show', 'venue_info'],
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch sync data' }, { status: 500 });
  }
}

// POST /api/cross-platform/gvteway-sync - Create link or sync event data
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
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = gvtewaySyncActionSchema.parse(body);
    const action = validatedData.action || 'create_link';

    if (action === 'create_link') {
      const { compvss_project_id, gvteway_event_id } = validatedData as z.infer<typeof createLinkSchema>;

      const { data: link, error } = await supabase
        .from('cross_platform_links')
        .insert({
          link_type: 'compvss_gvteway',
          compvss_project_id,
          gvteway_event_id,
          sync_enabled: true,
          sync_direction: 'bidirectional',
          created_by: user.id,
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
      }

      return NextResponse.json({ link }, { status: 201 });
    } else if (action === 'sync_schedule') {
      const { compvss_project_id, gvteway_event_id } = validatedData as z.infer<typeof syncScheduleSchema>;

      // Get COMPVSS run of show
      const { data: runOfShow } = await supabase
        .from('run_of_show')
        .select('*')
        .eq('project_id', compvss_project_id)
        .order('scheduled_time');

      // Update GVTEWAY event schedule
      if (runOfShow && runOfShow.length > 0) {
        const schedule = runOfShow.map(item => ({
          time: item.scheduled_time,
          title: item.title,
          description: item.description,
          duration: item.duration_minutes,
          type: item.item_type,
        }));

        await supabase
          .from('events')
          .update({ schedule })
          .eq('id', gvteway_event_id);
      }

      // Log sync
      await supabase.from('cross_platform_sync_logs').insert({
        link_type: 'compvss_gvteway',
        compvss_project_id,
        gvteway_event_id,
        sync_direction: 'compvss_to_gvteway',
        fields_synced: ['schedule'],
        sync_results: { items_synced: runOfShow?.length || 0 },
        synced_by: user.id,
        synced_at: new Date().toISOString(),
      });

      return NextResponse.json({
        success: true,
        items_synced: runOfShow?.length || 0,
      });
    } else if (action === 'sync_venue') {
      const { compvss_project_id, gvteway_event_id } = validatedData as z.infer<typeof syncVenueSchema>;

      // Get COMPVSS venue info
      const { data: project } = await supabase
        .from('compvss_projects')
        .select('venue_id')
        .eq('id', compvss_project_id)
        .single();

      if (project?.venue_id) {
        const { data: venue } = await supabase
          .from('venues')
          .select('*')
          .eq('id', project.venue_id)
          .single();

        if (venue) {
          // Update GVTEWAY event with venue info
          await supabase
            .from('events')
            .update({
              venue_name: venue.name,
              venue_address: venue.address,
              venue_city: venue.city,
              venue_state: venue.state,
              venue_zip: venue.zip,
              venue_capacity: venue.capacity,
            })
            .eq('id', gvteway_event_id);
        }
      }

      return NextResponse.json({ success: true });
    } else if (action === 'sync_crew_to_event') {
      const { compvss_project_id, gvteway_event_id } = validatedData as z.infer<typeof syncCrewSchema>;

      // Get COMPVSS crew assignments
      const { data: crew } = await supabase
        .from('crew_assignments')
        .select(`
          *,
          user:platform_users(first_name, last_name, email)
        `)
        .eq('project_id', compvss_project_id);

      // Create event staff records in GVTEWAY
      if (crew && crew.length > 0) {
        const staffRecords = crew.map(c => ({
          event_id: gvteway_event_id,
          user_id: c.user_id,
          role: c.role,
          department: c.department,
          check_in_time: c.call_time,
        }));

        await supabase
          .from('event_staff')
          .upsert(staffRecords, { onConflict: 'event_id,user_id' });
      }

      return NextResponse.json({
        success: true,
        staff_synced: crew?.length || 0,
      });
    } else if (action === 'pull_ticket_data') {
      const { compvss_project_id, gvteway_event_id } = validatedData as z.infer<typeof pullTicketDataSchema>;

      // Get ticket sales from GVTEWAY
      const { data: orders } = await supabase
        .from('orders')
        .select('*')
        .eq('event_id', gvteway_event_id)
        .eq('status', 'completed');

      // Get ticket types
      const { data: ticketTypes } = await supabase
        .from('ticket_types')
        .select('*')
        .eq('event_id', gvteway_event_id);

      // Calculate attendance projections
      const totalSold = orders?.length || 0;
      const totalCapacity = ticketTypes?.reduce((sum, t) => sum + (t.quantity || 0), 0) || 0;
      const soldPercentage = totalCapacity > 0 ? (totalSold / totalCapacity * 100) : 0;

      // Update COMPVSS project with attendance data
      await supabase
        .from('compvss_projects')
        .update({
          expected_attendance: totalSold,
          attendance_percentage: soldPercentage,
          ticket_data_synced_at: new Date().toISOString(),
        })
        .eq('id', compvss_project_id);

      return NextResponse.json({
        success: true,
        attendance_data: {
          tickets_sold: totalSold,
          total_capacity: totalCapacity,
          sold_percentage: soldPercentage.toFixed(2),
        },
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process sync' }, { status: 500 });
  }
}
