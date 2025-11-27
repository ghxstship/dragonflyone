import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@ghxstship/config';
import { z } from 'zod';

const cateringOrderSchema = z.object({
  event_id: z.string().uuid(),
  vendor_id: z.string().uuid().optional(),
  order_type: z.enum(['crew_meals', 'artist_hospitality', 'vip_catering', 'green_room', 'production_office']),
  delivery_time: z.string(),
  delivery_location: z.string().optional(),
  headcount: z.number().int().positive(),
  dietary_requirements: z.object({
    vegetarian: z.number().int().nonnegative().optional(),
    vegan: z.number().int().nonnegative().optional(),
    gluten_free: z.number().int().nonnegative().optional(),
    halal: z.number().int().nonnegative().optional(),
    kosher: z.number().int().nonnegative().optional(),
    allergies: z.array(z.string()).optional(),
  }).optional(),
  menu_items: z.array(z.object({
    name: z.string(),
    quantity: z.number().int().positive(),
    unit_price: z.number().nonnegative().optional(),
    notes: z.string().optional(),
  })).optional(),
  total_cost: z.number().nonnegative().optional(),
  notes: z.string().optional(),
});

// GET /api/catering - List catering orders
export async function GET(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('event_id');
    const status = searchParams.get('status');
    const orderType = searchParams.get('order_type');
    const vendorId = searchParams.get('vendor_id');

    let query = supabase
      .from('catering_orders')
      .select(`
        *,
        event:events(id, name, start_date),
        vendor:vendors(id, name, contact_name, phone)
      `)
      .order('delivery_time', { ascending: true });

    if (eventId) {
      query = query.eq('event_id', eventId);
    }
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }
    if (orderType) {
      query = query.eq('order_type', orderType);
    }
    if (vendorId) {
      query = query.eq('vendor_id', vendorId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching catering orders:', error);
      return NextResponse.json(
        { error: 'Failed to fetch catering orders', details: error.message },
        { status: 500 }
      );
    }

    interface CateringRecord {
      id: string;
      status: string;
      order_type: string;
      headcount: number;
      total_cost: number;
      [key: string]: unknown;
    }
    const orders = (data || []) as unknown as CateringRecord[];

    const summary = {
      total_orders: orders.length,
      by_status: {
        pending: orders.filter(o => o.status === 'pending').length,
        confirmed: orders.filter(o => o.status === 'confirmed').length,
        delivered: orders.filter(o => o.status === 'delivered').length,
        cancelled: orders.filter(o => o.status === 'cancelled').length,
      },
      by_type: orders.reduce((acc, o) => {
        acc[o.order_type] = (acc[o.order_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      total_headcount: orders.reduce((sum, o) => sum + (o.headcount || 0), 0),
      total_cost: orders.reduce((sum, o) => sum + (o.total_cost || 0), 0),
    };

    return NextResponse.json({ orders: data, summary });
  } catch (error) {
    console.error('Error in GET /api/catering:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/catering - Create catering order
export async function POST(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    const body = await request.json();
    const validated = cateringOrderSchema.parse(body);

    const userId = body.user_id || '00000000-0000-0000-0000-000000000000';

    const { data: order, error } = await supabase
      .from('catering_orders')
      .insert({
        ...validated,
        created_by: userId,
        status: 'pending',
      })
      .select(`
        *,
        event:events(id, name),
        vendor:vendors(id, name)
      `)
      .single();

    if (error) {
      console.error('Error creating catering order:', error);
      return NextResponse.json(
        { error: 'Failed to create catering order', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error in POST /api/catering:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/catering - Update catering order status
export async function PATCH(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    const body = await request.json();
    const { order_id, action, updates } = body;

    if (!order_id) {
      return NextResponse.json({ error: 'order_id is required' }, { status: 400 });
    }

    let updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };

    if (action === 'confirm') {
      updateData.status = 'confirmed';
    } else if (action === 'deliver') {
      updateData.status = 'delivered';
    } else if (action === 'cancel') {
      updateData.status = 'cancelled';
    } else if (updates) {
      const validated = cateringOrderSchema.partial().parse(updates);
      updateData = { ...updateData, ...validated };
    }

    const { data, error } = await supabase
      .from('catering_orders')
      .update(updateData)
      .eq('id', order_id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to update catering order', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, order: data });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error in PATCH /api/catering:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/catering - Delete catering order
export async function DELETE(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('order_id');

    if (!orderId) {
      return NextResponse.json({ error: 'order_id is required' }, { status: 400 });
    }

    // Only allow deletion of pending orders
    const { data: order } = await supabase
      .from('catering_orders')
      .select('status')
      .eq('id', orderId)
      .single();

    if (order?.status !== 'pending') {
      return NextResponse.json(
        { error: 'Only pending orders can be deleted' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('catering_orders')
      .delete()
      .eq('id', orderId);

    if (error) {
      return NextResponse.json(
        { error: 'Failed to delete catering order', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: 'Catering order deleted' });
  } catch (error) {
    console.error('Error in DELETE /api/catering:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
