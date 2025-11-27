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

const splitPaymentSchema = z.object({
  order_id: z.string().uuid(),
  total_amount: z.number().min(0.01),
  splits: z.array(z.object({
    payment_method: z.string(),
    amount: z.number().min(0.01),
    payer_name: z.string().optional(),
    payer_email: z.string().email().optional(),
  })),
});

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('order_id');

    if (!orderId) return NextResponse.json({ error: 'order_id required' }, { status: 400 });

    const { data: splits, error } = await supabase
      .from('split_payments')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    const totalPaid = splits?.reduce((sum, s) => s.status === 'completed' ? sum + s.amount : sum, 0) || 0;

    return NextResponse.json({ splits, total_paid: totalPaid });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const body = await request.json();
    const action = body.action;

    if (action === 'create_split') {
      const validated = splitPaymentSchema.parse(body.data);

      // Validate total matches
      const splitTotal = validated.splits.reduce((sum, s) => sum + s.amount, 0);
      if (Math.abs(splitTotal - validated.total_amount) > 0.01) {
        return NextResponse.json({
          error: 'Split amounts do not match total',
          expected: validated.total_amount,
          actual: splitTotal,
        }, { status: 400 });
      }

      // Create split payment records
      const splitRecords = validated.splits.map((split, index) => ({
        order_id: validated.order_id,
        split_index: index + 1,
        payment_method: split.payment_method,
        amount: split.amount,
        payer_name: split.payer_name,
        payer_email: split.payer_email,
        status: 'pending',
        created_at: new Date().toISOString(),
      }));

      const { data: splits, error } = await supabase
        .from('split_payments')
        .insert(splitRecords)
        .select();

      if (error) throw error;
      return NextResponse.json({ splits }, { status: 201 });
    }

    if (action === 'process_split') {
      const { split_id, payment_details } = body.data;

      // Simulate payment processing
      const success = Math.random() > 0.02;

      const { data: split, error } = await supabase
        .from('split_payments')
        .update({
          status: success ? 'completed' : 'failed',
          transaction_id: success ? `SPL_${Date.now()}` : null,
          processed_at: new Date().toISOString(),
          error_message: success ? null : 'Payment failed',
        })
        .eq('id', split_id)
        .select()
        .single();

      if (error) throw error;

      // Check if all splits are completed
      const { data: allSplits } = await supabase
        .from('split_payments')
        .select('status')
        .eq('order_id', split.order_id);

      const allCompleted = allSplits?.every(s => s.status === 'completed');

      return NextResponse.json({
        split,
        success,
        order_complete: allCompleted,
      });
    }

    if (action === 'calculate_equal_split') {
      const { total_amount, num_payers } = body.data;

      const perPerson = Math.floor((total_amount / num_payers) * 100) / 100;
      const remainder = Math.round((total_amount - perPerson * num_payers) * 100) / 100;

      const splits = Array(num_payers).fill(null).map((_, i) => ({
        payer_index: i + 1,
        amount: i === 0 ? perPerson + remainder : perPerson,
      }));

      return NextResponse.json({ splits, per_person: perPerson });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
