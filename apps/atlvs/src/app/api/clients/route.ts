export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { withAuth, PlatformRole } from '@ghxstship/config';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const ATLVS_ROLES = [
  PlatformRole.ATLVS_SUPER_ADMIN, PlatformRole.ATLVS_ADMIN, PlatformRole.ATLVS_TEAM_MEMBER, PlatformRole.ATLVS_VIEWER,
  PlatformRole.LEGEND_SUPER_ADMIN, PlatformRole.LEGEND_ADMIN, PlatformRole.LEGEND_DEVELOPER,
];

const ATLVS_ADMIN_ROLES = [
  PlatformRole.ATLVS_SUPER_ADMIN, PlatformRole.ATLVS_ADMIN,
  PlatformRole.LEGEND_SUPER_ADMIN, PlatformRole.LEGEND_ADMIN, PlatformRole.LEGEND_DEVELOPER,
];

const ClientSchema = z.object({
  organization_id: z.string().uuid(),
  company_name: z.string().min(1),
  contact_name: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  postal_code: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
  industry: z.string().optional(),
  status: z.enum(['active', 'inactive', 'prospect', 'churned']).default('active'),
  notes: z.string().optional(),
  metadata: z.record(z.unknown()).default({}),
});

export async function GET(request: NextRequest) {
  try {
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;
    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organization_id');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('contacts')
      .select('*', { count: 'exact' })
      .order('company', { ascending: true })
      .range(offset, offset + limit - 1);

    if (organizationId) {
      query = query.eq('organization_id', organizationId);
    }
    if (status && status !== 'all') {
      query = query.eq('metadata->>status', status);
    }
    if (search) {
      query = query.or(`company.ilike.%${search}%,first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    const { data, error, count } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const clients = (data || []).map(c => ({
      id: c.id,
      company_name: c.company || '',
      contact_name: `${c.first_name || ''} ${c.last_name || ''}`.trim(),
      email: c.email,
      phone: c.phone,
      status: c.metadata?.status || 'active',
      created_at: c.created_at,
      updated_at: c.updated_at,
      ...c.metadata,
    }));

    const summary = {
      total: count || 0,
      active: clients.filter(c => c.status === 'active').length,
      prospect: clients.filter(c => c.status === 'prospect').length,
      inactive: clients.filter(c => c.status === 'inactive').length,
    };

    return NextResponse.json({
      clients,
      summary,
      pagination: { limit, offset, total: count || 0 },
    });
  } catch (error: unknown) {
    return NextResponse.json({ error: 'Failed to fetch clients' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;
    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ADMIN_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = ClientSchema.parse(body);

    const contactData = {
      organization_id: validatedData.organization_id,
      company: validatedData.company_name,
      first_name: validatedData.contact_name?.split(' ')[0] || '',
      last_name: validatedData.contact_name?.split(' ').slice(1).join(' ') || '',
      email: validatedData.email,
      phone: validatedData.phone,
      metadata: {
        ...validatedData.metadata,
        status: validatedData.status,
        address: validatedData.address,
        city: validatedData.city,
        state: validatedData.state,
        country: validatedData.country,
        postal_code: validatedData.postal_code,
        website: validatedData.website,
        industry: validatedData.industry,
        notes: validatedData.notes,
        type: 'client',
      },
    };

    const { data, error } = await supabase
      .from('contacts')
      .insert(contactData)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ client: data }, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 422 });
    }
    return NextResponse.json({ error: 'Failed to create client' }, { status: 500 });
  }
}
