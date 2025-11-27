import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@ghxstship/config';
import { z } from 'zod';

const checklistItemSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  sort_order: z.number().default(0),
  is_required: z.boolean().default(true),
  requires_photo: z.boolean().default(false),
  requires_signature: z.boolean().default(false),
  requires_note: z.boolean().default(false),
  assigned_to: z.string().uuid().optional(),
  due_at: z.string().optional(),
});

const checklistSchema = z.object({
  project_id: z.string().uuid().optional(),
  event_id: z.string().uuid().optional(),
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  checklist_type: z.enum(['load_in', 'setup', 'sound_check', 'show', 'strike', 'safety', 'equipment', 'venue', 'custom']),
  due_at: z.string().optional(),
  assigned_to: z.string().uuid().optional(),
  items: z.array(checklistItemSchema).optional(),
});

export async function GET(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const project_id = searchParams.get('project_id');
    const event_id = searchParams.get('event_id');
    const checklist_type = searchParams.get('checklist_type');
    const status = searchParams.get('status');

    let query = supabase
      .from('production_checklists')
      .select(`
        *,
        assignee:platform_users!assigned_to(id, full_name, avatar_url),
        creator:platform_users!created_by(id, full_name),
        items:production_checklist_items(
          id, title, description, sort_order, is_completed, completed_at,
          is_required, requires_photo, requires_signature, requires_note,
          photo_urls, signature_url, notes,
          assignee:platform_users!assigned_to(id, full_name),
          completer:platform_users!completed_by(id, full_name)
        )
      `);

    if (project_id) {
      query = query.eq('project_id', project_id);
    }
    if (event_id) {
      query = query.eq('event_id', event_id);
    }
    if (checklist_type) {
      query = query.eq('checklist_type', checklist_type);
    }
    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Get production checklists error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch checklists' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: platformUser } = await supabase
      .from('platform_users')
      .select('id')
      .eq('auth_user_id', user.id)
      .single();

    if (!platformUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const validated = checklistSchema.parse(body);

    // Create checklist
    const { data: checklist, error: checklistError } = await supabase
      .from('production_checklists')
      .insert({
        project_id: validated.project_id,
        event_id: validated.event_id,
        name: validated.name,
        description: validated.description,
        checklist_type: validated.checklist_type,
        due_at: validated.due_at,
        assigned_to: validated.assigned_to,
        status: 'pending',
        created_by: platformUser.id,
      })
      .select()
      .single();

    if (checklistError) throw checklistError;

    // Create checklist items if provided
    if (validated.items && validated.items.length > 0) {
      const itemsToInsert = validated.items.map((item, index) => ({
        checklist_id: checklist.id,
        title: item.title,
        description: item.description,
        sort_order: item.sort_order || index,
        is_required: item.is_required,
        requires_photo: item.requires_photo,
        requires_signature: item.requires_signature,
        requires_note: item.requires_note,
        assigned_to: item.assigned_to,
        due_at: item.due_at,
      }));

      await supabase.from('production_checklist_items').insert(itemsToInsert);
    }

    // Create timeline entry
    await supabase.from('production_timeline_entries').insert({
      project_id: validated.project_id,
      event_id: validated.event_id,
      entry_type: 'checklist',
      title: `Checklist created: ${validated.name}`,
      description: validated.description,
      related_checklist_id: checklist.id,
      created_by: platformUser.id,
    });

    // Fetch complete checklist with items
    const { data: completeChecklist } = await supabase
      .from('production_checklists')
      .select(`
        *,
        items:production_checklist_items(*)
      `)
      .eq('id', checklist.id)
      .single();

    return NextResponse.json({ data: completeChecklist }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Create production checklist error:', error);
    return NextResponse.json(
      { error: 'Failed to create checklist' },
      { status: 500 }
    );
  }
}
