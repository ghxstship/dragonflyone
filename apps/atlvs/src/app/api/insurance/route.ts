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

const InsurancePolicySchema = z.object({
  organization_id: z.string().uuid(),
  policy_name: z.string().min(1),
  policy_type: z.enum(['general_liability', 'workers_comp', 'property', 'auto', 'umbrella', 'professional', 'event', 'other']).default('general_liability'),
  provider: z.string().optional(),
  policy_number: z.string().optional(),
  coverage_amount: z.number().optional(),
  deductible: z.number().optional(),
  premium: z.number().optional(),
  status: z.enum(['active', 'pending', 'expired', 'cancelled']).default('pending'),
  effective_date: z.string().optional(),
  expiration_date: z.string().optional(),
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
    const organizationId = searchParams.get('organization_id');
    const status = searchParams.get('status');
    const policyType = searchParams.get('policy_type');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('insurance_policies')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (organizationId) {
      query = query.eq('organization_id', organizationId);
    }
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }
    if (policyType && policyType !== 'all') {
      query = query.eq('policy_type', policyType);
    }

    const { data, error, count } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const policies = data || [];
    const summary = {
      total: count || 0,
      by_status: {
        active: policies.filter(p => p.status === 'active').length,
        pending: policies.filter(p => p.status === 'pending').length,
        expired: policies.filter(p => p.status === 'expired').length,
        cancelled: policies.filter(p => p.status === 'cancelled').length,
      },
      total_coverage: policies.reduce((sum, p) => sum + (p.coverage_amount || 0), 0),
      total_premium: policies.reduce((sum, p) => sum + (p.premium || 0), 0),
    };

    return NextResponse.json({
      policies,
      summary,
      pagination: { limit, offset, total: count || 0 },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch insurance policies' }, { status: 500 });
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
    const validatedData = InsurancePolicySchema.parse(body);

    const { data, error } = await supabase
      .from('insurance_policies')
      .insert(validatedData)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ policy: data }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 422 });
    }
    return NextResponse.json({ error: 'Failed to create insurance policy' }, { status: 500 });
  }
}
