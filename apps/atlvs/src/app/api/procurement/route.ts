export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const PurchaseOrderSchema = z.object({
  organization_id: z.string().uuid(),
  project_id: z.string().uuid().optional(),
  vendor_id: z.string().uuid().optional(),
  order_number: z.string().min(1),
  description: z.string().optional(),
  category: z.string().optional(),
  status: z.enum(['draft', 'pending_approval', 'approved', 'ordered', 'received', 'closed']).default('draft'),
  total_amount: z.number().default(0),
  currency: z.string().default('USD'),
  issued_on: z.string().optional(),
  due_date: z.string().optional(),
  requested_by: z.string().optional(),
  notes: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organization_id');
    const projectId = searchParams.get('project_id');
    const vendorId = searchParams.get('vendor_id');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('finance_purchase_orders')
      .select('*, procurement_vendors(*)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (organizationId) {
      query = query.eq('organization_id', organizationId);
    }
    if (projectId) {
      query = query.eq('project_id', projectId);
    }
    if (vendorId) {
      query = query.eq('vendor_id', vendorId);
    }
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    const { data, error, count } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const orders = data || [];
    const summary = {
      total: count || 0,
      by_status: {
        draft: orders.filter(o => o.status === 'draft').length,
        pending_approval: orders.filter(o => o.status === 'pending_approval').length,
        approved: orders.filter(o => o.status === 'approved').length,
        ordered: orders.filter(o => o.status === 'ordered').length,
        received: orders.filter(o => o.status === 'received').length,
        closed: orders.filter(o => o.status === 'closed').length,
      },
      total_value: orders.reduce((sum, o) => sum + (o.total_amount || 0), 0),
    };

    return NextResponse.json({
      purchase_orders: orders,
      summary,
      pagination: { limit, offset, total: count || 0 },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch purchase orders' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = PurchaseOrderSchema.parse(body);

    const { data, error } = await supabase
      .from('finance_purchase_orders')
      .insert(validatedData)
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'Order number already exists' }, { status: 409 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ purchase_order: data }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 422 });
    }
    return NextResponse.json({ error: 'Failed to create purchase order' }, { status: 500 });
  }
}
