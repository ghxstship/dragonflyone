export const dynamic = 'force-dynamic';

import { logger } from '@ghxstship/config';
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { z } from 'zod';

// GET /api/bills/[id] - Get single bill
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = createAdminClient();
  try {
    const { id } = await params;

    const { data: bill, error } = await supabase
      .from('bills')
      .select(`
        *,
        vendor:vendors(id, name, vendor_code, email, phone),
        project:projects(id, name, project_code),
        payments:bill_payments(*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Bill not found' }, { status: 404 });
      }
      return NextResponse.json(
        { error: 'Failed to fetch bill', details: error.message },
        { status: 500 }
      );
    }

    // Fetch activity history
    const { data: history } = await supabase
      .from('bill_activity_log')
      .select(`*, user:platform_users(id, full_name)`)
      .eq('bill_id', id)
      .order('created_at', { ascending: false });

    return NextResponse.json({ ...bill, history: history || [] });
  } catch (error) {
    logger.error('Error in GET /api/bills/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/bills/[id] - Update bill
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = createAdminClient();
  try {
    const { id } = await params;
    const body = await request.json();
    const userId = body.user_id || '00000000-0000-0000-0000-000000000000';

    const { data: existingBill, error: fetchError } = await supabase
      .from('bills')
      .select('id, status')
      .eq('id', id)
      .single();

    if (fetchError || !existingBill) {
      return NextResponse.json({ error: 'Bill not found' }, { status: 404 });
    }

    if (['paid', 'cancelled'].includes(existingBill.status)) {
      return NextResponse.json(
        { error: `Cannot edit bill in ${existingBill.status} status` },
        { status: 400 }
      );
    }

    const { user_id: _userId, ...updates } = body;

    const { data: updatedBill, error: updateError } = await supabase
      .from('bills')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to update bill', details: updateError.message },
        { status: 500 }
      );
    }

    await supabase.from('bill_activity_log').insert({
      bill_id: id,
      activity_type: 'updated',
      user_id: userId,
      description: 'Bill updated',
    }).catch(() => {});

    return NextResponse.json(updatedBill);
  } catch (error) {
    logger.error('Error in PUT /api/bills/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/bills/[id] - Actions (record_payment, cancel, etc.)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = createAdminClient();
  try {
    const { id } = await params;
    const body = await request.json();
    const { action } = body;
    const userId = body.user_id || '00000000-0000-0000-0000-000000000000';

    const { data: bill, error: fetchError } = await supabase
      .from('bills')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !bill) {
      return NextResponse.json({ error: 'Bill not found' }, { status: 404 });
    }

    switch (action) {
      case 'record_payment': {
        const paymentSchema = z.object({
          amount: z.number().positive(),
          payment_date: z.string(),
          payment_method: z.enum(['cash', 'check', 'credit_card', 'ach', 'wire', 'other']),
          reference_number: z.string().optional(),
          notes: z.string().optional(),
        });

        const payment = paymentSchema.parse(body.payment);

        // Create payment record
        const { data: paymentRecord, error: paymentError } = await supabase
          .from('bill_payments')
          .insert({
            bill_id: id,
            amount: payment.amount,
            payment_date: payment.payment_date,
            payment_method: payment.payment_method,
            reference_number: payment.reference_number,
            notes: payment.notes,
            recorded_by: userId,
          })
          .select()
          .single();

        if (paymentError) {
          return NextResponse.json(
            { error: 'Failed to record payment', details: paymentError.message },
            { status: 500 }
          );
        }

        // Update bill amounts
        const newAmountPaid = (bill.amount_paid || 0) + payment.amount;
        const newAmountDue = bill.amount - newAmountPaid;
        const newStatus = newAmountDue <= 0 ? 'paid' : 'partial';

        await supabase
          .from('bills')
          .update({
            amount_paid: newAmountPaid,
            status: newStatus,
            paid_at: newStatus === 'paid' ? new Date().toISOString() : null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', id);

        // Create ledger entries for accounts payable
        await supabase.from('ledger_entries').insert([
          {
            organization_id: bill.organization_id,
            account_code: '2000', // Accounts Payable
            entry_type: 'debit',
            amount: payment.amount,
            description: `Payment for Bill ${bill.bill_number}`,
            reference_type: 'bill_payment',
            reference_id: paymentRecord.id,
            entry_date: payment.payment_date,
            created_by: userId,
          },
          {
            organization_id: bill.organization_id,
            account_code: '1000', // Cash
            entry_type: 'credit',
            amount: payment.amount,
            description: `Payment for Bill ${bill.bill_number}`,
            reference_type: 'bill_payment',
            reference_id: paymentRecord.id,
            entry_date: payment.payment_date,
            created_by: userId,
          },
        ]).catch(() => {});

        await supabase.from('bill_activity_log').insert({
          bill_id: id,
          activity_type: 'payment_recorded',
          user_id: userId,
          description: `Payment of $${payment.amount} recorded via ${payment.payment_method}`,
        }).catch(() => {});

        return NextResponse.json({
          success: true,
          message: 'Payment recorded',
          payment: paymentRecord,
          new_status: newStatus,
        });
      }

      case 'cancel': {
        if (['paid', 'cancelled'].includes(bill.status)) {
          return NextResponse.json(
            { error: `Cannot cancel bill in ${bill.status} status` },
            { status: 400 }
          );
        }

        const { error } = await supabase
          .from('bills')
          .update({
            status: 'cancelled',
            cancelled_at: new Date().toISOString(),
            cancelled_by: userId,
            cancellation_reason: body.reason,
            updated_at: new Date().toISOString(),
          })
          .eq('id', id);

        if (error) {
          return NextResponse.json(
            { error: 'Failed to cancel bill', details: error.message },
            { status: 500 }
          );
        }

        await supabase.from('bill_activity_log').insert({
          bill_id: id,
          activity_type: 'cancelled',
          user_id: userId,
          description: `Bill cancelled: ${body.reason || 'No reason provided'}`,
        }).catch(() => {});

        return NextResponse.json({ success: true, message: 'Bill cancelled' });
      }

      case 'approve': {
        if (bill.status !== 'pending') {
          return NextResponse.json(
            { error: 'Only pending bills can be approved' },
            { status: 400 }
          );
        }

        const { error } = await supabase
          .from('bills')
          .update({
            status: 'approved',
            approved_at: new Date().toISOString(),
            approved_by: userId,
            updated_at: new Date().toISOString(),
          })
          .eq('id', id);

        if (error) {
          return NextResponse.json(
            { error: 'Failed to approve bill', details: error.message },
            { status: 500 }
          );
        }

        // Create ledger entry for accounts payable
        await supabase.from('ledger_entries').insert({
          organization_id: bill.organization_id,
          account_code: '2000', // Accounts Payable
          entry_type: 'credit',
          amount: bill.amount,
          description: `Bill ${bill.bill_number}`,
          reference_type: 'bill',
          reference_id: id,
          entry_date: new Date().toISOString().split('T')[0],
          created_by: userId,
          vendor_id: bill.vendor_id,
        }).catch(() => {});

        await supabase.from('bill_activity_log').insert({
          bill_id: id,
          activity_type: 'approved',
          user_id: userId,
          description: 'Bill approved for payment',
        }).catch(() => {});

        return NextResponse.json({ success: true, message: 'Bill approved' });
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    logger.error('Error in PATCH /api/bills/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/bills/[id] - Delete bill
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = createAdminClient();
  try {
    const { id } = await params;

    const { data: bill, error: fetchError } = await supabase
      .from('bills')
      .select('id, status, bill_number')
      .eq('id', id)
      .single();

    if (fetchError || !bill) {
      return NextResponse.json({ error: 'Bill not found' }, { status: 404 });
    }

    if (!['pending', 'cancelled'].includes(bill.status)) {
      return NextResponse.json(
        { error: 'Only pending or cancelled bills can be deleted' },
        { status: 400 }
      );
    }

    await supabase.from('bill_payments').delete().eq('bill_id', id).catch(() => {});
    await supabase.from('bill_activity_log').delete().eq('bill_id', id).catch(() => {});
    
    const { error: deleteError } = await supabase.from('bills').delete().eq('id', id);

    if (deleteError) {
      return NextResponse.json(
        { error: 'Failed to delete bill', details: deleteError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Bill ${bill.bill_number} deleted`,
    });
  } catch (error) {
    logger.error('Error in DELETE /api/bills/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
