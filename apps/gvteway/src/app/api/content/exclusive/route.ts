import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const eventId = searchParams.get('event_id');
    const accessLevel = searchParams.get('access_level');
    const limit = parseInt(searchParams.get('limit') || '50');

    // Get user's access level if authenticated
    let userAccessLevel = 'all';
    const authHeader = request.headers.get('authorization');
    if (authHeader) {
      const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
      if (user) {
        // Check user's membership/VIP status
        const { data: membership } = await supabase
          .from('memberships')
          .select('tier')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .single();

        if (membership?.tier === 'vip') {
          userAccessLevel = 'vip';
        } else if (membership) {
          userAccessLevel = 'members';
        }
      }
    }

    let query = supabase
      .from('exclusive_content')
      .select(`
        *,
        event:events(id, title)
      `)
      .lte('release_date', new Date().toISOString())
      .order('release_date', { ascending: false })
      .limit(limit);

    if (type) {
      query = query.eq('type', type);
    }

    if (eventId) {
      query = query.eq('event_id', eventId);
    }

    // Filter by access level
    const accessLevels = ['all'];
    if (userAccessLevel === 'members') accessLevels.push('members');
    if (userAccessLevel === 'vip') accessLevels.push('members', 'vip');
    
    if (accessLevel) {
      query = query.eq('access_level', accessLevel);
    } else {
      query = query.in('access_level', accessLevels);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Check if content is new (released in last 7 days)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const content = data?.map(c => ({
      id: c.id,
      title: c.title,
      description: c.description,
      type: c.type,
      event_id: c.event_id,
      event_name: (c.event as any)?.title || 'Unknown Event',
      thumbnail_url: c.thumbnail_url,
      duration: c.duration,
      file_count: c.file_count,
      access_level: c.access_level,
      release_date: c.release_date,
      views: c.views || 0,
      likes: c.likes || 0,
      is_new: new Date(c.release_date) > weekAgo,
    })) || [];

    return NextResponse.json({ content });
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

    // Check if user is admin/creator
    const { data: platformUser } = await supabase
      .from('platform_users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!platformUser || !['admin', 'creator'].includes(platformUser.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { title, description, type, event_id, thumbnail_url, duration, access_level, release_date } = body;

    if (!title || !type || !event_id) {
      return NextResponse.json(
        { error: 'Title, type, and event_id are required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('exclusive_content')
      .insert({
        title,
        description,
        type,
        event_id,
        thumbnail_url,
        duration,
        access_level: access_level || 'all',
        release_date: release_date || new Date().toISOString(),
        created_by: user.id,
        views: 0,
        likes: 0,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ content: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
