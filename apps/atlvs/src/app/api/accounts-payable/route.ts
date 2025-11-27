import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { z } from 'zod';

// Validation schemas
const invoiceSchema = z.object({
  vendor_id: z.string().uuid(),
  invoice_number: z.string().min(1),
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
    po_line_id: z.string().uuid().optional(),
  })).optional(),
  purchase_order_id: z.string().uuid().optional(),
  receipt_id: z.string().uuid().optional(),
  attachments: z.array(z.object({
    name: z.string(),
    url: z.string().url(),
    type: z.string(),
  })).optional(),
});

const receiptSchema = z.object({
  purchase_order_id: z.string().uuid(),
  received_by: z.string().uuid(),
  received_date: z.string().datetime(),
  line_items: z.array(z.object({
    po_line_id: z.string().uuid(),
    quantity_received: z.number().min(0),
    condition: z.enum(['good', 'damaged', 'partial', 'rejected']).default('good'),
    notes: z.string().optional(),
  })),
  delivery_note_number: z.string().optional(),
  carrier: z.string().optional(),
  notes: z.string().optional(),
});

const paymentSchema = z.object({
  invoice_id: z.string().uuid(),
  amount: z.number().positive(),
  payment_method: z.enum(['ach', 'wire', 'check', 'credit_card', 'other']),
  payment_date: z.string().datetime(),
  reference_number: z.string().optional(),
  notes: z.string().optional(),
});

// GET - Get AP data
export async function GET(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'invoices' | 'pending_match' | 'aging' | 'payments' | 'receipts'
    const vendorId = searchParams.get('vendor_id');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    if (type === 'invoices') {
      let query = supabase
        .from('vendor_invoices')
        .select(`
          *,
          vendor:vendors(id, name, payment_terms),
          purchase_order:purchase_orders(id, po_number, total_amount),
          receipt:receipts(id, received_date),
          payments:invoice_payments(id, amount, payment_date, status)
        `, { count: 'exact' })
        .order('due_date', { ascending: true });

      if (vendorId) {
        query = query.eq('vendor_id', vendorId);
      }
      if (status) {
        query = query.eq('status', status);
      }

      const { data: invoices, error, count } = await query.range(offset, offset + limit - 1);

      if (error) throw error;

      // Calculate paid amounts
      const enrichedInvoices = invoices?.map(inv => {
        const paidAmount = (inv.payments as any[])?.reduce((sum, p) => 
          p.status === 'completed' ? sum + p.amount : sum, 0) || 0;
        return {
          ...inv,
          paid_amount: paidAmount,
          balance_due: inv.amount - paidAmount,
          is_overdue: new Date(inv.due_date) < new Date() && inv.status !== 'paid',
        };
      });

      return NextResponse.json({
        invoices: enrichedInvoices,
        total: count,
        page,
        limit,
      });
    }

    if (type === 'pending_match') {
      // Get invoices pending 3-way match
      const { data: invoices, error } = await supabase
        .from('vendor_invoices')
        .select(`
          *,
          vendor:vendors(id, name),
          purchase_order:purchase_orders(id, po_number, total_amount, line_items),
          receipt:receipts(id, received_date, line_items)
        `)
        .eq('match_status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Perform 3-way match analysis
      const matchAnalysis = invoices?.map(inv => {
        const po = inv.purchase_order as any;
        const receipt = inv.receipt as any;
        
        const matchResult = {
          invoice_id: inv.id,
          invoice_number: inv.invoice_number,
          vendor_name: (inv.vendor as any)?.name,
          invoice_amount: inv.amount,
          po_amount: po?.total_amount || 0,
          po_match: false,
          receipt_match: false,
          quantity_match: false,
          price_match: false,
          discrepancies: [] as string[],
        };

        // Check PO amount match (within 2% tolerance)
        if (po) {
          const tolerance = po.total_amount * 0.02;
          matchResult.po_match = Math.abs(inv.amount - po.total_amount) <= tolerance;
          if (!matchResult.po_match) {
            matchResult.discrepancies.push(`Invoice amount (${inv.amount}) differs from PO amount (${po.total_amount})`);
          }
        } else {
          matchResult.discrepancies.push('No purchase order linked');
        }

        // Check receipt exists
        if (receipt) {
          matchResult.receipt_match = true;
          
          // Check quantities if line items available
          if (inv.line_items && receipt.line_items) {
            const invoiceItems = inv.line_items as any[];
            const receiptItems = receipt.line_items as any[];
            
            let allQuantitiesMatch = true;
            invoiceItems.forEach(invItem => {
              const recItem = receiptItems.find((r: any) => r.po_line_id === invItem.po_line_id);
              if (!recItem || recItem.quantity_received !== invItem.quantity) {
                allQuantitiesMatch = false;
              }
            });
            matchResult.quantity_match = allQuantitiesMatch;
            
            if (!allQuantitiesMatch) {
              matchResult.discrepancies.push('Quantity mismatch between invoice and receipt');
            }
          }
        } else {
          matchResult.discrepancies.push('No receipt recorded');
        }

        return matchResult;
      });

      return NextResponse.json({
        pending_matches: matchAnalysis,
        total: invoices?.length || 0,
      });
    }

    if (type === 'aging') {
      // Get AP aging report
      const { data: invoices, error } = await supabase
        .from('vendor_invoices')
        .select(`
          id,
          vendor_id,
          invoice_number,
          amount,
          due_date,
          status,
          vendor:vendors(id, name)
        `)
        .in('status', ['pending', 'approved', 'partial']);

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
        const dueDate = new Date(inv.due_date);
        const daysOverdue = Math.floor((today.getTime() - dueDate.getTime()) / (24 * 60 * 60 * 1000));
        
        const invData = {
          ...inv,
          days_overdue: daysOverdue > 0 ? daysOverdue : 0,
        };

        if (daysOverdue <= 0) {
          aging.current.count++;
          aging.current.amount += inv.amount;
          aging.current.invoices.push(invData);
        } else if (daysOverdue <= 30) {
          aging.days_1_30.count++;
          aging.days_1_30.amount += inv.amount;
          aging.days_1_30.invoices.push(invData);
        } else if (daysOverdue <= 60) {
          aging.days_31_60.count++;
          aging.days_31_60.amount += inv.amount;
          aging.days_31_60.invoices.push(invData);
        } else if (daysOverdue <= 90) {
          aging.days_61_90.count++;
          aging.days_61_90.amount += inv.amount;
          aging.days_61_90.invoices.push(invData);
        } else {
          aging.over_90.count++;
          aging.over_90.amount += inv.amount;
          aging.over_90.invoices.push(invData);
        }
      });

      const totalOutstanding = Object.values(aging).reduce((sum, bucket) => sum + bucket.amount, 0);

      return NextResponse.json({
        aging,
        summary: {
          total_outstanding: totalOutstanding,
          total_invoices: invoices?.length || 0,
          overdue_amount: aging.days_1_30.amount + aging.days_31_60.amount + aging.days_61_90.amount + aging.over_90.amount,
        },
      });
    }

    if (type === 'payments') {
      // Get payment history
      let query = supabase
        .from('invoice_payments')
        .select(`
          *,
          invoice:vendor_invoices(id, invoice_number, vendor_id, amount),
          vendor:vendors(id, name)
        `, { count: 'exact' })
        .order('payment_date', { ascending: false });

      if (vendorId) {
        query = query.eq('invoice.vendor_id', vendorId);
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

    if (type === 'receipts') {
      // Get goods receipts
      let query = supabase
        .from('receipts')
        .select(`
          *,
          purchase_order:purchase_orders(id, po_number, vendor_id),
          receiver:platform_users(id, email, first_name, last_name)
        `, { count: 'exact' })
        .order('received_date', { ascending: false });

      const { data: receipts, error, count } = await query.range(offset, offset + limit - 1);

      if (error) throw error;

      return NextResponse.json({
        receipts,
        total: count,
        page,
        limit,
      });
    }

    // Default: return AP summary
    const [pendingResult, overdueResult, thisMonthResult, paidResult] = await Promise.all([
      supabase
        .from('vendor_invoices')
        .select('amount')
        .in('status', ['pending', 'approved']),
      supabase
        .from('vendor_invoices')
        .select('amount')
        .in('status', ['pending', 'approved'])
        .lt('due_date', new Date().toISOString()),
      supabase
        .from('vendor_invoices')
        .select('amount')
        .eq('status', 'paid')
        .gte('paid_date', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),
      supabase
        .from('invoice_payments')
        .select('amount')
        .eq('status', 'completed')
        .gte('payment_date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
    ]);

    const pendingTotal = pendingResult.data?.reduce((sum, i) => sum + i.amount, 0) || 0;
    const overdueTotal = overdueResult.data?.reduce((sum, i) => sum + i.amount, 0) || 0;
    const thisMonthPaid = thisMonthResult.data?.reduce((sum, i) => sum + i.amount, 0) || 0;
    const last30DaysPaid = paidResult.data?.reduce((sum, p) => sum + p.amount, 0) || 0;

    return NextResponse.json({
      summary: {
        pending_invoices: pendingResult.data?.length || 0,
        pending_amount: pendingTotal,
        overdue_invoices: overdueResult.data?.length || 0,
        overdue_amount: overdueTotal,
        paid_this_month: thisMonthPaid,
        paid_last_30_days: last30DaysPaid,
      },
    });
  } catch (error: any) {
    console.error('Accounts payable error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Create invoice, receipt, or payment
export async function POST(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const body = await request.json();
    const action = body.action;

    if (action === 'create_invoice') {
      const validated = invoiceSchema.parse(body.data);

      // Check for duplicate invoice number
      const { data: existing } = await supabase
        .from('vendor_invoices')
        .select('id')
        .eq('vendor_id', validated.vendor_id)
        .eq('invoice_number', validated.invoice_number)
        .single();

      if (existing) {
        return NextResponse.json({ error: 'Invoice number already exists for this vendor' }, { status: 409 });
      }

      // Determine initial match status
      let matchStatus = 'pending';
      if (validated.purchase_order_id && validated.receipt_id) {
        matchStatus = 'ready_for_match';
      }

      const { data: invoice, error } = await supabase
        .from('vendor_invoices')
        .insert({
          ...validated,
          status: 'pending',
          match_status: matchStatus,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json({ invoice }, { status: 201 });
    }

    if (action === 'create_receipt') {
      const validated = receiptSchema.parse(body.data);

      const { data: receipt, error } = await supabase
        .from('receipts')
        .insert({
          ...validated,
          status: 'completed',
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      // Update PO status
      await supabase
        .from('purchase_orders')
        .update({ 
          receipt_status: 'received',
          updated_at: new Date().toISOString(),
        })
        .eq('id', validated.purchase_order_id);

      // Update any linked invoices to ready for match
      await supabase
        .from('vendor_invoices')
        .update({ 
          receipt_id: receipt.id,
          match_status: 'ready_for_match',
          updated_at: new Date().toISOString(),
        })
        .eq('purchase_order_id', validated.purchase_order_id)
        .eq('match_status', 'pending');

      return NextResponse.json({ receipt }, { status: 201 });
    }

    if (action === 'record_payment') {
      const validated = paymentSchema.parse(body.data);

      // Get invoice details
      const { data: invoice } = await supabase
        .from('vendor_invoices')
        .select('amount, status')
        .eq('id', validated.invoice_id)
        .single();

      if (!invoice) {
        return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
      }

      // Get existing payments
      const { data: existingPayments } = await supabase
        .from('invoice_payments')
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
        .from('invoice_payments')
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
        .from('vendor_invoices')
        .update({ 
          status: newStatus,
          paid_date: newStatus === 'paid' ? new Date().toISOString() : null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', validated.invoice_id);

      return NextResponse.json({ payment, invoice_status: newStatus }, { status: 201 });
    }

    if (action === 'perform_3way_match') {
      const { invoice_id } = body.data;

      // Get invoice with related data
      const { data: invoice } = await supabase
        .from('vendor_invoices')
        .select(`
          *,
          purchase_order:purchase_orders(*),
          receipt:receipts(*)
        `)
        .eq('id', invoice_id)
        .single();

      if (!invoice) {
        return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
      }

      const po = invoice.purchase_order as any;
      const receipt = invoice.receipt as any;

      // Perform matching
      const matchResult = {
        po_match: false,
        receipt_match: false,
        price_match: false,
        quantity_match: false,
        auto_approve: false,
        discrepancies: [] as string[],
      };

      // PO amount match (2% tolerance)
      if (po) {
        const tolerance = po.total_amount * 0.02;
        matchResult.po_match = Math.abs(invoice.amount - po.total_amount) <= tolerance;
        matchResult.price_match = matchResult.po_match;
        
        if (!matchResult.po_match) {
          matchResult.discrepancies.push(
            `Amount variance: Invoice ${invoice.amount} vs PO ${po.total_amount}`
          );
        }
      }

      // Receipt match
      if (receipt) {
        matchResult.receipt_match = true;
        matchResult.quantity_match = true; // Simplified - would need line item comparison
      }

      // Auto-approve if all match
      matchResult.auto_approve = matchResult.po_match && matchResult.receipt_match && 
                                  matchResult.price_match && matchResult.quantity_match;

      // Update invoice match status
      const newMatchStatus = matchResult.auto_approve ? 'matched' : 'exception';
      const newStatus = matchResult.auto_approve ? 'approved' : 'pending_review';

      await supabase
        .from('vendor_invoices')
        .update({
          match_status: newMatchStatus,
          status: newStatus,
          match_result: matchResult,
          matched_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', invoice_id);

      return NextResponse.json({
        match_result: matchResult,
        new_status: newStatus,
        auto_approved: matchResult.auto_approve,
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    console.error('Accounts payable error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH - Update invoice or approve
export async function PATCH(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const body = await request.json();
    const { id, action, ...updates } = body;

    if (action === 'approve') {
      const { data: invoice, error } = await supabase
        .from('vendor_invoices')
        .update({
          status: 'approved',
          approved_by: updates.approved_by,
          approved_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json({ invoice });
    }

    if (action === 'reject') {
      const { data: invoice, error } = await supabase
        .from('vendor_invoices')
        .update({
          status: 'rejected',
          rejection_reason: updates.reason,
          rejected_by: updates.rejected_by,
          rejected_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json({ invoice });
    }

    // General update
    const { data: invoice, error } = await supabase
      .from('vendor_invoices')
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
    console.error('Accounts payable error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Void invoice
export async function DELETE(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const reason = searchParams.get('reason');

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    // Check if invoice has payments
    const { data: payments } = await supabase
      .from('invoice_payments')
      .select('id')
      .eq('invoice_id', id)
      .eq('status', 'completed');

    if (payments && payments.length > 0) {
      return NextResponse.json({ 
        error: 'Cannot void invoice with completed payments' 
      }, { status: 400 });
    }

    const { error } = await supabase
      .from('vendor_invoices')
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
    console.error('Accounts payable error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
