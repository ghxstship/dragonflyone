import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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

    // Get current user's interests
    const { data: userInterests } = await supabase
      .from('user_interests')
      .select('interest_id')
      .eq('user_id', user.id);

    const interestIds = userInterests?.map(ui => ui.interest_id) || [];

    if (interestIds.length === 0) {
      return NextResponse.json({ matches: [] });
    }

    // Find users with similar interests
    const { data: matchingUsers } = await supabase
      .from('user_interests')
      .select(`
        user_id,
        interest:interests(id, name)
      `)
      .in('interest_id', interestIds)
      .neq('user_id', user.id);

    // Group by user and count matching interests
    const userScores: Record<string, { count: number; interests: string[] }> = {};
    matchingUsers?.forEach(mu => {
      if (!userScores[mu.user_id]) {
        userScores[mu.user_id] = { count: 0, interests: [] };
      }
      userScores[mu.user_id].count++;
      if (mu.interest) {
        userScores[mu.user_id].interests.push((mu.interest as any).name);
      }
    });

    // Get user details for matches
    const matchUserIds = Object.keys(userScores);
    if (matchUserIds.length === 0) {
      return NextResponse.json({ matches: [] });
    }

    const { data: users } = await supabase
      .from('platform_users')
      .select('*')
      .in('id', matchUserIds);

    // Get mutual friends count
    const { data: userFriends } = await supabase
      .from('friendships')
      .select('friend_id')
      .eq('user_id', user.id)
      .eq('status', 'accepted');

    const friendIds = userFriends?.map(f => f.friend_id) || [];

    // Get events attended count
    const { data: eventsAttended } = await supabase
      .from('order_items')
      .select('order:orders(user_id)')
      .in('order.user_id', matchUserIds);

    const eventCounts: Record<string, number> = {};
    eventsAttended?.forEach(ea => {
      const userId = (ea.order as any)?.user_id;
      if (userId) {
        eventCounts[userId] = (eventCounts[userId] || 0) + 1;
      }
    });

    // Get following status
    const { data: following } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', user.id)
      .in('following_id', matchUserIds);

    const followingIds = new Set(following?.map(f => f.following_id) || []);

    // Calculate match scores and build response
    const matches = users?.map(u => {
      const score = userScores[u.id];
      const matchScore = Math.min(100, Math.round((score.count / interestIds.length) * 100));

      // Count mutual friends
      let mutualFriends = 0;
      if (friendIds.length > 0) {
        // This is simplified - in production you'd query the other user's friends
        mutualFriends = Math.floor(Math.random() * 5); // Placeholder
      }

      return {
        id: u.id,
        name: `${u.first_name} ${u.last_name}`,
        avatar_url: u.avatar_url,
        bio: u.bio,
        location: u.city ? `${u.city}, ${u.state}` : null,
        interests: score.interests,
        favorite_genres: u.favorite_genres || [],
        events_attended: eventCounts[u.id] || 0,
        mutual_friends: mutualFriends,
        match_score: matchScore,
        is_following: followingIds.has(u.id),
      };
    }).sort((a, b) => b.match_score - a.match_score) || [];

    return NextResponse.json({ matches });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
