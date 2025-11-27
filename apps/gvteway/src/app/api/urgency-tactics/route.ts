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
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('event_id');
    const type = searchParams.get('type');

    if (!eventId) return NextResponse.json({ error: 'event_id required' }, { status: 400 });

    if (type === 'countdown') {
      const { data: event } = await supabase
        .from('events')
        .select('start_date, sale_end_date')
        .eq('id', eventId)
        .single();

      if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 });

      const now = new Date();
      const eventDate = new Date(event.start_date);
      const saleEnd = event.sale_end_date ? new Date(event.sale_end_date) : eventDate;

      const msUntilEvent = eventDate.getTime() - now.getTime();
      const msUntilSaleEnd = saleEnd.getTime() - now.getTime();

      return NextResponse.json({
        event_countdown: {
          days: Math.floor(msUntilEvent / (1000 * 60 * 60 * 24)),
          hours: Math.floor((msUntilEvent % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((msUntilEvent % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((msUntilEvent % (1000 * 60)) / 1000),
        },
        sale_countdown: {
          days: Math.floor(msUntilSaleEnd / (1000 * 60 * 60 * 24)),
          hours: Math.floor((msUntilSaleEnd % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((msUntilSaleEnd % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((msUntilSaleEnd % (1000 * 60)) / 1000),
        },
      });
    }

    if (type === 'inventory') {
      const { data: ticketTypes } = await supabase
        .from('ticket_types')
        .select('id, name, quantity, sold_count')
        .eq('event_id', eventId);

      const inventoryAlerts = ticketTypes?.map(tt => {
        const remaining = tt.quantity - (tt.sold_count || 0);
        const percentSold = tt.quantity > 0 ? ((tt.sold_count || 0) / tt.quantity * 100) : 0;

        let urgencyLevel = 'normal';
        let message = null;

        if (remaining <= 0) {
          urgencyLevel = 'sold_out';
          message = 'Sold Out';
        } else if (remaining <= 5) {
          urgencyLevel = 'critical';
          message = `Only ${remaining} left!`;
        } else if (remaining <= 20) {
          urgencyLevel = 'low';
          message = `Less than ${remaining} remaining`;
        } else if (percentSold >= 80) {
          urgencyLevel = 'high_demand';
          message = 'Selling fast!';
        }

        return {
          ticket_type_id: tt.id,
          ticket_type_name: tt.name,
          remaining,
          percent_sold: Math.round(percentSold),
          urgency_level: urgencyLevel,
          message,
        };
      });

      return NextResponse.json({ inventory_alerts: inventoryAlerts });
    }

    if (type === 'social_proof') {
      // Get recent purchases
      const { data: recentPurchases } = await supabase
        .from('orders')
        .select('created_at')
        .eq('event_id', eventId)
        .gte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false });

      // Get current viewers (simulated)
      const currentViewers = Math.floor(Math.random() * 50) + 10;

      // Get total sold
      const { count: totalSold } = await supabase
        .from('tickets')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', eventId)
        .eq('status', 'sold');

      return NextResponse.json({
        social_proof: {
          recent_purchases_1h: recentPurchases?.length || 0,
          current_viewers: currentViewers,
          total_sold: totalSold || 0,
          messages: [
            recentPurchases && recentPurchases.length > 0 
              ? `${recentPurchases.length} people bought tickets in the last hour` 
              : null,
            currentViewers > 20 ? `${currentViewers} people viewing this event` : null,
            totalSold && totalSold > 100 ? `${totalSold}+ tickets sold` : null,
          ].filter(Boolean),
        },
      });
    }

    // Get all urgency data
    const [countdown, inventory, socialProof] = await Promise.all([
      fetch(`${request.url}&type=countdown`).then(r => r.json()),
      fetch(`${request.url}&type=inventory`).then(r => r.json()),
      fetch(`${request.url}&type=social_proof`).then(r => r.json()),
    ]);

    return NextResponse.json({
      countdown: countdown.event_countdown,
      sale_countdown: countdown.sale_countdown,
      inventory_alerts: inventory.inventory_alerts,
      social_proof: socialProof.social_proof,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const body = await request.json();
    const { event_id, tactic_type, config } = body;

    const { data: tactic, error } = await supabase
      .from('urgency_tactics')
      .upsert({
        event_id,
        tactic_type,
        config,
        enabled: true,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'event_id,tactic_type' })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ tactic }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
