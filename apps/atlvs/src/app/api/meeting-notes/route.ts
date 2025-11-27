import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { z } from 'zod';

const MeetingNoteSchema = z.object({
  meeting_id: z.string().uuid().optional(),
  contact_id: z.string().uuid().optional(),
  deal_id: z.string().uuid().optional(),
  project_id: z.string().uuid().optional(),
  title: z.string(),
  date: z.string(),
  attendees: z.array(z.object({
    name: z.string(),
    email: z.string().email().optional(),
    role: z.string().optional(),
  })),
  agenda: z.array(z.string()).optional(),
  notes: z.string(),
  action_items: z.array(z.object({
    description: z.string(),
    assigned_to: z.string().uuid().optional(),
    assigned_to_name: z.string().optional(),
    due_date: z.string().optional(),
    priority: z.enum(['low', 'medium', 'high']).default('medium'),
    status: z.enum(['pending', 'in_progress', 'completed']).default('pending'),
  })).optional(),
  decisions: z.array(z.string()).optional(),
  next_steps: z.array(z.string()).optional(),
  follow_up_date: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

// GET /api/meeting-notes - Get meeting notes
export async function GET(request: NextRequest) {
  const supabase = createAdminClient();
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
    const noteId = searchParams.get('id');
    const contactId = searchParams.get('contact_id');
    const dealId = searchParams.get('deal_id');
    const projectId = searchParams.get('project_id');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (noteId) {
      // Get specific note
      const { data: note, error } = await supabase
        .from('meeting_notes')
        .select(`
          *,
          contact:contacts(id, first_name, last_name, email, company),
          deal:deals(id, name, stage),
          project:projects(id, name),
          action_items:meeting_action_items(*)
        `)
        .eq('id', noteId)
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ note });
    } else {
      // Get all notes with filters
      let query = supabase
        .from('meeting_notes')
        .select(`
          *,
          contact:contacts(id, first_name, last_name, email),
          deal:deals(id, name),
          project:projects(id, name)
        `, { count: 'exact' })
        .order('date', { ascending: false })
        .range(offset, offset + limit - 1);

      if (contactId) {
        query = query.eq('contact_id', contactId);
      }

      if (dealId) {
        query = query.eq('deal_id', dealId);
      }

      if (projectId) {
        query = query.eq('project_id', projectId);
      }

      if (search) {
        query = query.or(`title.ilike.%${search}%,notes.ilike.%${search}%`);
      }

      const { data: notes, error, count } = await query;

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({
        notes: notes || [],
        total: count || 0,
        limit,
        offset,
      });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch meeting notes' }, { status: 500 });
  }
}

// POST /api/meeting-notes - Create meeting note
export async function POST(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const action = body.action || 'create';

    if (action === 'create') {
      const validated = MeetingNoteSchema.parse(body);

      // Create meeting note
      const { data: note, error } = await supabase
        .from('meeting_notes')
        .insert({
          meeting_id: validated.meeting_id,
          contact_id: validated.contact_id,
          deal_id: validated.deal_id,
          project_id: validated.project_id,
          title: validated.title,
          date: validated.date,
          attendees: validated.attendees,
          agenda: validated.agenda,
          notes: validated.notes,
          decisions: validated.decisions,
          next_steps: validated.next_steps,
          follow_up_date: validated.follow_up_date,
          tags: validated.tags,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Create action items
      if (validated.action_items && validated.action_items.length > 0) {
        const actionItems = validated.action_items.map(item => ({
          meeting_note_id: note.id,
          description: item.description,
          assigned_to: item.assigned_to,
          assigned_to_name: item.assigned_to_name,
          due_date: item.due_date,
          priority: item.priority,
          status: item.status,
          created_by: user.id,
        }));

        await supabase.from('meeting_action_items').insert(actionItems);

        // Create tasks for action items with assigned users
        for (const item of validated.action_items) {
          if (item.assigned_to) {
            await supabase.from('crm_tasks').insert({
              user_id: user.id,
              assigned_to: item.assigned_to,
              contact_id: validated.contact_id,
              deal_id: validated.deal_id,
              project_id: validated.project_id,
              title: item.description,
              task_type: 'task',
              priority: item.priority,
              due_date: item.due_date,
              status: 'pending',
            });
          }
        }
      }

      // Create follow-up task if follow_up_date is set
      if (validated.follow_up_date) {
        await supabase.from('crm_tasks').insert({
          user_id: user.id,
          assigned_to: user.id,
          contact_id: validated.contact_id,
          deal_id: validated.deal_id,
          project_id: validated.project_id,
          title: `Follow up: ${validated.title}`,
          task_type: 'follow_up',
          priority: 'medium',
          due_date: validated.follow_up_date,
          status: 'pending',
        });
      }

      return NextResponse.json({ note }, { status: 201 });
    } else if (action === 'extract_action_items') {
      // AI-powered action item extraction from notes
      const { notes_text } = body;

      // Simple pattern matching for action items
      // In production, this would use an AI model
      const actionItemPatterns = [
        /(?:action item|todo|task|follow up|need to|should|will|must):\s*(.+)/gi,
        /\[action\]\s*(.+)/gi,
        /- \[ \]\s*(.+)/gi,
      ];

      const extractedItems: string[] = [];
      for (const pattern of actionItemPatterns) {
        const matches = notes_text.matchAll(pattern);
        for (const match of matches) {
          extractedItems.push(match[1].trim());
        }
      }

      // Extract decisions
      const decisionPatterns = [
        /(?:decided|decision|agreed|resolved):\s*(.+)/gi,
        /\[decision\]\s*(.+)/gi,
      ];

      const extractedDecisions: string[] = [];
      for (const pattern of decisionPatterns) {
        const matches = notes_text.matchAll(pattern);
        for (const match of matches) {
          extractedDecisions.push(match[1].trim());
        }
      }

      return NextResponse.json({
        action_items: extractedItems,
        decisions: extractedDecisions,
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create meeting note' }, { status: 500 });
  }
}

// PATCH /api/meeting-notes - Update meeting note or action item
export async function PATCH(request: NextRequest) {
  const supabase = createAdminClient();
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
    const noteId = searchParams.get('id');
    const actionItemId = searchParams.get('action_item_id');

    const body = await request.json();

    if (actionItemId) {
      // Update action item
      const { data: actionItem, error } = await supabase
        .from('meeting_action_items')
        .update({
          ...body,
          updated_at: new Date().toISOString(),
        })
        .eq('id', actionItemId)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ action_item: actionItem });
    } else if (noteId) {
      // Update meeting note
      const { data: note, error } = await supabase
        .from('meeting_notes')
        .update({
          ...body,
          updated_at: new Date().toISOString(),
        })
        .eq('id', noteId)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ note });
    }

    return NextResponse.json({ error: 'Note ID or Action Item ID required' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}

// DELETE /api/meeting-notes - Delete meeting note
export async function DELETE(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const noteId = searchParams.get('id');

    if (!noteId) {
      return NextResponse.json({ error: 'Note ID required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('meeting_notes')
      .delete()
      .eq('id', noteId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete meeting note' }, { status: 500 });
  }
}
