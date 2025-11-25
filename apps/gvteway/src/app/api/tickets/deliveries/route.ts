import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
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
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const deliveries = data?.map(d => {
      const steps = getDeliverySteps(d.delivery_method, d.delivery_status);
      return {
        id: d.id,
        order_id: d.order_id,
        event_title: (d.orders as any)?.events?.title,
        event_date: (d.orders as any)?.events?.date,
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

function getDeliverySteps(method: string, status: string) {
  const baseSteps = [
    { title: 'Order Confirmed', description: 'Your order has been received' },
    { title: 'Processing', description: 'Preparing your tickets' },
  ];

  let deliverySteps: any[] = [];

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
  const statusMap: Record<string, number> = {
    processing: 1,
    sent: 2,
    delivered: 3,
    ready: 2,
  };
  return statusMap[status] || 0;
}
