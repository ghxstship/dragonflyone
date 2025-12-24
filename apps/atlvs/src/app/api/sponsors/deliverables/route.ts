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

const createDeliverableSchema = z.object({
  sponsor_id: z.string().uuid(),
  sponsorship_id: z.string().uuid().optional(),
  title: z.string().min(1),
  description: z.string().optional(),
  deliverable_type: z.enum(['logo_placement', 'signage', 'digital', 'activation', 'hospitality', 'merchandise', 'content', 'other']),
  status: z.enum(['pending', 'in_progress', 'delivered', 'approved', 'rejected']).default('pending'),
  due_date: z.string().optional(),
  value: z.number().optional(),
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
    const sponsorId = searchParams.get('sponsor_id');
    const status = searchParams.get('status');

    let query = supabase
      .from('sponsor_deliverables')
      .select('*, sponsor:sponsors(id, company_name)')
      .order('due_date', { ascending: true });

    if (sponsorId) {
      query = query.eq('sponsor_id', sponsorId);
    }
    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      logger.error('Error fetching sponsor deliverables:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: data || [] });
  } catch (error) {
    logger.error('Error in GET /api/sponsors/deliverables:', error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json({ error: 'Failed to fetch deliverables' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;
    
    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden - ATLVS access required' }, { status: 403 });
    }

    const body = await request.json();
    const validationResult = createDeliverableSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json({ error: 'Validation failed', details: validationResult.error.errors }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('sponsor_deliverables')
      .insert(validationResult.data)
      .select()
      .single();

    if (error) {
      logger.error('Error creating sponsor deliverable:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    logger.error('Error in POST /api/sponsors/deliverables:', error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json({ error: 'Failed to create deliverable' }, { status: 500 });
  }
}
