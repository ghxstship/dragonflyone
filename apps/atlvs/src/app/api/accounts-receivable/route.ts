import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

// Validation schemas
const invoiceSchema = z.object({
  client_id: z.string().uuid(),
  project_id: z.string().uuid().optional(),
  invoice_number: z.string().optional(),
  invoice_date: z.string().datetime(),
  due_date: z.string().datetime(),
  amount: z.number().positive(),
  currency: z.string().default('USD'),
  description: z.string().optional(),
  line_items: z.array(z.object({
    description: z.string(),
    quantity: z.number(),
    unit_price: z.number(),
    amount: z.number(),
  })).optional(),
  payment_terms: z.string().optional(),
  notes: z.string().optional(),
});

const paymentSchema = z.object({
  invoice_id: z.string().uuid(),
  amount: z.number().positive(),
  payment_method: z.enum(['ach', 'wire', 'check', 'credit_card', 'cash', 'other']),
  payment_date: z.string().datetime(),
  reference_number: z.string().optional(),
  notes: z.string().optional(),
});

const collectionActionSchema = z.object({
  invoice_id: z.string().uuid(),
  action_type: z.enum(['reminder_sent', 'phone_call', 'email_sent', 'payment_plan', 'escalated', 'sent_to_collections']),
  notes: z.string().optional(),
  next_action_date: z.string().datetime().optional(),
  performed_by: z.string().uuid(),
});

// GET - Get AR data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'invoices' | 'aging' | 'collections' | 'payments' | 'dashboard'
    const clientId = searchParams.get('client_id');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    if (type === 'invoices') {
      let query = supabase
        .from('client_invoices')
        .select(`
          *,
          client:contacts(id, first_name, last_name, email, organization_id),
          organization:organizations(id, name),
          project:projects(id, name),
          payments:client_payments(id, amount, payment_date, status)
        `, { count: 'exact' })
        .order('due_date', { ascending: true });

      if (clientId) {
        query = query.eq('client_id', clientId);
      }
      if (status) {
        query = query.eq('status', status);
      }

      const { data: invoices, error, count } = await query.range(offset, offset + limit - 1);

      if (error) throw error;

      // Calculate paid amounts and balances
      const enrichedInvoices = invoices?.map(inv => {
        const paidAmount = (inv.payments as any[])?.reduce((sum, p) => 
          p.status === 'completed' ? sum + p.amount : sum, 0) || 0;
        const balance = inv.amount - paidAmount;
        const daysOverdue = inv.status !== 'paid' ? 
          Math.max(0, Math.floor((Date.now() - new Date(inv.due_date).getTime()) / (24 * 60 * 60 * 1000))) : 0;

        return {
          ...inv,
          paid_amount: paidAmount,
          balance_due: balance,
          days_overdue: daysOverdue,
          is_overdue: daysOverdue > 0 && inv.status !== 'paid',
        };
      });

      return NextResponse.json({
        invoices: enrichedInvoices,
        total: count,
        page,
        limit,
      });
    }

    if (type === 'aging') {
      // Get AR aging report
      const { data: invoices, error } = await supabase
        .from('client_invoices')
        .select(`
          id,
          client_id,
          invoice_number,
          amount,
          due_date,
          status,
          client:contacts(id, first_name, last_name),
          organization:organizations(id, name),
          payments:client_payments(amount, status)
        `)
        .in('status', ['sent', 'partial', 'overdue']);

      if (error) throw error;

      const today = new Date();
      const aging = {
        current: { count: 0, amount: 0, invoices: [] as any[] },
        days_1_30: { count: 0, amount: 0, invoices: [] as any[] },
        days_31_60: { count: 0, amount: 0, invoices: [] as any[] },
        days_61_90: { count: 0, amount: 0, invoices: [] as any[] },
        over_90: { count: 0, amount: 0, invoices: [] as any[] },
      };

      invoices?.forEach(inv => {
        const paidAmount = (inv.payments as any[])?.reduce((sum, p) => 
          p.status === 'completed' ? sum + p.amount : sum, 0) || 0;
        const balance = inv.amount - paidAmount;
        
        if (balance <= 0) return; // Skip fully paid

        const dueDate = new Date(inv.due_date);
        const daysOverdue = Math.floor((today.getTime() - dueDate.getTime()) / (24 * 60 * 60 * 1000));
        
        const invData = {
          ...inv,
          balance_due: balance,
          days_overdue: Math.max(0, daysOverdue),
        };

        if (daysOverdue <= 0) {
          aging.current.count++;
          aging.current.amount += balance;
          aging.current.invoices.push(invData);
        } else if (daysOverdue <= 30) {
          aging.days_1_30.count++;
          aging.days_1_30.amount += balance;
          aging.days_1_30.invoices.push(invData);
        } else if (daysOverdue <= 60) {
          aging.days_31_60.count++;
          aging.days_31_60.amount += balance;
          aging.days_31_60.invoices.push(invData);
        } else if (daysOverdue <= 90) {
          aging.days_61_90.count++;
          aging.days_61_90.amount += balance;
          aging.days_61_90.invoices.push(invData);
        } else {
          aging.over_90.count++;
          aging.over_90.amount += balance;
          aging.over_90.invoices.push(invData);
        }
      });

      const totalOutstanding = Object.values(aging).reduce((sum, bucket) => sum + bucket.amount, 0);
      const overdueAmount = aging.days_1_30.amount + aging.days_31_60.amount + aging.days_61_90.amount + aging.over_90.amount;

      return NextResponse.json({
        aging,
        summary: {
          total_outstanding: totalOutstanding,
          total_invoices: invoices?.length || 0,
          overdue_amount: overdueAmount,
          overdue_percentage: totalOutstanding > 0 ? (overdueAmount / totalOutstanding) * 100 : 0,
        },
      });
    }

    if (type === 'collections') {
      // Get collection activities
      const { data: activities, error } = await supabase
        .from('collection_activities')
        .select(`
          *,
          invoice:client_invoices(id, invoice_number, amount, due_date, client_id),
          performer:platform_users(id, first_name, last_name)
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      // Get invoices needing collection action
      const { data: overdueInvoices } = await supabase
        .from('client_invoices')
        .select(`
          *,
          client:contacts(id, first_name, last_name, email),
          last_action:collection_activities(action_type, created_at, next_action_date)
        `)
        .in('status', ['overdue', 'sent'])
        .lt('due_date', new Date().toISOString())
        .order('due_date', { ascending: true });

      // Identify invoices needing action
      const needsAction = overdueInvoices?.filter(inv => {
        const lastAction = (inv.last_action as any[])?.[0];
        if (!lastAction) return true;
        if (lastAction.next_action_date && new Date(lastAction.next_action_date) <= new Date()) return true;
        return false;
      });

      return NextResponse.json({
        recent_activities: activities,
        needs_action: needsAction,
        summary: {
          total_overdue_invoices: overdueInvoices?.length || 0,
          needs_action_count: needsAction?.length || 0,
        },
      });
    }

    if (type === 'payments') {
      // Get payment history
      let query = supabase
        .from('client_payments')
        .select(`
          *,
          invoice:client_invoices(id, invoice_number, client_id, amount)
        `, { count: 'exact' })
        .order('payment_date', { ascending: false });

      if (clientId) {
        query = query.eq('invoice.client_id', clientId);
      }

      const { data: payments, error, count } = await query.range(offset, offset + limit - 1);

      if (error) throw error;

      return NextResponse.json({
        payments,
        total: count,
        page,
        limit,
      });
    }

    if (type === 'dashboard') {
      // Get AR dashboard data
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      
      const [invoicesResult, paymentsResult, overdueResult] = await Promise.all([
        supabase.from('client_invoices').select('amount, status'),
        supabase.from('client_payments').select('amount, status').gte('payment_date', thirtyDaysAgo),
        supabase.from('client_invoices').select('amount').in('status', ['sent', 'partial', 'overdue']).lt('due_date', new Date().toISOString()),
      ]);

      const totalOutstanding = invoicesResult.data?.filter(i => ['sent', 'partial', 'overdue'].includes(i.status)).reduce((sum, i) => sum + i.amount, 0) || 0;
      const collectionsLast30Days = paymentsResult.data?.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0) || 0;
      const overdueAmount = overdueResult.data?.reduce((sum, i) => sum + i.amount, 0) || 0;

      // Calculate DSO (Days Sales Outstanding)
      const { data: recentInvoices } = await supabase
        .from('client_invoices')
        .select('amount, invoice_date, paid_date')
        .eq('status', 'paid')
        .gte('paid_date', thirtyDaysAgo);

      const avgDSO = recentInvoices?.length ? 
        recentInvoices.reduce((sum, inv) => {
          const days = Math.floor((new Date(inv.paid_date).getTime() - new Date(inv.invoice_date).getTime()) / (24 * 60 * 60 * 1000));
          return sum + days;
        }, 0) / recentInvoices.length : 0;

      return NextResponse.json({
        dashboard: {
          total_outstanding: totalOutstanding,
          overdue_amount: overdueAmount,
          collections_last_30_days: collectionsLast30Days,
          average_dso: Math.round(avgDSO),
          collection_rate: totalOutstanding > 0 ? (collectionsLast30Days / (totalOutstanding + collectionsLast30Days)) * 100 : 0,
        },
      });
    }

    // Default: return summary
    const [outstandingResult, overdueResult, collectedResult] = await Promise.all([
      supabase.from('client_invoices').select('amount').in('status', ['sent', 'partial', 'overdue']),
      supabase.from('client_invoices').select('amount').in('status', ['sent', 'partial', 'overdue']).lt('due_date', new Date().toISOString()),
      supabase.from('client_payments').select('amount').eq('status', 'completed').gte('payment_date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
    ]);

    return NextResponse.json({
      summary: {
        total_outstanding: outstandingResult.data?.reduce((sum, i) => sum + i.amount, 0) || 0,
        total_overdue: overdueResult.data?.reduce((sum, i) => sum + i.amount, 0) || 0,
        collected_last_30_days: collectedResult.data?.reduce((sum, p) => sum + p.amount, 0) || 0,
      },
    });
  } catch (error: any) {
    console.error('Accounts receivable error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Create invoice, payment, or collection action
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const action = body.action;

    if (action === 'create_invoice') {
      const validated = invoiceSchema.parse(body.data);

      // Generate invoice number if not provided
      let invoiceNumber = validated.invoice_number;
      if (!invoiceNumber) {
        const { count } = await supabase.from('client_invoices').select('*', { count: 'exact', head: true });
        invoiceNumber = `INV-${String((count || 0) + 1).padStart(6, '0')}`;
      }

      const { data: invoice, error } = await supabase
        .from('client_invoices')
        .insert({
          ...validated,
          invoice_number: invoiceNumber,
          status: 'draft',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json({ invoice }, { status: 201 });
    }

    if (action === 'record_payment') {
      const validated = paymentSchema.parse(body.data);

      // Get invoice details
      const { data: invoice } = await supabase
        .from('client_invoices')
        .select('amount, status')
        .eq('id', validated.invoice_id)
        .single();

      if (!invoice) {
        return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
      }

      // Get existing payments
      const { data: existingPayments } = await supabase
        .from('client_payments')
        .select('amount')
        .eq('invoice_id', validated.invoice_id)
        .eq('status', 'completed');

      const paidAmount = existingPayments?.reduce((sum, p) => sum + p.amount, 0) || 0;
      const remainingBalance = invoice.amount - paidAmount;

      if (validated.amount > remainingBalance) {
        return NextResponse.json({ 
          error: `Payment amount exceeds remaining balance of ${remainingBalance}` 
        }, { status: 400 });
      }

      const { data: payment, error } = await supabase
        .from('client_payments')
        .insert({
          ...validated,
          status: 'completed',
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      // Update invoice status
      const newPaidAmount = paidAmount + validated.amount;
      const newStatus = newPaidAmount >= invoice.amount ? 'paid' : 'partial';

      await supabase
        .from('client_invoices')
        .update({ 
          status: newStatus,
          paid_date: newStatus === 'paid' ? new Date().toISOString() : null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', validated.invoice_id);

      return NextResponse.json({ payment, invoice_status: newStatus }, { status: 201 });
    }

    if (action === 'log_collection_activity') {
      const validated = collectionActionSchema.parse(body.data);

      const { data: activity, error } = await supabase
        .from('collection_activities')
        .insert({
          ...validated,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      // Update invoice status if escalated
      if (validated.action_type === 'sent_to_collections') {
        await supabase
          .from('client_invoices')
          .update({ status: 'collections', updated_at: new Date().toISOString() })
          .eq('id', validated.invoice_id);
      }

      return NextResponse.json({ activity }, { status: 201 });
    }

    if (action === 'send_invoice') {
      const { invoice_id } = body.data;

      const { data: invoice, error } = await supabase
        .from('client_invoices')
        .update({
          status: 'sent',
          sent_date: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', invoice_id)
        .select()
        .single();

      if (error) throw error;

      // TODO: Trigger email notification to client

      return NextResponse.json({ invoice });
    }

    if (action === 'send_reminder') {
      const { invoice_id, reminder_type, performed_by } = body.data;

      // Log the reminder
      await supabase.from('collection_activities').insert({
        invoice_id,
        action_type: 'reminder_sent',
        notes: `${reminder_type} reminder sent`,
        performed_by,
        created_at: new Date().toISOString(),
      });

      // TODO: Trigger reminder email

      return NextResponse.json({ success: true, message: 'Reminder sent' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    console.error('Accounts receivable error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH - Update invoice
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    const { data: invoice, error } = await supabase
      .from('client_invoices')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ invoice });
  } catch (error: any) {
    console.error('Accounts receivable error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Void invoice
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const reason = searchParams.get('reason');

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    // Check if invoice has payments
    const { data: payments } = await supabase
      .from('client_payments')
      .select('id')
      .eq('invoice_id', id)
      .eq('status', 'completed');

    if (payments && payments.length > 0) {
      return NextResponse.json({ 
        error: 'Cannot void invoice with completed payments' 
      }, { status: 400 });
    }

    const { error } = await supabase
      .from('client_invoices')
      .update({
        status: 'voided',
        void_reason: reason,
        voided_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Accounts receivable error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
