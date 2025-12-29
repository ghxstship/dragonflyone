import { withAuth, PlatformRole } from '@ghxstship/config';
import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { z } from 'zod';

const CreateChronicleEntrySchema = z.object({
  chronicle_type: z.enum(['transaction', 'timesheet', 'movement', 'audit', 'automation', 'communication']),
  chronicle_subtype: z.string().optional(),
  action: z.string().min(1),
  action_category: z.enum(['create', 'read', 'update', 'delete', 'transfer', 'approve', 'reject', 'submit', 'complete', 'cancel', 'execute', 'send', 'receive', 'login', 'logout', 'other']),
  action_description: z.string().optional(),
  actor_type: z.enum(['user', 'system', 'integration', 'automation']).optional(),
  actor_id: z.string().uuid().optional(),
  actor_name: z.string().optional(),
  subject_entity_type: z.string().optional(),
  subject_entity_id: z.string().uuid().optional(),
  subject_name: z.string().optional(),
  context_entity_type: z.string().optional(),
  context_entity_id: z.string().uuid().optional(),
  context_name: z.string().optional(),
  before_state: z.record(z.unknown()).optional(),
  after_state: z.record(z.unknown()).optional(),
  metadata: z.record(z.unknown()).optional(),
  source_system: z.string().optional(),
  correlation_id: z.string().uuid().optional(),
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
    const pageSize = parseInt(searchParams.get('pageSize') || '50');
    const chronicleType = searchParams.get('chronicle_type');
    const chronicleSubtype = searchParams.get('chronicle_subtype');
    const actionCategory = searchParams.get('action_category');
    const actorId = searchParams.get('actor_id');
    const subjectEntityType = searchParams.get('subject_entity_type');
    const subjectEntityId = searchParams.get('subject_entity_id');
    const contextEntityType = searchParams.get('context_entity_type');
    const contextEntityId = searchParams.get('context_entity_id');
    const occurredFrom = searchParams.get('occurred_from');
    const occurredTo = searchParams.get('occurred_to');
    const sourceSystem = searchParams.get('source_system');

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
      .from('chronicle_entries')
      .select('*', { count: 'exact' })
      .eq('organization_id', userOrg.organization_id)
      .order('occurred_at', { ascending: false })
      .range((page - 1) * pageSize, page * pageSize - 1);

    if (chronicleType) query = query.eq('chronicle_type', chronicleType);
    if (chronicleSubtype) query = query.eq('chronicle_subtype', chronicleSubtype);
    if (actionCategory) query = query.eq('action_category', actionCategory);
    if (actorId) query = query.eq('actor_id', actorId);
    if (subjectEntityType) query = query.eq('subject_entity_type', subjectEntityType);
    if (subjectEntityId) query = query.eq('subject_entity_id', subjectEntityId);
    if (contextEntityType) query = query.eq('context_entity_type', contextEntityType);
    if (contextEntityId) query = query.eq('context_entity_id', contextEntityId);
    if (occurredFrom) query = query.gte('occurred_at', occurredFrom);
    if (occurredTo) query = query.lte('occurred_at', occurredTo);
    if (sourceSystem) query = query.eq('source_system', sourceSystem);

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
    const validation = CreateChronicleEntrySchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      );
    }

    // Get user's organization
    const { data: userOrg } = await supabase
      .from('user_organizations')
      .select('organization_id')
      .eq('user_id', user.id)
      .single();

    if (!userOrg) {
      return NextResponse.json({ error: 'No organization found' }, { status: 403 });
    }

    // Compute delta if before and after states provided
    let delta: Record<string, unknown> | null = null;
    if (validation.data.before_state && validation.data.after_state) {
      delta = {};
      const afterState = validation.data.after_state;
      const beforeState = validation.data.before_state;
      for (const key of Object.keys(afterState)) {
        if (JSON.stringify(beforeState[key]) !== JSON.stringify(afterState[key])) {
          delta[key] = afterState[key];
        }
      }
    }

    const { data, error } = await supabase
      .from('chronicle_entries')
      .insert({
        ...validation.data,
        organization_id: userOrg.organization_id,
        actor_id: validation.data.actor_id || user.id,
        actor_type: validation.data.actor_type || 'user',
        delta,
        source_system: validation.data.source_system || 'atlvs',
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
