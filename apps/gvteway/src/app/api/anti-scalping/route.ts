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

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const severity = searchParams.get('severity');
    const status = searchParams.get('status');
    const eventId = searchParams.get('event_id');

    let query = supabase
      .from('scalping_alerts')
      .select('*')
      .order('created_at', { ascending: false });

    if (type) {
      query = query.eq('type', type);
    }

    if (severity) {
      query = query.eq('severity', severity);
    }

    if (status) {
      query = query.eq('status', status);
    }

    if (eventId) {
      query = query.eq('event_id', eventId);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ alerts: data || [] });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, alert_id, block_type, block_value, block_reason } = body;

    if (action === 'update_status') {
      const { status } = body;
      const { data, error } = await supabase
        .from('scalping_alerts')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', alert_id)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ alert: data });
    }

    if (action === 'block') {
      const { data, error } = await supabase
        .from('blocked_entities')
        .insert({
          type: block_type,
          value: block_value,
          reason: block_reason,
          blocked_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ blocked: data }, { status: 201 });
    }

    if (action === 'unblock') {
      const { block_id } = body;
      const { error } = await supabase
        .from('blocked_entities')
        .delete()
        .eq('id', block_id);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Verification endpoint for ticket purchases
export async function PUT(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const body = await request.json();
    const { ip_address, user_id, email, device_fingerprint, ticket_count, event_id } = body;

    // Check blocked entities
    const { data: blockedIp } = await supabase
      .from('blocked_entities')
      .select('id')
      .eq('type', 'ip')
      .eq('value', ip_address)
      .single();

    if (blockedIp) {
      return NextResponse.json({
        allowed: false,
        reason: 'IP address is blocked',
        action: 'block',
      });
    }

    const { data: blockedEmail } = await supabase
      .from('blocked_entities')
      .select('id')
      .eq('type', 'email')
      .eq('value', email)
      .single();

    if (blockedEmail) {
      return NextResponse.json({
        allowed: false,
        reason: 'Email is blocked',
        action: 'block',
      });
    }

    // Check purchase limits
    const { data: rules } = await supabase
      .from('protection_rules')
      .select('*')
      .eq('enabled', true);

    const purchaseLimitRule = rules?.find(r => r.type === 'purchase_limit');
    if (purchaseLimitRule && ticket_count > purchaseLimitRule.threshold) {
      // Create alert
      await supabase.from('scalping_alerts').insert({
        type: 'bulk_purchase',
        severity: ticket_count > 20 ? 'critical' : 'high',
        event_id,
        details: `Attempted purchase of ${ticket_count} tickets exceeds limit of ${purchaseLimitRule.threshold}`,
        ip_address,
        user_id,
        user_email: email,
        ticket_count,
        status: 'pending',
      });

      return NextResponse.json({
        allowed: false,
        reason: `Purchase limit exceeded. Maximum ${purchaseLimitRule.threshold} tickets per transaction.`,
        action: purchaseLimitRule.action,
      });
    }

    // Check velocity (purchases per hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { data: recentPurchases } = await supabase
      .from('ticket_purchases')
      .select('id')
      .eq('ip_address', ip_address)
      .gte('created_at', oneHourAgo);

    const velocityRule = rules?.find(r => r.type === 'velocity_check');
    if (velocityRule && recentPurchases && recentPurchases.length >= velocityRule.threshold) {
      await supabase.from('scalping_alerts').insert({
        type: 'rapid_checkout',
        severity: 'medium',
        event_id,
        details: `Multiple purchases from same IP within 1 hour`,
        ip_address,
        user_id,
        user_email: email,
        ticket_count,
        status: 'pending',
      });

      return NextResponse.json({
        allowed: false,
        reason: 'Too many purchases in a short time. Please try again later.',
        action: velocityRule.action,
        require_captcha: true,
      });
    }

    return NextResponse.json({
      allowed: true,
      require_captcha: false,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
