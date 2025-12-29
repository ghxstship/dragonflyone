import { withAuth, PlatformRole } from '@ghxstship/config';
import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { z } from 'zod';

const CreateSagaSchema = z.object({
  saga_type: z.enum(['approval', 'request', 'submission', 'process', 'automation', 'change']),
  saga_subtype: z.string().optional(),
  title: z.string().min(1),
  description: z.string().optional(),
  priority: z.enum(['low', 'normal', 'high', 'urgent', 'critical']).optional(),
  due_date: z.string().optional(),
  assigned_to: z.string().uuid().optional(),
  subject_entity_type: z.string().optional(),
  subject_entity_id: z.string().uuid().optional(),
  tags: z.array(z.string()).optional(),
  metadata: z.record(z.unknown()).optional(),
});

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
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '25');
    const sagaType = searchParams.get('saga_type');
    const sagaSubtype = searchParams.get('saga_subtype');
    const currentState = searchParams.get('current_state');
    const priority = searchParams.get('priority');
    const initiatedBy = searchParams.get('initiated_by');
    const assignedTo = searchParams.get('assigned_to');
    const search = searchParams.get('search');

    // Get user's organization
    const { data: userOrg } = await supabase
      .from('user_organizations')
      .select('organization_id')
      .eq('user_id', user.id)
      .single();

    if (!userOrg) {
      return NextResponse.json({ error: 'No organization found' }, { status: 403 });
    }

    let query = supabase
      .from('saga_instances')
      .select(`
        *,
        initiated_by_person:legend_people!initiated_by(id, display_name),
        assigned_to_person:legend_people!assigned_to(id, display_name)
      `, { count: 'exact' })
      .eq('organization_id', userOrg.organization_id)
      .order('created_at', { ascending: false })
      .range((page - 1) * pageSize, page * pageSize - 1);

    if (sagaType) query = query.eq('saga_type', sagaType);
    if (sagaSubtype) query = query.eq('saga_subtype', sagaSubtype);
    if (currentState) query = query.eq('current_state', currentState);
    if (priority) query = query.eq('priority', priority);
    if (initiatedBy) query = query.eq('initiated_by', initiatedBy);
    if (assignedTo) query = query.eq('assigned_to', assignedTo);
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,reference_number.ilike.%${search}%`);
    }

    const { data, error, count } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      data,
      pagination: {
        page,
        pageSize,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / pageSize),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
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
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validation = CreateSagaSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      );
    }

    // Get user's organization and person ID
    const { data: userOrg } = await supabase
      .from('user_organizations')
      .select('organization_id')
      .eq('user_id', user.id)
      .single();

    if (!userOrg) {
      return NextResponse.json({ error: 'No organization found' }, { status: 403 });
    }

    // Get the person ID for the current user
    const { data: person } = await supabase
      .from('legend_people')
      .select('id')
      .eq('organization_id', userOrg.organization_id)
      .eq('email', user.email)
      .single();

    const { data, error } = await supabase
      .from('saga_instances')
      .insert({
        ...validation.data,
        organization_id: userOrg.organization_id,
        initiated_by: person?.id,
        created_by: user.id,
        current_state: 'draft',
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
