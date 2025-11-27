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

const alertSchema = z.object({
  event_id: z.string().uuid().optional(),
  name: z.string().min(1),
  trigger_type: z.enum(['negative_spike', 'positive_spike', 'keyword', 'volume']),
  threshold: z.number(),
  keywords: z.array(z.string()).optional(),
  notification_channels: z.array(z.string()),
});

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('event_id');
    const type = searchParams.get('type');

    if (type === 'triggered') {
      const { data: alerts, error } = await supabase
        .from('sentiment_alert_triggers')
        .select(`*, alert:sentiment_alerts(*)`)
        .order('triggered_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return NextResponse.json({ triggered_alerts: alerts });
    }

    let query = supabase.from('sentiment_alerts').select('*').eq('status', 'active');
    if (eventId) query = query.eq('event_id', eventId);

    const { data: alerts, error } = await query;
    if (error) throw error;

    return NextResponse.json({ alerts });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const body = await request.json();
    const action = body.action;

    if (action === 'trigger') {
      const { alert_id, sentiment_score, sample_content } = body;

      const { data: trigger, error } = await supabase
        .from('sentiment_alert_triggers')
        .insert({
          alert_id,
          sentiment_score,
          sample_content,
          triggered_at: new Date().toISOString(),
          acknowledged: false,
        })
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ trigger }, { status: 201 });
    }

    const validated = alertSchema.parse(body);

    const { data: alert, error } = await supabase
      .from('sentiment_alerts')
      .insert({ ...validated, status: 'active', created_at: new Date().toISOString() })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ alert }, { status: 201 });
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

    if (action === 'acknowledge') {
      const { data, error } = await supabase
        .from('sentiment_alert_triggers')
        .update({ acknowledged: true, acknowledged_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ trigger: data });
    }

    if (action === 'pause') {
      const { data, error } = await supabase
        .from('sentiment_alerts')
        .update({ status: 'paused' })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ alert: data });
    }

    const { data, error } = await supabase
      .from('sentiment_alerts')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ alert: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
