import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@ghxstship/config';
import { z } from 'zod';

const noteSchema = z.object({
  project_id: z.string().uuid().optional(),
  event_id: z.string().uuid().optional(),
  title: z.string().max(255).optional(),
  content: z.string().min(1),
  formatted_content: z.string().optional(),
  note_type: z.enum(['general', 'technical', 'safety', 'incident', 'client_feedback', 'crew_feedback', 'improvement', 'issue', 'resolution']),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
  category: z.string().max(100).optional(),
  tags: z.array(z.string()).optional(),
  attachments: z.array(z.object({
    type: z.string(),
    url: z.string().url(),
    name: z.string(),
  })).optional(),
  related_photos: z.array(z.string().uuid()).optional(),
  is_private: z.boolean().default(false),
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
    const note_type = searchParams.get('note_type');
    const priority = searchParams.get('priority');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    let query = supabase
      .from('production_notes')
      .select(`
        *,
        author:platform_users!created_by(id, full_name, avatar_url),
        resolver:platform_users!resolved_by(id, full_name)
      `, { count: 'exact' });

    if (project_id) {
      query = query.eq('project_id', project_id);
    }
    if (event_id) {
      query = query.eq('event_id', event_id);
    }
    if (note_type) {
      query = query.eq('note_type', note_type);
    }
    if (priority) {
      query = query.eq('priority', priority);
    }
    if (status) {
      query = query.eq('status', status);
    }

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return NextResponse.json({
      data,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error('Get production notes error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notes' },
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
    const validated = noteSchema.parse(body);

    const { data, error } = await supabase
      .from('production_notes')
      .insert({
        ...validated,
        tags: validated.tags || [],
        attachments: validated.attachments || [],
        related_photos: validated.related_photos || [],
        status: 'active',
        created_by: platformUser.id,
      })
      .select()
      .single();

    if (error) throw error;

    // Create timeline entry
    await supabase.from('production_timeline_entries').insert({
      project_id: validated.project_id,
      event_id: validated.event_id,
      entry_type: 'note',
      title: validated.title || `${validated.note_type} note added`,
      description: validated.content.substring(0, 200),
      related_note_id: data.id,
      created_by: platformUser.id,
    });

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Create production note error:', error);
    return NextResponse.json(
      { error: 'Failed to create note' },
      { status: 500 }
    );
  }
}
