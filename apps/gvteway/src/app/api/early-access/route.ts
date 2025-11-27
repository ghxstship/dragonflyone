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

// Early access to tickets and announcements
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Check user's early access privileges
    const { data: memberships } = await supabase.from('fan_club_members').select(`
      fan_club_id, tier:fan_club_tiers(early_access_hours)
    `).eq('user_id', user.id).eq('status', 'active');

    const earlyAccessHours = Math.max(...(memberships?.map((m: any) => m.tier?.early_access_hours || 0) || [0]), 0);

    // Get events with early access windows
    const now = new Date();
    const earlyAccessWindow = new Date(now.getTime() + earlyAccessHours * 60 * 60 * 1000);

    const { data: upcomingEvents } = await supabase.from('events').select(`
      *, early_access:event_early_access(start_time, end_time, tier_required)
    `).gte('ticket_sale_date', now.toISOString()).lte('ticket_sale_date', earlyAccessWindow.toISOString());

    // Get announcements user has early access to
    const { data: announcements } = await supabase.from('announcements').select('*')
      .lte('early_access_date', now.toISOString())
      .gte('public_date', now.toISOString())
      .order('early_access_date', { ascending: false });

    return NextResponse.json({
      early_access_hours: earlyAccessHours,
      available_presales: upcomingEvents?.filter(e => {
        const saleDate = new Date(e.ticket_sale_date);
        const userAccessTime = new Date(saleDate.getTime() - earlyAccessHours * 60 * 60 * 1000);
        return now >= userAccessTime;
      }) || [],
      upcoming_presales: upcomingEvents || [],
      exclusive_announcements: announcements || []
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch early access' }, { status: 500 });
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
    const { action, event_id } = body;

    if (action === 'request_code') {
      // Check eligibility
      const { data: memberships } = await supabase.from('fan_club_members').select(`
        tier:fan_club_tiers(early_access_hours)
      `).eq('user_id', user.id).eq('status', 'active');

      if (!memberships?.length) {
        return NextResponse.json({ error: 'Fan club membership required' }, { status: 403 });
      }

      // Generate presale code
      const code = `EA-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

      const { data, error } = await supabase.from('presale_codes').insert({
        event_id, user_id: user.id, code, status: 'active',
        expires_at: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString()
      }).select().single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });

      return NextResponse.json({ presale_code: data }, { status: 201 });
    }

    if (action === 'redeem_code') {
      const { code } = body;

      const { data: presaleCode } = await supabase.from('presale_codes').select('*')
        .eq('code', code).eq('status', 'active').single();

      if (!presaleCode) {
        return NextResponse.json({ error: 'Invalid or expired code' }, { status: 400 });
      }

      if (new Date(presaleCode.expires_at) < new Date()) {
        return NextResponse.json({ error: 'Code has expired' }, { status: 400 });
      }

      await supabase.from('presale_codes').update({
        status: 'redeemed', redeemed_at: new Date().toISOString()
      }).eq('id', presaleCode.id);

      return NextResponse.json({ success: true, event_id: presaleCode.event_id });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 });
  }
}
