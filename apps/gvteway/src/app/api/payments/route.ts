export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { logger, withAuth, PlatformRole } from '@ghxstship/config';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

const GVTEWAY_ADMIN_ROLES = [
  PlatformRole.GVTEWAY_ADMIN,
  PlatformRole.LEGEND_SUPER_ADMIN,
  PlatformRole.LEGEND_ADMIN,
];

const paymentSchema = z.object({
  order_id: z.string().uuid().optional(),
  payment_method_id: z.string().uuid(),
  amount: z.number().positive(),
  currency: z.string().default('USD'),
  payer_email: z.string().email(),
  payer_name: z.string().min(1),
  billing_address: z.object({
    street: z.string(),
    city: z.string(),
    state: z.string(),
    postal_code: z.string(),
    country: z.string().default('USA'),
  }).optional(),
});

// GET /api/payments - List payments
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    
    const orderId = searchParams.get('order_id');
    const payerId = searchParams.get('payer_id');
    const status = searchParams.get('status');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('payments')
      .select(`
        *,
        payment_method:payment_methods(id, code, name, processor),
        order:orders(id, order_number, total_amount),
        payer:legend_people(id, first_name, last_name, email),
        refunds:refunds(id, amount, status, created_at)
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (orderId) {
      query = query.eq('order_id', orderId);
    }
    if (payerId) {
      query = query.eq('payer_id', payerId);
    }
    if (status) {
      query = query.eq('status', status);
    }

    const { data, error, count } = await query;

    // Handle any database error gracefully - return empty result
    if (error) {
      return NextResponse.json({ 
        payments: [], 
        total: 0, 
        limit, 
        offset,
        summary: { total: 0, completed: 0, pending: 0, failed: 0, total_amount: 0, refunded_amount: 0 }
      });
    }

    const payments = data || [];
    const summary = {
      total: count || 0,
      completed: payments.filter(p => p.status === 'completed').length,
      pending: payments.filter(p => p.status === 'pending').length,
      failed: payments.filter(p => p.status === 'failed').length,
      total_amount: payments.reduce((sum, p) => sum + (p.amount || 0), 0),
      refunded_amount: payments.reduce((sum, p) => {
        const refunds = p.refunds || [];
        return sum + refunds.reduce((rSum: number, r: { amount: number }) => rSum + (r.amount || 0), 0);
      }, 0),
    };

    return NextResponse.json({ payments, total: count, limit, offset, summary });
  } catch (error) {
    // Return empty result for any error to ensure graceful degradation
    return NextResponse.json({ 
      payments: [], 
      total: 0, 
      limit: 50, 
      offset: 0,
      summary: { total: 0, completed: 0, pending: 0, failed: 0, total_amount: 0, refunded_amount: 0 }
    });
  }
}

// POST /api/payments - Create payment
export async function POST(request: NextRequest) {
  try {
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const supabase = getSupabaseClient();
    const body = await request.json();
    const validated = paymentSchema.parse(body);

    // Generate payment number
    const paymentNumber = `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    const { data: payment, error } = await supabase
      .from('payments')
      .insert({
        organization_id: body.organization_id || '00000000-0000-0000-0000-000000000001',
        order_id: validated.order_id,
        payment_method_id: validated.payment_method_id,
        payment_number: paymentNumber,
        amount: validated.amount,
        currency: validated.currency,
        payer_email: validated.payer_email,
        payer_name: validated.payer_name,
        billing_address: validated.billing_address,
        status: 'pending',
      })
      .select(`
        *,
        payment_method:payment_methods(id, code, name)
      `)
      .single();

    if (error) {
      logger.error('Error creating payment:', error);
      return NextResponse.json({ error: 'Failed to create payment', details: error.message }, { status: 500 });
    }

    return NextResponse.json({ payment }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    logger.error('Error in POST /api/payments:', error instanceof Error ? error : undefined);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/payments - Update payment status or process
export async function PATCH(request: NextRequest) {
  try {
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!GVTEWAY_ADMIN_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const supabase = getSupabaseClient();
    const body = await request.json();
    const { payment_id, action, processor_id, processor_response } = body;

    if (!payment_id) {
      return NextResponse.json({ error: 'payment_id is required' }, { status: 400 });
    }

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };

    if (action === 'authorize') {
      updates.status = 'processing';
      updates.authorized_at = new Date().toISOString();
      if (processor_id) updates.processor_id = processor_id;
    } else if (action === 'capture') {
      updates.status = 'completed';
      updates.captured_at = new Date().toISOString();
      if (processor_response) updates.processor_response = processor_response;
    } else if (action === 'fail') {
      updates.status = 'failed';
      updates.failed_at = new Date().toISOString();
      updates.failure_reason = body.failure_reason;
    } else if (action === 'cancel') {
      updates.status = 'cancelled';
    } else if (body.status) {
      updates.status = body.status;
    }

    const { data: payment, error } = await supabase
      .from('payments')
      .update(updates)
      .eq('id', payment_id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: 'Failed to update payment' }, { status: 500 });
    }

    return NextResponse.json({ success: true, payment });
  } catch (error) {
    logger.error('Error in PATCH /api/payments:', error instanceof Error ? error : undefined);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/payments - Refund payment
export async function DELETE(request: NextRequest) {
  try {
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!GVTEWAY_ADMIN_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const paymentId = searchParams.get('id');
    const amount = searchParams.get('amount');
    const reason = searchParams.get('reason');

    if (!paymentId) {
      return NextResponse.json({ error: 'Payment ID required' }, { status: 400 });
    }

    // Get payment details
    const { data: payment } = await supabase
      .from('payments')
      .select('amount, status')
      .eq('id', paymentId)
      .single();

    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    if (payment.status !== 'completed') {
      return NextResponse.json({ error: 'Can only refund completed payments' }, { status: 400 });
    }

    const refundAmount = amount ? parseFloat(amount) : payment.amount;
    const refundNumber = `REF-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    // Create refund record
    const { data: refund, error: refundError } = await supabase
      .from('refunds')
      .insert({
        payment_id: paymentId,
        refund_number: refundNumber,
        amount: refundAmount,
        reason: reason || 'Customer request',
        status: 'pending',
        processed_by: authResult.user?.id,
      })
      .select()
      .single();

    if (refundError) {
      return NextResponse.json({ error: 'Failed to create refund' }, { status: 500 });
    }

    // Update payment status
    const newStatus = refundAmount >= payment.amount ? 'refunded' : 'partially_refunded';
    await supabase
      .from('payments')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', paymentId);

    return NextResponse.json({ success: true, refund, message: 'Refund initiated' });
  } catch (error) {
    logger.error('Error in DELETE /api/payments:', error instanceof Error ? error : undefined);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
