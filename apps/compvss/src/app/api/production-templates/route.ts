import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@ghxstship/config';

// Template library for event types
export async function GET(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    const { searchParams } = new URL(request.url);
    const eventType = searchParams.get('event_type');

    let query = supabase.from('production_templates').select('*');
    if (eventType) query = query.eq('event_type', eventType);

    const { data, error } = await query.order('name', { ascending: true });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

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
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { name, event_type, description, default_timeline, default_crew_roles, default_equipment, checklist_items, budget_template } = body;

    const { data, error } = await supabase.from('production_templates').insert({
      name, event_type, description, default_timeline: default_timeline || [],
      default_crew_roles: default_crew_roles || [], default_equipment: default_equipment || [],
      checklist_items: checklist_items || [], budget_template: budget_template || {},
      created_by: user.id, is_public: false
    }).select().single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ template: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create template' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { template_id, action, project_id } = body;

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
