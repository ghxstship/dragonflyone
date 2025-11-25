import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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

    // Get cards purchased by user or redeemed by user
    const { data, error } = await supabase
      .from('gift_cards')
      .select('*')
      .or(`purchaser_id.eq.${user.id},redeemed_by.eq.${user.id}`)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const cards = data?.map(card => ({
      id: card.id,
      code: card.code,
      initial_balance: card.initial_balance,
      current_balance: card.current_balance,
      status: card.status,
      expires_at: card.expires_at,
      purchased_at: card.created_at,
      recipient_email: card.recipient_email,
      recipient_name: card.recipient_name,
      message: card.message,
    })) || [];

    return NextResponse.json({ cards });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
