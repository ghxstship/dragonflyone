export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase, withAuth, PlatformRole } from '@ghxstship/config';
import { z } from 'zod';

const createTemplateSchema = z.object({
  name: z.string(),
  event_type: z.string(),
  description: z.string().optional(),
  default_timeline: z.array(z.record(z.unknown())).optional(),
  default_crew_roles: z.array(z.record(z.unknown())).optional(),
  default_equipment: z.array(z.record(z.unknown())).optional(),
  checklist_items: z.array(z.string()).optional(),
  budget_template: z.record(z.unknown()).optional(),
});

const applyTemplateSchema = z.object({
  template_id: z.string().uuid(),
  action: z.literal('apply_to_project'),
  project_id: z.string().uuid(),
});

// Template library for event types
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
    const eventType = searchParams.get('event_type');

    let query = supabase.from('production_templates').select('*');
    if (eventType) query = query.eq('event_type', eventType);

    const { data, error } = await query.order('name', { ascending: true });
    if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });

    return NextResponse.json({
      templates: data,
      event_types: ['concert', 'festival', 'corporate', 'theater', 'sports', 'wedding', 'conference']
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 });
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

    const userId = authResult.user?.id;
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const validatedData = createTemplateSchema.parse(body);
    const { name, event_type, description, default_timeline, default_crew_roles, default_equipment, checklist_items, budget_template } = validatedData;

    const { data, error } = await supabase.from('production_templates').insert({
      name, event_type, description, default_timeline: default_timeline || [],
      default_crew_roles: default_crew_roles || [], default_equipment: default_equipment || [],
      checklist_items: checklist_items || [], budget_template: budget_template || {},
      created_by: userId, is_public: false
    }).select().single();

    if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
    return NextResponse.json({ template: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create template' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!COMPVSS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = applyTemplateSchema.parse(body);
    const { template_id, action, project_id } = validatedData;

    if (action === 'apply_to_project') {
      const { data: template } = await supabase.from('production_templates').select('*').eq('id', template_id).single();
      if (!template) return NextResponse.json({ error: 'Template not found' }, { status: 404 });

      // Apply template to project
      await supabase.from('projects').update({
        timeline: template.default_timeline,
        crew_roles: template.default_crew_roles,
        equipment_list: template.default_equipment,
        checklist: template.checklist_items
      }).eq('id', project_id);

      return NextResponse.json({ success: true, message: 'Template applied' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 });
  }
}
