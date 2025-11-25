import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const CreditCardAccountSchema = z.object({
  name: z.string(),
  card_type: z.enum(['visa', 'mastercard', 'amex', 'discover', 'other']),
  last_four: z.string().length(4),
  credit_limit: z.number().positive(),
  billing_cycle_day: z.number().int().min(1).max(31),
  payment_due_day: z.number().int().min(1).max(31),
  interest_rate: z.number().min(0).max(100).optional(),
  annual_fee: z.number().optional(),
  rewards_program: z.string().optional(),
  assigned_to: z.string().uuid().optional(),
  department_id: z.string().uuid().optional(),
  spending_limit: z.number().positive().optional(),
  is_active: z.boolean().default(true),
});

const TransactionSchema = z.object({
  card_id: z.string().uuid(),
  transaction_date: z.string(),
  post_date: z.string().optional(),
  merchant_name: z.string(),
  merchant_category: z.string().optional(),
  amount: z.number(),
  currency: z.string().default('USD'),
  description: z.string().optional(),
  expense_category_id: z.string().uuid().optional(),
  project_id: z.string().uuid().optional(),
  receipt_url: z.string().url().optional(),
  notes: z.string().optional(),
  status: z.enum(['pending', 'posted', 'disputed', 'reconciled']).default('pending'),
});

// GET /api/credit-card-reconciliation - Get credit card accounts and transactions
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const cardId = searchParams.get('card_id');
    const statementPeriod = searchParams.get('statement_period');
    const status = searchParams.get('status');
    const unreconciled = searchParams.get('unreconciled') === 'true';
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (cardId) {
      // Get transactions for specific card
      let query = supabase
        .from('credit_card_transactions')
        .select(`
          *,
          card:credit_card_accounts(name, last_four, card_type),
          expense_category:expense_categories(name),
          project:projects(name)
        `, { count: 'exact' })
        .eq('card_id', cardId)
        .order('transaction_date', { ascending: false })
        .range(offset, offset + limit - 1);

      if (statementPeriod) {
        const [year, month] = statementPeriod.split('-');
        const startDate = `${year}-${month}-01`;
        const endDate = new Date(parseInt(year), parseInt(month), 0).toISOString().split('T')[0];
        query = query.gte('transaction_date', startDate).lte('transaction_date', endDate);
      }

      if (status) {
        query = query.eq('status', status);
      }

      if (unreconciled) {
        query = query.neq('status', 'reconciled');
      }

      const { data: transactions, error, count } = await query;

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Get card summary
      const { data: card } = await supabase
        .from('credit_card_accounts')
        .select('*')
        .eq('id', cardId)
        .single();

      // Calculate totals
      const totalAmount = transactions?.reduce((sum, t) => sum + t.amount, 0) || 0;
      const reconciledAmount = transactions?.filter(t => t.status === 'reconciled').reduce((sum, t) => sum + t.amount, 0) || 0;
      const pendingAmount = transactions?.filter(t => t.status === 'pending').reduce((sum, t) => sum + t.amount, 0) || 0;

      return NextResponse.json({
        card,
        transactions: transactions || [],
        total: count || 0,
        summary: {
          total_amount: totalAmount,
          reconciled_amount: reconciledAmount,
          pending_amount: pendingAmount,
          unreconciled_count: transactions?.filter(t => t.status !== 'reconciled').length || 0,
        },
        limit,
        offset,
      });
    } else {
      // Get all credit card accounts
      const { data: cards, error } = await supabase
        .from('credit_card_accounts')
        .select(`
          *,
          assigned_user:platform_users(first_name, last_name, email),
          department:departments(name)
        `)
        .eq('is_active', true)
        .order('name');

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Get unreconciled transaction counts for each card
      const cardIds = cards?.map(c => c.id) || [];
      const { data: unreconciledCounts } = await supabase
        .from('credit_card_transactions')
        .select('card_id')
        .in('card_id', cardIds)
        .neq('status', 'reconciled');

      const countsByCard: Record<string, number> = {};
      unreconciledCounts?.forEach(t => {
        countsByCard[t.card_id] = (countsByCard[t.card_id] || 0) + 1;
      });

      const cardsWithCounts = cards?.map(c => ({
        ...c,
        unreconciled_count: countsByCard[c.id] || 0,
      }));

      return NextResponse.json({
        cards: cardsWithCounts || [],
      });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch credit card data' }, { status: 500 });
  }
}

// POST /api/credit-card-reconciliation - Create card account or transaction
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const action = body.action || 'create_transaction';

    if (action === 'create_card') {
      const validated = CreditCardAccountSchema.parse(body);

      const { data: card, error } = await supabase
        .from('credit_card_accounts')
        .insert({
          ...validated,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ card }, { status: 201 });
    } else if (action === 'import_statement') {
      // Import transactions from statement
      const { card_id, transactions } = body;

      if (!card_id || !transactions || !Array.isArray(transactions)) {
        return NextResponse.json({ error: 'Card ID and transactions array required' }, { status: 400 });
      }

      const validatedTransactions = transactions.map(t => ({
        card_id,
        transaction_date: t.transaction_date,
        post_date: t.post_date,
        merchant_name: t.merchant_name,
        merchant_category: t.merchant_category,
        amount: t.amount,
        currency: t.currency || 'USD',
        description: t.description,
        status: 'pending',
        imported_at: new Date().toISOString(),
        imported_by: user.id,
      }));

      const { data: imported, error } = await supabase
        .from('credit_card_transactions')
        .insert(validatedTransactions)
        .select();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ 
        imported_count: imported?.length || 0,
        transactions: imported,
      }, { status: 201 });
    } else if (action === 'reconcile') {
      // Reconcile transactions
      const { transaction_ids, expense_category_id, project_id } = body;

      if (!transaction_ids || !Array.isArray(transaction_ids)) {
        return NextResponse.json({ error: 'Transaction IDs required' }, { status: 400 });
      }

      const { data: reconciled, error } = await supabase
        .from('credit_card_transactions')
        .update({
          status: 'reconciled',
          expense_category_id,
          project_id,
          reconciled_at: new Date().toISOString(),
          reconciled_by: user.id,
        })
        .in('id', transaction_ids)
        .select();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ 
        reconciled_count: reconciled?.length || 0,
        transactions: reconciled,
      });
    } else {
      // Create single transaction
      const validated = TransactionSchema.parse(body);

      const { data: transaction, error } = await supabase
        .from('credit_card_transactions')
        .insert({
          ...validated,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ transaction }, { status: 201 });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}

// PATCH /api/credit-card-reconciliation - Update transaction
export async function PATCH(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const transactionId = searchParams.get('transaction_id');
    const cardId = searchParams.get('card_id');

    const body = await request.json();

    if (transactionId) {
      const { data: transaction, error } = await supabase
        .from('credit_card_transactions')
        .update({
          ...body,
          updated_at: new Date().toISOString(),
          updated_by: user.id,
        })
        .eq('id', transactionId)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ transaction });
    } else if (cardId) {
      const { data: card, error } = await supabase
        .from('credit_card_accounts')
        .update({
          ...body,
          updated_at: new Date().toISOString(),
        })
        .eq('id', cardId)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ card });
    }

    return NextResponse.json({ error: 'Transaction ID or Card ID required' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}
