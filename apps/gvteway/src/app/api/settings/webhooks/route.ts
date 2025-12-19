export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import { withAuth, logger } from '@ghxstship/config';
import crypto from 'crypto';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

const WebhookEventTypes = [
  'order.created',
  'order.completed',
  'order.cancelled',
  'order.refunded',
  'ticket.transferred',
  'ticket.scanned',
  'event.published',
  'event.updated',
  'event.cancelled',
  'payment.succeeded',
  'payment.failed',
  'customer.created',
  'customer.updated',
] as const;

const createWebhookSchema = z.object({
  name: z.string().min(1).max(100),
  url: z.string().url().startsWith('https://'),
  description: z.string().max(500).optional(),
  events: z.array(z.enum(WebhookEventTypes)).min(1),
  headers: z.record(z.string()).optional(),
  retry_count: z.number().int().min(0).max(5).optional(),
  timeout_ms: z.number().int().min(1000).max(60000).optional(),
});

const updateWebhookSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100).optional(),
  url: z.string().url().startsWith('https://').optional(),
  description: z.string().max(500).optional(),
  events: z.array(z.enum(WebhookEventTypes)).min(1).optional(),
  status: z.enum(['active', 'paused', 'disabled']).optional(),
  headers: z.record(z.string()).optional(),
  retry_count: z.number().int().min(0).max(5).optional(),
  timeout_ms: z.number().int().min(1000).max(60000).optional(),
});

function generateWebhookSecret(): string {
  return 'whsec_' + crypto.randomBytes(32).toString('hex');
}

export async function GET(request: NextRequest) {
  try {
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;
    
    const userId = authResult.user?.id;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const endpointId = searchParams.get('id');
    const includeDeliveries = searchParams.get('deliveries') === 'true';

    if (endpointId) {
      const { data: endpoint, error } = await supabase
        .from('webhook_endpoints')
        .select('*')
        .eq('id', endpointId)
        .eq('user_id', userId)
        .single();

      if (error || !endpoint) {
        return NextResponse.json({ error: 'Webhook not found' }, { status: 404 });
      }

      let deliveries = null;
      if (includeDeliveries) {
        const { data } = await supabase
          .from('webhook_deliveries')
          .select('*')
          .eq('endpoint_id', endpointId)
          .order('created_at', { ascending: false })
          .limit(50);
        deliveries = data;
      }

      return NextResponse.json({ endpoint, deliveries });
    }

    const { data: endpoints, error } = await supabase
      .from('webhook_endpoints')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      logger.error('Failed to fetch webhooks', error);
      return NextResponse.json({ error: 'Failed to fetch webhooks' }, { status: 500 });
    }

    return NextResponse.json({ endpoints: endpoints || [] });
  } catch (err) {
    logger.error('Webhook GET error', err instanceof Error ? err : new Error(String(err)));
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;
    
    const userId = authResult.user?.id;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getSupabaseClient();
    const body = await request.json();
    const validation = createWebhookSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { name, url, description, events, headers, retry_count, timeout_ms } = validation.data;
    const secret = generateWebhookSecret();

    const { data: endpoint, error } = await supabase
      .from('webhook_endpoints')
      .insert({
        user_id: userId,
        name,
        url,
        description,
        secret,
        events,
        headers: headers || {},
        retry_count: retry_count ?? 3,
        timeout_ms: timeout_ms ?? 30000,
      })
      .select()
      .single();

    if (error) {
      logger.error('Failed to create webhook', error);
      return NextResponse.json({ error: 'Failed to create webhook' }, { status: 500 });
    }

    return NextResponse.json({ endpoint, secret }, { status: 201 });
  } catch (err) {
    logger.error('Webhook POST error', err instanceof Error ? err : new Error(String(err)));
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;
    
    const userId = authResult.user?.id;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getSupabaseClient();
    const body = await request.json();
    const validation = updateWebhookSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { id, ...updates } = validation.data;

    const { data: existing } = await supabase
      .from('webhook_endpoints')
      .select('id')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (!existing) {
      return NextResponse.json({ error: 'Webhook not found' }, { status: 404 });
    }

    const { data: endpoint, error } = await supabase
      .from('webhook_endpoints')
      .update(updates)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      logger.error('Failed to update webhook', error);
      return NextResponse.json({ error: 'Failed to update webhook' }, { status: 500 });
    }

    return NextResponse.json({ endpoint });
  } catch (err) {
    logger.error('Webhook PATCH error', err instanceof Error ? err : new Error(String(err)));
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;
    
    const userId = authResult.user?.id;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Webhook ID required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('webhook_endpoints')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      logger.error('Failed to delete webhook', error);
      return NextResponse.json({ error: 'Failed to delete webhook' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    logger.error('Webhook DELETE error', err instanceof Error ? err : new Error(String(err)));
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
