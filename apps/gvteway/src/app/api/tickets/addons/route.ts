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
  PlatformRole.GVTEWAY_EXPERIENCE_CREATOR,
  PlatformRole.LEGEND_SUPER_ADMIN,
];

const addonSchema = z.object({
  ticket_id: z.string().uuid(),
  addon_type_id: z.string().uuid(),
  quantity: z.number().int().min(1).default(1),
});

// GET /api/tickets/addons - List ticket addons
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    
    const ticketId = searchParams.get('ticket_id');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('ticket_addons')
      .select(`
        *,
        addon_type:ticket_addon_types(id, code, name, description, price),
        ticket:tickets(id, ticket_number, holder_name)
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (ticketId) {
      query = query.eq('ticket_id', ticketId);
    }

    const { data, error, count } = await query;

    if (error) {
      if (error.message?.includes('does not exist') || error.code === '42P01') {
        return NextResponse.json({ addons: [], total: 0, limit, offset });
      }
      logger.error('Error fetching ticket addons:', error);
      return NextResponse.json({ error: 'Failed to fetch addons' }, { status: 500 });
    }

    return NextResponse.json({ addons: data || [], total: count, limit, offset });
  } catch (error) {
    logger.error('Error in GET /api/tickets/addons:', error instanceof Error ? error : undefined);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/tickets/addons - Add addon to ticket
export async function POST(request: NextRequest) {
  try {
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const supabase = getSupabaseClient();
    const body = await request.json();
    const validated = addonSchema.parse(body);

    // Get addon type price
    const { data: addonType } = await supabase
      .from('ticket_addon_types')
      .select('price')
      .eq('id', validated.addon_type_id)
      .single();

    const unitPrice = addonType?.price || 0;
    const totalPrice = unitPrice * validated.quantity;

    const { data: addon, error } = await supabase
      .from('ticket_addons')
      .insert({
        ticket_id: validated.ticket_id,
        addon_type_id: validated.addon_type_id,
        quantity: validated.quantity,
        unit_price: unitPrice,
        total_price: totalPrice,
      })
      .select(`
        *,
        addon_type:ticket_addon_types(id, code, name)
      `)
      .single();

    if (error) {
      logger.error('Error adding ticket addon:', error);
      return NextResponse.json({ error: 'Failed to add addon' }, { status: 500 });
    }

    return NextResponse.json({ addon }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    logger.error('Error in POST /api/tickets/addons:', error instanceof Error ? error : undefined);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/tickets/addons - Redeem addon
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
    const { addon_id, action } = body;

    if (!addon_id) {
      return NextResponse.json({ error: 'addon_id is required' }, { status: 400 });
    }

    if (action === 'redeem') {
      const { data: addon, error } = await supabase
        .from('ticket_addons')
        .update({ redeemed_at: new Date().toISOString() })
        .eq('id', addon_id)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: 'Failed to redeem addon' }, { status: 500 });
      }

      return NextResponse.json({ success: true, addon, message: 'Addon redeemed' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    logger.error('Error in PATCH /api/tickets/addons:', error instanceof Error ? error : undefined);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
