import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - Fetch intellectual property records
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'trademark', 'copyright', 'patent', 'trade_secret', 'all'
    const status = searchParams.get('status');

    let query = supabase
      .from('intellectual_property')
      .select(`
        *,
        owner:platform_users!owner_id(id, email, first_name, last_name),
        documents:ip_documents(*)
      `);

    if (type && type !== 'all') {
      query = query.eq('ip_type', type);
    }

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Get upcoming renewals
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const upcomingRenewals = data.filter(
      ip => ip.renewal_date && new Date(ip.renewal_date) <= thirtyDaysFromNow
    );

    return NextResponse.json({
      intellectual_property: data,
      upcoming_renewals: upcomingRenewals,
      stats: {
        total: data.length,
        by_type: data.reduce((acc: Record<string, number>, ip) => {
          acc[ip.ip_type] = (acc[ip.ip_type] || 0) + 1;
          return acc;
        }, {}),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch IP records' },
      { status: 500 }
    );
  }
}

// POST - Create IP record
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
    const {
      name,
      ip_type, // 'trademark', 'copyright', 'patent', 'trade_secret', 'design'
      description,
      registration_number,
      filing_date,
      registration_date,
      expiration_date,
      renewal_date,
      jurisdiction,
      classes, // For trademarks
      inventors, // For patents
      authors, // For copyrights
      owner_id,
      status,
      notes,
    } = body;

    const { data: ip, error } = await supabase
      .from('intellectual_property')
      .insert({
        name,
        ip_type,
        description,
        registration_number,
        filing_date,
        registration_date,
        expiration_date,
        renewal_date,
        jurisdiction: jurisdiction || 'US',
        classes: classes || [],
        inventors: inventors || [],
        authors: authors || [],
        owner_id: owner_id || user.id,
        status: status || 'pending',
        notes,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Create audit log
    await supabase.from('audit_logs').insert({
      entity_type: 'intellectual_property',
      entity_id: ip.id,
      action: 'created',
      user_id: user.id,
      details: { name, ip_type },
    });

    return NextResponse.json({ intellectual_property: ip }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create IP record' },
      { status: 500 }
    );
  }
}

// PATCH - Update IP record
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

    const body = await request.json();
    const { id, ...updateData } = body;

    const { error } = await supabase
      .from('intellectual_property')
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
        updated_by: user.id,
      })
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Create audit log
    await supabase.from('audit_logs').insert({
      entity_type: 'intellectual_property',
      entity_id: id,
      action: 'updated',
      user_id: user.id,
      details: updateData,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update IP record' },
      { status: 500 }
    );
  }
}
