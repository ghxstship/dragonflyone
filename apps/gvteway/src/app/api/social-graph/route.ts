import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Social graph integration (Facebook, Instagram friends)
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Get connected social accounts
    const { data: connections } = await supabase.from('social_connections').select('*')
      .eq('user_id', user.id);

    // Get friends on platform
    const { data: friends } = await supabase.from('social_friends').select(`
      friend:platform_users(id, email, first_name, last_name, avatar_url)
    `).eq('user_id', user.id);

    // Get friends' upcoming events
    const friendIds = friends?.map((f: any) => f.friend?.id).filter(Boolean) || [];
    let friendsEvents: any[] = [];

    if (friendIds.length > 0) {
      const { data: orders } = await supabase.from('orders').select(`
        user_id, event:events(*)
      `).in('user_id', friendIds).gte('event.date', new Date().toISOString());

      friendsEvents = orders?.map((o: any) => ({
        event: o.event,
        friends_attending: orders.filter((ord: any) => ord.event?.id === o.event?.id).length
      })) || [];
    }

    return NextResponse.json({
      connections: connections || [],
      friends: friends?.map(f => f.friend) || [],
      friends_events: friendsEvents,
      supported_platforms: ['facebook', 'instagram', 'twitter']
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch social data' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { platform, access_token, action, friend_ids } = body;

    if (action === 'connect') {
      const { data, error } = await supabase.from('social_connections').upsert({
        user_id: user.id, platform, access_token,
        connected_at: new Date().toISOString(), status: 'active'
      }).select().single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ connection: data }, { status: 201 });
    }

    if (action === 'sync_friends') {
      // Find friends who are also on the platform
      const { data: platformUsers } = await supabase.from('social_connections')
        .select('user_id').eq('platform', platform).in('external_id', friend_ids || []);

      const friendRecords = platformUsers?.map(pu => ({
        user_id: user.id, friend_user_id: pu.user_id, source_platform: platform
      })) || [];

      if (friendRecords.length > 0) {
        await supabase.from('social_friends').upsert(friendRecords);
      }

      return NextResponse.json({ friends_found: friendRecords.length });
    }

    if (action === 'disconnect') {
      await supabase.from('social_connections').delete()
        .eq('user_id', user.id).eq('platform', platform);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 });
  }
}
