import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { apiRoute } from '@ghxstship/config/middleware';
import { PlatformRole } from '@ghxstship/config/roles';

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

const paymentPlanSchema = z.object({
  order_id: z.string().uuid(),
  total_amount: z.number().positive(),
  down_payment: z.number().nonnegative(),
  installments: z.number().int().min(2).max(12),
  frequency: z.enum(['weekly', 'biweekly', 'monthly']),
  start_date: z.string(),
  auto_pay: z.boolean().default(true)
});

const paymentSchema = z.object({
  plan_id: z.string().uuid(),
  amount: z.number().positive(),
  payment_method_id: z.string().optional(),
  notes: z.string().optional()
});

// GET - List payment plans or get plan details
export const GET = apiRoute(
  async (request: NextRequest, context: any) => {
    const { searchParams } = new URL(request.url);
    const plan_id = searchParams.get('plan_id');
    const user_id = context.user?.id;
    const status = searchParams.get('status');

    if (plan_id) {
      // Get specific plan with installments
      const { data: plan, error } = await supabase
        .from('payment_plans')
        .select(`
          *,
          orders (*),
          payment_plan_installments (*)
        `)
        .eq('id', plan_id)
        .single();

      if (error || !plan) {
        return NextResponse.json({ error: 'Payment plan not found' }, { status: 404 });
      }

      // Check authorization - user must own the order
      if (plan.orders.user_id !== user_id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }

      return NextResponse.json({ plan });
    }

    // List user's payment plans
    let query = supabase
      .from('payment_plans')
      .select(`
        *,
        orders (
          id,
          event_id,
          total_amount,
          events (name, date)
        ),
        payment_plan_installments (
          id,
          installment_number,
          due_date,
          amount,
          status,
          paid_at
        )
      `)
      .eq('orders.user_id', user_id)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ plans: data || [] });
  },
  {
    auth: true,
    audit: { action: 'payment_plans:list', resource: 'payment_plans' }
  }
);

// POST - Create payment plan or process payment
export const POST = apiRoute(
  async (request: NextRequest, context: any) => {
    const body = await request.json();
    const { action } = body;

    if (action === 'process_payment') {
      // Process an installment payment
      const validated = paymentSchema.parse(body.data);
      
      const { data: installment } = await supabase
        .from('payment_plan_installments')
        .select('*, payment_plans!inner(*, orders(user_id))')
        .eq('plan_id', validated.plan_id)
        .eq('status', 'pending')
        .order('installment_number', { ascending: true })
        .limit(1)
        .single();

      if (!installment) {
        return NextResponse.json({ 
          error: 'No pending installments found' 
        }, { status: 404 });
      }

      // Verify ownership
      if (installment.payment_plans.orders.user_id !== context.user.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }

      // Process payment (integrate with Stripe here)
      // For now, mark as paid
      const { error: updateError } = await supabase
        .from('payment_plan_installments')
        .update({
          status: 'paid',
          paid_at: new Date().toISOString(),
          payment_method_id: validated.payment_method_id
        })
        .eq('id', installment.id);

      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 });
      }

      // Check if all installments are paid
      const { data: allInstallments } = await supabase
        .from('payment_plan_installments')
        .select('status')
        .eq('plan_id', validated.plan_id);

      const allPaid = allInstallments?.every(i => i.status === 'paid');

      if (allPaid) {
        await supabase
          .from('payment_plans')
          .update({ status: 'completed' })
          .eq('id', validated.plan_id);
      }

      return NextResponse.json({
        message: 'Payment processed successfully',
        installment: { ...installment, status: 'paid' }
      });
    }

    // Create new payment plan
    const validated = paymentPlanSchema.parse(body);

    // Verify order exists and belongs to user
    const { data: order } = await supabase
      .from('orders')
      .select('*')
      .eq('id', validated.order_id)
      .eq('user_id', context.user.id)
      .single();

    if (!order) {
      return NextResponse.json({ 
        error: 'Order not found or unauthorized' 
      }, { status: 404 });
    }

    // Calculate installment schedule
    const installmentAmount = (validated.total_amount - validated.down_payment) / validated.installments;
    const installments = [];
    const startDate = new Date(validated.start_date);

    for (let i = 0; i < validated.installments; i++) {
      const dueDate = new Date(startDate);
      
      switch (validated.frequency) {
        case 'weekly':
          dueDate.setDate(dueDate.getDate() + (i * 7));
          break;
        case 'biweekly':
          dueDate.setDate(dueDate.getDate() + (i * 14));
          break;
        case 'monthly':
          dueDate.setMonth(dueDate.getMonth() + i);
          break;
      }

      installments.push({
        installment_number: i + 1,
        due_date: dueDate.toISOString().split('T')[0],
        amount: installmentAmount,
        status: 'pending'
      });
    }

    // Create payment plan
    const { data: plan, error: planError } = await supabase
      .from('payment_plans')
      .insert({
        order_id: validated.order_id,
        total_amount: validated.total_amount,
        down_payment: validated.down_payment,
        installments: validated.installments,
        frequency: validated.frequency,
        auto_pay: validated.auto_pay,
        status: validated.down_payment > 0 ? 'active' : 'pending',
        created_by: context.user.id
      })
      .select()
      .single();

    if (planError) {
      return NextResponse.json({ error: planError.message }, { status: 500 });
    }

    // Create installment records
    const installmentsWithPlanId = installments.map(inst => ({
      ...inst,
      plan_id: plan.id
    }));

    const { error: installmentsError } = await supabase
      .from('payment_plan_installments')
      .insert(installmentsWithPlanId);

    if (installmentsError) {
      return NextResponse.json({ error: installmentsError.message }, { status: 500 });
    }

    return NextResponse.json({
      plan,
      installments: installmentsWithPlanId,
      message: 'Payment plan created successfully'
    }, { status: 201 });
  },
  {
    auth: true,
    audit: { action: 'payment_plans:create', resource: 'payment_plans' }
  }
);

// PUT - Update payment plan or retry failed payment
export const PUT = apiRoute(
  async (request: NextRequest, context: any) => {
    const body = await request.json();
    const { plan_id, action, updates } = body;

    if (!plan_id) {
      return NextResponse.json({ error: 'plan_id is required' }, { status: 400 });
    }

    // Verify ownership
    const { data: plan } = await supabase
      .from('payment_plans')
      .select('*, orders!inner(user_id)')
      .eq('id', plan_id)
      .single();

    if (!plan || plan.orders.user_id !== context.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    if (action === 'cancel') {
      const { error } = await supabase
        .from('payment_plans')
        .update({ status: 'cancelled', cancelled_at: new Date().toISOString() })
        .eq('id', plan_id);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ message: 'Payment plan cancelled' });
    }

    if (action === 'retry_payment') {
      // Retry failed payment (integrate with Stripe)
      const { installment_id } = body;
      
      const { error } = await supabase
        .from('payment_plan_installments')
        .update({ status: 'pending' })
        .eq('id', installment_id)
        .eq('status', 'failed');

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ message: 'Payment retry initiated' });
    }

    // Update payment plan settings
    const { data, error } = await supabase
      .from('payment_plans')
      .update(updates)
      .eq('id', plan_id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ plan: data, message: 'Payment plan updated' });
  },
  {
    auth: true,
    audit: { action: 'payment_plans:update', resource: 'payment_plans' }
  }
);
