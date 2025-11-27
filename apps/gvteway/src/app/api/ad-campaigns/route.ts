import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

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

const campaignSchema = z.object({
  event_id: z.string().uuid().optional(),
  name: z.string().min(1),
  platform: z.enum(['facebook', 'instagram', 'google', 'tiktok', 'twitter', 'linkedin', 'youtube']),
  campaign_type: z.enum(['awareness', 'traffic', 'conversions', 'engagement']),
  budget: z.number().min(0),
  daily_budget: z.number().min(0).optional(),
  start_date: z.string().datetime(),
  end_date: z.string().datetime().optional(),
  targeting: z.object({
    age_min: z.number().optional(),
    age_max: z.number().optional(),
    locations: z.array(z.string()).optional(),
    interests: z.array(z.string()).optional(),
    behaviors: z.array(z.string()).optional(),
  }).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('event_id');
    const campaignId = searchParams.get('campaign_id');
    const type = searchParams.get('type');

    if (type === 'performance' && campaignId) {
      const { data: campaign } = await supabase
        .from('ad_campaigns')
        .select('*')
        .eq('id', campaignId)
        .single();

      const { data: metrics } = await supabase
        .from('ad_campaign_metrics')
        .select('*')
        .eq('campaign_id', campaignId)
        .order('date', { ascending: false })
        .limit(30);

      const totals = metrics?.reduce((acc, m) => ({
        impressions: acc.impressions + (m.impressions || 0),
        clicks: acc.clicks + (m.clicks || 0),
        conversions: acc.conversions + (m.conversions || 0),
        spend: acc.spend + (m.spend || 0),
        revenue: acc.revenue + (m.revenue || 0),
      }), { impressions: 0, clicks: 0, conversions: 0, spend: 0, revenue: 0 });

      return NextResponse.json({
        campaign,
        metrics,
        totals,
        calculated: {
          ctr: totals?.impressions > 0 ? ((totals.clicks / totals.impressions) * 100).toFixed(2) : 0,
          cpc: totals?.clicks > 0 ? (totals.spend / totals.clicks).toFixed(2) : 0,
          cpa: totals?.conversions > 0 ? (totals.spend / totals.conversions).toFixed(2) : 0,
          roas: totals?.spend > 0 ? (totals.revenue / totals.spend).toFixed(2) : 0,
        },
      });
    }

    if (type === 'all_performance') {
      let query = supabase
        .from('ad_campaigns')
        .select(`
          id, name, platform, budget, spent, status,
          metrics:ad_campaign_metrics(impressions, clicks, conversions, spend, revenue)
        `);

      if (eventId) query = query.eq('event_id', eventId);

      const { data: campaigns } = await query;

      const performance = campaigns?.map(c => {
        const totals = c.metrics?.reduce((acc: any, m: any) => ({
          impressions: acc.impressions + (m.impressions || 0),
          clicks: acc.clicks + (m.clicks || 0),
          conversions: acc.conversions + (m.conversions || 0),
          revenue: acc.revenue + (m.revenue || 0),
        }), { impressions: 0, clicks: 0, conversions: 0, revenue: 0 });

        return {
          campaign_id: c.id,
          name: c.name,
          platform: c.platform,
          budget: c.budget,
          spent: c.spent,
          status: c.status,
          ...totals,
          roas: c.spent > 0 ? (totals.revenue / c.spent).toFixed(2) : 0,
        };
      });

      return NextResponse.json({ performance });
    }

    let query = supabase.from('ad_campaigns').select('*').order('created_at', { ascending: false });
    if (eventId) query = query.eq('event_id', eventId);

    const { data: campaigns, error } = await query;
    if (error) throw error;

    return NextResponse.json({ campaigns });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const body = await request.json();
    const action = body.action;

    if (action === 'create') {
      const validated = campaignSchema.parse(body.data);

      const { data: campaign, error } = await supabase
        .from('ad_campaigns')
        .insert({
          ...validated,
          spent: 0,
          status: 'draft',
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ campaign }, { status: 201 });
    }

    if (action === 'record_metrics') {
      const { campaign_id, date, impressions, clicks, conversions, spend, revenue } = body.data;

      const { data: metrics, error } = await supabase
        .from('ad_campaign_metrics')
        .upsert({
          campaign_id,
          date,
          impressions,
          clicks,
          conversions,
          spend,
          revenue,
        }, { onConflict: 'campaign_id,date' })
        .select()
        .single();

      if (error) throw error;

      // Update campaign spent
      const { data: allMetrics } = await supabase
        .from('ad_campaign_metrics')
        .select('spend')
        .eq('campaign_id', campaign_id);

      const totalSpent = allMetrics?.reduce((sum, m) => sum + (m.spend || 0), 0) || 0;

      await supabase
        .from('ad_campaigns')
        .update({ spent: totalSpent })
        .eq('id', campaign_id);

      return NextResponse.json({ metrics }, { status: 201 });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const body = await request.json();
    const { id, action, ...updates } = body;

    if (action === 'launch') {
      const { data, error } = await supabase
        .from('ad_campaigns')
        .update({ status: 'active', launched_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ campaign: data });
    }

    if (action === 'pause') {
      const { data, error } = await supabase
        .from('ad_campaigns')
        .update({ status: 'paused' })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ campaign: data });
    }

    if (action === 'end') {
      const { data, error } = await supabase
        .from('ad_campaigns')
        .update({ status: 'ended', ended_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ campaign: data });
    }

    const { data, error } = await supabase
      .from('ad_campaigns')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ campaign: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
