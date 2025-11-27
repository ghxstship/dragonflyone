import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's friends
    const { data: friendships, error } = await supabase
      .from('friendships')
      .select(`
        friend:platform_users!friendships_friend_id_fkey (
          id,
          first_name,
          last_name,
          avatar_url,
          status,
          current_event_id,
          last_seen,
          location_lat,
          location_lng,
          location_section
        )
      `)
      .eq('user_id', user.id)
      .eq('status', 'accepted');

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Get event names for friends at events
    const friendsAtEvents = friendships?.filter((f: any) => f.friend?.current_event_id) || [];
    const eventIds = friendsAtEvents.map((f: any) => f.friend.current_event_id);

    let events: any[] = [];
    if (eventIds.length > 0) {
      const { data: eventData } = await supabase
        .from('events')
        .select('id, title')
        .in('id', eventIds);
      events = eventData || [];
    }

    const friends = friendships?.map((f: any) => {
      const friend = f.friend;
      const event = events.find(e => e.id === friend?.current_event_id);
      return {
        id: friend?.id,
        user_id: friend?.id,
        name: `${friend?.first_name || ''} ${friend?.last_name || ''}`.trim(),
        avatar_url: friend?.avatar_url,
        status: friend?.current_event_id ? 'at_event' : (friend?.status || 'offline'),
        current_event_id: friend?.current_event_id,
        current_event_name: event?.title,
        last_seen: friend?.last_seen,
        location: friend?.location_lat ? {
          lat: friend.location_lat,
          lng: friend.location_lng,
          section: friend.location_section,
        } : null,
      };
    }) || [];

    return NextResponse.json({ friends });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, friend_id, email } = body;

    if (action === 'add') {
      // Find user by email if friend_id not provided
      let targetUserId = friend_id;
      if (!targetUserId && email) {
        const { data: targetUser } = await supabase
          .from('platform_users')
          .select('id')
          .eq('email', email)
          .single();
        targetUserId = targetUser?.id;
      }

      if (!targetUserId) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      // Create friendship request
      const { data, error } = await supabase
        .from('friendships')
        .insert({
          user_id: user.id,
          friend_id: targetUserId,
          status: 'pending',
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ friendship: data }, { status: 201 });
    }

    if (action === 'accept') {
      const { error } = await supabase
        .from('friendships')
        .update({ status: 'accepted' })
        .eq('friend_id', user.id)
        .eq('user_id', friend_id);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Create reverse friendship
      await supabase.from('friendships').insert({
        user_id: user.id,
        friend_id: friend_id,
        status: 'accepted',
      });

      return NextResponse.json({ success: true });
    }

    if (action === 'remove') {
      await supabase
        .from('friendships')
        .delete()
        .or(`and(user_id.eq.${user.id},friend_id.eq.${friend_id}),and(user_id.eq.${friend_id},friend_id.eq.${user.id})`);

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
