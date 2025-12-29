export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}



export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('ticket_deliveries')
      .select(`
        *,
        orders (
          id,
          events (
            id,
            title,
            date
          )
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
    }

    interface DeliveryOrderData { events?: { title?: string; date?: string } }
    const deliveries = data?.map(d => {
      const steps = getDeliverySteps(d.delivery_method, d.delivery_status);
      const orderData = d.orders as DeliveryOrderData | null;
      return {
        id: d.id,
        order_id: d.order_id,
        event_title: orderData?.events?.title,
        event_date: orderData?.events?.date,
        delivery_method: d.delivery_method,
        delivery_status: d.delivery_status,
        tracking_number: d.tracking_number,
        carrier: d.carrier,
        estimated_delivery: d.estimated_delivery,
        delivered_at: d.delivered_at,
        recipient_email: d.recipient_email,
        recipient_name: d.recipient_name,
        steps,
      };
    }) || [];

    return NextResponse.json({ deliveries });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

interface DeliveryStep { title: string; description: string }
function getDeliverySteps(method: string, status: string) {
  const baseSteps: DeliveryStep[] = [
    { title: 'Order Confirmed', description: 'Your order has been received' },
    { title: 'Processing', description: 'Preparing your tickets' },
  ];

  let deliverySteps: DeliveryStep[] = [];

  switch (method) {
    case 'email':
      deliverySteps = [
        ...baseSteps,
        { title: 'Sent', description: 'Tickets sent to your email' },
        { title: 'Delivered', description: 'Check your inbox' },
      ];
      break;
    case 'mobile':
      deliverySteps = [
        ...baseSteps,
        { title: 'Ready', description: 'Tickets added to your account' },
        { title: 'Available', description: 'View in your mobile wallet' },
      ];
      break;
    case 'physical':
      deliverySteps = [
        ...baseSteps,
        { title: 'Shipped', description: 'Package is on its way' },
        { title: 'In Transit', description: 'Package is being delivered' },
        { title: 'Delivered', description: 'Package delivered' },
      ];
      break;
    case 'will_call':
      deliverySteps = [
        ...baseSteps,
        { title: 'Ready', description: 'Tickets ready for pickup' },
        { title: 'Picked Up', description: 'Tickets collected at venue' },
      ];
      break;
    default:
      deliverySteps = baseSteps;
  }

  // Mark steps based on status
  const statusIndex = getStatusIndex(status, method);
  return deliverySteps.map((step, index) => ({
    ...step,
    status: index < statusIndex ? 'completed' : index === statusIndex ? 'current' : 'pending',
    timestamp: index <= statusIndex ? new Date().toISOString() : undefined,
  }));
}

function getStatusIndex(status: string, method: string): number {
  // Different delivery methods have different status flows
  const digitalStatusMap: Record<string, number> = {
    processing: 1,
    sent: 2,
    delivered: 3,
  };
  const willCallStatusMap: Record<string, number> = {
    processing: 1,
    ready: 2,
    picked_up: 3,
  };
  const statusMap = method === 'will_call' ? willCallStatusMap : digitalStatusMap;
  return statusMap[status] || 0;
}
