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

// Fan club management with exclusive perks
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const artistId = searchParams.get('artist_id');

    let query = supabase.from('fan_clubs').select(`
      *, artist:artists(id, name, image_url),
      tiers:fan_club_tiers(id, name, price, perks),
      members:fan_club_members(count)
    `).eq('status', 'active');

    if (artistId) query = query.eq('artist_id', artistId);

    const { data, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ fan_clubs: data });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch fan clubs' }, { status: 500 });
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

    if (action === 'join') {
      const { fan_club_id, tier_id } = body;

      // Check if already a member
      const { data: existing } = await supabase.from('fan_club_members').select('id')
        .eq('fan_club_id', fan_club_id).eq('user_id', user.id).single();

      if (existing) {
        return NextResponse.json({ error: 'Already a member' }, { status: 400 });
      }

      const { data: tier } = await supabase.from('fan_club_tiers').select('*').eq('id', tier_id).single();

      const { data, error } = await supabase.from('fan_club_members').insert({
        fan_club_id, user_id: user.id, tier_id, status: 'active',
        joined_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
      }).select().single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });

      // Grant perks
      if (tier?.perks) {
        await supabase.from('user_perks').insert(
          tier.perks.map((perk: string) => ({
            user_id: user.id, perk_type: perk, source: 'fan_club', source_id: fan_club_id
          }))
        );
      }

      return NextResponse.json({ membership: data }, { status: 201 });
    }

    if (action === 'upgrade') {
      const { membership_id, new_tier_id } = body;

      await supabase.from('fan_club_members').update({
        tier_id: new_tier_id, upgraded_at: new Date().toISOString()
      }).eq('id', membership_id);

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 });
  }
}
