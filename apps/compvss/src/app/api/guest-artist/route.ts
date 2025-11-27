import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@ghxstship/config';

// Guest artist coordination
export async function GET(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('event_id');

    const { data, error } = await supabase.from('guest_artists').select(`
      *, artist:artists(id, name), host_artist:artists!host_artist_id(id, name)
    `).eq('event_id', eventId).order('appearance_time', { ascending: true });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ guest_artists: data });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { event_id, artist_id, host_artist_id, appearance_time, songs, requirements, notes } = body;

    const { data, error } = await supabase.from('guest_artists').insert({
      event_id, artist_id, host_artist_id, appearance_time,
      songs: songs || [], requirements: requirements || [], notes, status: 'confirmed'
    }).select().single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ guest_artist: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { id, status, checked_in, actual_appearance_time } = body;

    await supabase.from('guest_artists').update({
      status, checked_in, actual_appearance_time,
      checked_in_at: checked_in ? new Date().toISOString() : null
    }).eq('id', id);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}
