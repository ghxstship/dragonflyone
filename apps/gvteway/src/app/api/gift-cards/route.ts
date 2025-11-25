import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - Fetch user's gift cards
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'purchased', 'received', 'all'

    let query = supabase
      .from('gift_cards')
      .select('*');

    if (type === 'purchased') {
      query = query.eq('purchaser_id', user.id);
    } else if (type === 'received') {
      query = query.eq('recipient_email', user.email);
    } else {
      query = query.or(`purchaser_id.eq.${user.id},recipient_email.eq.${user.email}`);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ gift_cards: data });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch gift cards' },
      { status: 500 }
    );
  }
}

// POST - Purchase gift card
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      amount,
      recipient_email,
      recipient_name,
      message,
      delivery_date,
      design_template,
    } = body;

    // Validate amount
    if (amount < 10 || amount > 500) {
      return NextResponse.json(
        { error: 'Amount must be between $10 and $500' },
        { status: 400 }
      );
    }

    // Generate unique code
    const code = generateGiftCardCode();

    const { data: giftCard, error } = await supabase
      .from('gift_cards')
      .insert({
        code,
        initial_amount: amount,
        current_balance: amount,
        purchaser_id: user.id,
        recipient_email,
        recipient_name,
        message,
        delivery_date: delivery_date || new Date().toISOString(),
        design_template: design_template || 'default',
        status: 'active',
        expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // TODO: Process payment and send email to recipient

    return NextResponse.json({ gift_card: giftCard }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create gift card' },
      { status: 500 }
    );
  }
}

// PATCH - Redeem gift card
export async function PATCH(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { code, amount } = body;

    // Find gift card
    const { data: giftCard, error: findError } = await supabase
      .from('gift_cards')
      .select('*')
      .eq('code', code.toUpperCase())
      .eq('status', 'active')
      .single();

    if (findError || !giftCard) {
      return NextResponse.json({ error: 'Invalid gift card code' }, { status: 404 });
    }

    // Check expiration
    if (new Date(giftCard.expires_at) < new Date()) {
      return NextResponse.json({ error: 'Gift card has expired' }, { status: 400 });
    }

    // Check balance
    if (amount > giftCard.current_balance) {
      return NextResponse.json({
        error: 'Insufficient balance',
        available_balance: giftCard.current_balance,
      }, { status: 400 });
    }

    const newBalance = giftCard.current_balance - amount;

    // Update balance
    const { error: updateError } = await supabase
      .from('gift_cards')
      .update({
        current_balance: newBalance,
        status: newBalance === 0 ? 'redeemed' : 'active',
        redeemed_by: user.id,
        last_used_at: new Date().toISOString(),
      })
      .eq('id', giftCard.id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // Record transaction
    await supabase.from('gift_card_transactions').insert({
      gift_card_id: giftCard.id,
      user_id: user.id,
      amount: -amount,
      balance_after: newBalance,
      transaction_type: 'redemption',
    });

    return NextResponse.json({
      success: true,
      amount_applied: amount,
      remaining_balance: newBalance,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to redeem gift card' },
      { status: 500 }
    );
  }
}

function generateGiftCardCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 16; i++) {
    if (i > 0 && i % 4 === 0) code += '-';
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}
