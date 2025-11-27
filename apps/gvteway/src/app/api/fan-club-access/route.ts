import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}


// Lazy getter for supabase client - only accessed at runtime
const supabase = new Proxy({} as ReturnType<typeof getSupabaseClient>, {
  get(_target, prop) {
    return (getSupabaseClient() as any)[prop];
  }
});

const accessWindowSchema = z.object({
  event_id: z.string().uuid(),
  fan_club_id: z.string().uuid(),
  name: z.string().min(1),
  start_time: z.string().datetime(),
  end_time: z.string().datetime(),
  ticket_allocation: z.number().min(1).optional(),
  discount_percent: z.number().min(0).max(100).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('event_id');
    const fanClubId = searchParams.get('fan_club_id');
    const userId = searchParams.get('user_id');
    const type = searchParams.get('type');

    if (type === 'check_access' && eventId && userId) {
      // Get user's fan club memberships
      const { data: memberships } = await supabase
        .from('fan_club_members')
        .select('fan_club_id')
        .eq('user_id', userId)
        .eq('status', 'active');

      const fanClubIds = memberships?.map(m => m.fan_club_id) || [];

      if (fanClubIds.length === 0) {
        return NextResponse.json({ has_access: false, reason: 'No fan club memberships' });
      }

      // Check for active access windows
      const now = new Date().toISOString();
      const { data: windows } = await supabase
        .from('fan_club_access_windows')
        .select('*, fan_club:fan_clubs(id, name)')
        .eq('event_id', eventId)
        .in('fan_club_id', fanClubIds)
        .lte('start_time', now)
        .gte('end_time', now);

      if (windows && windows.length > 0) {
        return NextResponse.json({
          has_access: true,
          access_windows: windows,
          best_discount: Math.max(...windows.map(w => w.discount_percent || 0)),
        });
      }

      // Check for upcoming windows
      const { data: upcoming } = await supabase
        .from('fan_club_access_windows')
        .select('*, fan_club:fan_clubs(id, name)')
        .eq('event_id', eventId)
        .in('fan_club_id', fanClubIds)
        .gt('start_time', now)
        .order('start_time', { ascending: true })
        .limit(1);

      if (upcoming && upcoming.length > 0) {
        return NextResponse.json({
          has_access: false,
          reason: 'Access window not yet open',
          upcoming_window: upcoming[0],
        });
      }

      return NextResponse.json({ has_access: false, reason: 'No access windows for your fan clubs' });
    }

    if (type === 'windows' && eventId) {
      const { data: windows, error } = await supabase
        .from('fan_club_access_windows')
        .select('*, fan_club:fan_clubs(id, name)')
        .eq('event_id', eventId)
        .order('start_time', { ascending: true });

      if (error) throw error;
      return NextResponse.json({ access_windows: windows });
    }

    if (fanClubId) {
      const { data: windows, error } = await supabase
        .from('fan_club_access_windows')
        .select('*, event:events(id, name, start_date)')
        .eq('fan_club_id', fanClubId)
        .order('start_time', { ascending: false });

      if (error) throw error;
      return NextResponse.json({ access_windows: windows });
    }

    return NextResponse.json({ error: 'event_id or fan_club_id required' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const body = await request.json();
    const action = body.action;

    if (action === 'create_window') {
      const validated = accessWindowSchema.parse(body.data);

      const { data: window, error } = await supabase
        .from('fan_club_access_windows')
        .insert({
          ...validated,
          tickets_sold: 0,
          status: 'scheduled',
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ access_window: window }, { status: 201 });
    }

    if (action === 'use_access') {
      const { window_id, user_id, ticket_count } = body.data;

      // Get window and check allocation
      const { data: window } = await supabase
        .from('fan_club_access_windows')
        .select('ticket_allocation, tickets_sold')
        .eq('id', window_id)
        .single();

      if (!window) return NextResponse.json({ error: 'Window not found' }, { status: 404 });

      if (window.ticket_allocation && (window.tickets_sold || 0) + ticket_count > window.ticket_allocation) {
        return NextResponse.json({ error: 'Allocation exceeded' }, { status: 400 });
      }

      // Record usage
      await supabase.from('fan_club_access_usage').insert({
        window_id,
        user_id,
        ticket_count,
        used_at: new Date().toISOString(),
      });

      // Update tickets sold
      await supabase
        .from('fan_club_access_windows')
        .update({ tickets_sold: (window.tickets_sold || 0) + ticket_count })
        .eq('id', window_id);

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const body = await request.json();
    const { id, ...updates } = body;

    const { data: window, error } = await supabase
      .from('fan_club_access_windows')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ access_window: window });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    const { error } = await supabase
      .from('fan_club_access_windows')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
