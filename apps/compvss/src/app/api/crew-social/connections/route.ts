import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@ghxstship/config';
import { z } from 'zod';

const connectionSchema = z.object({
  following_id: z.string().uuid(),
  connection_type: z.enum(['follow', 'connection', 'colleague', 'mentor', 'mentee']).default('follow'),
  notes: z.string().optional(),
});

export async function GET(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    const { searchParams } = new URL(request.url);
    const user_id = searchParams.get('user_id');
    const type = searchParams.get('type'); // 'followers' or 'following'
    const connection_type = searchParams.get('connection_type');

    if (!user_id) {
      return NextResponse.json(
        { error: 'user_id is required' },
        { status: 400 }
      );
    }

    let query = supabase
      .from('crew_connections')
      .select(`
        *,
        follower:platform_users!follower_id(id, email, full_name, avatar_url),
        following:platform_users!following_id(id, email, full_name, avatar_url)
      `)
      .eq('status', 'active');

    if (type === 'followers') {
      query = query.eq('following_id', user_id);
    } else if (type === 'following') {
      query = query.eq('follower_id', user_id);
    } else {
      query = query.or(`follower_id.eq.${user_id},following_id.eq.${user_id}`);
    }

    if (connection_type) {
      query = query.eq('connection_type', connection_type);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;

    // Get counts
    const { count: followersCount } = await supabase
      .from('crew_connections')
      .select('*', { count: 'exact', head: true })
      .eq('following_id', user_id)
      .eq('status', 'active');

    const { count: followingCount } = await supabase
      .from('crew_connections')
      .select('*', { count: 'exact', head: true })
      .eq('follower_id', user_id)
      .eq('status', 'active');

    return NextResponse.json({
      data,
      counts: {
        followers: followersCount || 0,
        following: followingCount || 0,
      },
    });
  } catch (error) {
    console.error('Error fetching connections:', error);
    return NextResponse.json(
      { error: 'Failed to fetch connections' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const supabase = getServerSupabase();
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
    const validated = connectionSchema.parse(body);

    // Can't follow yourself
    if (validated.following_id === user.id) {
      return NextResponse.json(
        { error: 'Cannot follow yourself' },
        { status: 400 }
      );
    }

    // Check if connection already exists
    const { data: existing } = await supabase
      .from('crew_connections')
      .select('id, status')
      .eq('follower_id', user.id)
      .eq('following_id', validated.following_id)
      .single();

    if (existing) {
      if (existing.status === 'active') {
        return NextResponse.json(
          { error: 'Already connected' },
          { status: 409 }
        );
      }
      // Reactivate blocked/pending connection
      const { data, error } = await supabase
        .from('crew_connections')
        .update({ status: 'active', connection_type: validated.connection_type })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ data });
    }

    const { data, error } = await supabase
      .from('crew_connections')
      .insert({
        follower_id: user.id,
        ...validated,
        status: 'active',
      })
      .select()
      .single();

    if (error) throw error;

    // Create activity feed entry
    await supabase.from('crew_activity_feed').insert({
      user_id: user.id,
      activity_type: 'connection_made',
      target_type: 'user',
      target_id: validated.following_id,
      visibility: 'connections',
    });

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error creating connection:', error);
    return NextResponse.json(
      { error: 'Failed to create connection' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const supabase = getServerSupabase();
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
    const following_id = searchParams.get('following_id');

    if (!following_id) {
      return NextResponse.json(
        { error: 'following_id is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('crew_connections')
      .delete()
      .eq('follower_id', user.id)
      .eq('following_id', following_id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing connection:', error);
    return NextResponse.json(
      { error: 'Failed to remove connection' },
      { status: 500 }
    );
  }
}
