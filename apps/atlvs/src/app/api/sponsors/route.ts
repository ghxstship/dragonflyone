export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { withAuth, PlatformRole, logger } from '@ghxstship/config';
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

const SponsorSchema = z.object({
  production_id: z.string().uuid(),
  organization_id: z.string().uuid(),
  sponsor_tier_id: z.string().uuid().optional(),
  company_name: z.string().min(1),
  contact_name: z.string().optional(),
  contact_email: z.string().email().optional(),
  contact_phone: z.string().optional(),
  logo_url: z.string().url().optional(),
  website_url: z.string().url().optional(),
  status: z.enum(['prospect', 'negotiating', 'confirmed', 'active', 'completed', 'cancelled']).default('prospect'),
  contract_value: z.number().default(0),
  payment_status: z.enum(['pending', 'partial', 'paid', 'overdue']).default('pending'),
  amount_paid: z.number().default(0),
  notes: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;
    
    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden - ATLVS access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const productionId = searchParams.get('production_id');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('sponsors')
      .select('*, sponsor_tiers(*)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (productionId) {
      query = query.eq('production_id', productionId);
    }
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    const { data, error, count } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const sponsors = data || [];
    const summary = {
      total: count || 0,
      total_value: sponsors.reduce((sum, s) => sum + (s.contract_value || 0), 0),
      total_paid: sponsors.reduce((sum, s) => sum + (s.amount_paid || 0), 0),
      by_status: {
        prospect: sponsors.filter(s => s.status === 'prospect').length,
        negotiating: sponsors.filter(s => s.status === 'negotiating').length,
        confirmed: sponsors.filter(s => s.status === 'confirmed').length,
        active: sponsors.filter(s => s.status === 'active').length,
        completed: sponsors.filter(s => s.status === 'completed').length,
      },
    };

    return NextResponse.json({
      sponsors,
      summary,
      pagination: { limit, offset, total: count || 0 },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch sponsors' }, { status: 500 });
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
    const validatedData = SponsorSchema.parse(body);

    const { data, error } = await supabase
      .from('sponsors')
      .insert(validatedData)
      .select()
      .single();

    if (error) {
      logger.error('Error creating sponsor:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ sponsor: data }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 422 });
    }
    logger.error('Error in POST /api/sponsors:', error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json({ error: 'Failed to create sponsor' }, { status: 500 });
  }
}
