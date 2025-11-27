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

// Charity and cause campaign integration
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('event_id');
    const artistId = searchParams.get('artist_id');
    const status = searchParams.get('status');

    let query = supabase.from('charity_campaigns').select(`
      *, charity:charities(id, name, logo_url, description),
      event:events(id, name), artist:artists(id, name),
      donations:charity_donations(amount)
    `);

    if (eventId) query = query.eq('event_id', eventId);
    if (artistId) query = query.eq('artist_id', artistId);
    if (status) query = query.eq('status', status);

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Calculate totals
    const campaignsWithTotals = data?.map(c => ({
      ...c,
      total_raised: c.donations?.reduce((s: number, d: any) => s + d.amount, 0) || 0,
      progress_percent: c.goal_amount ? Math.round(((c.donations?.reduce((s: number, d: any) => s + d.amount, 0) || 0) / c.goal_amount) * 100) : 0
    }));

    return NextResponse.json({
      campaigns: campaignsWithTotals,
      active: campaignsWithTotals?.filter(c => c.status === 'active') || [],
      featured: campaignsWithTotals?.filter(c => c.is_featured) || []
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch campaigns' }, { status: 500 });
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

    if (action === 'donate') {
      const { campaign_id, amount, is_anonymous, message } = body;

      const { data: campaign } = await supabase.from('charity_campaigns').select('*')
        .eq('id', campaign_id).single();

      if (!campaign || campaign.status !== 'active') {
        return NextResponse.json({ error: 'Campaign not available' }, { status: 400 });
      }

      const { data: donation, error } = await supabase.from('charity_donations').insert({
        campaign_id, user_id: user.id, amount, is_anonymous: is_anonymous || false,
        message, status: 'completed', donated_at: new Date().toISOString()
      }).select().single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });

      // Award points/badges for donation
      await supabase.from('user_badges').upsert({
        user_id: user.id, badge_type: 'charitable_donor',
        earned_at: new Date().toISOString()
      }, { onConflict: 'user_id,badge_type', ignoreDuplicates: true });

      return NextResponse.json({ donation }, { status: 201 });
    }

    if (action === 'round_up') {
      // Add round-up donation to order
      const { order_id, round_up_amount, campaign_id } = body;

      await supabase.from('order_round_ups').insert({
        order_id, campaign_id, amount: round_up_amount, user_id: user.id
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 });
  }
}
