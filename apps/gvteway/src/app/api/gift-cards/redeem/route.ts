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

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { code } = body;

    if (!code) {
      return NextResponse.json({ error: 'Gift card code is required' }, { status: 400 });
    }

    // Find the gift card
    const { data: giftCard, error: findError } = await supabase
      .from('gift_cards')
      .select('*')
      .eq('code', code.toUpperCase())
      .single();

    if (findError || !giftCard) {
      return NextResponse.json({ error: 'Invalid gift card code' }, { status: 404 });
    }

    if (giftCard.status !== 'active') {
      return NextResponse.json({ error: 'Gift card is not active' }, { status: 400 });
    }

    if (giftCard.expires_at && new Date(giftCard.expires_at) < new Date()) {
      return NextResponse.json({ error: 'Gift card has expired' }, { status: 400 });
    }

    if (giftCard.current_balance <= 0) {
      return NextResponse.json({ error: 'Gift card has no balance' }, { status: 400 });
    }

    // Add balance to user's store credit
    const { data: existingCredit } = await supabase
      .from('user_store_credits')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (existingCredit) {
      await supabase
        .from('user_store_credits')
        .update({
          balance: existingCredit.balance + giftCard.current_balance,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);
    } else {
      await supabase
        .from('user_store_credits')
        .insert({
          user_id: user.id,
          balance: giftCard.current_balance,
        });
    }

    // Mark gift card as redeemed
    await supabase
      .from('gift_cards')
      .update({
        status: 'redeemed',
        redeemed_by: user.id,
        redeemed_at: new Date().toISOString(),
        current_balance: 0,
      })
      .eq('id', giftCard.id);

    // Record the transaction
    await supabase
      .from('gift_card_transactions')
      .insert({
        gift_card_id: giftCard.id,
        user_id: user.id,
        type: 'redeem',
        amount: giftCard.current_balance,
      });

    return NextResponse.json({
      success: true,
      balance: giftCard.current_balance,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
