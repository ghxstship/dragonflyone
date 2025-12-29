export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase, withAuth, PlatformRole } from '@ghxstship/config';
import { z } from 'zod';

const recordViewSchema = z.object({
  opportunity_id: z.string().uuid(),
  user_id: z.string().uuid().optional(),
});

// Opportunity analytics (view counts, application rates)
const COMPVSS_ROLES = [
  PlatformRole.COMPVSS_ADMIN, PlatformRole.COMPVSS_TEAM_MEMBER, PlatformRole.COMPVSS_VIEWER,
  PlatformRole.LEGEND_SUPER_ADMIN, PlatformRole.LEGEND_ADMIN, PlatformRole.LEGEND_DEVELOPER,
];

export async function GET(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!COMPVSS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const opportunityId = searchParams.get('opportunity_id');
    const period = searchParams.get('period') || '30d';

    // Calculate date range based on period
    const now = new Date();
    const periodDays = period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 30;
    const startDate = new Date(now.getTime() - periodDays * 24 * 60 * 60 * 1000).toISOString();

    if (opportunityId) {
      const { data: opportunity } = await supabase.from('opportunities').select(`
        id, title, views, applications:job_applications(count)
      `).eq('id', opportunityId).single();

      const { data: views } = await supabase.from('opportunity_views').select('viewed_at')
        .eq('opportunity_id', opportunityId).gte('viewed_at', startDate).order('viewed_at', { ascending: true });

      // Group views by day
      const viewsByDay: Record<string, number> = {};
      views?.forEach(v => {
        const day = v.viewed_at.split('T')[0];
        viewsByDay[day] = (viewsByDay[day] || 0) + 1;
      });

      return NextResponse.json({
        opportunity,
        analytics: {
          total_views: opportunity?.views || 0,
          total_applications: opportunity?.applications?.[0]?.count || 0,
          application_rate: opportunity?.views ? ((opportunity.applications?.[0]?.count || 0) / opportunity.views * 100).toFixed(1) : 0,
          views_by_day: viewsByDay
        }
      });
    }

    // Aggregate analytics
    const { data: opportunities } = await supabase.from('opportunities').select(`
      id, title, views, applications:job_applications(count)
    `).order('views', { ascending: false }).limit(20);

    const totalViews = opportunities?.reduce((s, o) => s + (o.views || 0), 0) || 0;
    const totalApps = opportunities?.reduce((s, o) => s + (o.applications?.[0]?.count || 0), 0) || 0;

    return NextResponse.json({
      top_opportunities: opportunities,
      summary: {
        total_views: totalViews,
        total_applications: totalApps,
        avg_application_rate: totalViews ? (totalApps / totalViews * 100).toFixed(1) : 0
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!COMPVSS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = recordViewSchema.parse(body);
    const { opportunity_id, user_id } = validatedData;

    // Record view
    await supabase.from('opportunity_views').insert({
      opportunity_id, user_id, viewed_at: new Date().toISOString()
    });

    // Increment view count
    await supabase.rpc('increment_opportunity_views', { opp_id: opportunity_id });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to record' }, { status: 500 });
  }
}
