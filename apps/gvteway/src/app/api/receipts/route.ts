import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const transactionId = searchParams.get('transaction_id');
    const orderId = searchParams.get('order_id');
    const format = searchParams.get('format') || 'json';

    let transaction;

    if (transactionId) {
      const { data } = await supabase
        .from('pos_transactions')
        .select(`*, items:pos_transaction_items(*), terminal:pos_terminals(terminal_name, location)`)
        .eq('id', transactionId)
        .single();
      transaction = data;
    } else if (orderId) {
      const { data } = await supabase
        .from('orders')
        .select(`*, items:order_items(*, product:products(name)), user:platform_users(first_name, last_name, email)`)
        .eq('id', orderId)
        .single();
      transaction = data;
    }

    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    const receipt = {
      receipt_number: `RCP-${Date.now().toString(36).toUpperCase()}`,
      date: transaction.created_at,
      items: transaction.items?.map((item: any) => ({
        name: item.product_name || item.product?.name,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total: item.total_price || item.unit_price * item.quantity,
      })),
      subtotal: transaction.subtotal,
      tax: transaction.tax,
      tip: transaction.tip || 0,
      total: transaction.total,
      payment_method: transaction.payment_method,
      terminal: transaction.terminal?.terminal_name,
      location: transaction.terminal?.location,
    };

    if (format === 'text') {
      // Generate text receipt for thermal printer
      let text = '================================\n';
      text += '           RECEIPT              \n';
      text += '================================\n';
      text += `Receipt #: ${receipt.receipt_number}\n`;
      text += `Date: ${new Date(receipt.date).toLocaleString()}\n`;
      text += '--------------------------------\n';

      receipt.items?.forEach((item: any) => {
        text += `${item.name}\n`;
        text += `  ${item.quantity} x $${item.unit_price.toFixed(2)} = $${item.total.toFixed(2)}\n`;
      });

      text += '--------------------------------\n';
      text += `Subtotal:     $${receipt.subtotal.toFixed(2)}\n`;
      text += `Tax:          $${receipt.tax.toFixed(2)}\n`;
      if (receipt.tip > 0) {
        text += `Tip:          $${receipt.tip.toFixed(2)}\n`;
      }
      text += `TOTAL:        $${receipt.total.toFixed(2)}\n`;
      text += '================================\n';
      text += '      Thank you for your visit!  \n';
      text += '================================\n';

      return new NextResponse(text, {
        headers: { 'Content-Type': 'text/plain' },
      });
    }

    return NextResponse.json({ receipt });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const body = await request.json();
    const { transaction_id, delivery_method, recipient } = body;

    // Log receipt delivery
    const { data: delivery, error } = await supabase
      .from('receipt_deliveries')
      .insert({
        transaction_id,
        delivery_method, // 'email', 'sms', 'print'
        recipient,
        status: 'sent',
        sent_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      delivery,
      message: `Receipt sent via ${delivery_method}`,
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
