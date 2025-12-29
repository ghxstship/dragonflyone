export const dynamic = 'force-dynamic';

import { withAuth, PlatformRole } from '@ghxstship/config';
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { z } from 'zod';

const createIPSchema = z.object({
  name: z.string().min(1),
  ip_type: z.enum(['trademark', 'copyright', 'patent', 'trade_secret', 'design']),
  description: z.string().optional(),
  registration_number: z.string().optional(),
  filing_date: z.string().optional(),
  registration_date: z.string().optional(),
  expiration_date: z.string().optional(),
  renewal_date: z.string().optional(),
  jurisdiction: z.string().optional(),
  classes: z.array(z.string()).optional(),
  inventors: z.array(z.string()).optional(),
  authors: z.array(z.string()).optional(),
  owner_id: z.string().uuid().optional(),
  status: z.string().optional(),
  notes: z.string().optional(),
});

const updateIPSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).optional(),
  ip_type: z.enum(['trademark', 'copyright', 'patent', 'trade_secret', 'design']).optional(),
  description: z.string().optional(),
  registration_number: z.string().optional(),
  filing_date: z.string().optional(),
  registration_date: z.string().optional(),
  expiration_date: z.string().optional(),
  renewal_date: z.string().optional(),
  jurisdiction: z.string().optional(),
  classes: z.array(z.string()).optional(),
  inventors: z.array(z.string()).optional(),
  authors: z.array(z.string()).optional(),
  owner_id: z.string().uuid().optional(),
  status: z.string().optional(),
  notes: z.string().optional(),
});

// GET - Fetch intellectual property records
const ATLVS_ROLES = [
  PlatformRole.ATLVS_SUPER_ADMIN, PlatformRole.ATLVS_ADMIN, PlatformRole.ATLVS_TEAM_MEMBER, PlatformRole.ATLVS_VIEWER,
  PlatformRole.LEGEND_SUPER_ADMIN, PlatformRole.LEGEND_ADMIN, PlatformRole.LEGEND_DEVELOPER,
];

export async function GET(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'trademark', 'copyright', 'patent', 'trade_secret', 'all'
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = (page - 1) * limit;

    let query = supabase
      .from('intellectual_property')
      .select(`
        id, name, ip_type, registration_number, status, filing_date, registration_date, renewal_date, created_at,
        owner:platform_users!owner_id(id, email, first_name, last_name),
        documents:ip_documents(id, name, file_url)
      `, { count: 'exact' });

    if (type && type !== 'all') {
      query = query.eq('ip_type', type);
    }

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
    }

    // Get upcoming renewals
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const upcomingRenewals = data.filter(
      ip => ip.renewal_date && new Date(ip.renewal_date) <= thirtyDaysFromNow
    );

    const totalCount = count || (data?.length ?? 0);
    const pagination = {
      page,
      limit,
      total: totalCount,
      totalPages: Math.ceil(totalCount / limit),
      hasMore: offset + (data?.length ?? 0) < totalCount,
    };

    return NextResponse.json({
      intellectual_property: data,
      upcoming_renewals: upcomingRenewals,
      stats: {
        total: totalCount,
        by_type: data.reduce((acc: Record<string, number>, ip) => {
          acc[ip.ip_type] = (acc[ip.ip_type] || 0) + 1;
          return acc;
        }, {}),
      },
      pagination,
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
  const supabase = createAdminClient();
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createIPSchema.parse(body);
    const {
      name,
      ip_type,
      description,
      registration_number,
      filing_date,
      registration_date,
      expiration_date,
      renewal_date,
      jurisdiction,
      classes,
      inventors,
      authors,
      owner_id,
      status,
      notes,
    } = validatedData;

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
      return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
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
  const supabase = createAdminClient();
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = updateIPSchema.parse(body);
    const { id, ...updateData } = validatedData;

    const { error } = await supabase
      .from('intellectual_property')
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
        updated_by: user.id,
      })
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
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
