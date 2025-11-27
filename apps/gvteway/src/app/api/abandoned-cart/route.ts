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

// Abandoned cart recovery automation
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Get user's abandoned carts
    const { data: carts, error } = await supabase.from('shopping_carts').select(`
      *, items:cart_items(*, product:products(id, name, price, images))
    `).eq('user_id', user.id).eq('status', 'abandoned');

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({
      abandoned_carts: carts,
      recovery_offers: carts?.map(cart => ({
        cart_id: cart.id,
        discount_code: cart.recovery_discount_code,
        discount_percent: cart.recovery_discount_percent || 10,
        expires_at: cart.recovery_expires_at
      })) || []
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch carts' }, { status: 500 });
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
    const { action, cart_id } = body;

    if (action === 'recover') {
      // Restore abandoned cart to active
      const { data: cart } = await supabase.from('shopping_carts').select('*')
        .eq('id', cart_id).eq('user_id', user.id).single();

      if (!cart) return NextResponse.json({ error: 'Cart not found' }, { status: 404 });

      await supabase.from('shopping_carts').update({
        status: 'active', recovered_at: new Date().toISOString()
      }).eq('id', cart_id);

      return NextResponse.json({ success: true, discount_code: cart.recovery_discount_code });
    }

    if (action === 'apply_recovery_discount') {
      const { discount_code } = body;

      const { data: cart } = await supabase.from('shopping_carts').select('*')
        .eq('recovery_discount_code', discount_code).eq('user_id', user.id).single();

      if (!cart) return NextResponse.json({ error: 'Invalid discount code' }, { status: 400 });
      if (new Date(cart.recovery_expires_at) < new Date()) {
        return NextResponse.json({ error: 'Discount code expired' }, { status: 400 });
      }

      return NextResponse.json({
        valid: true,
        discount_percent: cart.recovery_discount_percent || 10
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 });
  }
}

// This would typically be called by a scheduled job
export async function PATCH(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { action } = body;

    if (action === 'process_abandoned') {
      // Find carts inactive for more than 1 hour
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

      const { data: inactiveCarts } = await supabase.from('shopping_carts').select('*')
        .eq('status', 'active').lt('updated_at', oneHourAgo.toISOString());

      for (const cart of inactiveCarts || []) {
        const discountCode = `RECOVER-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
        const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 hours

        await supabase.from('shopping_carts').update({
          status: 'abandoned',
          abandoned_at: new Date().toISOString(),
          recovery_discount_code: discountCode,
          recovery_discount_percent: 10,
          recovery_expires_at: expiresAt.toISOString()
        }).eq('id', cart.id);

        // Queue recovery email
        await supabase.from('email_queue').insert({
          user_id: cart.user_id,
          template: 'abandoned_cart_recovery',
          data: { cart_id: cart.id, discount_code: discountCode },
          scheduled_for: new Date(Date.now() + 60 * 60 * 1000).toISOString() // 1 hour delay
        });
      }

      return NextResponse.json({ processed: inactiveCarts?.length || 0 });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 });
  }
}
