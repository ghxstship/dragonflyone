import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@ghxstship/config';

// Social sharing of opportunities
export async function GET(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const opportunityId = searchParams.get('opportunity_id');

    if (!opportunityId) return NextResponse.json({ error: 'opportunity_id required' }, { status: 400 });

    const { data, error } = await supabase.from('opportunity_shares').select('*')
      .eq('opportunity_id', opportunityId);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

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
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { action } = body;

    if (action === 'share') {
      const { opportunity_id, platform } = body;

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
      const { share_id } = body;

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
