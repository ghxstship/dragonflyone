export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { searchParams } = new URL(request.url);
    
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ error: 'Token required' }, { status: 400 });
    }

    const { data: access, error: accessError } = await supabase
      .from('client_portal_access')
      .select('id, contact_id, booking_id, permissions')
      .eq('access_token', token)
      .eq('is_active', true)
      .single();

    if (accessError || !access) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const permissions = access.permissions as string[];
    if (!permissions.includes('view_invoices') && !permissions.includes('all')) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
    }

    const { data: invoices, error } = await supabase
      .from('venue_invoices')
      .select(`
        id, invoice_number, status, subtotal, tax_amount, total,
        amount_paid, balance_due, due_date, issued_at,
        booking:bookings(id, booking_number, event_name)
      `)
      .eq('contact_id', access.contact_id)
      .order('issued_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const summary = {
      total_invoices: invoices?.length || 0,
      total_due: invoices?.reduce((sum, inv) => sum + (inv.balance_due || 0), 0) || 0,
      overdue: invoices?.filter(inv => 
        inv.status !== 'paid' && inv.due_date && new Date(inv.due_date) < new Date()
      ).length || 0,
    };

    await supabase.from('client_portal_activities').insert({
      access_id: access.id,
      action: 'view_invoices',
      metadata: { count: invoices?.length || 0 },
    });

    return NextResponse.json({ invoices, summary });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
