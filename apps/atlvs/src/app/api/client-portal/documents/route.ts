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
    if (!permissions.includes('view_documents') && !permissions.includes('all')) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
    }

    const [proposals, contracts] = await Promise.all([
      supabase
        .from('proposals')
        .select('id, proposal_number, name, status, created_at, valid_until')
        .eq('contact_id', access.contact_id)
        .order('created_at', { ascending: false }),
      supabase
        .from('contracts')
        .select('id, name, status, created_at')
        .eq('contact_id', access.contact_id)
        .order('created_at', { ascending: false }),
    ]);

    await supabase.from('client_portal_activities').insert({
      access_id: access.id,
      action: 'view_documents',
    });

    return NextResponse.json({
      documents: {
        proposals: proposals.data || [],
        contracts: contracts.data || [],
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
