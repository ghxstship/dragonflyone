import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

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

const wristbandSchema = z.object({
  event_id: z.string().uuid(),
  wristband_id: z.string().min(1),
  user_id: z.string().uuid().optional(),
  initial_balance: z.number().min(0).default(0),
});

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('event_id');
    const wristbandId = searchParams.get('wristband_id');
    const userId = searchParams.get('user_id');

    if (wristbandId) {
      const { data: wristband, error } = await supabase
        .from('rfid_wristbands')
        .select(`*, user:platform_users(id, first_name, last_name, email)`)
        .eq('wristband_id', wristbandId)
        .single();

      if (error) throw error;

      // Get transaction history
      const { data: transactions } = await supabase
        .from('rfid_transactions')
        .select('*')
        .eq('wristband_id', wristband.id)
        .order('created_at', { ascending: false })
        .limit(20);

      return NextResponse.json({ wristband, transactions });
    }

    let query = supabase
      .from('rfid_wristbands')
      .select(`*, user:platform_users(id, first_name, last_name)`)
      .order('created_at', { ascending: false });

    if (eventId) query = query.eq('event_id', eventId);
    if (userId) query = query.eq('user_id', userId);

    const { data: wristbands, error } = await query;
    if (error) throw error;

    return NextResponse.json({ wristbands });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const body = await request.json();
    const action = body.action;

    if (action === 'register') {
      const validated = wristbandSchema.parse(body.data);

      const { data: wristband, error } = await supabase
        .from('rfid_wristbands')
        .insert({
          ...validated,
          balance: validated.initial_balance,
          status: 'active',
          activated_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ wristband }, { status: 201 });
    }

    if (action === 'top_up') {
      const { wristband_id, amount, payment_method } = body.data;

      const { data: wristband } = await supabase
        .from('rfid_wristbands')
        .select('id, balance')
        .eq('wristband_id', wristband_id)
        .single();

      if (!wristband) return NextResponse.json({ error: 'Wristband not found' }, { status: 404 });

      const newBalance = (wristband.balance || 0) + amount;

      await supabase
        .from('rfid_wristbands')
        .update({ balance: newBalance })
        .eq('id', wristband.id);

      // Log transaction
      await supabase.from('rfid_transactions').insert({
        wristband_id: wristband.id,
        transaction_type: 'top_up',
        amount,
        balance_after: newBalance,
        payment_method,
        created_at: new Date().toISOString(),
      });

      return NextResponse.json({ new_balance: newBalance });
    }

    if (action === 'purchase') {
      const { wristband_id, amount, description, terminal_id } = body.data;

      const { data: wristband } = await supabase
        .from('rfid_wristbands')
        .select('id, balance')
        .eq('wristband_id', wristband_id)
        .single();

      if (!wristband) return NextResponse.json({ error: 'Wristband not found' }, { status: 404 });
      if ((wristband.balance || 0) < amount) {
        return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 });
      }

      const newBalance = wristband.balance - amount;

      await supabase
        .from('rfid_wristbands')
        .update({ balance: newBalance })
        .eq('id', wristband.id);

      // Log transaction
      await supabase.from('rfid_transactions').insert({
        wristband_id: wristband.id,
        transaction_type: 'purchase',
        amount: -amount,
        balance_after: newBalance,
        description,
        terminal_id,
        created_at: new Date().toISOString(),
      });

      return NextResponse.json({ new_balance: newBalance, success: true });
    }

    if (action === 'refund') {
      const { wristband_id, amount, reason } = body.data;

      const { data: wristband } = await supabase
        .from('rfid_wristbands')
        .select('id, balance')
        .eq('wristband_id', wristband_id)
        .single();

      if (!wristband) return NextResponse.json({ error: 'Wristband not found' }, { status: 404 });

      const newBalance = (wristband.balance || 0) + amount;

      await supabase
        .from('rfid_wristbands')
        .update({ balance: newBalance })
        .eq('id', wristband.id);

      await supabase.from('rfid_transactions').insert({
        wristband_id: wristband.id,
        transaction_type: 'refund',
        amount,
        balance_after: newBalance,
        description: reason,
        created_at: new Date().toISOString(),
      });

      return NextResponse.json({ new_balance: newBalance });
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
    const { id, action } = body;

    if (action === 'deactivate') {
      const { data, error } = await supabase
        .from('rfid_wristbands')
        .update({ status: 'inactive' })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ wristband: data });
    }

    if (action === 'report_lost') {
      const { data, error } = await supabase
        .from('rfid_wristbands')
        .update({ status: 'lost' })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ wristband: data });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
