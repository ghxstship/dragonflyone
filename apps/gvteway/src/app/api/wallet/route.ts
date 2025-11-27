import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

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

// GET /api/wallet - Get user wallet with payment methods and recent transactions
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    const includeTransactions = searchParams.get('include_transactions') !== 'false';
    const transactionLimit = parseInt(searchParams.get('transaction_limit') || '10');

    if (!userId) {
      return NextResponse.json(
        { error: 'user_id is required' },
        { status: 400 }
      );
    }

    // Get wallet
    const { data: wallet, error: walletError } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (walletError && walletError.code !== 'PGRST116') {
      console.error('Error fetching wallet:', walletError);
      return NextResponse.json(
        { error: 'Failed to fetch wallet', details: walletError.message },
        { status: 500 }
      );
    }

    // If wallet doesn't exist, create one
    if (!wallet) {
      const { data: newWallet, error: createError } = await supabase
        .from('wallets')
        .insert([
          {
            user_id: userId,
            balance: 0,
            currency: 'USD',
            status: 'active',
          },
        ])
        .select()
        .single();

      if (createError) {
        console.error('Error creating wallet:', createError);
        return NextResponse.json(
          { error: 'Failed to create wallet', details: createError.message },
          { status: 500 }
        );
      }

      return NextResponse.json({
        wallet: newWallet,
        payment_methods: [],
        transactions: [],
        auto_reload: null,
      });
    }

    // Get payment methods
    const { data: paymentMethods } = await supabase
      .from('payment_methods')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('is_default', { ascending: false })
      .order('last_used_at', { ascending: false, nullsFirst: false });

    // Get recent transactions if requested
    let transactions = null;
    if (includeTransactions) {
      const { data: txData } = await supabase
        .from('wallet_transactions')
        .select('*')
        .eq('wallet_id', wallet.id)
        .order('created_at', { ascending: false })
        .limit(transactionLimit);

      transactions = txData;
    }

    // Get auto reload settings
    const { data: autoReload } = await supabase
      .from('wallet_auto_reload')
      .select('*')
      .eq('wallet_id', wallet.id)
      .single();

    // Calculate summary
    const summary = {
      balance: Number(wallet.balance),
      rewards_balance: wallet.rewards_balance || 0,
      cashback_balance: Number(wallet.cashback_balance || 0),
      payment_methods_count: paymentMethods?.length || 0,
      default_payment_method: paymentMethods?.find(pm => pm.is_default),
      auto_reload_enabled: autoReload?.enabled || false,
    };

    return NextResponse.json({
      wallet,
      payment_methods: paymentMethods || [],
      transactions: transactions || [],
      auto_reload: autoReload,
      summary,
    });
  } catch (error) {
    console.error('Error in GET /api/wallet:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/wallet/transaction - Process a wallet transaction
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const body = await request.json();
    const { action } = body;

    if (action === 'load') {
      return await handleLoadWallet(body);
    } else if (action === 'transfer') {
      return await handleTransfer(body);
    } else if (action === 'withdraw') {
      return await handleWithdraw(body);
    } else {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      );
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error in POST /api/wallet/transaction:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper: Load wallet
async function handleLoadWallet(body: any) {
  const schema = z.object({
    user_id: z.string().uuid(),
    amount: z.number().positive(),
    payment_method_id: z.string().uuid(),
    description: z.string().optional(),
  });

  const validated = schema.parse(body);

  // Get wallet
  const { data: wallet } = await supabase
    .from('wallets')
    .select('id')
    .eq('user_id', validated.user_id)
    .single();

  if (!wallet) {
    return NextResponse.json(
      { error: 'Wallet not found' },
      { status: 404 }
    );
  }

  // TODO: Process actual payment with Stripe using payment_method_id
  // For now, simulate successful payment

  // Call wallet transaction function
  const { data: transactionId, error } = await supabase.rpc(
    'process_wallet_transaction',
    {
      p_wallet_id: wallet.id,
      p_transaction_type: 'load',
      p_amount: validated.amount,
      p_description: validated.description || 'Wallet load',
      p_payment_method_id: validated.payment_method_id,
    }
  );

  if (error) {
    console.error('Error processing transaction:', error);
    return NextResponse.json(
      { error: 'Failed to process transaction', details: error.message },
      { status: 500 }
    );
  }

  // Update payment method last used
  await supabase
    .from('payment_methods')
    .update({ last_used_at: new Date().toISOString() })
    .eq('id', validated.payment_method_id);

  return NextResponse.json({
    success: true,
    transaction_id: transactionId,
    message: 'Wallet loaded successfully',
  }, { status: 201 });
}

// Helper: Transfer between users
async function handleTransfer(body: any) {
  const schema = z.object({
    from_user_id: z.string().uuid(),
    to_user_id: z.string().uuid(),
    amount: z.number().positive(),
    description: z.string().optional(),
  });

  const validated = schema.parse(body);

  // Get both wallets
  const { data: fromWallet } = await supabase
    .from('wallets')
    .select('id, balance')
    .eq('user_id', validated.from_user_id)
    .single();

  const { data: toWallet } = await supabase
    .from('wallets')
    .select('id')
    .eq('user_id', validated.to_user_id)
    .single();

  if (!fromWallet || !toWallet) {
    return NextResponse.json(
      { error: 'Wallet not found' },
      { status: 404 }
    );
  }

  // Check sufficient balance
  if (Number(fromWallet.balance) < validated.amount) {
    return NextResponse.json(
      { error: 'Insufficient balance' },
      { status: 400 }
    );
  }

  // Process outgoing transaction
  await supabase.rpc('process_wallet_transaction', {
    p_wallet_id: fromWallet.id,
    p_transaction_type: 'transfer_out',
    p_amount: validated.amount,
    p_description: validated.description || 'Transfer out',
  });

  // Process incoming transaction
  await supabase.rpc('process_wallet_transaction', {
    p_wallet_id: toWallet.id,
    p_transaction_type: 'transfer_in',
    p_amount: validated.amount,
    p_description: validated.description || 'Transfer in',
  });

  return NextResponse.json({
    success: true,
    message: 'Transfer completed successfully',
  });
}

// Helper: Withdraw to bank account
async function handleWithdraw(body: any) {
  const schema = z.object({
    user_id: z.string().uuid(),
    amount: z.number().positive(),
    payment_method_id: z.string().uuid(),
  });

  const validated = schema.parse(body);

  // Get wallet
  const { data: wallet } = await supabase
    .from('wallets')
    .select('id, balance')
    .eq('user_id', validated.user_id)
    .single();

  if (!wallet) {
    return NextResponse.json(
      { error: 'Wallet not found' },
      { status: 404 }
    );
  }

  // Check sufficient balance
  if (Number(wallet.balance) < validated.amount) {
    return NextResponse.json(
      { error: 'Insufficient balance' },
      { status: 400 }
    );
  }

  // TODO: Process actual payout with Stripe

  // Process withdrawal transaction
  await supabase.rpc('process_wallet_transaction', {
    p_wallet_id: wallet.id,
    p_transaction_type: 'transfer_out',
    p_amount: validated.amount,
    p_description: 'Withdrawal to bank account',
    p_payment_method_id: validated.payment_method_id,
  });

  return NextResponse.json({
    success: true,
    message: 'Withdrawal initiated successfully',
  });
}
