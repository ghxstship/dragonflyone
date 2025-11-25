import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Dedicated crew mobile app API with offline capability
 * Supports background sync, push notifications, and offline data caching
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'dashboard';
    const lastSync = searchParams.get('last_sync');

    // Dashboard data for crew mobile app
    if (action === 'dashboard') {
      // Get crew member profile
      const { data: profile } = await supabase
        .from('crew_members')
        .select('*, department:departments(name)')
        .eq('user_id', user.id)
        .single();

      // Get upcoming assignments
      const { data: assignments } = await supabase
        .from('crew_assignments')
        .select(`
          *,
          event:events(id, name, date, venue, status),
          role:event_roles(name, department)
        `)
        .eq('crew_member_id', profile?.id)
        .gte('event.date', new Date().toISOString())
        .order('event(date)', { ascending: true })
        .limit(10);

      // Get today's schedule
      const today = new Date().toISOString().split('T')[0];
      const { data: todaySchedule } = await supabase
        .from('crew_schedules')
        .select('*')
        .eq('crew_member_id', profile?.id)
        .gte('start_time', `${today}T00:00:00`)
        .lte('start_time', `${today}T23:59:59`)
        .order('start_time', { ascending: true });

      // Get unread notifications
      const { data: notifications, count: unreadCount } = await supabase
        .from('notifications')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id)
        .eq('read', false)
        .order('created_at', { ascending: false })
        .limit(20);

      // Get pending time entries to sync
      const { data: pendingTimeEntries } = await supabase
        .from('time_entries')
        .select('*')
        .eq('crew_member_id', profile?.id)
        .eq('synced', false);

      return NextResponse.json({
        profile,
        assignments,
        today_schedule: todaySchedule,
        notifications,
        unread_count: unreadCount,
        pending_sync: pendingTimeEntries?.length || 0,
        last_sync: lastSync,
        server_time: new Date().toISOString(),
      });
    }

    // Get offline-cacheable data bundle
    if (action === 'offline_bundle') {
      const { data: profile } = await supabase
        .from('crew_members')
        .select('*')
        .eq('user_id', user.id)
        .single();

      // Get all upcoming events for offline access
      const { data: events } = await supabase
        .from('events')
        .select(`
          id, name, date, venue, status, location,
          event_roles(id, name, department),
          crew_assignments!inner(crew_member_id)
        `)
        .eq('crew_assignments.crew_member_id', profile?.id)
        .gte('date', new Date().toISOString())
        .order('date', { ascending: true })
        .limit(20);

      // Get schedules for next 7 days
      const weekFromNow = new Date();
      weekFromNow.setDate(weekFromNow.getDate() + 7);
      
      const { data: schedules } = await supabase
        .from('crew_schedules')
        .select('*')
        .eq('crew_member_id', profile?.id)
        .gte('start_time', new Date().toISOString())
        .lte('start_time', weekFromNow.toISOString());

      // Get emergency contacts
      const { data: emergencyContacts } = await supabase
        .from('emergency_contacts')
        .select('*')
        .eq('crew_member_id', profile?.id);

      // Get important documents
      const { data: documents } = await supabase
        .from('crew_documents')
        .select('id, name, type, url, expires_at')
        .eq('crew_member_id', profile?.id)
        .eq('offline_available', true);

      return NextResponse.json({
        profile,
        events,
        schedules,
        emergency_contacts: emergencyContacts,
        documents,
        bundle_version: Date.now(),
        expires_at: weekFromNow.toISOString(),
      });
    }

    // Get schedule for specific date range
    if (action === 'schedule') {
      const startDate = searchParams.get('start') || new Date().toISOString();
      const endDate = searchParams.get('end');

      const { data: profile } = await supabase
        .from('crew_members')
        .select('id')
        .eq('user_id', user.id)
        .single();

      let query = supabase
        .from('crew_schedules')
        .select(`
          *,
          event:events(id, name, venue, status)
        `)
        .eq('crew_member_id', profile?.id)
        .gte('start_time', startDate)
        .order('start_time', { ascending: true });

      if (endDate) {
        query = query.lte('start_time', endDate);
      }

      const { data: schedules, error } = await query;

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ schedules });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action } = body;

    // Clock in/out with geolocation
    if (action === 'clock_in' || action === 'clock_out') {
      const { event_id, latitude, longitude, notes } = body;

      const { data: profile } = await supabase
        .from('crew_members')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (action === 'clock_in') {
        const { data, error } = await supabase
          .from('time_entries')
          .insert({
            crew_member_id: profile?.id,
            event_id,
            clock_in: new Date().toISOString(),
            clock_in_latitude: latitude,
            clock_in_longitude: longitude,
            notes,
            synced: true,
          })
          .select()
          .single();

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ time_entry: data }, { status: 201 });
      } else {
        // Clock out - find active time entry
        const { data: activeEntry } = await supabase
          .from('time_entries')
          .select('id')
          .eq('crew_member_id', profile?.id)
          .eq('event_id', event_id)
          .is('clock_out', null)
          .single();

        if (!activeEntry) {
          return NextResponse.json({ error: 'No active time entry found' }, { status: 400 });
        }

        const { data, error } = await supabase
          .from('time_entries')
          .update({
            clock_out: new Date().toISOString(),
            clock_out_latitude: latitude,
            clock_out_longitude: longitude,
            notes: notes ? `${notes}` : undefined,
          })
          .eq('id', activeEntry.id)
          .select()
          .single();

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ time_entry: data });
      }
    }

    // Sync offline time entries
    if (action === 'sync_time_entries') {
      const { entries } = body;
      const results: any[] = [];

      const { data: profile } = await supabase
        .from('crew_members')
        .select('id')
        .eq('user_id', user.id)
        .single();

      for (const entry of entries || []) {
        try {
          const { data, error } = await supabase
            .from('time_entries')
            .upsert({
              ...entry,
              crew_member_id: profile?.id,
              synced: true,
              synced_at: new Date().toISOString(),
            })
            .select()
            .single();

          if (error) {
            results.push({ local_id: entry.local_id, status: 'failed', error: error.message });
          } else {
            results.push({ local_id: entry.local_id, status: 'synced', server_id: data.id });
          }
        } catch (e) {
          results.push({ local_id: entry.local_id, status: 'failed', error: (e as Error).message });
        }
      }

      return NextResponse.json({ results, synced_at: new Date().toISOString() });
    }

    // Report incident
    if (action === 'report_incident') {
      const { event_id, type, description, severity, photos } = body;

      const { data: profile } = await supabase
        .from('crew_members')
        .select('id')
        .eq('user_id', user.id)
        .single();

      const { data, error } = await supabase
        .from('incidents')
        .insert({
          event_id,
          reported_by: profile?.id,
          type,
          description,
          severity,
          photos,
          status: 'reported',
          reported_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ incident: data }, { status: 201 });
    }

    // Update availability
    if (action === 'update_availability') {
      const { date, available, notes } = body;

      const { data: profile } = await supabase
        .from('crew_members')
        .select('id')
        .eq('user_id', user.id)
        .single();

      const { data, error } = await supabase
        .from('crew_availability')
        .upsert({
          crew_member_id: profile?.id,
          date,
          available,
          notes,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'crew_member_id,date' })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ availability: data });
    }

    // Register push notification token
    if (action === 'register_push_token') {
      const { token, platform } = body;

      await supabase
        .from('push_tokens')
        .upsert({
          user_id: user.id,
          token,
          platform,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id,platform' });

      return NextResponse.json({ success: true });
    }

    // Mark notifications as read
    if (action === 'mark_notifications_read') {
      const { notification_ids } = body;

      await supabase
        .from('notifications')
        .update({ read: true, read_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .in('id', notification_ids || []);

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
