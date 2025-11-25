import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.json(
        { error: 'Tracking code is required' },
        { status: 400 }
      );
    }

    // Search by order_id or tracking_number
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
      .or(`order_id.eq.${code},tracking_number.eq.${code}`)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: 'No delivery found with that tracking code' },
        { status: 404 }
      );
    }

    const steps = getDeliverySteps(data.delivery_method, data.delivery_status);
    const delivery = {
      id: data.id,
      order_id: data.order_id,
      event_title: (data.orders as any)?.events?.title,
      event_date: (data.orders as any)?.events?.date,
      delivery_method: data.delivery_method,
      delivery_status: data.delivery_status,
      tracking_number: data.tracking_number,
      carrier: data.carrier,
      estimated_delivery: data.estimated_delivery,
      delivered_at: data.delivered_at,
      recipient_email: data.recipient_email,
      recipient_name: data.recipient_name,
      steps,
    };

    return NextResponse.json({ delivery });
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

  let deliverySteps: { title: string; description: string }[] = [];

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

  const statusIndex = getStatusIndex(status);
  return deliverySteps.map((step, index) => ({
    ...step,
    status: index < statusIndex ? 'completed' as const : index === statusIndex ? 'current' as const : 'pending' as const,
    timestamp: index <= statusIndex ? new Date().toISOString() : undefined,
  }));
}

function getStatusIndex(status: string): number {
  const statusMap: Record<string, number> = {
    processing: 1,
    sent: 2,
    delivered: 3,
    ready: 2,
  };
  return statusMap[status] || 0;
}
