import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const AttributionEventSchema = z.object({
  contact_id: z.string().uuid().optional(),
  deal_id: z.string().uuid().optional(),
  event_type: z.enum(['page_view', 'form_submit', 'email_open', 'email_click', 'ad_click', 'social_click', 'referral', 'conversion']),
  source: z.string(),
  medium: z.string().optional(),
  campaign: z.string().optional(),
  content: z.string().optional(),
  term: z.string().optional(),
  referrer: z.string().optional(),
  landing_page: z.string().optional(),
  value: z.number().optional(),
  metadata: z.record(z.any()).optional(),
});

// GET /api/marketing-attribution - Get attribution data and reports
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const reportType = searchParams.get('report_type') || 'overview';
    const dateFrom = searchParams.get('date_from');
    const dateTo = searchParams.get('date_to');
    const source = searchParams.get('source');
    const campaign = searchParams.get('campaign');
    const contactId = searchParams.get('contact_id');
    const dealId = searchParams.get('deal_id');

    let query = supabase
      .from('attribution_events')
      .select(`
        *,
        contact:contacts(id, first_name, last_name, email),
        deal:deals(id, name, value, stage)
      `)
      .order('created_at', { ascending: false });

    if (dateFrom) {
      query = query.gte('created_at', dateFrom);
    }

    if (dateTo) {
      query = query.lte('created_at', dateTo);
    }

    if (source) {
      query = query.eq('source', source);
    }

    if (campaign) {
      query = query.eq('campaign', campaign);
    }

    if (contactId) {
      query = query.eq('contact_id', contactId);
    }

    if (dealId) {
      query = query.eq('deal_id', dealId);
    }

    const { data: events, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Calculate attribution metrics
    const sourceMetrics: Record<string, { touches: number; conversions: number; revenue: number }> = {};
    const campaignMetrics: Record<string, { touches: number; conversions: number; revenue: number }> = {};
    const channelMetrics: Record<string, { touches: number; conversions: number; revenue: number }> = {};

    events?.forEach(event => {
      // Source metrics
      if (!sourceMetrics[event.source]) {
        sourceMetrics[event.source] = { touches: 0, conversions: 0, revenue: 0 };
      }
      sourceMetrics[event.source].touches++;
      if (event.event_type === 'conversion') {
        sourceMetrics[event.source].conversions++;
        sourceMetrics[event.source].revenue += event.value || 0;
      }

      // Campaign metrics
      if (event.campaign) {
        if (!campaignMetrics[event.campaign]) {
          campaignMetrics[event.campaign] = { touches: 0, conversions: 0, revenue: 0 };
        }
        campaignMetrics[event.campaign].touches++;
        if (event.event_type === 'conversion') {
          campaignMetrics[event.campaign].conversions++;
          campaignMetrics[event.campaign].revenue += event.value || 0;
        }
      }

      // Channel metrics (derived from medium)
      const channel = event.medium || 'direct';
      if (!channelMetrics[channel]) {
        channelMetrics[channel] = { touches: 0, conversions: 0, revenue: 0 };
      }
      channelMetrics[channel].touches++;
      if (event.event_type === 'conversion') {
        channelMetrics[channel].conversions++;
        channelMetrics[channel].revenue += event.value || 0;
      }
    });

    // Calculate first-touch and last-touch attribution
    const contactJourneys: Record<string, any[]> = {};
    events?.forEach(event => {
      if (event.contact_id) {
        if (!contactJourneys[event.contact_id]) {
          contactJourneys[event.contact_id] = [];
        }
        contactJourneys[event.contact_id].push(event);
      }
    });

    const firstTouchAttribution: Record<string, number> = {};
    const lastTouchAttribution: Record<string, number> = {};

    Object.values(contactJourneys).forEach(journey => {
      const sortedJourney = journey.sort((a, b) => 
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
      
      const conversion = sortedJourney.find(e => e.event_type === 'conversion');
      if (conversion) {
        const firstTouch = sortedJourney[0];
        const lastTouch = sortedJourney[sortedJourney.length - 2] || firstTouch;

        firstTouchAttribution[firstTouch.source] = (firstTouchAttribution[firstTouch.source] || 0) + (conversion.value || 1);
        lastTouchAttribution[lastTouch.source] = (lastTouchAttribution[lastTouch.source] || 0) + (conversion.value || 1);
      }
    });

    return NextResponse.json({
      events: events?.slice(0, 100) || [],
      metrics: {
        by_source: Object.entries(sourceMetrics).map(([source, data]) => ({
          source,
          ...data,
          conversion_rate: data.touches > 0 ? (data.conversions / data.touches * 100).toFixed(2) : 0,
        })),
        by_campaign: Object.entries(campaignMetrics).map(([campaign, data]) => ({
          campaign,
          ...data,
          conversion_rate: data.touches > 0 ? (data.conversions / data.touches * 100).toFixed(2) : 0,
        })),
        by_channel: Object.entries(channelMetrics).map(([channel, data]) => ({
          channel,
          ...data,
          conversion_rate: data.touches > 0 ? (data.conversions / data.touches * 100).toFixed(2) : 0,
        })),
      },
      attribution_models: {
        first_touch: firstTouchAttribution,
        last_touch: lastTouchAttribution,
      },
      total_events: events?.length || 0,
      total_conversions: events?.filter(e => e.event_type === 'conversion').length || 0,
      total_revenue: events?.filter(e => e.event_type === 'conversion').reduce((sum, e) => sum + (e.value || 0), 0) || 0,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch attribution data' }, { status: 500 });
  }
}

// POST /api/marketing-attribution - Track attribution event
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = AttributionEventSchema.parse(body);

    // Get user from auth if available
    const authHeader = request.headers.get('authorization');
    let userId = null;
    if (authHeader) {
      const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
      userId = user?.id;
    }

    // Parse UTM parameters if present
    const utmParams = {
      source: validated.source,
      medium: validated.medium,
      campaign: validated.campaign,
      content: validated.content,
      term: validated.term,
    };

    const { data: event, error } = await supabase
      .from('attribution_events')
      .insert({
        contact_id: validated.contact_id,
        deal_id: validated.deal_id,
        user_id: userId,
        event_type: validated.event_type,
        ...utmParams,
        referrer: validated.referrer,
        landing_page: validated.landing_page,
        value: validated.value,
        metadata: validated.metadata,
        ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
        user_agent: request.headers.get('user-agent'),
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // If this is a conversion, update the contact/deal with attribution data
    if (validated.event_type === 'conversion' && validated.contact_id) {
      await supabase
        .from('contacts')
        .update({
          first_touch_source: validated.source,
          first_touch_campaign: validated.campaign,
          conversion_date: new Date().toISOString(),
        })
        .eq('id', validated.contact_id)
        .is('first_touch_source', null);
    }

    return NextResponse.json({ event }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to track attribution event' }, { status: 500 });
  }
}
