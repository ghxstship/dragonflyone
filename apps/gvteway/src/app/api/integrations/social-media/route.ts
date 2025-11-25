import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Social Media Integration API
 * Integrates with Facebook, Instagram, Twitter/X, TikTok for event promotion
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const platform = searchParams.get('platform');
    const eventId = searchParams.get('event_id');

    if (type === 'connections') {
      // Get connected social accounts
      const { data, error } = await supabase
        .from('social_connections')
        .select('*')
        .order('platform', { ascending: true });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ connections: data });
    }

    if (type === 'posts') {
      // Get scheduled/published posts
      let query = supabase
        .from('social_posts')
        .select(`
          *,
          event:events(id, name, date),
          metrics:social_post_metrics(impressions, engagements, clicks, shares)
        `)
        .order('scheduled_at', { ascending: false });

      if (platform) {
        query = query.eq('platform', platform);
      }
      if (eventId) {
        query = query.eq('event_id', eventId);
      }

      const { data, error } = await query.limit(50);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ posts: data });
    }

    if (type === 'analytics') {
      // Get social media analytics
      const { data, error } = await supabase
        .from('social_post_metrics')
        .select(`
          *,
          post:social_posts(id, platform, content, event_id)
        `)
        .order('recorded_at', { ascending: false })
        .limit(100);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Aggregate by platform
      const byPlatform = (data || []).reduce((acc: Record<string, any>, m) => {
        const p = m.post?.platform || 'unknown';
        if (!acc[p]) {
          acc[p] = { impressions: 0, engagements: 0, clicks: 0, shares: 0, posts: 0 };
        }
        acc[p].impressions += m.impressions || 0;
        acc[p].engagements += m.engagements || 0;
        acc[p].clicks += m.clicks || 0;
        acc[p].shares += m.shares || 0;
        acc[p].posts++;
        return acc;
      }, {});

      return NextResponse.json({ analytics: byPlatform, raw_metrics: data });
    }

    if (type === 'templates') {
      // Get post templates
      const { data, error } = await supabase
        .from('social_post_templates')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ templates: data });
    }

    // Default: return platforms info
    const platforms = [
      { id: 'facebook', name: 'Facebook', features: ['posts', 'events', 'ads', 'insights'] },
      { id: 'instagram', name: 'Instagram', features: ['posts', 'stories', 'reels', 'insights'] },
      { id: 'twitter', name: 'Twitter/X', features: ['tweets', 'threads', 'analytics'] },
      { id: 'tiktok', name: 'TikTok', features: ['videos', 'analytics'] },
      { id: 'linkedin', name: 'LinkedIn', features: ['posts', 'events', 'analytics'] }
    ];

    return NextResponse.json({ platforms });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch social data' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action } = body;

    if (action === 'connect') {
      // Connect social account (OAuth flow would be handled separately)
      const { platform, access_token, account_id, account_name } = body;

      const { data, error } = await supabase
        .from('social_connections')
        .upsert({
          platform,
          access_token_encrypted: access_token, // Would be encrypted
          account_id,
          account_name,
          status: 'connected',
          connected_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ connection: data }, { status: 201 });
    }

    if (action === 'disconnect') {
      const { platform } = body;

      await supabase
        .from('social_connections')
        .delete()
        .eq('platform', platform);

      return NextResponse.json({ success: true });
    }

    if (action === 'create_post') {
      // Create/schedule a social post
      const { platform, content, media_urls, event_id, scheduled_at, publish_now } = body;

      const { data, error } = await supabase
        .from('social_posts')
        .insert({
          platform,
          content,
          media_urls: media_urls || [],
          event_id,
          scheduled_at: publish_now ? new Date().toISOString() : scheduled_at,
          status: publish_now ? 'publishing' : 'scheduled'
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // If publish_now, trigger immediate publish
      if (publish_now) {
        // In production, would call platform API
        await supabase
          .from('social_posts')
          .update({ status: 'published', published_at: new Date().toISOString() })
          .eq('id', data.id);
      }

      return NextResponse.json({ post: data }, { status: 201 });
    }

    if (action === 'bulk_schedule') {
      // Schedule posts across multiple platforms
      const { platforms, content, media_urls, event_id, scheduled_at } = body;

      const posts = platforms.map((p: string) => ({
        platform: p,
        content,
        media_urls: media_urls || [],
        event_id,
        scheduled_at,
        status: 'scheduled'
      }));

      const { data, error } = await supabase
        .from('social_posts')
        .insert(posts)
        .select();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ posts: data }, { status: 201 });
    }

    if (action === 'create_event_campaign') {
      // Create a full social campaign for an event
      const { event_id, campaign_name, posts } = body;

      // Get event details
      const { data: event } = await supabase
        .from('events')
        .select('*')
        .eq('id', event_id)
        .single();

      if (!event) {
        return NextResponse.json({ error: 'Event not found' }, { status: 404 });
      }

      // Create campaign
      const { data: campaign, error: campError } = await supabase
        .from('social_campaigns')
        .insert({
          name: campaign_name || `${event.name} Campaign`,
          event_id,
          status: 'active',
          start_date: new Date().toISOString(),
          end_date: event.date
        })
        .select()
        .single();

      if (campError) {
        return NextResponse.json({ error: campError.message }, { status: 500 });
      }

      // Create scheduled posts
      const scheduledPosts = (posts || []).map((p: any) => ({
        ...p,
        event_id,
        campaign_id: campaign.id,
        status: 'scheduled'
      }));

      if (scheduledPosts.length > 0) {
        await supabase.from('social_posts').insert(scheduledPosts);
      }

      return NextResponse.json({ campaign }, { status: 201 });
    }

    if (action === 'sync_metrics') {
      // Sync metrics from social platforms
      const { post_id } = body;

      // In production, would call platform APIs
      // For now, simulate metrics update
      const { data, error } = await supabase
        .from('social_post_metrics')
        .upsert({
          post_id,
          impressions: Math.floor(Math.random() * 10000),
          engagements: Math.floor(Math.random() * 500),
          clicks: Math.floor(Math.random() * 200),
          shares: Math.floor(Math.random() * 50),
          recorded_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ metrics: data });
    }

    if (action === 'generate_content') {
      // AI-assisted content generation (placeholder)
      const { event_id, platform, tone } = body;

      const { data: event } = await supabase
        .from('events')
        .select('*')
        .eq('id', event_id)
        .single();

      if (!event) {
        return NextResponse.json({ error: 'Event not found' }, { status: 404 });
      }

      // Generate platform-specific content suggestions
      const suggestions = {
        facebook: `🎉 Don't miss ${event.name}! Join us on ${new Date(event.date).toLocaleDateString()} for an unforgettable experience. Get your tickets now! 🎫`,
        instagram: `✨ ${event.name} is coming! ✨\n\n📅 ${new Date(event.date).toLocaleDateString()}\n📍 ${event.venue || 'TBA'}\n\nLink in bio for tickets! 🎟️\n\n#LiveMusic #Events #${event.name?.replace(/\s+/g, '')}`,
        twitter: `🎤 ${event.name} - ${new Date(event.date).toLocaleDateString()}\n\nTickets available now! Don't miss out 🔥\n\n#LiveEvents`,
        tiktok: `POV: You're about to experience ${event.name} 🤩 Mark your calendars for ${new Date(event.date).toLocaleDateString()}!`
      };

      return NextResponse.json({
        suggestions: platform ? { [platform]: suggestions[platform as keyof typeof suggestions] } : suggestions
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process social media request' }, { status: 500 });
  }
}
