import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

const rehireNoteSchema = z.object({
  crew_member_id: z.string().uuid(),
  recommendation: z.enum(['highly_recommended', 'recommended', 'conditional', 'not_recommended']),
  notes: z.string().optional(),
  strengths: z.array(z.string()).optional(),
  areas_for_improvement: z.array(z.string()).optional(),
  project_id: z.string().uuid().optional(),
  event_id: z.string().uuid().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const crewMemberId = searchParams.get('crew_member_id');
    const recommendation = searchParams.get('recommendation');

    let query = supabase
      .from('rehire_notes')
      .select(`
        *,
        crew_member:platform_users(id, first_name, last_name),
        created_by_user:platform_users!rehire_notes_created_by_fkey(id, first_name, last_name),
        project:projects(id, name),
        event:events(id, name)
      `)
      .order('created_at', { ascending: false });

    if (crewMemberId) query = query.eq('crew_member_id', crewMemberId);
    if (recommendation) query = query.eq('recommendation', recommendation);

    const { data: notes, error } = await query;
    if (error) throw error;

    // Calculate summary for crew member
    if (crewMemberId && notes?.length) {
      const summary = {
        total_reviews: notes.length,
        highly_recommended: notes.filter(n => n.recommendation === 'highly_recommended').length,
        recommended: notes.filter(n => n.recommendation === 'recommended').length,
        conditional: notes.filter(n => n.recommendation === 'conditional').length,
        not_recommended: notes.filter(n => n.recommendation === 'not_recommended').length,
      };
      return NextResponse.json({ notes, summary });
    }

    return NextResponse.json({ notes });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = rehireNoteSchema.parse(body);
    const createdBy = body.created_by;

    const { data: note, error } = await supabase
      .from('rehire_notes')
      .insert({
        ...validated,
        created_by: createdBy,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ note }, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    const { data: note, error } = await supabase
      .from('rehire_notes')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ note });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    const { error } = await supabase.from('rehire_notes').delete().eq('id', id);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
