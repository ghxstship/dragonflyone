export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { logger, withAuth, PlatformRole } from '@ghxstship/config';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

const GVTEWAY_ADMIN_ROLES = [
  PlatformRole.GVTEWAY_ADMIN,
  PlatformRole.LEGEND_SUPER_ADMIN,
];

const deliverySchema = z.object({
  ticket_id: z.string().uuid(),
  delivery_method_id: z.string().uuid(),
  delivery_address: z.object({
    street: z.string(),
    city: z.string(),
    state: z.string(),
    postal_code: z.string(),
    country: z.string().default('USA'),
  }).optional(),
});

// GET /api/tickets/deliveries - List ticket deliveries
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    
    const ticketId = searchParams.get('ticket_id');
    const status = searchParams.get('status');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('ticket_deliveries')
      .select(`
        *,
        delivery_method:delivery_methods(id, code, name, fee),
        ticket:tickets(id, ticket_number, holder_name, holder_email)
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (ticketId) {
      query = query.eq('ticket_id', ticketId);
    }
    if (status) {
      query = query.eq('status', status);
    }

    const { data, error, count } = await query;

    if (error) {
      if (error.message?.includes('does not exist') || error.code === '42P01') {
        return NextResponse.json({ deliveries: [], total: 0, limit, offset });
      }
      logger.error('Error fetching ticket deliveries:', error);
      return NextResponse.json({ error: 'Failed to fetch deliveries' }, { status: 500 });
    }

    return NextResponse.json({ deliveries: data || [], total: count, limit, offset });
  } catch (error) {
    logger.error('Error in GET /api/tickets/deliveries:', error instanceof Error ? error : undefined);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/tickets/deliveries - Create delivery request
export async function POST(request: NextRequest) {
  try {
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const supabase = getSupabaseClient();
    const body = await request.json();
    const validated = deliverySchema.parse(body);

    const { data: delivery, error } = await supabase
      .from('ticket_deliveries')
      .insert({
        ticket_id: validated.ticket_id,
        delivery_method_id: validated.delivery_method_id,
        delivery_address: validated.delivery_address,
        status: 'pending',
      })
      .select(`
        *,
        delivery_method:delivery_methods(id, code, name)
      `)
      .single();

    if (error) {
      logger.error('Error creating ticket delivery:', error);
      return NextResponse.json({ error: 'Failed to create delivery' }, { status: 500 });
    }

    return NextResponse.json({ delivery }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    logger.error('Error in POST /api/tickets/deliveries:', error instanceof Error ? error : undefined);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/tickets/deliveries - Update delivery status
export async function PATCH(request: NextRequest) {
  try {
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!GVTEWAY_ADMIN_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const supabase = getSupabaseClient();
    const body = await request.json();
    const { delivery_id, status, tracking_number, carrier } = body;

    if (!delivery_id) {
      return NextResponse.json({ error: 'delivery_id is required' }, { status: 400 });
    }

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    
    if (status) {
      updates.status = status;
      if (status === 'shipped') {
        updates.shipped_at = new Date().toISOString();
      } else if (status === 'delivered') {
        updates.delivered_at = new Date().toISOString();
      }
    }
    if (tracking_number) updates.tracking_number = tracking_number;
    if (carrier) updates.carrier = carrier;

    const { data: delivery, error } = await supabase
      .from('ticket_deliveries')
      .update(updates)
      .eq('id', delivery_id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: 'Failed to update delivery' }, { status: 500 });
    }

    return NextResponse.json({ success: true, delivery });
  } catch (error) {
    logger.error('Error in PATCH /api/tickets/deliveries:', error instanceof Error ? error : undefined);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
