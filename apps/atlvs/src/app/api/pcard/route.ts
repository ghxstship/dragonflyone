import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const PCardSchema = z.object({
  cardholder_id: z.string().uuid(),
  card_number_last_four: z.string().length(4),
  card_type: z.enum(['visa', 'mastercard', 'amex']),
  credit_limit: z.number().positive(),
  single_transaction_limit: z.number().positive().optional(),
  monthly_limit: z.number().positive().optional(),
  department_id: z.string().uuid().optional(),
  cost_center: z.string().optional(),
  allowed_merchant_categories: z.array(z.string()).optional(),
  blocked_merchant_categories: z.array(z.string()).optional(),
  expiration_date: z.string(),
  is_active: z.boolean().default(true),
});

const PCardTransactionSchema = z.object({
  pcard_id: z.string().uuid(),
  transaction_date: z.string(),
  merchant_name: z.string(),
  merchant_category_code: z.string().optional(),
  amount: z.number(),
  currency: z.string().default('USD'),
  description: z.string().optional(),
  receipt_url: z.string().url().optional(),
  expense_category_id: z.string().uuid().optional(),
  project_id: z.string().uuid().optional(),
  gl_account_id: z.string().uuid().optional(),
  notes: z.string().optional(),
});

// GET /api/pcard - Get P-cards and transactions
export async function GET(request: NextRequest) {
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
    const pcardId = searchParams.get('pcard_id');
    const cardholderId = searchParams.get('cardholder_id');
    const statementPeriod = searchParams.get('statement_period');
    const status = searchParams.get('status');
    const unreconciledOnly = searchParams.get('unreconciled_only') === 'true';
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (pcardId) {
      // Get transactions for specific P-card
      let query = supabase
        .from('pcard_transactions')
        .select(`
          *,
          pcard:pcards(card_number_last_four, cardholder:platform_users(first_name, last_name)),
          expense_category:expense_categories(name),
          project:projects(name)
        `, { count: 'exact' })
        .eq('pcard_id', pcardId)
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

      if (unreconciledOnly) {
        query = query.neq('status', 'reconciled');
      }

      const { data: transactions, error, count } = await query;

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Get P-card details
      const { data: pcard } = await supabase
        .from('pcards')
        .select(`
          *,
          cardholder:platform_users(id, first_name, last_name, email),
          department:departments(name)
        `)
        .eq('id', pcardId)
        .single();

      // Calculate totals
      const totalAmount = transactions?.reduce((sum, t) => sum + t.amount, 0) || 0;
      const reconciledAmount = transactions?.filter(t => t.status === 'reconciled').reduce((sum, t) => sum + t.amount, 0) || 0;
      const pendingAmount = transactions?.filter(t => t.status === 'pending').reduce((sum, t) => sum + t.amount, 0) || 0;

      return NextResponse.json({
        pcard,
        transactions: transactions || [],
        total: count || 0,
        summary: {
          total_amount: totalAmount,
          reconciled_amount: reconciledAmount,
          pending_amount: pendingAmount,
          unreconciled_count: transactions?.filter(t => t.status !== 'reconciled').length || 0,
          available_credit: pcard ? pcard.credit_limit - totalAmount : 0,
        },
        limit,
        offset,
      });
    } else {
      // Get all P-cards
      let query = supabase
        .from('pcards')
        .select(`
          *,
          cardholder:platform_users(id, first_name, last_name, email),
          department:departments(name)
        `)
        .order('created_at', { ascending: false });

      if (cardholderId) {
        query = query.eq('cardholder_id', cardholderId);
      }

      const { data: pcards, error } = await query;

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Get current month spending for each card
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const pcardIds = pcards?.map(p => p.id) || [];
      const { data: monthlySpending } = await supabase
        .from('pcard_transactions')
        .select('pcard_id, amount')
        .in('pcard_id', pcardIds)
        .gte('transaction_date', startOfMonth.toISOString());

      const spendingByCard: Record<string, number> = {};
      monthlySpending?.forEach(t => {
        spendingByCard[t.pcard_id] = (spendingByCard[t.pcard_id] || 0) + t.amount;
      });

      const pcardsWithSpending = pcards?.map(p => ({
        ...p,
        current_month_spending: spendingByCard[p.id] || 0,
        available_credit: p.credit_limit - (spendingByCard[p.id] || 0),
        utilization_percent: ((spendingByCard[p.id] || 0) / p.credit_limit * 100).toFixed(2),
      }));

      return NextResponse.json({
        pcards: pcardsWithSpending || [],
      });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch P-card data' }, { status: 500 });
  }
}

// POST /api/pcard - Create P-card or transaction
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

    if (action === 'create_pcard') {
      const validated = PCardSchema.parse(body);

      const { data: pcard, error } = await supabase
        .from('pcards')
        .insert({
          ...validated,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ pcard }, { status: 201 });
    } else if (action === 'create_transaction') {
      const validated = PCardTransactionSchema.parse(body);

      // Check transaction limits
      const { data: pcard } = await supabase
        .from('pcards')
        .select('*')
        .eq('id', validated.pcard_id)
        .single();

      if (!pcard) {
        return NextResponse.json({ error: 'P-card not found' }, { status: 404 });
      }

      if (!pcard.is_active) {
        return NextResponse.json({ error: 'P-card is inactive' }, { status: 400 });
      }

      // Check single transaction limit
      if (pcard.single_transaction_limit && validated.amount > pcard.single_transaction_limit) {
        return NextResponse.json({ 
          error: 'Transaction exceeds single transaction limit',
          limit: pcard.single_transaction_limit,
        }, { status: 400 });
      }

      // Check blocked merchant categories
      if (pcard.blocked_merchant_categories?.includes(validated.merchant_category_code)) {
        return NextResponse.json({ 
          error: 'Merchant category is blocked for this card',
        }, { status: 400 });
      }

      const { data: transaction, error } = await supabase
        .from('pcard_transactions')
        .insert({
          ...validated,
          status: 'pending',
          created_by: user.id,
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ transaction }, { status: 201 });
    } else if (action === 'import_statement') {
      const { pcard_id, transactions } = body;

      if (!pcard_id || !transactions || !Array.isArray(transactions)) {
        return NextResponse.json({ error: 'P-card ID and transactions array required' }, { status: 400 });
      }

      const importedTransactions = transactions.map(t => ({
        pcard_id,
        transaction_date: t.transaction_date,
        merchant_name: t.merchant_name,
        merchant_category_code: t.merchant_category_code,
        amount: t.amount,
        currency: t.currency || 'USD',
        description: t.description,
        status: 'pending',
        imported_at: new Date().toISOString(),
        imported_by: user.id,
      }));

      const { data: imported, error } = await supabase
        .from('pcard_transactions')
        .insert(importedTransactions)
        .select();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({
        imported_count: imported?.length || 0,
        transactions: imported,
      }, { status: 201 });
    } else if (action === 'reconcile') {
      const { transaction_ids, expense_category_id, project_id, gl_account_id } = body;

      if (!transaction_ids || !Array.isArray(transaction_ids)) {
        return NextResponse.json({ error: 'Transaction IDs required' }, { status: 400 });
      }

      const { data: reconciled, error } = await supabase
        .from('pcard_transactions')
        .update({
          status: 'reconciled',
          expense_category_id,
          project_id,
          gl_account_id,
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
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}

// PATCH /api/pcard - Update P-card or transaction
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
    const pcardId = searchParams.get('pcard_id');
    const transactionId = searchParams.get('transaction_id');

    const body = await request.json();

    if (transactionId) {
      const { data: transaction, error } = await supabase
        .from('pcard_transactions')
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
    } else if (pcardId) {
      const { data: pcard, error } = await supabase
        .from('pcards')
        .update({
          ...body,
          updated_at: new Date().toISOString(),
        })
        .eq('id', pcardId)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ pcard });
    }

    return NextResponse.json({ error: 'P-card ID or Transaction ID required' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}
