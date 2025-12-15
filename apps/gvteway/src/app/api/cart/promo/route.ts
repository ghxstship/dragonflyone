export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { withAuth, logger } from '@ghxstship/config';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

const applyPromoSchema = z.object({
  code: z.string().min(1).max(50),
});

// POST /api/cart/promo - Apply promo code to cart
export async function POST(request: NextRequest) {
  try {
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;
    
    const userId = authResult.user?.id;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validated = applyPromoSchema.parse(body);

    const supabase = getSupabaseClient();

    // Look up promo code
    const { data: promo, error: promoError } = await supabase
      .from('promo_codes')
      .select('*')
      .eq('code', validated.code.toUpperCase())
      .eq('is_active', true)
      .single();

    if (promoError || !promo) {
      return NextResponse.json({ error: 'Invalid promo code' }, { status: 400 });
    }

    // Check if promo code is expired
    if (promo.expires_at && new Date(promo.expires_at) < new Date()) {
      return NextResponse.json({ error: 'Promo code has expired' }, { status: 400 });
    }

    // Check usage limit
    if (promo.max_uses && promo.times_used >= promo.max_uses) {
      return NextResponse.json({ error: 'Promo code usage limit reached' }, { status: 400 });
    }

    // Get cart total to calculate discount
    const { data: cartItems } = await supabase
      .from('cart_items')
      .select('quantity, unit_price')
      .eq('user_id', userId);

    const cartTotal = (cartItems || []).reduce(
      (sum, item) => sum + (item.quantity * item.unit_price),
      0
    );

    // Calculate discount
    let discount = 0;
    if (promo.discount_type === 'percentage') {
      discount = (cartTotal * promo.discount_value) / 100;
      if (promo.max_discount && discount > promo.max_discount) {
        discount = promo.max_discount;
      }
    } else if (promo.discount_type === 'fixed') {
      discount = promo.discount_value;
    }

    // Check minimum purchase
    if (promo.minimum_purchase && cartTotal < promo.minimum_purchase) {
      return NextResponse.json({ 
        error: `Minimum purchase of $${promo.minimum_purchase} required` 
      }, { status: 400 });
    }

    // Update promo usage count
    await supabase
      .from('promo_codes')
      .update({ times_used: (promo.times_used || 0) + 1 })
      .eq('id', promo.id);

    // Store applied promo in session/cart
    await supabase
      .from('cart_promos')
      .upsert({
        user_id: userId,
        promo_code_id: promo.id,
        discount_amount: discount,
        applied_at: new Date().toISOString(),
      });

    return NextResponse.json({ 
      success: true,
      discount,
      promo_code: validated.code,
      message: 'Promo code applied successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    const msg = error instanceof Error ? error.message : '';
    if (msg.includes('does not exist') || msg.includes('42P01')) {
      return NextResponse.json({ error: 'Promo codes not available' }, { status: 400 });
    }
    logger.error('Error in POST /api/cart/promo:', error instanceof Error ? error : undefined);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/cart/promo - Remove promo code from cart
export async function DELETE(request: NextRequest) {
  try {
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;
    
    const userId = authResult.user?.id;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getSupabaseClient();

    await supabase
      .from('cart_promos')
      .delete()
      .eq('user_id', userId);

    return NextResponse.json({ success: true, message: 'Promo code removed' });
  } catch (error) {
    logger.error('Error in DELETE /api/cart/promo:', error instanceof Error ? error : undefined);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
