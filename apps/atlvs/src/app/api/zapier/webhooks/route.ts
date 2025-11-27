import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import crypto from 'crypto';

// Webhook delivery function
async function deliverWebhook(
  subscriptionId: string,
  webhookUrl: string,
  payload: any
): Promise<{ success: boolean; statusCode?: number; error?: string }> {
  const timestamp = Date.now();
  const signature = generateSignature(payload, timestamp);

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-GHXSTSHIP-Signature': signature,
        'X-GHXSTSHIP-Timestamp': timestamp.toString(),
        'X-GHXSTSHIP-Subscription-ID': subscriptionId,
      },
      body: JSON.stringify(payload),
    });

    // Log delivery
    await supabase.from('webhook_delivery_logs').insert({
      subscription_id: subscriptionId,
      payload,
      status_code: response.status,
      success: response.ok,
      delivered_at: new Date().toISOString(),
    });

    return { success: response.ok, statusCode: response.status };
  } catch (error: any) {
    // Log failed delivery
    await supabase.from('webhook_delivery_logs').insert({
      subscription_id: subscriptionId,
      payload,
      success: false,
      error_message: error.message,
      delivered_at: new Date().toISOString(),
    });

    return { success: false, error: error.message };
  }
}

// Generate HMAC signature for webhook payload
function generateSignature(payload: any, timestamp: number): string {
  const secret = process.env.WEBHOOK_SECRET || 'default-webhook-secret';
  const data = `${timestamp}.${JSON.stringify(payload)}`;
  return crypto.createHmac('sha256', secret).update(data).digest('hex');
}

// POST /api/zapier/webhooks - Trigger webhooks for an event
export async function POST(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const authHeader = request.headers.get('authorization');
    // Allow internal service calls with service key
    const isServiceCall = authHeader === `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`;
    
    if (!authHeader && !isServiceCall) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { trigger_type, data } = body;

    if (!trigger_type || !data) {
      return NextResponse.json({ error: 'trigger_type and data required' }, { status: 400 });
    }

    // Get active subscriptions for this trigger type
    const { data: subscriptions, error } = await supabase
      .from('webhook_subscriptions')
      .select('*')
      .eq('trigger_type', trigger_type)
      .eq('is_active', true);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json({ 
        message: 'No active subscriptions for this trigger',
        delivered: 0,
      });
    }

    // Deliver webhooks to all subscribers
    const deliveryResults = await Promise.all(
      subscriptions.map(async (sub) => {
        // Check filters if any
        if (sub.filters) {
          const matchesFilters = Object.entries(sub.filters).every(([key, value]) => {
            return data[key] === value;
          });
          if (!matchesFilters) {
            return { subscription_id: sub.id, skipped: true, reason: 'filter_mismatch' };
          }
        }

        const payload = {
          trigger: trigger_type,
          timestamp: new Date().toISOString(),
          data,
        };

        const result = await deliverWebhook(sub.id, sub.webhook_url, payload);
        return { subscription_id: sub.id, ...result };
      })
    );

    const successCount = deliveryResults.filter(r => 'success' in r && r.success).length;
    const failedCount = deliveryResults.filter(r => 'success' in r && !r.success && !('skipped' in r)).length;
    const skippedCount = deliveryResults.filter(r => 'skipped' in r && r.skipped).length;

    return NextResponse.json({
      delivered: successCount,
      failed: failedCount,
      skipped: skippedCount,
      results: deliveryResults,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to deliver webhooks' }, { status: 500 });
  }
}

// GET /api/zapier/webhooks - Get webhook delivery logs
export async function GET(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const subscriptionId = searchParams.get('subscription_id');
    const limit = parseInt(searchParams.get('limit') || '50');

    let query = supabase
      .from('webhook_delivery_logs')
      .select(`
        *,
        subscription:webhook_subscriptions(trigger_type, webhook_url)
      `)
      .order('delivered_at', { ascending: false })
      .limit(limit);

    if (subscriptionId) {
      query = query.eq('subscription_id', subscriptionId);
    }

    const { data: logs, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Get summary stats
    const { data: stats } = await supabase
      .from('webhook_delivery_logs')
      .select('success')
      .gte('delivered_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    const totalDeliveries = stats?.length || 0;
    const successfulDeliveries = stats?.filter(s => s.success).length || 0;
    const errorRate = totalDeliveries > 0 
      ? ((totalDeliveries - successfulDeliveries) / totalDeliveries * 100).toFixed(2)
      : 0;

    return NextResponse.json({
      logs: logs || [],
      stats: {
        total_24h: totalDeliveries,
        successful_24h: successfulDeliveries,
        error_rate_24h: `${errorRate}%`,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 });
  }
}
