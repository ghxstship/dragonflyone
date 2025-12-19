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

    const { data: access, error } = await supabase
      .from('client_portal_access')
      .select(`
        *,
        contact:contacts(id, first_name, last_name, email, phone, company),
        booking:bookings(id, booking_number, event_name, event_date, status)
      `)
      .eq('access_token', token)
      .eq('is_active', true)
      .single();

    if (error || !access) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    if (access.expires_at && new Date(access.expires_at) < new Date()) {
      return NextResponse.json({ error: 'Token has expired' }, { status: 401 });
    }

    await supabase
      .from('client_portal_access')
      .update({ last_accessed_at: new Date().toISOString() })
      .eq('id', access.id);

    await supabase.from('client_portal_activities').insert({
      access_id: access.id,
      action: 'login',
      metadata: { timestamp: new Date().toISOString() },
    });

    return NextResponse.json({
      access: {
        id: access.id,
        permissions: access.permissions,
        expires_at: access.expires_at,
      },
      contact: access.contact,
      booking: access.booking,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
