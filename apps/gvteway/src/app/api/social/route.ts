import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { apiRoute } from '@ghxstship/config/middleware';
import { PlatformRole } from '@ghxstship/config/roles';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

const socialShareSchema = z.object({
  content_type: z.enum(['event', 'ticket', 'achievement', 'review', 'custom']),
  content_id: z.string().uuid().optional(),
  platforms: z.array(z.enum(['facebook', 'twitter', 'instagram', 'linkedin', 'tiktok'])),
  message: z.string().max(280).optional(),
  media_urls: z.array(z.string().url()).optional(),
  hashtags: z.array(z.string()).optional(),
  schedule_time: z.string().optional()
});

const socialAccountSchema = z.object({
  platform: z.enum(['facebook', 'twitter', 'instagram', 'linkedin', 'tiktok']),
  account_name: z.string(),
  access_token: z.string(),
  refresh_token: z.string().optional(),
  expires_at: z.string().optional(),
  account_metadata: z.record(z.any()).optional()
});

// GET - List social posts or accounts
export const GET = apiRoute(
  async (request: NextRequest, context: any) => {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const user_id = context.user.id;

    if (type === 'accounts') {
      // List connected social accounts
      const { data, error } = await supabase
        .from('social_accounts')
        .select('id, platform, account_name, connected_at, is_active')
        .eq('user_id', user_id)
        .order('connected_at', { ascending: false });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ accounts: data });
    }

    if (type === 'analytics') {
      // Get social media analytics
      const event_id = searchParams.get('event_id');
      
      const { data: shares } = await supabase
        .from('social_shares')
        .select('platform, impressions, clicks, shares, likes')
        .eq('user_id', user_id)
        .eq('content_type', 'event')
        .eq('content_id', event_id);

      const analytics = aggregateAnalytics(shares || []);

      return NextResponse.json({ analytics });
    }

    // List social posts
    const { data, error } = await supabase
      .from('social_shares')
      .select(`
        *,
        events (
          id,
          name,
          date
        )
      `)
      .eq('user_id', user_id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ posts: data });
  },
  {
    auth: true,
    audit: { action: 'social:list', resource: 'social_shares' }
  }
);

// POST - Share content or connect account
export const POST = apiRoute(
  async (request: NextRequest, context: any) => {
    const body = await request.json();
    const { action } = body;

    if (action === 'connect_account') {
      const validated = socialAccountSchema.parse(body.data);

      // Save social account connection
      const { data: account, error } = await supabase
        .from('social_accounts')
        .insert({
          ...validated,
          user_id: context.user.id,
          is_active: true
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({
        account,
        message: `${validated.platform} account connected successfully`
      }, { status: 201 });
    }

    // Share content
    const validated = socialShareSchema.parse(body);

    // Generate share content based on type
    const shareContent = await generateShareContent(
      validated.content_type,
      validated.content_id,
      validated.message
    );

    // Get user's connected accounts for selected platforms
    const { data: accounts } = await supabase
      .from('social_accounts')
      .select('*')
      .eq('user_id', context.user.id)
      .in('platform', validated.platforms)
      .eq('is_active', true);

    if (!accounts || accounts.length === 0) {
      return NextResponse.json({
        error: 'No connected accounts found for selected platforms'
      }, { status: 400 });
    }

    // Create share records
    const shares = [];
    for (const platform of validated.platforms) {
      const account = accounts.find(a => a.platform === platform);
      if (!account) continue;

      const shareData = {
        user_id: context.user.id,
        content_type: validated.content_type,
        content_id: validated.content_id,
        platform,
        account_id: account.id,
        message: shareContent.message,
        media_urls: validated.media_urls || shareContent.media_urls,
        hashtags: validated.hashtags || shareContent.hashtags,
        schedule_time: validated.schedule_time,
        status: validated.schedule_time ? 'scheduled' : 'pending'
      };

      const { data: share, error } = await supabase
        .from('social_shares')
        .insert(shareData)
        .select()
        .single();

      if (!error && share) {
        shares.push(share);
        
        // If not scheduled, post immediately
        if (!validated.schedule_time) {
          await postToSocialMedia(platform, account, shareContent);
          
          await supabase
            .from('social_shares')
            .update({ 
              status: 'posted',
              posted_at: new Date().toISOString()
            })
            .eq('id', share.id);
        }
      }
    }

    return NextResponse.json({
      shares,
      message: validated.schedule_time ? 
        `Content scheduled for ${validated.platforms.length} platforms` :
        `Content shared to ${validated.platforms.length} platforms`
    }, { status: 201 });
  },
  {
    auth: true,
    audit: { action: 'social:share', resource: 'social_shares' }
  }
);

// Helper functions
async function generateShareContent(contentType: string, contentId: string | undefined, customMessage?: string) {
  if (customMessage) {
    return { message: customMessage, media_urls: [], hashtags: [] };
  }

  switch (contentType) {
    case 'event':
      if (!contentId) return { message: '', media_urls: [], hashtags: [] };
      
      const { data: event } = await supabase
        .from('events')
        .select('name, date, description, image_url')
        .eq('id', contentId)
        .single();

      if (!event) return { message: '', media_urls: [], hashtags: [] };

      return {
        message: `🎉 Just got tickets to ${event.name}! Join me on ${new Date(event.date).toLocaleDateString()}!`,
        media_urls: event.image_url ? [event.image_url] : [],
        hashtags: ['#Events', '#LiveEvents', event.name.replace(/\s+/g, '')]
      };

    case 'ticket':
      return {
        message: `🎫 Just secured my tickets! Can't wait! #Tickets #LiveEvents`,
        media_urls: [],
        hashtags: ['#Tickets', '#Events']
      };

    case 'achievement':
      return {
        message: `🏆 Achievement unlocked! #EventGoer #Community`,
        media_urls: [],
        hashtags: ['#Achievement']
      };

    default:
      return { message: '', media_urls: [], hashtags: [] };
  }
}

async function postToSocialMedia(platform: string, account: any, content: any) {
  // This would integrate with actual social media APIs
  // For now, just log the action
  console.log(`Posting to ${platform}:`, content);
  
  // In production, implement:
  // - Facebook Graph API
  // - Twitter API v2
  // - Instagram Graph API
  // - LinkedIn API
  // - TikTok API
  
  return {
    post_id: `${platform}_${Date.now()}`,
    url: `https://${platform}.com/post/${Date.now()}`
  };
}

function aggregateAnalytics(shares: any[]) {
  if (!shares || shares.length === 0) {
    return {
      total_impressions: 0,
      total_clicks: 0,
      total_shares: 0,
      total_likes: 0,
      by_platform: {}
    };
  }

  const analytics: any = {
    total_impressions: 0,
    total_clicks: 0,
    total_shares: 0,
    total_likes: 0,
    by_platform: {}
  };

  for (const share of shares) {
    analytics.total_impressions += share.impressions || 0;
    analytics.total_clicks += share.clicks || 0;
    analytics.total_shares += share.shares || 0;
    analytics.total_likes += share.likes || 0;

    if (!analytics.by_platform[share.platform]) {
      analytics.by_platform[share.platform] = {
        impressions: 0,
        clicks: 0,
        shares: 0,
        likes: 0
      };
    }

    analytics.by_platform[share.platform].impressions += share.impressions || 0;
    analytics.by_platform[share.platform].clicks += share.clicks || 0;
    analytics.by_platform[share.platform].shares += share.shares || 0;
    analytics.by_platform[share.platform].likes += share.likes || 0;
  }

  return analytics;
}

// PUT - Update share or disconnect account
export const PUT = apiRoute(
  async (request: NextRequest, context: any) => {
    const body = await request.json();
    const { id, action, updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    if (action === 'disconnect_account') {
      const { error } = await supabase
        .from('social_accounts')
        .update({ is_active: false })
        .eq('id', id)
        .eq('user_id', context.user.id);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ message: 'Account disconnected' });
    }

    // Update share
    const { data, error } = await supabase
      .from('social_shares')
      .update(updates)
      .eq('id', id)
      .eq('user_id', context.user.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ share: data });
  },
  {
    auth: true,
    audit: { action: 'social:update', resource: 'social_shares' }
  }
);

// DELETE - Cancel scheduled share
export const DELETE = apiRoute(
  async (request: NextRequest, context: any) => {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('social_shares')
      .update({ status: 'cancelled' })
      .eq('id', id)
      .eq('user_id', context.user.id)
      .eq('status', 'scheduled');

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Scheduled share cancelled' });
  },
  {
    auth: true,
    audit: { action: 'social:cancel', resource: 'social_shares' }
  }
);
