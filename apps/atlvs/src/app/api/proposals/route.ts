export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { randomBytes } from 'crypto';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const ProposalSchema = z.object({
  organization_id: z.string().uuid(),
  booking_id: z.string().uuid().optional().nullable(),
  lead_id: z.string().uuid().optional().nullable(),
  contact_id: z.string().uuid(),
  name: z.string().min(1, 'Name is required'),
  status: z.enum(['draft', 'sent', 'viewed', 'accepted', 'declined', 'expired']).default('draft'),
  content: z.object({
    header: z.object({
      title: z.string().optional(),
      subtitle: z.string().optional(),
      logo_url: z.string().optional(),
    }).optional(),
    sections: z.array(z.object({
      id: z.string(),
      type: z.enum(['text', 'pricing', 'images', 'timeline', 'terms', 'signature']),
      title: z.string().optional(),
      content: z.any(),
      order_index: z.number(),
    })).default([]),
    footer: z.object({
      company_name: z.string().optional(),
      contact_info: z.string().optional(),
    }).optional(),
  }).default({}),
  branding: z.object({
    primary_color: z.string().default('#3B82F6'),
    secondary_color: z.string().optional(),
    font_family: z.string().optional(),
    logo_url: z.string().optional(),
  }).default({}),
  pricing_items: z.array(z.object({
    id: z.string(),
    description: z.string(),
    quantity: z.number(),
    unit_price: z.number(),
    total: z.number(),
    category: z.string().optional(),
    optional: z.boolean().default(false),
  })).default([]),
  subtotal: z.number().min(0).default(0),
  tax_amount: z.number().min(0).default(0),
  total: z.number().min(0).default(0),
  terms: z.string().optional(),
  valid_until: z.string().optional().nullable(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organization_id');
    const bookingId = searchParams.get('booking_id');
    const leadId = searchParams.get('lead_id');
    const contactId = searchParams.get('contact_id');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('proposals')
      .select(`
        *,
        contact:contacts(id, first_name, last_name, email, company),
        booking:bookings(id, booking_number, event_name, event_date),
        lead:leads(id, title)
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (organizationId) {
      query = query.eq('organization_id', organizationId);
    }
    if (bookingId) {
      query = query.eq('booking_id', bookingId);
    }
    if (leadId) {
      query = query.eq('lead_id', leadId);
    }
    if (contactId) {
      query = query.eq('contact_id', contactId);
    }
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    const { data, error, count } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      proposals: data || [],
      pagination: { limit, offset, total: count || 0 },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch proposals' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = ProposalSchema.parse(body);

    // Generate public token for sharing
    const publicToken = randomBytes(32).toString('hex');

    const { data, error } = await supabase
      .from('proposals')
      .insert({
        ...validatedData,
        public_token: publicToken,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ proposal: data }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create proposal' }, { status: 500 });
  }
}
