export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const SUPPORTED_EVENTS = [
  'booking.created', 'booking.updated', 'booking.cancelled', 'booking.confirmed',
  'lead.created', 'lead.updated', 'lead.converted',
  'contact.created', 'contact.updated', 'contact.merged',
  'proposal.sent', 'proposal.viewed', 'proposal.accepted', 'proposal.declined',
  'payment.received', 'payment.overdue', 'payment.reminder',
  'invoice.created', 'invoice.sent', 'invoice.paid',
  'contract.signed', 'contract.expired',
];

const createWebhookSchema = z.object({
  organization_id: z.string().uuid(),
  name: z.string().min(1),
  url: z.string().url(),
  events: z.array(z.string()).min(1),
  headers: z.record(z.string()).optional(),
  is_active: z.boolean().default(true),
});

function generateSecret(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let secret = 'whsec_';
  for (let i = 0; i < 32; i++) {
    secret += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return secret;
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { searchParams } = new URL(request.url);

    const orgId = searchParams.get('organization_id');
    const includeInactive = searchParams.get('include_inactive') === 'true';

    if (!orgId) {
      return NextResponse.json({ error: 'organization_id required' }, { status: 400 });
    }

    let query = supabase
      .from('webhooks_outgoing')
      .select('*')
      .eq('organization_id', orgId)
      .order('name');

    if (!includeInactive) {
      query = query.eq('is_active', true);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      webhooks: data,
      supported_events: SUPPORTED_EVENTS,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const body = await request.json();
    const payload = createWebhookSchema.parse(body);

    const invalidEvents = payload.events.filter(e => !SUPPORTED_EVENTS.includes(e));
    if (invalidEvents.length > 0) {
      return NextResponse.json({
        error: `Invalid events: ${invalidEvents.join(', ')}`,
        supported_events: SUPPORTED_EVENTS,
      }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('webhooks_outgoing')
      .insert({
        ...payload,
        secret: generateSecret(),
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ webhook: data }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 422 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
