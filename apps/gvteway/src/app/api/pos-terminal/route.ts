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

const transactionSchema = z.object({
  terminal_id: z.string().uuid(),
  items: z.array(z.object({
    product_id: z.string().uuid().optional(),
    product_name: z.string(),
    quantity: z.number().min(1),
    unit_price: z.number().min(0),
  })),
  payment_method: z.enum(['cash', 'card', 'nfc', 'rfid', 'split']),
  tip: z.number().min(0).default(0),
  cashier_id: z.string().uuid().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('event_id');
    const terminalId = searchParams.get('terminal_id');
    const type = searchParams.get('type');

    if (type === 'transactions' && terminalId) {
      const { data: transactions, error } = await supabase
        .from('pos_transactions')
        .select(`*, items:pos_transaction_items(*)`)
        .eq('terminal_id', terminalId)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      return NextResponse.json({ transactions });
    }

    if (type === 'sales_report') {
      const startDate = searchParams.get('start_date');
      const endDate = searchParams.get('end_date');

      let query = supabase
        .from('pos_transactions')
        .select('terminal_id, total, payment_method, created_at')
        .eq('transaction_type', 'sale');

      if (terminalId) query = query.eq('terminal_id', terminalId);
      if (startDate) query = query.gte('created_at', startDate);
      if (endDate) query = query.lte('created_at', endDate);

      const { data: transactions } = await query;

      const summary = {
        total_sales: transactions?.reduce((sum, t) => sum + t.total, 0) || 0,
        transaction_count: transactions?.length || 0,
        by_payment_method: transactions?.reduce((acc: Record<string, number>, t) => {
          acc[t.payment_method] = (acc[t.payment_method] || 0) + t.total;
          return acc;
        }, {}),
      };

      return NextResponse.json({ summary, transactions });
    }

    let query = supabase.from('pos_terminals').select('*');
    if (eventId) query = query.eq('event_id', eventId);

    const { data: terminals, error } = await query;
    if (error) throw error;

    return NextResponse.json({ terminals });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const body = await request.json();
    const action = body.action;

    if (action === 'create_terminal') {
      const { event_id, venue_id, terminal_name, terminal_type, location } = body.data;

      const { data: terminal, error } = await supabase
        .from('pos_terminals')
        .insert({
          event_id,
          venue_id,
          terminal_name,
          terminal_type,
          location,
          status: 'active',
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ terminal }, { status: 201 });
    }

    if (action === 'process_sale') {
      const validated = transactionSchema.parse(body.data);

      // Calculate totals
      const subtotal = validated.items.reduce((sum, item) => sum + item.unit_price * item.quantity, 0);
      const tax = subtotal * 0.0875; // Example tax rate
      const total = subtotal + tax + validated.tip;

      // Create transaction
      const { data: transaction, error } = await supabase
        .from('pos_transactions')
        .insert({
          terminal_id: validated.terminal_id,
          transaction_type: 'sale',
          payment_method: validated.payment_method,
          subtotal,
          tax,
          tip: validated.tip,
          total,
          cashier_id: validated.cashier_id,
          status: 'completed',
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      // Create transaction items
      const items = validated.items.map(item => ({
        transaction_id: transaction.id,
        product_id: item.product_id,
        product_name: item.product_name,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.unit_price * item.quantity,
      }));

      await supabase.from('pos_transaction_items').insert(items);

      // Update terminal last sync
      await supabase
        .from('pos_terminals')
        .update({ last_sync_at: new Date().toISOString() })
        .eq('id', validated.terminal_id);

      return NextResponse.json({ transaction, receipt: { subtotal, tax, tip: validated.tip, total } }, { status: 201 });
    }

    if (action === 'refund') {
      const { original_transaction_id, reason } = body.data;

      const { data: original } = await supabase
        .from('pos_transactions')
        .select('*')
        .eq('id', original_transaction_id)
        .single();

      if (!original) return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });

      const { data: refund, error } = await supabase
        .from('pos_transactions')
        .insert({
          terminal_id: original.terminal_id,
          transaction_type: 'refund',
          payment_method: original.payment_method,
          subtotal: -original.subtotal,
          tax: -original.tax,
          tip: 0,
          total: -original.total,
          status: 'completed',
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ refund }, { status: 201 });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const body = await request.json();
    const { id, ...updates } = body;

    const { data: terminal, error } = await supabase
      .from('pos_terminals')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ terminal });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
