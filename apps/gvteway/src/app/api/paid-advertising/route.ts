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

// Paid advertising campaign management
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('event_id');
    const platform = searchParams.get('platform');

    let query = supabase.from('ad_campaigns').select(`
      *, performance:ad_performance(impressions, clicks, conversions, spend)
    `);

    if (eventId) query = query.eq('event_id', eventId);
    if (platform) query = query.eq('platform', platform);

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Calculate totals
    const totals = data?.reduce((acc, c) => {
      const perf = c.performance?.[0] || {};
      return {
        impressions: acc.impressions + (perf.impressions || 0),
        clicks: acc.clicks + (perf.clicks || 0),
        conversions: acc.conversions + (perf.conversions || 0),
        spend: acc.spend + (perf.spend || 0)
      };
    }, { impressions: 0, clicks: 0, conversions: 0, spend: 0 });

    return NextResponse.json({ campaigns: data, totals });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
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

    if (action === 'create') {
      const { event_id, name, platform, objective, budget, start_date, end_date, targeting, creative } = body;

      const { data, error } = await supabase.from('ad_campaigns').insert({
        event_id, name, platform, objective, budget, start_date, end_date,
        targeting: targeting || {}, creative: creative || {},
        status: 'draft', created_by: user.id
      }).select().single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ campaign: data }, { status: 201 });
    }

    if (action === 'update_status') {
      const { campaign_id, status } = body;

      await supabase.from('ad_campaigns').update({ status }).eq('id', campaign_id);
      return NextResponse.json({ success: true });
    }

    if (action === 'sync_performance') {
      const { campaign_id, impressions, clicks, conversions, spend } = body;

      await supabase.from('ad_performance').upsert({
        campaign_id, impressions, clicks, conversions, spend,
        updated_at: new Date().toISOString()
      }, { onConflict: 'campaign_id' });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 });
  }
}
