import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

// Validation schemas
const transactionSchema = z.object({
  from_entity_id: z.string().uuid(),
  to_entity_id: z.string().uuid(),
  transaction_type: z.enum(['service', 'goods', 'loan', 'dividend', 'management_fee', 'royalty', 'cost_sharing']),
  amount: z.number().positive(),
  currency: z.string().default('USD'),
  description: z.string(),
  transaction_date: z.string().datetime(),
  invoice_number: z.string().optional(),
  cost_center: z.string().optional(),
  project_id: z.string().uuid().optional(),
});

const eliminationSchema = z.object({
  period_start: z.string().datetime(),
  period_end: z.string().datetime(),
  consolidation_entity_id: z.string().uuid().optional(),
});

// GET - Get intercompany data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'transactions' | 'balances' | 'eliminations' | 'reconciliation'
    const entityId = searchParams.get('entity_id');
    const period = searchParams.get('period');

    if (type === 'transactions') {
      let query = supabase
        .from('intercompany_transactions')
        .select(`
          *,
          from_entity:entities!from_entity_id(id, name, code),
          to_entity:entities!to_entity_id(id, name, code)
        `)
        .order('transaction_date', { ascending: false });

      if (entityId) {
        query = query.or(`from_entity_id.eq.${entityId},to_entity_id.eq.${entityId}`);
      }
      if (period) {
        query = query.gte('transaction_date', `${period}-01`).lte('transaction_date', `${period}-31`);
      }

      const { data: transactions, error } = await query.limit(200);

      if (error) throw error;

      // Group by type
      const byType = transactions?.reduce((acc: Record<string, { count: number; total: number }>, t) => {
        if (!acc[t.transaction_type]) acc[t.transaction_type] = { count: 0, total: 0 };
        acc[t.transaction_type].count++;
        acc[t.transaction_type].total += t.amount;
        return acc;
      }, {});

      return NextResponse.json({
        transactions,
        by_type: byType,
        total: transactions?.reduce((sum, t) => sum + t.amount, 0) || 0,
      });
    }

    if (type === 'balances') {
      // Get intercompany balances (receivables and payables)
      const { data: transactions, error } = await supabase
        .from('intercompany_transactions')
        .select(`
          from_entity_id,
          to_entity_id,
          amount,
          status,
          from_entity:entities!from_entity_id(id, name, code),
          to_entity:entities!to_entity_id(id, name, code)
        `)
        .in('status', ['pending', 'partial']);

      if (error) throw error;

      // Calculate net balances between entities
      const balances: Record<string, Record<string, number>> = {};

      transactions?.forEach(t => {
        const fromId: string = t.from_entity_id;
        const toId: string = t.to_entity_id;

        if (!balances[fromId]) balances[fromId] = {};
        if (!balances[toId]) balances[toId] = {};

        balances[fromId][toId] = (balances[fromId][toId] || 0) + t.amount;
        balances[toId][fromId] = (balances[toId][fromId] || 0) - t.amount;
      });

      // Get entity names
      const { data: entities } = await supabase
        .from('entities')
        .select('id, name, code');

      const entityMap: Record<string, { id: string; name: string; code: string }> = 
        entities?.reduce((acc, e) => ({ ...acc, [e.id]: e }), {}) || {};

      // Format balance matrix
      const balanceMatrix = Object.entries(balances).map(([entityId, counterparties]) => ({
        entity_id: entityId,
        entity_name: entityMap[entityId]?.name || 'Unknown',
        entity_code: entityMap[entityId]?.code,
        counterparty_balances: Object.entries(counterparties).map(([cpId, amount]) => ({
          counterparty_id: cpId,
          counterparty_name: entityMap[cpId]?.name || 'Unknown',
          balance: amount,
          type: amount > 0 ? 'receivable' : 'payable',
        })).filter(b => Math.abs(b.balance) > 0.01),
      }));

      return NextResponse.json({
        balances: balanceMatrix,
        total_intercompany: transactions?.reduce((sum, t) => sum + t.amount, 0) || 0,
      });
    }

    if (type === 'eliminations') {
      // Get elimination entries
      let query = supabase
        .from('intercompany_eliminations')
        .select(`
          *,
          details:elimination_details(*)
        `)
        .order('period_end', { ascending: false });

      if (period) {
        query = query.gte('period_start', `${period}-01`).lte('period_end', `${period}-31`);
      }

      const { data: eliminations, error } = await query;

      if (error) throw error;

      return NextResponse.json({ eliminations });
    }

    if (type === 'reconciliation') {
      // Get reconciliation status between entities
      const { data: transactions, error } = await supabase
        .from('intercompany_transactions')
        .select(`
          id,
          from_entity_id,
          to_entity_id,
          amount,
          status,
          confirmed_by_receiver,
          from_entity:entities!from_entity_id(name),
          to_entity:entities!to_entity_id(name)
        `)
        .in('status', ['pending', 'partial', 'disputed']);

      if (error) throw error;

      const unconfirmed = transactions?.filter(t => !t.confirmed_by_receiver);
      const disputed = transactions?.filter(t => t.status === 'disputed');

      return NextResponse.json({
        transactions,
        summary: {
          total_pending: transactions?.length || 0,
          unconfirmed_count: unconfirmed?.length || 0,
          unconfirmed_amount: unconfirmed?.reduce((sum, t) => sum + t.amount, 0) || 0,
          disputed_count: disputed?.length || 0,
          disputed_amount: disputed?.reduce((sum, t) => sum + t.amount, 0) || 0,
        },
      });
    }

    // Default: return summary
    const { data: pending } = await supabase
      .from('intercompany_transactions')
      .select('amount')
      .eq('status', 'pending');

    const { data: eliminations } = await supabase
      .from('intercompany_eliminations')
      .select('total_eliminated')
      .gte('period_end', new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString());

    return NextResponse.json({
      summary: {
        pending_transactions: pending?.length || 0,
        pending_amount: pending?.reduce((sum, t) => sum + t.amount, 0) || 0,
        ytd_eliminations: eliminations?.reduce((sum, e) => sum + e.total_eliminated, 0) || 0,
      },
    });
  } catch (error: any) {
    console.error('Intercompany error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Create transaction or run elimination
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const action = body.action;

    if (action === 'create_transaction') {
      const validated = transactionSchema.parse(body.data);

      if (validated.from_entity_id === validated.to_entity_id) {
        return NextResponse.json({ error: 'Cannot create transaction between same entity' }, { status: 400 });
      }

      const { data: transaction, error } = await supabase
        .from('intercompany_transactions')
        .insert({
          ...validated,
          status: 'pending',
          confirmed_by_receiver: false,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      // Create ledger entries for both entities
      // Debit AR for sender
      await supabase.from('ledger_entries').insert({
        entity_id: validated.from_entity_id,
        entry_date: validated.transaction_date,
        description: `Intercompany receivable - ${validated.description}`,
        debit: validated.amount,
        credit: 0,
        account_type: 'asset',
        reference_type: 'intercompany',
        reference_id: transaction.id,
        created_at: new Date().toISOString(),
      });

      // Credit AP for receiver
      await supabase.from('ledger_entries').insert({
        entity_id: validated.to_entity_id,
        entry_date: validated.transaction_date,
        description: `Intercompany payable - ${validated.description}`,
        debit: 0,
        credit: validated.amount,
        account_type: 'liability',
        reference_type: 'intercompany',
        reference_id: transaction.id,
        created_at: new Date().toISOString(),
      });

      return NextResponse.json({ transaction }, { status: 201 });
    }

    if (action === 'confirm_transaction') {
      const { transaction_id, confirmed_by } = body.data;

      const { data: transaction, error } = await supabase
        .from('intercompany_transactions')
        .update({
          confirmed_by_receiver: true,
          confirmed_at: new Date().toISOString(),
          confirmed_by,
        })
        .eq('id', transaction_id)
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json({ transaction });
    }

    if (action === 'run_elimination') {
      const validated = eliminationSchema.parse(body.data);

      // Get all confirmed intercompany transactions for the period
      const { data: transactions, error } = await supabase
        .from('intercompany_transactions')
        .select('*')
        .eq('confirmed_by_receiver', true)
        .gte('transaction_date', validated.period_start)
        .lte('transaction_date', validated.period_end);

      if (error) throw error;

      const totalToEliminate = transactions?.reduce((sum, t) => sum + t.amount, 0) || 0;

      // Create elimination record
      const { data: elimination, error: elimError } = await supabase
        .from('intercompany_eliminations')
        .insert({
          period_start: validated.period_start,
          period_end: validated.period_end,
          consolidation_entity_id: validated.consolidation_entity_id,
          total_eliminated: totalToEliminate,
          transaction_count: transactions?.length || 0,
          status: 'completed',
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (elimError) throw elimError;

      // Create elimination details
      const details = transactions?.map(t => ({
        elimination_id: elimination.id,
        transaction_id: t.id,
        from_entity_id: t.from_entity_id,
        to_entity_id: t.to_entity_id,
        amount: t.amount,
        created_at: new Date().toISOString(),
      }));

      if (details?.length) {
        await supabase.from('elimination_details').insert(details);
      }

      // Mark transactions as eliminated
      const transactionIds = transactions?.map(t => t.id) || [];
      if (transactionIds.length) {
        await supabase
          .from('intercompany_transactions')
          .update({ status: 'eliminated', elimination_id: elimination.id })
          .in('id', transactionIds);
      }

      return NextResponse.json({
        elimination,
        transactions_eliminated: transactionIds.length,
        total_eliminated: totalToEliminate,
      }, { status: 201 });
    }

    if (action === 'settle_transaction') {
      const { transaction_id, settlement_date, settlement_method, notes } = body.data;

      const { data: transaction, error } = await supabase
        .from('intercompany_transactions')
        .update({
          status: 'settled',
          settlement_date,
          settlement_method,
          settlement_notes: notes,
        })
        .eq('id', transaction_id)
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json({ transaction });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    console.error('Intercompany error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH - Update transaction
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    const { data: transaction, error } = await supabase
      .from('intercompany_transactions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ transaction });
  } catch (error: any) {
    console.error('Intercompany error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Void transaction
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const reason = searchParams.get('reason');

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    // Check if transaction can be voided
    const { data: transaction } = await supabase
      .from('intercompany_transactions')
      .select('status')
      .eq('id', id)
      .single();

    if (transaction?.status === 'eliminated') {
      return NextResponse.json({ error: 'Cannot void eliminated transaction' }, { status: 400 });
    }

    const { error } = await supabase
      .from('intercompany_transactions')
      .update({
        status: 'voided',
        void_reason: reason,
        voided_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Intercompany error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
