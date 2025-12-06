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

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const period = searchParams.get('period');

    let query = supabase
      .from('orders')
      .select(`
        *,
        events (
          id,
          title,
          date,
          venue,
          image
        ),
        order_items (
          id,
          name,
          quantity,
          price,
          item_type
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    if (period && period !== 'all') {
      const now = new Date();
      let startDate: Date;
      
      switch (period) {
        case '30d':
          startDate = new Date(now.setDate(now.getDate() - 30));
          break;
        case '90d':
          startDate = new Date(now.setDate(now.getDate() - 90));
          break;
        case '1y':
          startDate = new Date(now.setFullYear(now.getFullYear() - 1));
          break;
        default:
          startDate = new Date(0);
      }
      
      query = query.gte('created_at', startDate.toISOString());
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
    }

    interface OrderEventInfo { title?: string; date?: string; venue?: string; image?: string }
    interface OrderItemInfo { id: string; name: string; quantity: number; price: number; item_type?: string }
    const orders = data?.map(order => {
      const event = order.events as OrderEventInfo | null;
      const items = (order.order_items || []) as OrderItemInfo[];
      return {
        id: order.id,
        order_number: order.order_number || `ORD-${order.id.substring(0, 8).toUpperCase()}`,
        event_title: event?.title,
        event_date: event?.date,
        event_venue: event?.venue,
        event_image: event?.image,
        items: items.map((item: OrderItemInfo) => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          type: item.item_type || 'ticket',
        })),
        subtotal: order.subtotal || 0,
        fees: order.fees || 0,
        tax: order.tax || 0,
        total: order.total || 0,
        status: order.status,
        payment_method: order.payment_method || 'Card',
        created_at: order.created_at,
      };
    }) || [];

    return NextResponse.json({ orders });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
