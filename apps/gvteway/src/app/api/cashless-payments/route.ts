export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

const cashlessPaymentSchema = z.object({
  event_id: z.string().uuid(),
  user_id: z.string().uuid().optional(),
  amount: z.number().positive(),
  currency: z.string().default('USD'),
  payment_method: z.enum(['nfc', 'qr_code', 'wristband', 'mobile_wallet']),
  vendor_id: z.string().uuid().optional(),
  description: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('event_id');
    const userId = searchParams.get('user_id');
    const status = searchParams.get('status');

    let query = supabase
      .from('cashless_payments')
      .select('*')
      .order('created_at', { ascending: false });

    if (eventId) query = query.eq('event_id', eventId);
    if (userId) query = query.eq('user_id', userId);
    if (status) query = query.eq('status', status);

    const { data: payments, error } = await query.limit(100);
    if (error) throw error;

    return NextResponse.json({ payments });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const body = await request.json();
    const validated = cashlessPaymentSchema.parse(body);

    const { data: payment, error } = await supabase
      .from('cashless_payments')
      .insert({
        ...validated,
        status: 'pending',
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ payment }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Payment ID required' }, { status: 400 });
    }

    const { data: payment, error } = await supabase
      .from('cashless_payments')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ payment });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
