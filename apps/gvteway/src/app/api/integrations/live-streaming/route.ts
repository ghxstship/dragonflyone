import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Live Streaming Integration API
 * Integrates with YouTube Live, Twitch, Vimeo, and custom RTMP streams
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const eventId = searchParams.get('event_id');
    const streamId = searchParams.get('stream_id');

    if (type === 'platforms') {
      const platforms = [
        { id: 'youtube', name: 'YouTube Live', features: ['rtmp', 'hls', 'chat', 'analytics', 'dvr'] },
        { id: 'twitch', name: 'Twitch', features: ['rtmp', 'chat', 'clips', 'vods'] },
        { id: 'vimeo', name: 'Vimeo Livestream', features: ['rtmp', 'hls', 'simulcast', 'privacy'] },
        { id: 'facebook', name: 'Facebook Live', features: ['rtmp', 'crosspost', 'reactions'] },
        { id: 'custom_rtmp', name: 'Custom RTMP', features: ['rtmp', 'custom_player'] }
      ];
      return NextResponse.json({ platforms });
    }

    if (type === 'streams') {
      let query = supabase
        .from('live_streams')
        .select(`
          *,
          event:events(id, name, date, venue),
          destinations:stream_destinations(*)
        `)
        .order('scheduled_start', { ascending: false });

      if (eventId) {
        query = query.eq('event_id', eventId);
      }

      const { data, error } = await query.limit(20);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ streams: data });
    }

    if (type === 'stream' && streamId) {
      const { data, error } = await supabase
        .from('live_streams')
        .select(`
          *,
          event:events(*),
          destinations:stream_destinations(*),
          analytics:stream_analytics(*)
        `)
        .eq('id', streamId)
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ stream: data });
    }

    if (type === 'analytics' && streamId) {
      const { data, error } = await supabase
        .from('stream_analytics')
        .select('*')
        .eq('stream_id', streamId)
        .order('recorded_at', { ascending: false })
        .limit(100);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Aggregate metrics
      const latest = data?.[0];
      const peakViewers = Math.max(...(data || []).map(d => d.concurrent_viewers || 0));
      const totalViews = latest?.total_views || 0;

      return NextResponse.json({
        analytics: {
          current_viewers: latest?.concurrent_viewers || 0,
          peak_viewers: peakViewers,
          total_views: totalViews,
          avg_watch_time: latest?.avg_watch_time || 0,
          chat_messages: latest?.chat_messages || 0,
          timeline: data
        }
      });
    }

    if (type === 'active') {
      const { data, error } = await supabase
        .from('live_streams')
        .select(`
          *,
          event:events(id, name)
        `)
        .eq('status', 'live')
        .order('started_at', { ascending: false });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ active_streams: data });
    }

    // Default summary
    const [totalStreams, liveNow] = await Promise.all([
      supabase.from('live_streams').select('id', { count: 'exact', head: true }),
      supabase.from('live_streams').select('id', { count: 'exact', head: true }).eq('status', 'live')
    ]);

    return NextResponse.json({
      summary: {
        total_streams: totalStreams.count || 0,
        live_now: liveNow.count || 0
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch streaming data' }, { status: 500 });
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

    if (action === 'create_stream') {
      const { event_id, title, description, scheduled_start, privacy, destinations } = body;

      // Generate stream key
      const streamKey = `sk_${Date.now()}_${Math.random().toString(36).substr(2, 16)}`;

      const { data: stream, error } = await supabase
        .from('live_streams')
        .insert({
          event_id,
          title,
          description,
          scheduled_start,
          privacy: privacy || 'public',
          stream_key: streamKey,
          rtmp_url: 'rtmp://live.ghxstship.com/live',
          status: 'scheduled'
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Add destinations
      if (destinations && destinations.length > 0) {
        const destRecords = destinations.map((d: any) => ({
          stream_id: stream.id,
          platform: d.platform,
          rtmp_url: d.rtmp_url,
          stream_key: d.stream_key,
          enabled: true
        }));

        await supabase.from('stream_destinations').insert(destRecords);
      }

      return NextResponse.json({ stream }, { status: 201 });
    }

    if (action === 'add_destination') {
      const { stream_id, platform, rtmp_url, stream_key } = body;

      const { data, error } = await supabase
        .from('stream_destinations')
        .insert({
          stream_id,
          platform,
          rtmp_url,
          stream_key,
          enabled: true
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ destination: data }, { status: 201 });
    }

    if (action === 'start_stream') {
      const { stream_id } = body;

      const { data, error } = await supabase
        .from('live_streams')
        .update({
          status: 'live',
          started_at: new Date().toISOString()
        })
        .eq('id', stream_id)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Initialize analytics
      await supabase.from('stream_analytics').insert({
        stream_id,
        concurrent_viewers: 0,
        total_views: 0,
        recorded_at: new Date().toISOString()
      });

      return NextResponse.json({ stream: data });
    }

    if (action === 'stop_stream') {
      const { stream_id } = body;

      const { data, error } = await supabase
        .from('live_streams')
        .update({
          status: 'ended',
          ended_at: new Date().toISOString()
        })
        .eq('id', stream_id)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ stream: data });
    }

    if (action === 'update_analytics') {
      const { stream_id, concurrent_viewers, chat_messages } = body;

      // Get current totals
      const { data: current } = await supabase
        .from('stream_analytics')
        .select('total_views')
        .eq('stream_id', stream_id)
        .order('recorded_at', { ascending: false })
        .limit(1)
        .single();

      const { data, error } = await supabase
        .from('stream_analytics')
        .insert({
          stream_id,
          concurrent_viewers,
          total_views: (current?.total_views || 0) + (concurrent_viewers > 0 ? 1 : 0),
          chat_messages,
          recorded_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ analytics: data });
    }

    if (action === 'create_clip') {
      const { stream_id, title, start_time, end_time } = body;

      const { data, error } = await supabase
        .from('stream_clips')
        .insert({
          stream_id,
          title,
          start_time,
          end_time,
          duration: end_time - start_time,
          status: 'processing'
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ clip: data }, { status: 201 });
    }

    if (action === 'enable_dvr') {
      const { stream_id, dvr_window_hours } = body;

      const { data, error } = await supabase
        .from('live_streams')
        .update({
          dvr_enabled: true,
          dvr_window_hours: dvr_window_hours || 4
        })
        .eq('id', stream_id)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ stream: data });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process streaming request' }, { status: 500 });
  }
}
