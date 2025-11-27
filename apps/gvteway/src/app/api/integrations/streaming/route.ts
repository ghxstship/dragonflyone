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

/**
 * Streaming Services Integration API
 * Integrates with Spotify, Apple Music, and other streaming platforms
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const artistId = searchParams.get('artist_id');
    const eventId = searchParams.get('event_id');

    if (type === 'platforms') {
      const platforms = [
        { id: 'spotify', name: 'Spotify', features: ['artist_profile', 'playlists', 'pre_save', 'analytics'] },
        { id: 'apple_music', name: 'Apple Music', features: ['artist_profile', 'playlists', 'pre_add'] },
        { id: 'youtube_music', name: 'YouTube Music', features: ['artist_channel', 'playlists'] },
        { id: 'soundcloud', name: 'SoundCloud', features: ['artist_profile', 'tracks', 'playlists'] },
        { id: 'bandcamp', name: 'Bandcamp', features: ['artist_page', 'merch', 'releases'] }
      ];
      return NextResponse.json({ platforms });
    }

    if (type === 'artist_links') {
      let query = supabase
        .from('artist_streaming_links')
        .select(`
          *,
          artist:artists(id, name, image_url)
        `);

      if (artistId) {
        query = query.eq('artist_id', artistId);
      }

      const { data, error } = await query;

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ artist_links: data });
    }

    if (type === 'event_playlists') {
      let query = supabase
        .from('event_playlists')
        .select(`
          *,
          event:events(id, name, date)
        `);

      if (eventId) {
        query = query.eq('event_id', eventId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ playlists: data });
    }

    if (type === 'pre_saves') {
      const { data, error } = await supabase
        .from('pre_save_campaigns')
        .select(`
          *,
          event:events(id, name),
          artist:artists(id, name)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ campaigns: data });
    }

    if (type === 'analytics') {
      const { data, error } = await supabase
        .from('streaming_analytics')
        .select('*')
        .eq('artist_id', artistId || '')
        .order('recorded_at', { ascending: false })
        .limit(30);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ analytics: data });
    }

    // Default summary
    return NextResponse.json({
      summary: {
        supported_platforms: 5,
        features: ['Artist profiles', 'Event playlists', 'Pre-save campaigns', 'Streaming analytics']
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch streaming data' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action } = body;

    if (action === 'link_artist') {
      const { artist_id, platform, platform_url, platform_id } = body;

      const { data, error } = await supabase
        .from('artist_streaming_links')
        .upsert({
          artist_id,
          platform,
          platform_url,
          platform_id,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ link: data }, { status: 201 });
    }

    if (action === 'create_playlist') {
      const { event_id, platform, name, description, tracks } = body;

      const { data, error } = await supabase
        .from('event_playlists')
        .insert({
          event_id,
          platform,
          name,
          description,
          tracks: tracks || [],
          status: 'draft'
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ playlist: data }, { status: 201 });
    }

    if (action === 'publish_playlist') {
      const { playlist_id } = body;

      // In production, would call platform API to create playlist
      const { data, error } = await supabase
        .from('event_playlists')
        .update({
          status: 'published',
          published_at: new Date().toISOString()
        })
        .eq('id', playlist_id)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ playlist: data });
    }

    if (action === 'create_pre_save') {
      const { event_id, artist_id, platform, release_date, title } = body;

      const { data, error } = await supabase
        .from('pre_save_campaigns')
        .insert({
          event_id,
          artist_id,
          platform,
          release_date,
          title,
          status: 'active',
          saves_count: 0
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ campaign: data }, { status: 201 });
    }

    if (action === 'record_pre_save') {
      const { campaign_id, user_email, platform_user_id } = body;

      // Record the pre-save
      await supabase.from('pre_save_records').insert({
        campaign_id,
        user_email,
        platform_user_id,
        saved_at: new Date().toISOString()
      });

      // Increment counter
      await supabase.rpc('increment_pre_save_count', { campaign_id });

      return NextResponse.json({ success: true });
    }

    if (action === 'sync_analytics') {
      const { artist_id, platform } = body;

      // In production, would call platform API
      const mockAnalytics = {
        artist_id,
        platform,
        monthly_listeners: Math.floor(Math.random() * 100000),
        followers: Math.floor(Math.random() * 50000),
        streams_30d: Math.floor(Math.random() * 500000),
        recorded_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('streaming_analytics')
        .insert(mockAnalytics)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ analytics: data });
    }

    if (action === 'generate_smart_link') {
      const { artist_id, release_title } = body;

      // Get all streaming links for artist
      const { data: links } = await supabase
        .from('artist_streaming_links')
        .select('platform, platform_url')
        .eq('artist_id', artist_id);

      // Generate smart link page data
      const smartLink = {
        artist_id,
        release_title,
        links: links || [],
        slug: `${release_title.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
        created_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('smart_links')
        .insert(smartLink)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({
        smart_link: data,
        url: `https://link.ghxstship.com/${data.slug}`
      }, { status: 201 });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process streaming request' }, { status: 500 });
  }
}
