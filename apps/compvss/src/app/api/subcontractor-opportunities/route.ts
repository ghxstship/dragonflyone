export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase, withAuth, PlatformRole } from '@ghxstship/config';
import { z } from 'zod';

const createOpportunitySchema = z.object({
  action: z.literal('create'),
  project_id: z.string().uuid(),
  title: z.string().min(1),
  category: z.string().min(1),
  description: z.string().optional(),
  requirements: z.array(z.string()).optional(),
  location: z.string().optional(),
  budget_range: z.string().optional(),
  deadline: z.string().optional(),
});

const applySchema = z.object({
  action: z.literal('apply'),
  opportunity_id: z.string().uuid(),
  vendor_id: z.string().uuid(),
  proposal: z.string().optional(),
  rate: z.number().min(0).optional(),
  availability: z.string().optional(),
});

const subcontractorActionSchema = z.union([createOpportunitySchema, applySchema]);

// Subcontractor opportunity listings
const COMPVSS_ROLES = [
  PlatformRole.COMPVSS_ADMIN, PlatformRole.COMPVSS_TEAM_MEMBER, PlatformRole.COMPVSS_VIEWER,
  PlatformRole.LEGEND_SUPER_ADMIN, PlatformRole.LEGEND_ADMIN, PlatformRole.LEGEND_DEVELOPER,
];

export async function GET(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!COMPVSS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const location = searchParams.get('location');
    const status = searchParams.get('status') || 'open';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = (page - 1) * limit;

    let query = supabase.from('subcontractor_opportunities').select(`
      id, title, category, description, location, budget_range, deadline, status, created_at,
      project:projects(id, name),
      applications:subcontractor_applications(id, status)
    `, { count: 'exact' }).eq('status', status);

    if (category) query = query.eq('category', category);
    if (location) query = query.ilike('location', `%${location}%`);

    const { data, error, count } = await query
      .order('deadline', { ascending: true })
      .range(offset, offset + limit - 1);
    if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });

    const totalCount = count || (data?.length ?? 0);
    const pagination = {
      page,
      limit,
      total: totalCount,
      totalPages: Math.ceil(totalCount / limit),
      hasMore: offset + (data?.length ?? 0) < totalCount,
    };

    return NextResponse.json({ opportunities: data, pagination });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!COMPVSS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const validatedData = subcontractorActionSchema.parse(body);
    const { action } = validatedData;

    if (action === 'create') {
      const { project_id, title, category, description, requirements, location, budget_range, deadline } = validatedData as z.infer<typeof createOpportunitySchema>;

      const { data, error } = await supabase.from('subcontractor_opportunities').insert({
        project_id, title, category, description, requirements: requirements || [],
        location, budget_range, deadline, status: 'open', created_by: user.id
      }).select().single();

      if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
      return NextResponse.json({ opportunity: data }, { status: 201 });
    }

    if (action === 'apply') {
      const { opportunity_id, vendor_id, proposal, rate, availability } = validatedData as z.infer<typeof applySchema>;

      const { data, error } = await supabase.from('subcontractor_applications').insert({
        opportunity_id, vendor_id, proposal, rate, availability, status: 'submitted', submitted_by: user.id
      }).select().single();

      if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
      return NextResponse.json({ application: data }, { status: 201 });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 });
  }
}
