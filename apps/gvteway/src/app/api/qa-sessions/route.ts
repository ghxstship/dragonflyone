import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const artistId = searchParams.get('artist_id');

    let query = supabase
      .from('qa_sessions')
      .select(`
        *,
        artist:artists(id, name, image_url)
      `)
      .order('scheduled_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    if (artistId) {
      query = query.eq('artist_id', artistId);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const sessions = data?.map(s => ({
      id: s.id,
      artist_id: s.artist_id,
      artist_name: (s.artist as any)?.name || 'Unknown Artist',
      artist_image: (s.artist as any)?.image_url,
      title: s.title,
      description: s.description,
      scheduled_at: s.scheduled_at,
      duration_minutes: s.duration_minutes || 60,
      status: s.status,
      questions_count: s.questions_count || 0,
      attendees_count: s.attendees_count || 0,
      is_member_only: s.is_member_only || false,
    })) || [];

    return NextResponse.json({ sessions });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { artist_id, title, description, scheduled_at, duration_minutes, is_member_only } = body;

    if (!artist_id || !title || !scheduled_at) {
      return NextResponse.json(
        { error: 'Artist ID, title, and scheduled time are required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('qa_sessions')
      .insert({
        artist_id,
        title,
        description,
        scheduled_at,
        duration_minutes: duration_minutes || 60,
        is_member_only: is_member_only || false,
        status: 'upcoming',
        questions_count: 0,
        attendees_count: 0,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ session: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
