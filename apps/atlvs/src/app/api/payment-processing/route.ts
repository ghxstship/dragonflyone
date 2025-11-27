import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { z } from 'zod';

// Validation schemas
const paymentSchema = z.object({
  payment_type: z.enum(['vendor', 'employee', 'refund', 'transfer']),
  payee_type: z.enum(['vendor', 'employee', 'customer', 'other']),
  payee_id: z.string().uuid(),
  amount: z.number().positive(),
  currency: z.string().default('USD'),
  payment_method: z.enum(['ach', 'wire', 'check', 'credit_card', 'debit_card', 'cash']),
  payment_date: z.string().datetime(),
  reference_ids: z.array(z.string().uuid()).optional(), // Invoice IDs, expense IDs, etc.
  memo: z.string().optional(),
  bank_account_id: z.string().uuid().optional(),
});

const achPaymentSchema = z.object({
  payee_name: z.string(),
  routing_number: z.string().length(9),
  account_number: z.string().min(4),
  account_type: z.enum(['checking', 'savings']),
  amount: z.number().positive(),
  payment_date: z.string().datetime(),
  memo: z.string().optional(),
});

const wirePaymentSchema = z.object({
  beneficiary_name: z.string(),
  beneficiary_address: z.string().optional(),
  bank_name: z.string(),
  bank_address: z.string().optional(),
  routing_number: z.string(),
  account_number: z.string(),
  swift_code: z.string().optional(),
  amount: z.number().positive(),
  currency: z.string().default('USD'),
  purpose: z.string().optional(),
});

const checkSchema = z.object({
  payee_name: z.string(),
  payee_address: z.string().optional(),
  amount: z.number().positive(),
  check_number: z.string().optional(),
  memo: z.string().optional(),
  print_date: z.string().datetime().optional(),
});

// GET - Get payment data
export async function GET(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'payments' | 'pending' | 'batches' | 'methods' | 'history'
    const payeeId = searchParams.get('payee_id');
    const paymentMethod = searchParams.get('method');
    const status = searchParams.get('status');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    if (type === 'payments') {
      let query = supabase
        .from('payments')
        .select(`
          *,
          bank_account:bank_accounts(id, name, account_number)
        `, { count: 'exact' })
        .order('payment_date', { ascending: false });

      if (payeeId) query = query.eq('payee_id', payeeId);
      if (paymentMethod) query = query.eq('payment_method', paymentMethod);
      if (status) query = query.eq('status', status);
      if (startDate) query = query.gte('payment_date', startDate);
      if (endDate) query = query.lte('payment_date', endDate);

      const { data: payments, error, count } = await query.range(offset, offset + limit - 1);

      if (error) throw error;

      return NextResponse.json({
        payments,
        total: count,
        page,
        limit,
      });
    }

    if (type === 'pending') {
      // Get pending payments awaiting processing
      const { data: pending, error } = await supabase
        .from('payments')
        .select(`
          *,
          bank_account:bank_accounts(id, name)
        `)
        .in('status', ['pending', 'scheduled', 'processing'])
        .order('payment_date', { ascending: true });

      if (error) throw error;

      // Group by payment method
      const byMethod = pending?.reduce((acc: Record<string, any[]>, p) => {
        if (!acc[p.payment_method]) acc[p.payment_method] = [];
        acc[p.payment_method].push(p);
        return acc;
      }, {});

      return NextResponse.json({
        pending,
        by_method: byMethod,
        total_pending: pending?.reduce((sum, p) => sum + p.amount, 0) || 0,
      });
    }

    if (type === 'batches') {
      // Get payment batches
      const { data: batches, error } = await supabase
        .from('payment_batches')
        .select(`
          *,
          payments:payments(id, amount, status)
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      const enrichedBatches = batches?.map(batch => ({
        ...batch,
        payment_count: (batch.payments as any[])?.length || 0,
        total_amount: (batch.payments as any[])?.reduce((sum, p) => sum + p.amount, 0) || 0,
        completed_count: (batch.payments as any[])?.filter(p => p.status === 'completed').length || 0,
      }));

      return NextResponse.json({ batches: enrichedBatches });
    }

    if (type === 'methods') {
      // Get payment method statistics
      const { data: payments, error } = await supabase
        .from('payments')
        .select('payment_method, amount, status')
        .gte('payment_date', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString());

      if (error) throw error;

      const methodStats = payments?.reduce((acc: Record<string, { count: number; total: number; completed: number }>, p) => {
        if (!acc[p.payment_method]) acc[p.payment_method] = { count: 0, total: 0, completed: 0 };
        acc[p.payment_method].count++;
        acc[p.payment_method].total += p.amount;
        if (p.status === 'completed') acc[p.payment_method].completed++;
        return acc;
      }, {});

      return NextResponse.json({ method_statistics: methodStats });
    }

    if (type === 'history' && payeeId) {
      // Get payment history for a specific payee
      const { data: history, error } = await supabase
        .from('payments')
        .select('*')
        .eq('payee_id', payeeId)
        .order('payment_date', { ascending: false })
        .limit(100);

      if (error) throw error;

      const totalPaid = history?.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0) || 0;

      return NextResponse.json({
        history,
        summary: {
          total_payments: history?.length || 0,
          total_paid: totalPaid,
          last_payment: history?.[0]?.payment_date,
        },
      });
    }

    // Default: return summary
    const [pendingResult, completedResult, failedResult] = await Promise.all([
      supabase.from('payments').select('amount').eq('status', 'pending'),
      supabase.from('payments').select('amount').eq('status', 'completed').gte('payment_date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
      supabase.from('payments').select('amount').eq('status', 'failed').gte('payment_date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
    ]);

    return NextResponse.json({
      summary: {
        pending_amount: pendingResult.data?.reduce((sum, p) => sum + p.amount, 0) || 0,
        pending_count: pendingResult.data?.length || 0,
        completed_last_30_days: completedResult.data?.reduce((sum, p) => sum + p.amount, 0) || 0,
        failed_last_30_days: failedResult.data?.length || 0,
      },
    });
  } catch (error: any) {
    console.error('Payment processing error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Create payment or batch
export async function POST(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const body = await request.json();
    const action = body.action;

    if (action === 'create_payment') {
      const validated = paymentSchema.parse(body.data);

      // Generate payment reference
      const { count } = await supabase.from('payments').select('*', { count: 'exact', head: true });
      const paymentRef = `PAY-${String((count || 0) + 1).padStart(8, '0')}`;

      const { data: payment, error } = await supabase
        .from('payments')
        .insert({
          ...validated,
          payment_reference: paymentRef,
          status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json({ payment }, { status: 201 });
    }

    if (action === 'process_ach') {
      const validated = achPaymentSchema.parse(body.data);
      const paymentId = body.payment_id;

      // In production, this would integrate with ACH processor (e.g., Plaid, Dwolla)
      // For now, we simulate the ACH process

      const achDetails = {
        routing_number: validated.routing_number,
        account_number_last4: validated.account_number.slice(-4),
        account_type: validated.account_type,
        ach_trace_number: `ACH${Date.now()}`,
      };

      const { data: payment, error } = await supabase
        .from('payments')
        .update({
          status: 'processing',
          ach_details: achDetails,
          processed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', paymentId)
        .select()
        .single();

      if (error) throw error;

      // Simulate ACH settlement (in production, this would be a webhook)
      // ACH typically settles in 1-3 business days

      return NextResponse.json({ 
        payment, 
        ach_trace: achDetails.ach_trace_number,
        estimated_settlement: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      });
    }

    if (action === 'process_wire') {
      const validated = wirePaymentSchema.parse(body.data);
      const paymentId = body.payment_id;

      const wireDetails = {
        beneficiary_name: validated.beneficiary_name,
        bank_name: validated.bank_name,
        swift_code: validated.swift_code,
        wire_reference: `WIRE${Date.now()}`,
      };

      const { data: payment, error } = await supabase
        .from('payments')
        .update({
          status: 'processing',
          wire_details: wireDetails,
          processed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', paymentId)
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json({ 
        payment, 
        wire_reference: wireDetails.wire_reference,
      });
    }

    if (action === 'print_check') {
      const validated = checkSchema.parse(body.data);
      const paymentId = body.payment_id;

      // Get next check number
      const { data: lastCheck } = await supabase
        .from('payments')
        .select('check_number')
        .eq('payment_method', 'check')
        .not('check_number', 'is', null)
        .order('check_number', { ascending: false })
        .limit(1)
        .single();

      const nextCheckNumber = validated.check_number || 
        String(parseInt(lastCheck?.check_number || '1000') + 1);

      const checkDetails = {
        check_number: nextCheckNumber,
        payee_name: validated.payee_name,
        payee_address: validated.payee_address,
        print_date: validated.print_date || new Date().toISOString(),
      };

      const { data: payment, error } = await supabase
        .from('payments')
        .update({
          status: 'printed',
          check_number: nextCheckNumber,
          check_details: checkDetails,
          updated_at: new Date().toISOString(),
        })
        .eq('id', paymentId)
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json({ payment, check_number: nextCheckNumber });
    }

    if (action === 'create_batch') {
      const { payment_ids, batch_name, payment_method, scheduled_date } = body.data;

      // Create batch
      const { data: batch, error: batchError } = await supabase
        .from('payment_batches')
        .insert({
          name: batch_name,
          payment_method,
          scheduled_date,
          status: 'pending',
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (batchError) throw batchError;

      // Assign payments to batch
      await supabase
        .from('payments')
        .update({ batch_id: batch.id })
        .in('id', payment_ids);

      return NextResponse.json({ batch }, { status: 201 });
    }

    if (action === 'process_batch') {
      const { batch_id } = body.data;

      // Get batch payments
      const { data: payments } = await supabase
        .from('payments')
        .select('*')
        .eq('batch_id', batch_id)
        .eq('status', 'pending');

      // Process each payment (simplified)
      for (const payment of payments || []) {
        await supabase
          .from('payments')
          .update({ 
            status: 'processing',
            processed_at: new Date().toISOString(),
          })
          .eq('id', payment.id);
      }

      // Update batch status
      await supabase
        .from('payment_batches')
        .update({ 
          status: 'processing',
          processed_at: new Date().toISOString(),
        })
        .eq('id', batch_id);

      return NextResponse.json({ 
        success: true, 
        processed_count: payments?.length || 0,
      });
    }

    if (action === 'void_payment') {
      const { payment_id, reason } = body.data;

      const { data: payment, error } = await supabase
        .from('payments')
        .update({
          status: 'voided',
          void_reason: reason,
          voided_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', payment_id)
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json({ payment });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    console.error('Payment processing error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH - Update payment status
export async function PATCH(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const body = await request.json();
    const { id, status, ...updates } = body;

    // Validate status transition
    const validTransitions: Record<string, string[]> = {
      pending: ['processing', 'scheduled', 'cancelled'],
      scheduled: ['processing', 'cancelled'],
      processing: ['completed', 'failed'],
      printed: ['completed', 'voided'],
      failed: ['pending', 'cancelled'],
    };

    if (status) {
      const { data: current } = await supabase
        .from('payments')
        .select('status')
        .eq('id', id)
        .single();

      if (current && !validTransitions[current.status]?.includes(status)) {
        return NextResponse.json({ 
          error: `Invalid status transition from ${current.status} to ${status}` 
        }, { status: 400 });
      }
    }

    const { data: payment, error } = await supabase
      .from('payments')
      .update({
        status,
        ...updates,
        updated_at: new Date().toISOString(),
        ...(status === 'completed' && { completed_at: new Date().toISOString() }),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ payment });
  } catch (error: any) {
    console.error('Payment processing error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
