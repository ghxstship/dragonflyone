import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { apiRoute } from '@ghxstship/config/middleware';
import { PlatformRole } from '@ghxstship/config/roles';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const streamSchema = z.object({
  event_id: z.string().uuid(),
  title: z.string().min(1),
  description: z.string().optional(),
  stream_type: z.enum(['live', 'replay', 'virtual']),
  platform: z.enum(['youtube', 'twitch', 'custom', 'native']),
  stream_url: z.string().url().optional(),
  stream_key: z.string().optional(),
  scheduled_start: z.string(),
  scheduled_end: z.string().optional(),
  access_type: z.enum(['public', 'ticketed', 'members_only', 'vip']).default('ticketed'),
  price: z.number().nonnegative().optional(),
  max_viewers: z.number().positive().optional(),
  chat_enabled: z.boolean().default(true),
  reactions_enabled: z.boolean().default(true),
  recording_enabled: z.boolean().default(true),
  quality_options: z.array(z.enum(['360p', '480p', '720p', '1080p', '4k'])).optional(),
  status: z.enum(['scheduled', 'live', 'ended', 'cancelled']).default('scheduled')
});

// GET - List streams or get stream details
export const GET = apiRoute(
  async (request: NextRequest, context: any) => {
    const { searchParams } = new URL(request.url);
    const stream_id = searchParams.get('stream_id');
    const event_id = searchParams.get('event_id');
    const status = searchParams.get('status');

    if (stream_id) {
      // Get specific stream with viewer stats
      const { data: stream, error } = await supabase
        .from('live_streams')
        .select(`
          *,
          events (
            id,
            name,
            date,
            venue_id
          ),
          stream_viewers (count),
          stream_analytics (
            peak_viewers,
            total_views,
            average_watch_time,
            chat_messages_count
          )
        `)
        .eq('id', stream_id)
        .single();

      if (error || !stream) {
        return NextResponse.json({ error: 'Stream not found' }, { status: 404 });
      }

      // Check access permissions
      if (stream.access_type !== 'public') {
        const hasAccess = await checkStreamAccess(stream, context.user);
        if (!hasAccess) {
          return NextResponse.json({ error: 'Access denied' }, { status: 403 });
        }
      }

      return NextResponse.json({ stream });
    }

    // List streams
    let query = supabase
      .from('live_streams')
      .select(`
        *,
        events (
          id,
          name,
          date
        ),
        stream_analytics (
          peak_viewers,
          total_views
        )
      `)
      .order('scheduled_start', { ascending: false });

    if (event_id) {
      query = query.eq('event_id', event_id);
    }

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ streams: data });
  },
  {
    auth: false, // Public endpoint with access checks
    audit: { action: 'streaming:list', resource: 'live_streams' }
  }
);

// POST - Create stream or join as viewer
export const POST = apiRoute(
  async (request: NextRequest, context: any) => {
    const body = await request.json();
    const { action } = body;

    if (action === 'join_stream') {
      const { stream_id } = body;

      // Get stream details
      const { data: stream } = await supabase
        .from('live_streams')
        .select('*')
        .eq('id', stream_id)
        .single();

      if (!stream) {
        return NextResponse.json({ error: 'Stream not found' }, { status: 404 });
      }

      // Check if stream is live
      if (stream.status !== 'live') {
        return NextResponse.json({ 
          error: 'Stream is not currently live',
          status: stream.status 
        }, { status: 400 });
      }

      // Check access permissions
      const hasAccess = await checkStreamAccess(stream, context.user);
      if (!hasAccess) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }

      // Check viewer limit
      if (stream.max_viewers) {
        const { count } = await supabase
          .from('stream_viewers')
          .select('*', { count: 'exact', head: true })
          .eq('stream_id', stream_id)
          .eq('is_active', true);

        if (count && count >= stream.max_viewers) {
          return NextResponse.json({ 
            error: 'Stream is at maximum capacity' 
          }, { status: 429 });
        }
      }

      // Add viewer
      const { data: viewer, error } = await supabase
        .from('stream_viewers')
        .insert({
          stream_id,
          user_id: context.user?.id,
          joined_at: new Date().toISOString(),
          is_active: true
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({
        viewer,
        stream_url: stream.stream_url,
        chat_enabled: stream.chat_enabled,
        message: 'Successfully joined stream'
      });
    }

    // Create new stream
    const validated = streamSchema.parse(body.data || body);

    // Generate stream key if using native platform
    const streamKey = validated.platform === 'native' 
      ? generateStreamKey()
      : validated.stream_key;

    const { data: stream, error } = await supabase
      .from('live_streams')
      .insert({
        ...validated,
        stream_key: streamKey,
        created_by: context.user.id
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Initialize analytics
    await supabase.from('stream_analytics').insert({
      stream_id: stream.id,
      peak_viewers: 0,
      total_views: 0,
      average_watch_time: 0,
      chat_messages_count: 0
    });

    return NextResponse.json({
      stream,
      message: 'Stream created successfully'
    }, { status: 201 });
  },
  {
    auth: true,
    audit: { action: 'streaming:create', resource: 'live_streams' }
  }
);

// Helper function to check stream access
async function checkStreamAccess(stream: any, user: any): Promise<boolean> {
  if (stream.access_type === 'public') {
    return true;
  }

  if (!user) {
    return false;
  }

  switch (stream.access_type) {
    case 'ticketed':
      // Check if user has ticket for the event
      const { data: ticket } = await supabase
        .from('tickets')
        .select('id')
        .eq('user_id', user.id)
        .eq('event_id', stream.event_id)
        .eq('status', 'active')
        .single();
      return !!ticket;

    case 'members_only':
      // Check if user has active membership
      const { data: membership } = await supabase
        .from('memberships')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();
      return !!membership;

    case 'vip':
      // Check if user has VIP ticket or membership
      const { data: vipTicket } = await supabase
        .from('tickets')
        .select('id, ticket_types!inner(name)')
        .eq('user_id', user.id)
        .eq('event_id', stream.event_id)
        .eq('status', 'active')
        .ilike('ticket_types.name', '%vip%')
        .single();
      return !!vipTicket;

    default:
      return false;
  }
}

// Helper function to generate stream key
function generateStreamKey(): string {
  return Array.from({ length: 32 }, () => 
    Math.random().toString(36)[2]
  ).join('');
}

// PUT - Update stream status or settings
export const PUT = apiRoute(
  async (request: NextRequest) => {
    const body = await request.json();
    const { id, action, updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    if (action === 'go_live') {
      const { error } = await supabase
        .from('live_streams')
        .update({
          status: 'live',
          actual_start_time: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Notify all ticket holders
      // await notifyStreamLive(id);

      return NextResponse.json({ message: 'Stream is now live' });
    }

    if (action === 'end_stream') {
      const { error } = await supabase
        .from('live_streams')
        .update({
          status: 'ended',
          actual_end_time: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Mark all viewers as inactive
      await supabase
        .from('stream_viewers')
        .update({ is_active: false, left_at: new Date().toISOString() })
        .eq('stream_id', id)
        .eq('is_active', true);

      return NextResponse.json({ message: 'Stream ended' });
    }

    // Update stream settings
    const { data, error } = await supabase
      .from('live_streams')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ stream: data });
  },
  {
    auth: true,
    roles: [PlatformRole.GVTEWAY_ADMIN, PlatformRole.GVTEWAY_EXPERIENCE_CREATOR],
    audit: { action: 'streaming:update', resource: 'live_streams' }
  }
);

// DELETE - Cancel stream
export const DELETE = apiRoute(
  async (request: NextRequest) => {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('live_streams')
      .update({ status: 'cancelled' })
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Stream cancelled' });
  },
  {
    auth: true,
    roles: [PlatformRole.GVTEWAY_ADMIN],
    audit: { action: 'streaming:delete', resource: 'live_streams' }
  }
);
