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

const InvestorSchema = z.object({
  production_id: z.string().uuid(),
  round_id: z.string().uuid().optional(),
  investor_type: z.enum(['individual', 'entity', 'fund']).default('individual'),
  name: z.string().min(1),
  contact_name: z.string().optional(),
  contact_email: z.string().email().optional(),
  contact_phone: z.string().optional(),
  investment_amount: z.number().default(0),
  ownership_percentage: z.number().optional(),
  status: z.enum(['prospect', 'committed', 'funded', 'exited']).default('prospect'),
  commitment_date: z.string().optional(),
  funding_date: z.string().optional(),
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
    const roundId = searchParams.get('round_id');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('investors')
      .select('*, investment_rounds(*)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (productionId) {
      query = query.eq('production_id', productionId);
    }
    if (roundId) {
      query = query.eq('round_id', roundId);
    }
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    const { data, error, count } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const investors = data || [];
    const summary = {
      total: count || 0,
      total_invested: investors.reduce((sum, i) => sum + (i.investment_amount || 0), 0),
      by_status: {
        prospect: investors.filter(i => i.status === 'prospect').length,
        committed: investors.filter(i => i.status === 'committed').length,
        funded: investors.filter(i => i.status === 'funded').length,
        exited: investors.filter(i => i.status === 'exited').length,
      },
      by_type: {
        individual: investors.filter(i => i.investor_type === 'individual').length,
        entity: investors.filter(i => i.investor_type === 'entity').length,
        fund: investors.filter(i => i.investor_type === 'fund').length,
      },
    };

    return NextResponse.json({
      investors,
      summary,
      pagination: { limit, offset, total: count || 0 },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch investors' }, { status: 500 });
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
    const validatedData = InvestorSchema.parse(body);

    const { data, error } = await supabase
      .from('investors')
      .insert(validatedData)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ investor: data }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    logger.error('Error in POST /api/investors:', error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json({ error: 'Failed to create investor' }, { status: 500 });
  }
}
