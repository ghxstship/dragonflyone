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

// Local fan chapters and geographic communities
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city');
    const artistId = searchParams.get('artist_id');
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');

    let query = supabase.from('fan_chapters').select(`
      *, members:fan_chapter_members(count), events:chapter_events(id, name, date)
    `).eq('status', 'active');

    if (city) query = query.ilike('city', `%${city}%`);
    if (artistId) query = query.eq('artist_id', artistId);

    const { data, error } = await query.order('member_count', { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // If location provided, sort by distance
    let sortedData = data;
    if (lat && lng) {
      sortedData = data?.sort((a, b) => {
        const distA = calculateDistance(parseFloat(lat), parseFloat(lng), a.lat, a.lng);
        const distB = calculateDistance(parseFloat(lat), parseFloat(lng), b.lat, b.lng);
        return distA - distB;
      });
    }

    return NextResponse.json({
      chapters: sortedData,
      nearby: sortedData?.slice(0, 5) || []
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch chapters' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { action } = body;

    if (action === 'create_chapter') {
      const { artist_id, name, city, state, country, description, lat, lng } = body;

      const { data, error } = await supabase.from('fan_chapters').insert({
        artist_id, name, city, state, country, description, lat, lng,
        leader_id: user.id, member_count: 1, status: 'active'
      }).select().single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });

      // Add creator as first member
      await supabase.from('fan_chapter_members').insert({
        chapter_id: data.id, user_id: user.id, role: 'leader', joined_at: new Date().toISOString()
      });

      return NextResponse.json({ chapter: data }, { status: 201 });
    }

    if (action === 'join') {
      const { chapter_id } = body;

      const { data: existing } = await supabase.from('fan_chapter_members').select('id')
        .eq('chapter_id', chapter_id).eq('user_id', user.id).single();

      if (existing) {
        return NextResponse.json({ error: 'Already a member' }, { status: 400 });
      }

      await supabase.from('fan_chapter_members').insert({
        chapter_id, user_id: user.id, role: 'member', joined_at: new Date().toISOString()
      });

      await supabase.rpc('increment_chapter_members', { chapter_id });

      return NextResponse.json({ success: true, message: 'Joined chapter' });
    }

    if (action === 'create_event') {
      const { chapter_id, name, description, date, location, max_attendees } = body;

      const { data, error } = await supabase.from('chapter_events').insert({
        chapter_id, name, description, date, location, max_attendees,
        created_by: user.id, status: 'scheduled'
      }).select().single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ event: data }, { status: 201 });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 });
  }
}

function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}
