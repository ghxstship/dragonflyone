export const dynamic = 'force-dynamic';

import { withAuth, PlatformRole } from '@ghxstship/config';
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { z } from 'zod';

const ATLVS_ROLES = [
  PlatformRole.ATLVS_SUPER_ADMIN, PlatformRole.ATLVS_ADMIN, PlatformRole.ATLVS_TEAM_MEMBER, PlatformRole.ATLVS_VIEWER,
  PlatformRole.LEGEND_SUPER_ADMIN, PlatformRole.LEGEND_ADMIN, PlatformRole.LEGEND_DEVELOPER,
];

const ATLVS_ADMIN_ROLES = [
  PlatformRole.ATLVS_SUPER_ADMIN, PlatformRole.ATLVS_ADMIN,
  PlatformRole.LEGEND_SUPER_ADMIN, PlatformRole.LEGEND_ADMIN, PlatformRole.LEGEND_DEVELOPER,
];

const clauseSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  category: z.enum(['general', 'liability', 'payment', 'cancellation', 'force_majeure', 'confidentiality', 'indemnification', 'custom']),
  content: z.string().min(1, 'Content is required'),
  description: z.string().optional(),
  variables: z.array(z.string()).optional(),
  is_default: z.boolean().default(false),
  is_required: z.boolean().default(false),
  order_index: z.number().optional(),
});

// GET /api/contract-clauses - List contract clauses
export async function GET(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;
    
    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden - ATLVS access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    let query = supabase
      .from('contract_clauses')
      .select('*')
      .order('category')
      .order('order_index');

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) {
      logger.error('Error fetching clauses:', error);
      return NextResponse.json(
        { error: 'Failed to fetch clauses', details: error.message },
        { status: 500 }
      );
    }

    // Group by category
    const grouped = (data || []).reduce((acc, clause) => {
      if (!acc[clause.category]) {
        acc[clause.category] = [];
      }
      acc[clause.category].push(clause);
      return acc;
    }, {} as Record<string, typeof data>);

    return NextResponse.json({
      clauses: data || [],
      grouped,
      total: data?.length || 0,
    });
  } catch (error) {
    logger.error('Error in GET /api/contract-clauses:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/contract-clauses - Create new clause
export async function POST(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;
    
    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ADMIN_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const validated = clauseSchema.parse(body);

    const organizationId = body.organization_id || '00000000-0000-0000-0000-000000000000';

    const { data, error } = await supabase
      .from('contract_clauses')
      .insert([
        {
          ...validated,
          organization_id: organizationId,
          created_by: authResult.user?.id || null,
        },
      ])
      .select()
      .single();

    if (error) {
      logger.error('Error creating clause:', error);
      return NextResponse.json(
        { error: 'Failed to create clause', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    logger.error('Error in POST /api/contract-clauses:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
