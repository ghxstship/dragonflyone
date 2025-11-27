import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@ghxstship/config';
import { z } from 'zod';

const rehearsalSchema = z.object({
  event_id: z.string().uuid(),
  scheduled_start: z.string().datetime(),
  scheduled_end: z.string().datetime(),
  type: z.enum(['tech_rehearsal', 'soundcheck', 'focus', 'dress_rehearsal', 'run_through']),
  notes: z.string().optional(),
  attendees: z.array(z.string().uuid()).optional(),
});

export async function GET(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('event_id');
    const type = searchParams.get('type');

    let query = supabase
      .from('technical_rehearsals')
      .select(`
        *,
        event:events(id, name, start_date),
        created_by_user:platform_users(id, first_name, last_name)
      `)
      .order('scheduled_start', { ascending: true });

    if (eventId) query = query.eq('event_id', eventId);
    if (type) query = query.eq('type', type);

    const { data: rehearsals, error } = await query;
    if (error) throw error;

    return NextResponse.json({ rehearsals });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    const body = await request.json();
    const validated = rehearsalSchema.parse(body);
    const createdBy = body.created_by;

    const { data: rehearsal, error } = await supabase
      .from('technical_rehearsals')
      .insert({
        ...validated,
        status: 'scheduled',
        created_by: createdBy,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ rehearsal }, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    const body = await request.json();
    const { id, action, ...updates } = body;

    if (action === 'start') {
      const { data, error } = await supabase
        .from('technical_rehearsals')
        .update({ status: 'in_progress', actual_start: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return NextResponse.json({ rehearsal: data });
    }

    if (action === 'complete') {
      const { data, error } = await supabase
        .from('technical_rehearsals')
        .update({
          status: 'completed',
          actual_end: new Date().toISOString(),
          notes: updates.notes,
          issues: updates.issues,
        })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return NextResponse.json({ rehearsal: data });
    }

    if (action === 'add_issue') {
      const { data: current } = await supabase
        .from('technical_rehearsals')
        .select('issues')
        .eq('id', id)
        .single();

      const issues = current?.issues || [];
      issues.push({
        id: Date.now().toString(),
        description: updates.issue_description,
        department: updates.department,
        priority: updates.priority || 'medium',
        resolved: false,
        created_at: new Date().toISOString(),
      });

      const { data, error } = await supabase
        .from('technical_rehearsals')
        .update({ issues })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ rehearsal: data });
    }

    const { data, error } = await supabase
      .from('technical_rehearsals')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ rehearsal: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    const { error } = await supabase
      .from('technical_rehearsals')
      .update({ status: 'cancelled' })
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
