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
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('order_id');

    let query = supabase.from('refund_requests').select(`
      *, order:orders(id, total, event:events(id, name, date))
    `).eq('user_id', user.id);

    if (orderId) query = query.eq('order_id', orderId);

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ refunds: data });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch refunds' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { order_id, reason, refund_type } = body; // 'full', 'partial', 'exchange'

    // Get order details
    const { data: order, error: orderError } = await supabase.from('orders').select(`
      *, event:events(id, name, date, refund_policy)
    `).eq('id', order_id).eq('user_id', user.id).single();

    if (orderError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Check refund eligibility
    const eventDate = new Date(order.event?.date);
    const now = new Date();
    const daysUntilEvent = Math.ceil((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    let refundAmount = order.total;
    let eligible = true;
    let message = '';

    if (daysUntilEvent < 0) {
      eligible = false;
      message = 'Event has already occurred';
    } else if (daysUntilEvent < 7) {
      refundAmount = order.total * 0.5; // 50% refund within 7 days
      message = 'Partial refund available (50%)';
    } else if (daysUntilEvent < 14) {
      refundAmount = order.total * 0.75; // 75% refund within 14 days
      message = 'Partial refund available (75%)';
    }

    if (!eligible) {
      return NextResponse.json({ error: message, eligible: false }, { status: 400 });
    }

    const { data, error } = await supabase.from('refund_requests').insert({
      order_id, user_id: user.id, reason, refund_type,
      original_amount: order.total, refund_amount: refundAmount,
      status: 'pending', submitted_at: new Date().toISOString()
    }).select().single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({
      refund_request: data,
      message: `Refund request submitted. Amount: $${refundAmount.toFixed(2)}`
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to submit refund' }, { status: 500 });
  }
}
