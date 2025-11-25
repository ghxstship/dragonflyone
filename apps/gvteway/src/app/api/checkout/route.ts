import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const checkoutSchema = z.object({
  event_id: z.string().uuid(),
  items: z.array(z.object({
    ticket_type_id: z.string().uuid(),
    quantity: z.number().int().min(1).max(10),
  })),
  addons: z.array(z.object({
    addon_id: z.string().uuid(),
    quantity: z.number().int().min(1),
  })).optional(),
  promo_code: z.string().optional(),
  gift_card_code: z.string().optional(),
  customer_info: z.object({
    email: z.string().email(),
    first_name: z.string().min(1),
    last_name: z.string().min(1),
    phone: z.string().optional(),
  }),
  billing_address: z.object({
    line1: z.string(),
    line2: z.string().optional(),
    city: z.string(),
    state: z.string(),
    postal_code: z.string(),
    country: z.string().default('US'),
  }).optional(),
  delivery_method: z.enum(['digital', 'will_call', 'mail']).default('digital'),
});

// POST /api/checkout - Create checkout session
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = checkoutSchema.parse(body);

    // Get user if authenticated
    let userId = null;
    const authHeader = request.headers.get('authorization');
    if (authHeader) {
      const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
      userId = user?.id;
    }

    // Validate event exists and is on sale
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id, name, status, start_date')
      .eq('id', validated.event_id)
      .single();

    if (eventError || !event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    if (event.status !== 'on_sale') {
      return NextResponse.json({ error: 'Event is not currently on sale' }, { status: 400 });
    }

    // Calculate totals
    let subtotal = 0;
    const lineItems = [];

    // Process ticket items
    for (const item of validated.items) {
      const { data: ticketType, error: ticketError } = await supabase
        .from('ticket_types')
        .select('*')
        .eq('id', item.ticket_type_id)
        .single();

      if (ticketError || !ticketType) {
        return NextResponse.json({ error: `Ticket type not found: ${item.ticket_type_id}` }, { status: 404 });
      }

      if (ticketType.available < item.quantity) {
        return NextResponse.json({
          error: `Insufficient tickets available for ${ticketType.name}`,
          available: ticketType.available,
        }, { status: 400 });
      }

      const itemTotal = ticketType.price * item.quantity;
      subtotal += itemTotal;

      lineItems.push({
        type: 'ticket',
        ticket_type_id: item.ticket_type_id,
        name: ticketType.name,
        quantity: item.quantity,
        unit_price: ticketType.price,
        total: itemTotal,
      });
    }

    // Process addons
    if (validated.addons && validated.addons.length > 0) {
      for (const addon of validated.addons) {
        const { data: addonData, error: addonError } = await supabase
          .from('ticket_addons')
          .select('*')
          .eq('id', addon.addon_id)
          .single();

        if (addonError || !addonData) {
          return NextResponse.json({ error: `Addon not found: ${addon.addon_id}` }, { status: 404 });
        }

        const available = addonData.quantity_available - addonData.quantity_sold;
        if (available < addon.quantity) {
          return NextResponse.json({
            error: `Insufficient quantity for ${addonData.name}`,
            available,
          }, { status: 400 });
        }

        const itemTotal = addonData.price * addon.quantity;
        subtotal += itemTotal;

        lineItems.push({
          type: 'addon',
          addon_id: addon.addon_id,
          name: addonData.name,
          quantity: addon.quantity,
          unit_price: addonData.price,
          total: itemTotal,
        });
      }
    }

    // Apply promo code discount
    let discountAmount = 0;
    let promoCodeId = null;
    if (validated.promo_code) {
      const { data: promoResult } = await supabase.rpc('validate_promo_code', {
        p_code: validated.promo_code,
        p_event_id: validated.event_id,
        p_user_id: userId,
      });

      if (promoResult?.[0]?.is_valid) {
        promoCodeId = promoResult[0].promo_code_id;
        if (promoResult[0].discount_type === 'percentage') {
          discountAmount = subtotal * (promoResult[0].discount_value / 100);
        } else if (promoResult[0].discount_type === 'fixed') {
          discountAmount = promoResult[0].discount_value;
        }
      }
    }

    // Apply gift card
    let giftCardAmount = 0;
    let giftCardId = null;
    if (validated.gift_card_code) {
      const { data: giftCardResult } = await supabase.rpc('check_gift_card_balance', {
        p_code: validated.gift_card_code,
      });

      if (giftCardResult?.[0]?.is_valid) {
        giftCardId = validated.gift_card_code;
        giftCardAmount = Math.min(giftCardResult[0].balance, subtotal - discountAmount);
      }
    }

    // Calculate fees and total
    const serviceFee = subtotal * 0.10; // 10% service fee
    const facilityFee = lineItems.filter(i => i.type === 'ticket').reduce((sum, i) => sum + (i.quantity * 2.50), 0);
    const taxRate = 0.0825; // 8.25% tax
    const taxableAmount = subtotal - discountAmount;
    const taxAmount = taxableAmount * taxRate;
    const totalAmount = subtotal + serviceFee + facilityFee + taxAmount - discountAmount - giftCardAmount;

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        event_id: validated.event_id,
        customer_id: userId,
        customer_email: validated.customer_info.email,
        customer_name: `${validated.customer_info.first_name} ${validated.customer_info.last_name}`,
        customer_phone: validated.customer_info.phone,
        status: 'pending',
        order_type: 'purchase',
        subtotal,
        service_fee: serviceFee,
        facility_fee: facilityFee,
        tax_amount: taxAmount,
        discount_amount: discountAmount,
        total_amount: totalAmount,
        promo_code_id: promoCodeId,
        promo_code: validated.promo_code,
        delivery_method: validated.delivery_method,
        billing_address: validated.billing_address,
        expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 min expiry
      })
      .select()
      .single();

    if (orderError) {
      return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
    }

    // Reserve tickets
    for (const item of validated.items) {
      await supabase
        .from('ticket_types')
        .update({
          reserved: supabase.rpc('increment', { x: item.quantity }),
        })
        .eq('id', item.ticket_type_id);
    }

    return NextResponse.json({
      order_id: order.id,
      order_number: orderNumber,
      summary: {
        subtotal,
        service_fee: serviceFee,
        facility_fee: facilityFee,
        tax_amount: taxAmount,
        discount_amount: discountAmount,
        gift_card_amount: giftCardAmount,
        total_amount: totalAmount,
      },
      line_items: lineItems,
      expires_at: order.expires_at,
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to process checkout' },
      { status: 500 }
    );
  }
}

// GET /api/checkout - Get checkout session status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('order_id');

    if (!orderId) {
      return NextResponse.json({ error: 'order_id is required' }, { status: 400 });
    }

    const { data: order, error } = await supabase
      .from('orders')
      .select(`
        *,
        event:events(id, name, start_date, venue_id),
        tickets(*)
      `)
      .eq('id', orderId)
      .single();

    if (error || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Check if expired
    if (order.status === 'pending' && new Date(order.expires_at) < new Date()) {
      await supabase
        .from('orders')
        .update({ status: 'expired' })
        .eq('id', orderId);

      return NextResponse.json({
        order,
        status: 'expired',
        message: 'Checkout session has expired',
      });
    }

    return NextResponse.json({ order });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch checkout status' },
      { status: 500 }
    );
  }
}
