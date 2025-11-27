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

// Influencer collaboration and tracking tools
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('event_id');
    const status = searchParams.get('status');

    let query = supabase.from('influencer_campaigns').select(`
      *, influencer:influencers(id, name, platform, followers, engagement_rate),
      event:events(id, name, date)
    `);

    if (eventId) query = query.eq('event_id', eventId);
    if (status) query = query.eq('status', status);

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Calculate ROI metrics
    const metrics = data?.map(c => ({
      ...c,
      roi: calculateROI(c),
      cost_per_engagement: c.total_cost / (c.total_engagements || 1)
    }));

    return NextResponse.json({
      campaigns: metrics,
      summary: {
        total_reach: data?.reduce((s, c) => s + (c.total_reach || 0), 0) || 0,
        total_engagements: data?.reduce((s, c) => s + (c.total_engagements || 0), 0) || 0,
        total_spend: data?.reduce((s, c) => s + (c.total_cost || 0), 0) || 0
      }
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
    const { event_id, influencer_id, campaign_type, deliverables, compensation, start_date, end_date } = body;

    const { data, error } = await supabase.from('influencer_campaigns').insert({
      event_id, influencer_id, campaign_type, deliverables: deliverables || [],
      compensation, start_date, end_date, status: 'pending', created_by: user.id
    }).select().single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ campaign: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create campaign' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { id, action, metrics } = body;

    if (action === 'update_metrics') {
      await supabase.from('influencer_campaigns').update({
        total_reach: metrics.reach,
        total_engagements: metrics.engagements,
        total_clicks: metrics.clicks,
        conversions: metrics.conversions,
        metrics_updated_at: new Date().toISOString()
      }).eq('id', id);

      return NextResponse.json({ success: true });
    }

    if (action === 'complete') {
      await supabase.from('influencer_campaigns').update({
        status: 'completed', completed_at: new Date().toISOString()
      }).eq('id', id);

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}

function calculateROI(campaign: any): number {
  const revenue = (campaign.conversions || 0) * (campaign.avg_ticket_value || 50);
  const cost = campaign.total_cost || 1;
  return Math.round(((revenue - cost) / cost) * 100);
}
