export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { logger } from '@ghxstship/config';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: tokenOrId } = await params;
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    let query = supabase
      .from('invoices')
      .select(`
        id, invoice_number, status, amount, tax_amount, total_amount,
        due_date, issued_date, notes, payment_terms,
        line_items, 
        client:clients(id, company_name, contact_name, email, address),
        organization:organizations(id, name, logo_url, address)
      `);

    if (token) {
      query = query.eq('view_token', token);
    } else {
      query = query.eq('id', tokenOrId);
    }

    const { data: invoice, error } = await query.single();

    if (error || !invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    if (invoice.status === 'sent') {
      await supabase
        .from('invoices')
        .update({ viewed_at: new Date().toISOString() })
        .eq('id', invoice.id);
    }

    return NextResponse.json({ data: invoice });
  } catch (error) {
    logger.error('Error in GET /api/invoices/[id]/view:', error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json({ error: 'Failed to fetch invoice' }, { status: 500 });
  }
}
