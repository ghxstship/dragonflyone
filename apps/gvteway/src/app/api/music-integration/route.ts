import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Music streaming platform integration (Spotify, Apple Music)
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Get user's connected music services
    const { data: connections } = await supabase.from('music_connections').select('*')
      .eq('user_id', user.id);

    // Get recommendations based on listening history
    const { data: preferences } = await supabase.from('user_music_preferences').select('*')
      .eq('user_id', user.id).single();

    let recommendations: any[] = [];
    if (preferences?.top_artists?.length > 0) {
      const { data: events } = await supabase.from('events').select('*')
        .overlaps('artist_ids', preferences.top_artists)
        .gte('date', new Date().toISOString())
        .limit(20);
      recommendations = events || [];
    }

    return NextResponse.json({
      connections: connections || [],
      preferences,
      recommendations,
      supported_services: ['spotify', 'apple_music', 'youtube_music']
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch music data' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { service, access_token, refresh_token, action } = body;

    if (action === 'connect') {
      const { data, error } = await supabase.from('music_connections').upsert({
        user_id: user.id, service, access_token, refresh_token,
        connected_at: new Date().toISOString(), status: 'active'
      }).select().single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ connection: data }, { status: 201 });
    }

    if (action === 'sync_preferences') {
      // In production, this would call Spotify/Apple Music APIs
      const mockPreferences = {
        top_artists: body.top_artists || [],
        top_genres: body.top_genres || [],
        recently_played: body.recently_played || [],
        synced_at: new Date().toISOString()
      };

      await supabase.from('user_music_preferences').upsert({
        user_id: user.id, ...mockPreferences
      });

      return NextResponse.json({ preferences: mockPreferences });
    }

    if (action === 'disconnect') {
      await supabase.from('music_connections').delete()
        .eq('user_id', user.id).eq('service', service);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 });
  }
}
