import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

const subscriptionSchema = z.object({
  box_id: z.string().uuid(),
  frequency: z.enum(['monthly', 'quarterly', 'biannual', 'annual']),
  shipping_address: z.object({
    street: z.string(),
    city: z.string(),
    state: z.string(),
    zip: z.string(),
    country: z.string(),
  }),
});

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const userId = searchParams.get('user_id');
    const boxId = searchParams.get('box_id');

    if (type === 'boxes') {
      const { data: boxes, error } = await supabase
        .from('subscription_boxes')
        .select('*')
        .eq('status', 'active')
        .order('price');

      if (error) throw error;
      return NextResponse.json({ boxes });
    }

    if (type === 'my_subscriptions' && userId) {
      const { data: subscriptions, error } = await supabase
        .from('box_subscriptions')
        .select(`*, box:subscription_boxes(id, name, description, price)`)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return NextResponse.json({ subscriptions });
    }

    if (type === 'shipments' && userId) {
      const { data: shipments, error } = await supabase
        .from('box_shipments')
        .select(`*, subscription:box_subscriptions(box:subscription_boxes(name))`)
        .eq('subscription.user_id', userId)
        .order('ship_date', { ascending: false });

      if (error) throw error;
      return NextResponse.json({ shipments });
    }

    if (boxId) {
      const { data: box, error } = await supabase
        .from('subscription_boxes')
        .select(`*, items:subscription_box_items(*, product:products(id, name, image_url))`)
        .eq('id', boxId)
        .single();

      if (error) throw error;
      return NextResponse.json({ box });
    }

    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const body = await request.json();
    const action = body.action;

    if (action === 'create_box') {
      const { name, description, price, frequency_options, image_url } = body.data;

      const { data: box, error } = await supabase
        .from('subscription_boxes')
        .insert({
          name,
          description,
          price,
          frequency_options,
          image_url,
          status: 'active',
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ box }, { status: 201 });
    }

    if (action === 'subscribe') {
      const validated = subscriptionSchema.parse(body.data);
      const userId = body.user_id;

      // Get box price
      const { data: box } = await supabase
        .from('subscription_boxes')
        .select('price')
        .eq('id', validated.box_id)
        .single();

      // Calculate next ship date
      const nextShipDate = new Date();
      nextShipDate.setDate(nextShipDate.getDate() + 7);

      const { data: subscription, error } = await supabase
        .from('box_subscriptions')
        .insert({
          user_id: userId,
          box_id: validated.box_id,
          frequency: validated.frequency,
          shipping_address: validated.shipping_address,
          price: box?.price,
          status: 'active',
          next_ship_date: nextShipDate.toISOString(),
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ subscription }, { status: 201 });
    }

    if (action === 'add_item_to_box') {
      const { box_id, product_id, quantity } = body.data;

      const { data: item, error } = await supabase
        .from('subscription_box_items')
        .insert({ box_id, product_id, quantity: quantity || 1 })
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ item }, { status: 201 });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const body = await request.json();
    const { id, action, ...updates } = body;

    if (action === 'pause') {
      const { data, error } = await supabase
        .from('box_subscriptions')
        .update({ status: 'paused' })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ subscription: data });
    }

    if (action === 'resume') {
      const nextShipDate = new Date();
      nextShipDate.setDate(nextShipDate.getDate() + 7);

      const { data, error } = await supabase
        .from('box_subscriptions')
        .update({ status: 'active', next_ship_date: nextShipDate.toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ subscription: data });
    }

    if (action === 'cancel') {
      const { data, error } = await supabase
        .from('box_subscriptions')
        .update({ status: 'cancelled', cancelled_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ subscription: data });
    }

    if (action === 'update_address') {
      const { data, error } = await supabase
        .from('box_subscriptions')
        .update({ shipping_address: updates.shipping_address })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ subscription: data });
    }

    const { data, error } = await supabase
      .from('box_subscriptions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ subscription: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
