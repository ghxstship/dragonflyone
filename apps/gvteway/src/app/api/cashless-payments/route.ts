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

const paymentSchema = z.object({
  amount: z.number().min(0.01),
  payment_method: z.enum(['tap', 'chip', 'swipe', 'nfc', 'apple_pay', 'google_pay']),
  terminal_id: z.string().uuid().optional(),
  order_id: z.string().uuid().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const terminalId = searchParams.get('terminal_id');

    if (type === 'methods') {
      const methods = [
        { id: 'tap', name: 'Contactless Tap', icon: 'contactless', enabled: true },
        { id: 'chip', name: 'Chip Card', icon: 'credit-card', enabled: true },
        { id: 'swipe', name: 'Magnetic Swipe', icon: 'credit-card', enabled: true },
        { id: 'nfc', name: 'NFC', icon: 'nfc', enabled: true },
        { id: 'apple_pay', name: 'Apple Pay', icon: 'apple', enabled: true },
        { id: 'google_pay', name: 'Google Pay', icon: 'google', enabled: true },
      ];
      return NextResponse.json({ payment_methods: methods });
    }

    if (type === 'transactions' && terminalId) {
      const { data: transactions, error } = await supabase
        .from('cashless_transactions')
        .select('*')
        .eq('terminal_id', terminalId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return NextResponse.json({ transactions });
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const body = await request.json();
    const action = body.action;

    if (action === 'process') {
      const validated = paymentSchema.parse(body.data);

      // Simulate payment processing
      const transactionId = `TXN_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      const success = Math.random() > 0.02; // 98% success rate

      const { data: transaction, error } = await supabase
        .from('cashless_transactions')
        .insert({
          transaction_id: transactionId,
          amount: validated.amount,
          payment_method: validated.payment_method,
          terminal_id: validated.terminal_id,
          order_id: validated.order_id,
          status: success ? 'completed' : 'failed',
          error_message: success ? null : 'Card declined',
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      if (!success) {
        return NextResponse.json({
          success: false,
          error: 'Payment declined',
          transaction_id: transactionId,
        }, { status: 400 });
      }

      return NextResponse.json({
        success: true,
        transaction_id: transactionId,
        transaction,
      }, { status: 201 });
    }

    if (action === 'refund') {
      const { transaction_id, amount, reason } = body.data;

      const { data: original } = await supabase
        .from('cashless_transactions')
        .select('*')
        .eq('transaction_id', transaction_id)
        .single();

      if (!original) return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });

      const refundAmount = amount || original.amount;
      const refundId = `REF_${Date.now()}_${Math.random().toString(36).substring(7)}`;

      const { data: refund, error } = await supabase
        .from('cashless_transactions')
        .insert({
          transaction_id: refundId,
          original_transaction_id: transaction_id,
          amount: -refundAmount,
          payment_method: original.payment_method,
          terminal_id: original.terminal_id,
          status: 'completed',
          refund_reason: reason,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ refund }, { status: 201 });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
