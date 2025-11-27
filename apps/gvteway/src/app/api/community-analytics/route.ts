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

// Community analytics and engagement insights
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const communityId = searchParams.get('community_id');
    const period = searchParams.get('period') || '30'; // days

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    // Get member stats
    const { data: members } = await supabase.from('community_members').select('*')
      .eq('community_id', communityId);

    const { data: newMembers } = await supabase.from('community_members').select('*')
      .eq('community_id', communityId).gte('joined_at', startDate.toISOString());

    // Get engagement metrics
    const { data: posts } = await supabase.from('community_posts').select('*')
      .eq('community_id', communityId).gte('created_at', startDate.toISOString());

    const { data: comments } = await supabase.from('post_comments').select('*, post:community_posts!inner(community_id)')
      .eq('post.community_id', communityId).gte('created_at', startDate.toISOString());

    const { data: reactions } = await supabase.from('post_reactions').select('*, post:community_posts!inner(community_id)')
      .eq('post.community_id', communityId).gte('created_at', startDate.toISOString());

    // Calculate engagement rate
    const totalMembers = members?.length || 1;
    const activeMembers = new Set([
      ...(posts?.map(p => p.user_id) || []),
      ...(comments?.map(c => c.user_id) || []),
      ...(reactions?.map(r => r.user_id) || [])
    ]).size;

    const engagementRate = Math.round((activeMembers / totalMembers) * 100);

    // Top contributors
    const contributorCounts: Record<string, number> = {};
    posts?.forEach(p => { contributorCounts[p.user_id] = (contributorCounts[p.user_id] || 0) + 3; });
    comments?.forEach(c => { contributorCounts[c.user_id] = (contributorCounts[c.user_id] || 0) + 1; });

    const topContributors = Object.entries(contributorCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([userId, score]) => ({ user_id: userId, engagement_score: score }));

    // Daily activity trend
    const dailyActivity: Record<string, number> = {};
    posts?.forEach(p => {
      const day = p.created_at.substring(0, 10);
      dailyActivity[day] = (dailyActivity[day] || 0) + 1;
    });

    return NextResponse.json({
      summary: {
        total_members: totalMembers,
        new_members: newMembers?.length || 0,
        active_members: activeMembers,
        engagement_rate: engagementRate,
        total_posts: posts?.length || 0,
        total_comments: comments?.length || 0,
        total_reactions: reactions?.length || 0
      },
      top_contributors: topContributors,
      daily_activity: Object.entries(dailyActivity).map(([date, count]) => ({ date, count })),
      growth_rate: totalMembers > 0 ? Math.round(((newMembers?.length || 0) / totalMembers) * 100) : 0
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
