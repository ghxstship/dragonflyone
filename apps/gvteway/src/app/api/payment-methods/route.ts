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

// Validation schema
const paymentMethodSchema = z.object({
  method_type: z.enum([
    'credit_card', 'debit_card', 'bank_account', 'paypal',
    'apple_pay', 'google_pay', 'venmo', 'crypto', 'gift_card'
  ]),
  // Card fields (for tokenized cards)
  provider_payment_method_id: z.string().optional(), // Stripe pm_xxx
  provider_customer_id: z.string().optional(), // Stripe cus_xxx
  card_brand: z.string().optional(),
  last_four: z.string().length(4).optional(),
  expiry_month: z.number().min(1).max(12).optional(),
  expiry_year: z.number().optional(),
  cardholder_name: z.string().optional(),
  // Bank account fields
  bank_name: z.string().optional(),
  account_type: z.enum(['checking', 'savings']).optional(),
  routing_last_four: z.string().length(4).optional(),
  // Billing address
  billing_address_line1: z.string().optional(),
  billing_city: z.string().optional(),
  billing_state: z.string().optional(),
  billing_postal_code: z.string().optional(),
  billing_country: z.string().default('US'),
  // Settings
  nickname: z.string().optional(),
  is_default: z.boolean().default(false),
});

// GET /api/payment-methods - List user's payment methods
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    const status = searchParams.get('status') || 'active';

    if (!userId) {
      return NextResponse.json(
        { error: 'user_id is required' },
        { status: 400 }
      );
    }

    let query = supabase
      .from('payment_methods')
      .select('*')
      .eq('user_id', userId)
      .order('is_default', { ascending: false })
      .order('last_used_at', { ascending: false, nullsFirst: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching payment methods:', error);
      return NextResponse.json(
        { error: 'Failed to fetch payment methods', details: error.message },
        { status: 500 }
      );
    }

    // Mask sensitive data (already tokenized, but extra safety)
    const masked = data.map(pm => ({
      ...pm,
      // Don't expose full card numbers even if stored
      card_brand: pm.card_brand,
      last_four: pm.last_four,
      // Remove any sensitive fields
      provider_payment_method_id: pm.provider_payment_method_id ? '***' : null,
    }));

    return NextResponse.json({
      payment_methods: masked,
      default_method: masked.find(pm => pm.is_default),
      count: masked.length,
    });
  } catch (error) {
    console.error('Error in GET /api/payment-methods:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/payment-methods - Add new payment method
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const body = await request.json();

    // Validate input
    const validated = paymentMethodSchema.parse(body);
    const userId = body.user_id;

    if (!userId) {
      return NextResponse.json(
        { error: 'user_id is required' },
        { status: 400 }
      );
    }

    // TODO: Tokenize payment method with Stripe if not already tokenized
    // For now, assume provider_payment_method_id is provided from frontend

    if (!validated.provider_payment_method_id && 
        ['credit_card', 'debit_card', 'bank_account'].includes(validated.method_type)) {
      return NextResponse.json(
        { error: 'Payment method must be tokenized first' },
        { status: 400 }
      );
    }

    // Insert payment method
    const { data, error } = await supabase
      .from('payment_methods')
      .insert([
        {
          ...validated,
          user_id: userId,
          payment_provider: 'stripe',
          status: 'active',
          verified: true, // Stripe handles verification
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error adding payment method:', error);
      return NextResponse.json(
        { error: 'Failed to add payment method', details: error.message },
        { status: 500 }
      );
    }

    // If set as default, call function to ensure only one default
    if (validated.is_default) {
      await supabase.rpc('set_default_payment_method', {
        p_user_id: userId,
        p_payment_method_id: data.id,
      });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error in POST /api/payment-methods:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/payment-methods - Update payment method or set default
export async function PATCH(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const body = await request.json();
    const { payment_method_id, action, updates, user_id } = body;

    if (!payment_method_id) {
      return NextResponse.json(
        { error: 'payment_method_id is required' },
        { status: 400 }
      );
    }

    // Handle specific actions
    if (action === 'set_default') {
      if (!user_id) {
        return NextResponse.json(
          { error: 'user_id is required' },
          { status: 400 }
        );
      }

      await supabase.rpc('set_default_payment_method', {
        p_user_id: user_id,
        p_payment_method_id: payment_method_id,
      });

      return NextResponse.json({
        success: true,
        message: 'Default payment method updated',
      });
    }

    if (action === 'remove' || action === 'delete') {
      const { error } = await supabase
        .from('payment_methods')
        .update({
          status: 'removed',
          updated_at: new Date().toISOString(),
        })
        .eq('id', payment_method_id);

      if (error) {
        console.error('Error removing payment method:', error);
        return NextResponse.json(
          { error: 'Failed to remove payment method', details: error.message },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Payment method removed',
      });
    }

    // General update
    if (updates) {
      const allowedUpdates = ['nickname', 'billing_address_line1', 'billing_city', 
                              'billing_state', 'billing_postal_code', 'billing_country'];
      const filteredUpdates = Object.keys(updates)
        .filter(key => allowedUpdates.includes(key))
        .reduce((obj: any, key) => {
          obj[key] = updates[key];
          return obj;
        }, {});

      const { data, error } = await supabase
        .from('payment_methods')
        .update({
          ...filteredUpdates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', payment_method_id)
        .select()
        .single();

      if (error) {
        console.error('Error updating payment method:', error);
        return NextResponse.json(
          { error: 'Failed to update payment method', details: error.message },
          { status: 500 }
        );
      }

      return NextResponse.json(data);
    }

    return NextResponse.json(
      { error: 'No valid action or updates provided' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error in PATCH /api/payment-methods:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
