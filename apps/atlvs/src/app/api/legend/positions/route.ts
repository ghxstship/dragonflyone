import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { withAuth, PlatformRole } from '@ghxstship/config';

const createPositionSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  code: z.string().min(1, 'Code is required'),
  description: z.string().optional().nullable(),
  level: z.enum(['entry', 'mid', 'senior', 'lead', 'manager', 'director', 'executive']).optional().nullable(),
  job_family: z.string().optional().nullable(),
  department_id: z.string().uuid().optional().nullable(),
  min_salary: z.number().optional().nullable(),
  max_salary: z.number().optional().nullable(),
  salary_currency: z.string().default('USD'),
  requirements: z.record(z.unknown()).default({}),
  is_active: z.boolean().default(true),
});

const updatePositionSchema = createPositionSchema.partial();

const ATLVS_ROLES = [
  PlatformRole.ATLVS_SUPER_ADMIN, PlatformRole.ATLVS_ADMIN, PlatformRole.ATLVS_TEAM_MEMBER, PlatformRole.ATLVS_VIEWER,
  PlatformRole.LEGEND_SUPER_ADMIN, PlatformRole.LEGEND_ADMIN, PlatformRole.LEGEND_DEVELOPER,
];

export async function GET(request: NextRequest) {
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const supabase = createRouteHandlerClient({ cookies });
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: userOrg } = await supabase
      .from('user_organizations')
      .select('organization_id, role')
      .eq('platform_user_id', session.user.id)
      .single();

    if (!userOrg) {
      return NextResponse.json({ error: 'No organization found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get('include_inactive') === 'true';
    const departmentId = searchParams.get('department_id');

    let query = supabase
      .from('legend_positions')
      .select('*, department:legend_departments!department_id(*)')
      .eq('organization_id', userOrg.organization_id)
      .order('title', { ascending: true });

    if (!includeInactive) {
      query = query.eq('is_active', true);
    }
    if (departmentId) {
      query = query.eq('department_id', departmentId);
    }

    const { data: positions, error } = await query;

    if (error) {
      logger.error('Error fetching legend positions', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: positions });
  } catch (error) {
    logger.error('Error in GET /api/legend/positions', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const supabase = createRouteHandlerClient({ cookies });
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: userOrg } = await supabase
      .from('user_organizations')
      .select('organization_id, role')
      .eq('platform_user_id', session.user.id)
      .single();

    if (!userOrg) {
      return NextResponse.json({ error: 'No organization found' }, { status: 404 });
    }

    if (!['owner', 'admin'].includes(userOrg.role)) {
      return NextResponse.json({ error: 'Forbidden: Only owners and admins can create positions' }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = createPositionSchema.parse(body);

    const { data: position, error } = await supabase
      .from('legend_positions')
      .insert({
        ...validatedData,
        organization_id: userOrg.organization_id,
      })
      .select()
      .single();

    if (error) {
      logger.error('Error creating legend position', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: position }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    logger.error('Error in POST /api/legend/positions', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const supabase = createRouteHandlerClient({ cookies });
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: userOrg } = await supabase
      .from('user_organizations')
      .select('organization_id, role')
      .eq('platform_user_id', session.user.id)
      .single();

    if (!userOrg) {
      return NextResponse.json({ error: 'No organization found' }, { status: 404 });
    }

    if (!['owner', 'admin'].includes(userOrg.role)) {
      return NextResponse.json({ error: 'Forbidden: Only owners and admins can update positions' }, { status: 403 });
    }

    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Position ID is required' }, { status: 400 });
    }

    const validatedData = updatePositionSchema.parse(updates);

    const { data: position, error } = await supabase
      .from('legend_positions')
      .update(validatedData)
      .eq('id', id)
      .eq('organization_id', userOrg.organization_id)
      .select()
      .single();

    if (error) {
      logger.error('Error updating legend position', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!position) {
      return NextResponse.json({ error: 'Position not found' }, { status: 404 });
    }

    return NextResponse.json({ data: position });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    logger.error('Error in PUT /api/legend/positions', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const supabase = createRouteHandlerClient({ cookies });
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: userOrg } = await supabase
      .from('user_organizations')
      .select('organization_id, role')
      .eq('platform_user_id', session.user.id)
      .single();

    if (!userOrg) {
      return NextResponse.json({ error: 'No organization found' }, { status: 404 });
    }

    if (!['owner', 'admin'].includes(userOrg.role)) {
      return NextResponse.json({ error: 'Forbidden: Only owners and admins can delete positions' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Position ID is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('legend_positions')
      .delete()
      .eq('id', id)
      .eq('organization_id', userOrg.organization_id);

    if (error) {
      logger.error('Error deleting legend position', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    logger.error('Error in DELETE /api/legend/positions', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
