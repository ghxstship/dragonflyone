export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const createOrderSchema = z.object({
  organization_id: z.string().uuid(),
  vendor_profile_id: z.string().uuid(),
  booking_id: z.string().uuid().optional(),
  event_id: z.string().uuid().optional(),
  delivery_date: z.string().optional(),
  delivery_time: z.string().optional(),
  delivery_location: z.string().optional(),
  special_instructions: z.string().optional(),
  payment_terms: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(z.object({
    product_id: z.string().uuid().optional(),
    sku: z.string().optional(),
    name: z.string(),
    description: z.string().optional(),
    quantity: z.number().min(0.01),
    unit: z.string().optional(),
    unit_price: z.number().min(0),
    discount_percent: z.number().min(0).max(100).optional(),
    tax_rate: z.number().min(0).max(100).optional(),
    notes: z.string().optional(),
  })).min(1),
});

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { searchParams } = new URL(request.url);

    const orgId = searchParams.get('organization_id');
    const vendorId = searchParams.get('vendor_profile_id');
    const bookingId = searchParams.get('booking_id');
    const status = searchParams.get('status');

    if (!orgId) {
      return NextResponse.json({ error: 'organization_id required' }, { status: 400 });
    }

    let query = supabase
      .from('vendor_orders')
      .select(`
        *,
        vendor:vendor_profiles(id, name, logo_url),
        booking:bookings(id, booking_number, event_name),
        items:vendor_order_items(*)
      `)
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false });

    if (vendorId) query = query.eq('vendor_profile_id', vendorId);
    if (bookingId) query = query.eq('booking_id', bookingId);
    if (status) query = query.eq('status', status);

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ orders: data });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const body = await request.json();
    const payload = createOrderSchema.parse(body);

    const { items, ...orderData } = payload;

    let subtotal = 0;
    const orderItems = items.map((item, index) => {
      const discount = item.discount_percent || 0;
      const discountedPrice = item.unit_price * (1 - discount / 100);
      const itemTotal = discountedPrice * item.quantity;
      subtotal += itemTotal;

      return {
        ...item,
        total: itemTotal,
        sort_order: index,
      };
    });

    const taxAmount = subtotal * 0.08;
    const total = subtotal + taxAmount;

    const { data: order, error: orderError } = await supabase
      .from('vendor_orders')
      .insert({
        ...orderData,
        subtotal,
        tax_amount: taxAmount,
        total,
        status: 'draft',
      })
      .select()
      .single();

    if (orderError) {
      return NextResponse.json({ error: orderError.message }, { status: 500 });
    }

    const itemsWithOrderId = orderItems.map(item => ({
      ...item,
      order_id: order.id,
    }));

    const { error: itemsError } = await supabase
      .from('vendor_order_items')
      .insert(itemsWithOrderId);

    if (itemsError) {
      await supabase.from('vendor_orders').delete().eq('id', order.id);
      return NextResponse.json({ error: itemsError.message }, { status: 500 });
    }

    const { data: fullOrder } = await supabase
      .from('vendor_orders')
      .select(`
        *,
        vendor:vendor_profiles(id, name),
        items:vendor_order_items(*)
      `)
      .eq('id', order.id)
      .single();

    return NextResponse.json({ order: fullOrder }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 422 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
