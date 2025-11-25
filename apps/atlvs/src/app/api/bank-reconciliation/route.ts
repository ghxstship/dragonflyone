import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

// Validation schemas
const bankAccountSchema = z.object({
  name: z.string().min(1),
  account_number: z.string().min(4),
  routing_number: z.string().optional(),
  bank_name: z.string(),
  account_type: z.enum(['checking', 'savings', 'money_market', 'credit_line']),
  currency: z.string().default('USD'),
  opening_balance: z.number().default(0),
  current_balance: z.number().optional(),
  is_primary: z.boolean().default(false),
});

const bankTransactionSchema = z.object({
  bank_account_id: z.string().uuid(),
  transaction_date: z.string().datetime(),
  amount: z.number(),
  transaction_type: z.enum(['deposit', 'withdrawal', 'transfer', 'fee', 'interest', 'adjustment']),
  description: z.string(),
  reference_number: z.string().optional(),
  payee: z.string().optional(),
  category: z.string().optional(),
});

const reconciliationSchema = z.object({
  bank_account_id: z.string().uuid(),
  statement_date: z.string().datetime(),
  statement_ending_balance: z.number(),
  statement_start_date: z.string().datetime().optional(),
});

// GET - Get bank reconciliation data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'accounts' | 'transactions' | 'reconciliation' | 'unmatched'
    const accountId = searchParams.get('account_id');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');

    if (type === 'accounts') {
      const { data: accounts, error } = await supabase
        .from('bank_accounts')
        .select('*')
        .eq('status', 'active')
        .order('is_primary', { ascending: false });

      if (error) throw error;

      // Get recent transaction counts
      const accountIds = accounts?.map(a => a.id) || [];
      const { data: txnCounts } = await supabase
        .from('bank_transactions')
        .select('bank_account_id')
        .in('bank_account_id', accountIds)
        .gte('transaction_date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      const countMap = txnCounts?.reduce((acc: Record<string, number>, t) => {
        acc[t.bank_account_id] = (acc[t.bank_account_id] || 0) + 1;
        return acc;
      }, {});

      const enrichedAccounts = accounts?.map(a => ({
        ...a,
        recent_transactions: countMap?.[a.id] || 0,
      }));

      return NextResponse.json({ accounts: enrichedAccounts });
    }

    if (type === 'transactions' && accountId) {
      let query = supabase
        .from('bank_transactions')
        .select(`
          *,
          matched_transaction:matched_ledger_entry_id(id, description, amount)
        `)
        .eq('bank_account_id', accountId)
        .order('transaction_date', { ascending: false });

      if (startDate) {
        query = query.gte('transaction_date', startDate);
      }
      if (endDate) {
        query = query.lte('transaction_date', endDate);
      }

      const { data: transactions, error } = await query.limit(500);

      if (error) throw error;

      // Calculate running balance
      let runningBalance = 0;
      const { data: account } = await supabase
        .from('bank_accounts')
        .select('opening_balance')
        .eq('id', accountId)
        .single();

      runningBalance = account?.opening_balance || 0;

      const withBalance = transactions?.reverse().map(t => {
        runningBalance += t.amount;
        return { ...t, running_balance: runningBalance };
      }).reverse();

      return NextResponse.json({ transactions: withBalance });
    }

    if (type === 'reconciliation' && accountId) {
      // Get reconciliation status
      const { data: lastReconciliation } = await supabase
        .from('bank_reconciliations')
        .select('*')
        .eq('bank_account_id', accountId)
        .order('statement_date', { ascending: false })
        .limit(1)
        .single();

      const { data: account } = await supabase
        .from('bank_accounts')
        .select('current_balance, opening_balance')
        .eq('id', accountId)
        .single();

      // Get unreconciled transactions
      const { data: unreconciled, error } = await supabase
        .from('bank_transactions')
        .select('*')
        .eq('bank_account_id', accountId)
        .eq('reconciled', false)
        .order('transaction_date', { ascending: false });

      if (error) throw error;

      // Calculate book balance
      const { data: allTransactions } = await supabase
        .from('bank_transactions')
        .select('amount')
        .eq('bank_account_id', accountId);

      const bookBalance = (account?.opening_balance || 0) + 
        (allTransactions?.reduce((sum, t) => sum + t.amount, 0) || 0);

      // Get outstanding items
      const deposits = unreconciled?.filter(t => t.amount > 0) || [];
      const withdrawals = unreconciled?.filter(t => t.amount < 0) || [];

      return NextResponse.json({
        last_reconciliation: lastReconciliation,
        book_balance: bookBalance,
        bank_balance: account?.current_balance || 0,
        unreconciled_count: unreconciled?.length || 0,
        outstanding_deposits: deposits.reduce((sum, t) => sum + t.amount, 0),
        outstanding_withdrawals: Math.abs(withdrawals.reduce((sum, t) => sum + t.amount, 0)),
        unreconciled_transactions: unreconciled,
      });
    }

    if (type === 'unmatched') {
      // Get unmatched bank transactions and ledger entries
      const { data: unmatchedBank, error: bankError } = await supabase
        .from('bank_transactions')
        .select('*')
        .is('matched_ledger_entry_id', null)
        .order('transaction_date', { ascending: false })
        .limit(100);

      if (bankError) throw bankError;

      const { data: unmatchedLedger, error: ledgerError } = await supabase
        .from('ledger_entries')
        .select('*')
        .is('matched_bank_transaction_id', null)
        .in('account_type', ['asset', 'liability'])
        .order('entry_date', { ascending: false })
        .limit(100);

      if (ledgerError) throw ledgerError;

      // Auto-suggest matches based on amount and date proximity
      const suggestions = unmatchedBank?.map(bankTxn => {
        const potentialMatches = unmatchedLedger?.filter(ledger => {
          const amountMatch = Math.abs(Math.abs(bankTxn.amount) - Math.abs(ledger.debit - ledger.credit)) < 0.01;
          const dateDiff = Math.abs(new Date(bankTxn.transaction_date).getTime() - new Date(ledger.entry_date).getTime());
          const dateClose = dateDiff < 7 * 24 * 60 * 60 * 1000; // Within 7 days
          return amountMatch && dateClose;
        });

        return {
          bank_transaction: bankTxn,
          potential_matches: potentialMatches || [],
          match_confidence: potentialMatches?.length === 1 ? 'high' : potentialMatches?.length ? 'medium' : 'none',
        };
      });

      return NextResponse.json({
        unmatched_bank: unmatchedBank,
        unmatched_ledger: unmatchedLedger,
        suggestions,
      });
    }

    // Default: return summary
    const { data: accounts } = await supabase
      .from('bank_accounts')
      .select('id, name, current_balance')
      .eq('status', 'active');

    const totalBalance = accounts?.reduce((sum, a) => sum + (a.current_balance || 0), 0) || 0;

    const { count: unreconciledCount } = await supabase
      .from('bank_transactions')
      .select('*', { count: 'exact', head: true })
      .eq('reconciled', false);

    return NextResponse.json({
      summary: {
        total_accounts: accounts?.length || 0,
        total_balance: totalBalance,
        unreconciled_transactions: unreconciledCount || 0,
      },
    });
  } catch (error: any) {
    console.error('Bank reconciliation error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Create account, transaction, or perform reconciliation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const action = body.action;

    if (action === 'create_account') {
      const validated = bankAccountSchema.parse(body.data);

      // If setting as primary, unset other primary accounts
      if (validated.is_primary) {
        await supabase
          .from('bank_accounts')
          .update({ is_primary: false })
          .eq('is_primary', true);
      }

      const { data: account, error } = await supabase
        .from('bank_accounts')
        .insert({
          ...validated,
          current_balance: validated.opening_balance,
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json({ account }, { status: 201 });
    }

    if (action === 'import_transactions') {
      const { bank_account_id, transactions } = body.data;

      const txnRecords = transactions.map((t: any) => ({
        bank_account_id,
        transaction_date: t.date,
        amount: t.amount,
        transaction_type: t.amount > 0 ? 'deposit' : 'withdrawal',
        description: t.description,
        reference_number: t.reference,
        payee: t.payee,
        reconciled: false,
        imported_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      }));

      const { data: imported, error } = await supabase
        .from('bank_transactions')
        .insert(txnRecords)
        .select();

      if (error) throw error;

      // Update account balance
      const totalAmount = transactions.reduce((sum: number, t: any) => sum + t.amount, 0);
      await supabase.rpc('update_bank_balance', { 
        p_account_id: bank_account_id, 
        p_amount: totalAmount 
      });

      return NextResponse.json({ imported, count: imported?.length }, { status: 201 });
    }

    if (action === 'add_transaction') {
      const validated = bankTransactionSchema.parse(body.data);

      const { data: transaction, error } = await supabase
        .from('bank_transactions')
        .insert({
          ...validated,
          reconciled: false,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      // Update account balance
      await supabase.rpc('update_bank_balance', { 
        p_account_id: validated.bank_account_id, 
        p_amount: validated.amount 
      });

      return NextResponse.json({ transaction }, { status: 201 });
    }

    if (action === 'match_transaction') {
      const { bank_transaction_id, ledger_entry_id } = body.data;

      // Update bank transaction
      await supabase
        .from('bank_transactions')
        .update({ 
          matched_ledger_entry_id: ledger_entry_id,
          matched_at: new Date().toISOString(),
        })
        .eq('id', bank_transaction_id);

      // Update ledger entry
      await supabase
        .from('ledger_entries')
        .update({ matched_bank_transaction_id: bank_transaction_id })
        .eq('id', ledger_entry_id);

      return NextResponse.json({ success: true, matched: true });
    }

    if (action === 'auto_match') {
      const { bank_account_id } = body.data;

      // Get unmatched transactions
      const { data: unmatchedBank } = await supabase
        .from('bank_transactions')
        .select('*')
        .eq('bank_account_id', bank_account_id)
        .is('matched_ledger_entry_id', null);

      const { data: unmatchedLedger } = await supabase
        .from('ledger_entries')
        .select('*')
        .is('matched_bank_transaction_id', null);

      let matchedCount = 0;

      for (const bankTxn of unmatchedBank || []) {
        const match = unmatchedLedger?.find(ledger => {
          const amountMatch = Math.abs(Math.abs(bankTxn.amount) - Math.abs(ledger.debit - ledger.credit)) < 0.01;
          const dateDiff = Math.abs(new Date(bankTxn.transaction_date).getTime() - new Date(ledger.entry_date).getTime());
          const dateClose = dateDiff < 3 * 24 * 60 * 60 * 1000; // Within 3 days
          return amountMatch && dateClose;
        });

        if (match) {
          await supabase
            .from('bank_transactions')
            .update({ matched_ledger_entry_id: match.id, matched_at: new Date().toISOString() })
            .eq('id', bankTxn.id);

          await supabase
            .from('ledger_entries')
            .update({ matched_bank_transaction_id: bankTxn.id })
            .eq('id', match.id);

          // Remove from available matches
          const idx = unmatchedLedger?.indexOf(match);
          if (idx !== undefined && idx > -1) unmatchedLedger?.splice(idx, 1);
          
          matchedCount++;
        }
      }

      return NextResponse.json({ matched_count: matchedCount });
    }

    if (action === 'complete_reconciliation') {
      const validated = reconciliationSchema.parse(body.data);

      // Get current book balance
      const { data: account } = await supabase
        .from('bank_accounts')
        .select('opening_balance')
        .eq('id', validated.bank_account_id)
        .single();

      const { data: transactions } = await supabase
        .from('bank_transactions')
        .select('amount')
        .eq('bank_account_id', validated.bank_account_id)
        .lte('transaction_date', validated.statement_date);

      const bookBalance = (account?.opening_balance || 0) + 
        (transactions?.reduce((sum, t) => sum + t.amount, 0) || 0);

      const difference = validated.statement_ending_balance - bookBalance;

      // Create reconciliation record
      const { data: reconciliation, error } = await supabase
        .from('bank_reconciliations')
        .insert({
          bank_account_id: validated.bank_account_id,
          statement_date: validated.statement_date,
          statement_ending_balance: validated.statement_ending_balance,
          book_balance: bookBalance,
          difference,
          status: Math.abs(difference) < 0.01 ? 'balanced' : 'unbalanced',
          reconciled_by: body.reconciled_by,
          reconciled_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      // Mark transactions as reconciled
      await supabase
        .from('bank_transactions')
        .update({ reconciled: true, reconciled_at: new Date().toISOString() })
        .eq('bank_account_id', validated.bank_account_id)
        .lte('transaction_date', validated.statement_date)
        .eq('reconciled', false);

      // Update account current balance
      await supabase
        .from('bank_accounts')
        .update({ 
          current_balance: validated.statement_ending_balance,
          last_reconciled_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', validated.bank_account_id);

      return NextResponse.json({ 
        reconciliation, 
        balanced: Math.abs(difference) < 0.01,
        difference,
      }, { status: 201 });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    console.error('Bank reconciliation error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH - Update account or transaction
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, type, ...updates } = body;

    if (type === 'account') {
      const { data: account, error } = await supabase
        .from('bank_accounts')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json({ account });
    }

    if (type === 'transaction') {
      const { data: transaction, error } = await supabase
        .from('bank_transactions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json({ transaction });
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  } catch (error: any) {
    console.error('Bank reconciliation error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Deactivate account or delete transaction
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const type = searchParams.get('type');

    if (!id || !type) {
      return NextResponse.json({ error: 'id and type are required' }, { status: 400 });
    }

    if (type === 'account') {
      const { error } = await supabase
        .from('bank_accounts')
        .update({ status: 'inactive', updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
    } else if (type === 'transaction') {
      // Get transaction to reverse balance
      const { data: txn } = await supabase
        .from('bank_transactions')
        .select('bank_account_id, amount, reconciled')
        .eq('id', id)
        .single();

      if (txn?.reconciled) {
        return NextResponse.json({ error: 'Cannot delete reconciled transaction' }, { status: 400 });
      }

      const { error } = await supabase
        .from('bank_transactions')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Reverse balance
      if (txn) {
        await supabase.rpc('update_bank_balance', { 
          p_account_id: txn.bank_account_id, 
          p_amount: -txn.amount 
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Bank reconciliation error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
