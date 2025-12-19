import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createAdminClient();
    const proposalId = params.id;

    // Get proposal
    const { data: proposal, error: proposalError } = await supabase
      .from('proposals')
      .select('id, proposal_number, title, status, sent_at, view_count')
      .eq('id', proposalId)
      .single();

    if (proposalError || !proposal) {
      return NextResponse.json(
        { error: 'Proposal not found' },
        { status: 404 }
      );
    }

    // Get view history
    const { data: views, error: viewsError } = await supabase
      .from('proposal_views')
      .select('id, viewer_ip, user_agent, viewed_at')
      .eq('proposal_id', proposalId)
      .order('viewed_at', { ascending: false });

    if (viewsError) {
      return NextResponse.json(
        { error: 'Failed to fetch view analytics' },
        { status: 500 }
      );
    }

    // Calculate view metrics
    const totalViews = views?.length || 0;
    const uniqueViewers = new Set(views?.map(v => v.viewer_ip)).size;

    // Group views by date
    const viewsByDate: Record<string, number> = {};
    views?.forEach((view) => {
      const date = new Date(view.viewed_at).toISOString().split('T')[0];
      viewsByDate[date] = (viewsByDate[date] || 0) + 1;
    });

    // Convert to array for chart
    const viewTrend = Object.entries(viewsByDate)
      .map(([date, count]) => ({ date, views: count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Calculate engagement metrics
    const firstView = views?.length ? views[views.length - 1].viewed_at : null;
    const lastView = views?.length ? views[0].viewed_at : null;

    // Time since sent to first view
    let timeToFirstView = null;
    if (proposal.sent_at && firstView) {
      const sentTime = new Date(proposal.sent_at).getTime();
      const firstViewTime = new Date(firstView).getTime();
      timeToFirstView = Math.round((firstViewTime - sentTime) / (1000 * 60)); // in minutes
    }

    // Recent activity
    const recentViews = views?.slice(0, 10).map(v => ({
      viewed_at: v.viewed_at,
      device: parseUserAgent(v.user_agent),
    })) || [];

    return NextResponse.json({
      proposal: {
        id: proposal.id,
        proposal_number: proposal.proposal_number,
        title: proposal.title,
        status: proposal.status,
        sent_at: proposal.sent_at,
      },
      metrics: {
        total_views: totalViews,
        unique_viewers: uniqueViewers,
        first_viewed_at: firstView,
        last_viewed_at: lastView,
        time_to_first_view_minutes: timeToFirstView,
      },
      view_trend: viewTrend,
      recent_activity: recentViews,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function parseUserAgent(userAgent: string): string {
  if (!userAgent) return 'Unknown';
  
  if (userAgent.includes('Mobile') || userAgent.includes('Android')) {
    return 'Mobile';
  }
  if (userAgent.includes('iPad') || userAgent.includes('Tablet')) {
    return 'Tablet';
  }
  return 'Desktop';
}
