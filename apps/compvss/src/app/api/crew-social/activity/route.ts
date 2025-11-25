import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const user_id = searchParams.get('user_id');
    const activity_type = searchParams.get('activity_type');
    const feed_type = searchParams.get('feed_type'); // 'personal', 'connections', 'all'
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    const authHeader = request.headers.get('authorization');
    let currentUserId: string | null = null;
    
    if (authHeader) {
      const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
      currentUserId = user?.id || null;
    }

    let query = supabase
      .from('crew_activity_feed')
      .select(`
        *,
        user:platform_users!user_id(id, email, full_name, avatar_url)
      `, { count: 'exact' });

    if (user_id) {
      query = query.eq('user_id', user_id);
    } else if (feed_type === 'connections' && currentUserId) {
      // Get activities from users the current user follows
      const { data: connections } = await supabase
        .from('crew_connections')
        .select('following_id')
        .eq('follower_id', currentUserId)
        .eq('status', 'active');

      const followingIds = connections?.map(c => c.following_id) || [];
      followingIds.push(currentUserId); // Include own activities

      if (followingIds.length > 0) {
        query = query.in('user_id', followingIds);
      }
    } else if (feed_type === 'personal' && currentUserId) {
      query = query.eq('user_id', currentUserId);
    }

    if (activity_type) {
      query = query.eq('activity_type', activity_type);
    }

    // Filter by visibility
    if (!currentUserId) {
      query = query.eq('visibility', 'public');
    }

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return NextResponse.json({
      data,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching activity feed:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activity feed' },
      { status: 500 }
    );
  }
}
