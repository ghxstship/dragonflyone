export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase, withAuth, PlatformRole } from '@ghxstship/config';
import { z } from 'zod';

const shareSchema = z.object({
  action: z.literal('share'),
  opportunity_id: z.string().uuid(),
  platform: z.enum(['twitter', 'linkedin', 'facebook', 'email']),
});

const trackClickSchema = z.object({
  action: z.literal('track_click'),
  share_id: z.string().uuid(),
});

const socialActionSchema = z.union([shareSchema, trackClickSchema]);

// Social sharing of opportunities
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

    if (!opportunityId) return NextResponse.json({ error: 'opportunity_id required' }, { status: 400 });

    const { data, error } = await supabase.from('opportunity_shares').select('*')
      .eq('opportunity_id', opportunityId);

    if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });

    // Aggregate by platform
    const byPlatform: Record<string, number> = {};
    data?.forEach(s => {
      byPlatform[s.platform] = (byPlatform[s.platform] || 0) + 1;
    });

    return NextResponse.json({
      shares: data,
      total: data?.length || 0,
      by_platform: byPlatform
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

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const validatedData = socialActionSchema.parse(body);
    const { action } = validatedData;

    if (action === 'share') {
      const { opportunity_id, platform } = validatedData as z.infer<typeof shareSchema>;

      // Get opportunity for share URL
      const { data: opp } = await supabase.from('opportunities').select('title').eq('id', opportunity_id).single();

      const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL}/opportunities/${opportunity_id}`;
      const shareText = `Check out this opportunity: ${opp?.title}`;

      // Record share
      await supabase.from('opportunity_shares').insert({
        opportunity_id, platform, shared_by: user.id
      });

      // Generate platform-specific share URLs
      const shareUrls: Record<string, string> = {
        twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
        linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
        email: `mailto:?subject=${encodeURIComponent(opp?.title || 'Opportunity')}&body=${encodeURIComponent(shareText + '\n\n' + shareUrl)}`
      };

      return NextResponse.json({
        share_url: shareUrl,
        platform_urls: shareUrls,
        selected_url: shareUrls[platform] || shareUrl
      });
    }

    if (action === 'track_click') {
      const { share_id } = validatedData as z.infer<typeof trackClickSchema>;

      await supabase.from('opportunity_shares').update({
        clicked: true, clicked_at: new Date().toISOString()
      }).eq('id', share_id);

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 });
  }
}
