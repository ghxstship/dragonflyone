import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const hostId = searchParams.get('host_id');

    let query = supabase
      .from('watch_parties')
      .select(`
        *,
        host:platform_users!watch_parties_host_id_fkey(id, first_name, last_name, avatar_url),
        event:events(id, title)
      `)
      .order('scheduled_at', { ascending: true });

    if (status) {
      query = query.eq('status', status);
    } else {
      // By default, show upcoming and live
      query = query.in('status', ['upcoming', 'live']);
    }

    if (hostId) {
      query = query.eq('host_id', hostId);
    }

    // Only show public parties unless authenticated
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      query = query.eq('is_private', false);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const parties = data?.map(p => ({
      id: p.id,
      title: p.title,
      description: p.description,
      host_id: p.host_id,
      host_name: p.host ? `${(p.host as any).first_name} ${(p.host as any).last_name}` : 'Anonymous',
      host_avatar: (p.host as any)?.avatar_url,
      event_id: p.event_id,
      event_name: (p.event as any)?.title,
      content_type: p.content_type,
      content_url: p.content_url,
      thumbnail_url: p.thumbnail_url,
      scheduled_at: p.scheduled_at,
      duration_minutes: p.duration_minutes || 120,
      status: p.status,
      attendees_count: p.attendees_count || 0,
      max_attendees: p.max_attendees,
      is_private: p.is_private || false,
      chat_enabled: p.chat_enabled !== false,
      video_enabled: p.video_enabled || false,
    })) || [];

    return NextResponse.json({ parties });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
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
    const {
      title,
      description,
      event_id,
      content_type,
      content_url,
      thumbnail_url,
      scheduled_at,
      duration_minutes,
      max_attendees,
      is_private,
      chat_enabled,
      video_enabled,
    } = body;

    if (!title || !scheduled_at) {
      return NextResponse.json(
        { error: 'Title and scheduled time are required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('watch_parties')
      .insert({
        title,
        description,
        host_id: user.id,
        event_id,
        content_type: content_type || 'livestream',
        content_url,
        thumbnail_url,
        scheduled_at,
        duration_minutes: duration_minutes || 120,
        max_attendees,
        is_private: is_private || false,
        chat_enabled: chat_enabled !== false,
        video_enabled: video_enabled || false,
        status: 'upcoming',
        attendees_count: 1, // Host is first attendee
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Add host as attendee
    await supabase.from('watch_party_attendees').insert({
      party_id: data.id,
      user_id: user.id,
      role: 'host',
    });

    return NextResponse.json({ party: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
