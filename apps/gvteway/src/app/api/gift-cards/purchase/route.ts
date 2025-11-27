import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { randomBytes } from 'crypto';

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

function generateGiftCardCode(): string {
  const bytes = randomBytes(8);
  const hex = bytes.toString('hex').toUpperCase();
  return `${hex.slice(0, 4)}-${hex.slice(4, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}`;
}

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
    const { amount, design, recipient_email, recipient_name, message, delivery_date } = body;

    if (!amount || amount < 10 || amount > 1000) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    if (!recipient_email) {
      return NextResponse.json({ error: 'Recipient email is required' }, { status: 400 });
    }

    const code = generateGiftCardCode();
    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 2); // 2 year expiry

    const { data: giftCard, error } = await supabase
      .from('gift_cards')
      .insert({
        code,
        purchaser_id: user.id,
        initial_balance: amount,
        current_balance: amount,
        design,
        recipient_email,
        recipient_name,
        message,
        delivery_date: delivery_date || null,
        expires_at: expiresAt.toISOString(),
        status: 'active',
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // TODO: Send email to recipient (would be handled by edge function)

    return NextResponse.json({ gift_card: giftCard }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
