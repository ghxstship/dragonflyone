export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { withAuth, PlatformRole, logger } from '@ghxstship/config';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const GVTEWAY_ROLES = [
  PlatformRole.GVTEWAY_ADMIN, PlatformRole.GVTEWAY_VENUE_MANAGER, PlatformRole.GVTEWAY_EXPERIENCE_CREATOR,
  PlatformRole.LEGEND_SUPER_ADMIN, PlatformRole.LEGEND_ADMIN, PlatformRole.LEGEND_DEVELOPER,
];

const processSaleSchema = z.object({
  terminal_id: z.string().uuid(),
  items: z.array(z.object({
    menu_item_id: z.string().uuid(),
    quantity: z.number().int().positive(),
    price: z.number().positive(),
  })),
  payment_method: z.enum(['card', 'cash', 'mobile']),
  total: z.number().positive(),
});

export async function GET(request: NextRequest) {
  try {
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;
    
    const userRoles = authResult.user?.platformRoles || [];
    if (!GVTEWAY_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden - GVTEWAY access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const terminalId = searchParams.get('terminal_id');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');

    let query = supabase
      .from('pos_transactions')
      .select('*, terminal:pos_terminals(id, name)')
      .order('created_at', { ascending: false })
      .limit(100);

    if (terminalId) query = query.eq('terminal_id', terminalId);
    if (startDate) query = query.gte('created_at', startDate);
    if (endDate) query = query.lte('created_at', endDate);

    const { data, error } = await query;

    if (error) {
      logger.error('Error fetching POS transactions:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: data || [] });
  } catch (error) {
    logger.error('Error in GET /api/admin/pos/transactions:', error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;
    
    const userRoles = authResult.user?.platformRoles || [];
    if (!GVTEWAY_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden - GVTEWAY access required' }, { status: 403 });
    }

    const body = await request.json();
    const validationResult = processSaleSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json({ error: 'Validation failed', details: validationResult.error.errors }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('pos_transactions')
      .insert({
        terminal_id: validationResult.data.terminal_id,
        items: validationResult.data.items,
        payment_method: validationResult.data.payment_method,
        total: validationResult.data.total,
        status: 'completed',
      })
      .select()
      .single();

    if (error) {
      logger.error('Error processing sale:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    logger.error('Error in POST /api/admin/pos/transactions:', error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json({ error: 'Failed to process sale' }, { status: 500 });
  }
}
