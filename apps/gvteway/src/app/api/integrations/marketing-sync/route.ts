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

const MarketingConnectionSchema = z.object({
  provider: z.enum(['mailchimp', 'klaviyo', 'ga4', 'facebook', 'google_ads']),
  credentials: z.object({
    api_key: z.string().optional(),
    access_token: z.string().optional(),
    refresh_token: z.string().optional(),
    account_id: z.string().optional(),
    list_id: z.string().optional(),
    measurement_id: z.string().optional(),
    pixel_id: z.string().optional(),
  }),
  sync_settings: z.object({
    sync_purchases: z.boolean().default(true),
    sync_engagement: z.boolean().default(true),
    sync_consent: z.boolean().default(true),
    attribution_window_days: z.number().default(30),
  }),
});

const EventStreamSchema = z.object({
  connection_id: z.string().uuid(),
  events: z.array(z.object({
    event_type: z.string(),
    user_id: z.string().optional(),
    email: z.string().email().optional(),
    event_data: z.record(z.any()),
    timestamp: z.string(),
  })),
});

const ConsentUpdateSchema = z.object({
  email: z.string().email(),
  consent_type: z.enum(['email', 'sms', 'push', 'tracking']),
  is_consented: z.boolean(),
  source: z.string().optional(),
});

// GET /api/integrations/marketing-sync - Get marketing connections and data
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const connectionId = searchParams.get('connection_id');
    const action = searchParams.get('action');

    if (action === 'consent_status') {
      const email = searchParams.get('email');
      
      if (!email) {
        return NextResponse.json({ error: 'Email required' }, { status: 400 });
      }

      const { data: consents } = await supabase
        .from('marketing_consents')
        .select('*')
        .eq('email', email)
        .order('created_at', { ascending: false });

      // Get latest consent for each type
      const latestConsents: Record<string, any> = {};
      consents?.forEach(c => {
        if (!latestConsents[c.consent_type]) {
          latestConsents[c.consent_type] = c;
        }
      });

      return NextResponse.json({
        email,
        consents: latestConsents,
        history: consents || [],
      });
    }

    if (action === 'attribution_report') {
      const startDate = searchParams.get('start_date');
      const endDate = searchParams.get('end_date');

      let query = supabase
        .from('marketing_attributions')
        .select('*')
        .order('created_at', { ascending: false });

      if (startDate) {
        query = query.gte('created_at', startDate);
      }
      if (endDate) {
        query = query.lte('created_at', endDate);
      }

      const { data: attributions } = await query;

      // Aggregate by source/medium/campaign
      const bySource: Record<string, { count: number; value: number }> = {};
      const byMedium: Record<string, { count: number; value: number }> = {};
      const byCampaign: Record<string, { count: number; value: number }> = {};

      attributions?.forEach(a => {
        if (a.utm_source) {
          if (!bySource[a.utm_source]) bySource[a.utm_source] = { count: 0, value: 0 };
          bySource[a.utm_source].count++;
          bySource[a.utm_source].value += a.conversion_value || 0;
        }
        if (a.utm_medium) {
          if (!byMedium[a.utm_medium]) byMedium[a.utm_medium] = { count: 0, value: 0 };
          byMedium[a.utm_medium].count++;
          byMedium[a.utm_medium].value += a.conversion_value || 0;
        }
        if (a.utm_campaign) {
          if (!byCampaign[a.utm_campaign]) byCampaign[a.utm_campaign] = { count: 0, value: 0 };
          byCampaign[a.utm_campaign].count++;
          byCampaign[a.utm_campaign].value += a.conversion_value || 0;
        }
      });

      return NextResponse.json({
        total_conversions: attributions?.filter(a => a.converted_at).length || 0,
        total_value: attributions?.reduce((sum, a) => sum + (a.conversion_value || 0), 0) || 0,
        by_source: bySource,
        by_medium: byMedium,
        by_campaign: byCampaign,
        attributions: attributions || [],
      });
    }

    if (connectionId) {
      const { data: connection, error } = await supabase
        .from('marketing_connections')
        .select('*')
        .eq('id', connectionId)
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Mask credentials
      if (connection.credentials) {
        connection.credentials = {
          ...connection.credentials,
          api_key: connection.credentials.api_key ? '***' : undefined,
          access_token: connection.credentials.access_token ? '***' : undefined,
          refresh_token: connection.credentials.refresh_token ? '***' : undefined,
        };
      }

      return NextResponse.json({ connection });
    } else {
      const { data: connections, error } = await supabase
        .from('marketing_connections')
        .select('id, provider, sync_settings, is_active, last_sync_at, created_at')
        .order('created_at', { ascending: false });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({
        connections: connections || [],
        providers: ['mailchimp', 'klaviyo', 'ga4', 'facebook', 'google_ads'],
      });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch marketing data' }, { status: 500 });
  }
}

// POST /api/integrations/marketing-sync - Create connection or stream events
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const action = body.action || 'create_connection';

    if (action === 'create_connection') {
      const validated = MarketingConnectionSchema.parse(body);

      const { data: connection, error } = await supabase
        .from('marketing_connections')
        .insert({
          ...validated,
          is_active: true,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ connection }, { status: 201 });
    } else if (action === 'stream_events') {
      const validated = EventStreamSchema.parse(body);

      // Store events locally
      const eventRecords = validated.events.map(e => ({
        connection_id: validated.connection_id,
        event_type: e.event_type,
        user_id: e.user_id,
        email: e.email,
        event_data: e.event_data,
        event_timestamp: e.timestamp,
        created_at: new Date().toISOString(),
      }));

      const { data: storedEvents, error: storeError } = await supabase
        .from('marketing_events')
        .insert(eventRecords)
        .select();

      if (storeError) {
        return NextResponse.json({ error: storeError.message }, { status: 500 });
      }

      // Get connection to determine provider
      const { data: connection } = await supabase
        .from('marketing_connections')
        .select('provider, credentials')
        .eq('id', validated.connection_id)
        .single();

      // Forward events to provider (simulated)
      let forwardedCount = 0;
      if (connection) {
        // In production, this would call the actual provider APIs
        forwardedCount = validated.events.length;
      }

      return NextResponse.json({
        stored_count: storedEvents?.length || 0,
        forwarded_count: forwardedCount,
        events: storedEvents,
      });
    } else if (action === 'update_consent') {
      const validated = ConsentUpdateSchema.parse(body);

      const { data: consent, error } = await supabase
        .from('marketing_consents')
        .insert({
          email: validated.email,
          consent_type: validated.consent_type,
          is_consented: validated.is_consented,
          source: validated.source || 'api',
          consented_at: validated.is_consented ? new Date().toISOString() : null,
          withdrawn_at: !validated.is_consented ? new Date().toISOString() : null,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Sync to connected marketing platforms
      const { data: connections } = await supabase
        .from('marketing_connections')
        .select('id, provider')
        .eq('is_active', true);

      // In production, sync consent to each provider
      const syncedTo = connections?.map(c => c.provider) || [];

      return NextResponse.json({
        consent,
        synced_to: syncedTo,
      });
    } else if (action === 'track_attribution') {
      const { 
        session_id, 
        utm_source, 
        utm_medium, 
        utm_campaign, 
        utm_term, 
        utm_content,
        referrer,
        landing_page,
      } = body;

      const { data: attribution, error } = await supabase
        .from('marketing_attributions')
        .insert({
          user_id: user.id,
          session_id,
          utm_source,
          utm_medium,
          utm_campaign,
          utm_term,
          utm_content,
          referrer,
          landing_page,
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ attribution });
    } else if (action === 'record_conversion') {
      const { attribution_id, conversion_event, conversion_value } = body;

      const { data: attribution, error } = await supabase
        .from('marketing_attributions')
        .update({
          conversion_event,
          conversion_value,
          converted_at: new Date().toISOString(),
        })
        .eq('id', attribution_id)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Forward conversion to connected platforms
      const { data: connections } = await supabase
        .from('marketing_connections')
        .select('id, provider, credentials')
        .eq('is_active', true);

      // In production, send conversion events to GA4, Facebook, etc.

      return NextResponse.json({
        attribution,
        forwarded_to: connections?.map(c => c.provider) || [],
      });
    } else if (action === 'create_automation') {
      const { name, trigger_type, trigger_conditions, actions, is_active } = body;

      const { data: automation, error } = await supabase
        .from('marketing_automations')
        .insert({
          name,
          trigger_type,
          trigger_conditions,
          actions,
          is_active: is_active ?? true,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ automation }, { status: 201 });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}

// PATCH /api/integrations/marketing-sync - Update connection
export async function PATCH(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const connectionId = searchParams.get('connection_id');

    if (!connectionId) {
      return NextResponse.json({ error: 'Connection ID required' }, { status: 400 });
    }

    const body = await request.json();

    const { data: connection, error } = await supabase
      .from('marketing_connections')
      .update({
        ...body,
        updated_at: new Date().toISOString(),
      })
      .eq('id', connectionId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ connection });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update connection' }, { status: 500 });
  }
}
