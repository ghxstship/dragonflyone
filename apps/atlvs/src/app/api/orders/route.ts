export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const OrderSchema = z.object({
  organization_id: z.string().uuid(),
  user_id: z.string().uuid().optional(),
  event_id: z.string().uuid().optional(),
  order_number: z.string().min(1),
  status: z.enum(['pending', 'confirmed', 'processing', 'completed', 'cancelled', 'refunded']).default('pending'),
  subtotal: z.number().min(0).default(0),
  tax: z.number().min(0).default(0),
  fees: z.number().min(0).default(0),
  total_amount: z.number().min(0).default(0),
  currency: z.string().default('USD'),
  payment_method: z.string().optional(),
  payment_status: z.enum(['pending', 'paid', 'failed', 'refunded']).default('pending'),
  billing_name: z.string().optional(),
  billing_email: z.string().email().optional(),
  billing_phone: z.string().optional(),
  notes: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('event_id');
    const userId = searchParams.get('user_id');
    const status = searchParams.get('status');
    const paymentStatus = searchParams.get('payment_status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('orders')
      .select(`
        *,
        events(id, name),
        platform_users(id, email, full_name)
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (eventId) {
      query = query.eq('event_id', eventId);
    }
    if (userId) {
      query = query.eq('user_id', userId);
    }
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }
    if (paymentStatus && paymentStatus !== 'all') {
      query = query.eq('payment_status', paymentStatus);
    }

    const { data, error, count } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const orders = data || [];
    const summary = {
      total: count || 0,
      total_revenue: orders.reduce((sum, o) => sum + (o.total_amount || 0), 0),
      by_status: {
        pending: orders.filter(o => o.status === 'pending').length,
        confirmed: orders.filter(o => o.status === 'confirmed').length,
        completed: orders.filter(o => o.status === 'completed').length,
        cancelled: orders.filter(o => o.status === 'cancelled').length,
      },
      by_payment: {
        paid: orders.filter(o => o.payment_status === 'paid').length,
        pending: orders.filter(o => o.payment_status === 'pending').length,
        refunded: orders.filter(o => o.payment_status === 'refunded').length,
      },
    };

    return NextResponse.json({
      orders,
      summary,
      pagination: { limit, offset, total: count || 0 },
    });
  } catch (error: unknown) {
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = OrderSchema.parse(body);

    const { data, error } = await supabase
      .from('orders')
      .insert(validatedData)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ order: data }, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 422 });
    }
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
