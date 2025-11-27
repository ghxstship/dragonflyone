import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}


// Lazy getter for supabase client - only accessed at runtime
const supabase = new Proxy({} as ReturnType<typeof getSupabaseClient>, {
  get(_target, prop) {
    return (getSupabaseClient() as any)[prop];
  }
});

const crisisSchema = z.object({
  event_id: z.string().uuid().optional(),
  title: z.string().min(1),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  category: z.enum(['pr', 'safety', 'technical', 'legal', 'financial', 'other']),
  description: z.string(),
  affected_platforms: z.array(z.string()).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const eventId = searchParams.get('event_id');

    if (type === 'templates') {
      const { data: templates, error } = await supabase
        .from('crisis_response_templates')
        .select('*')
        .order('category');

      if (error) throw error;
      return NextResponse.json({ templates });
    }

    if (type === 'active') {
      const { data: crises, error } = await supabase
        .from('crisis_incidents')
        .select(`*, responses:crisis_responses(*)`)
        .in('status', ['active', 'monitoring'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      return NextResponse.json({ crises });
    }

    let query = supabase
      .from('crisis_incidents')
      .select(`*, responses:crisis_responses(*)`)
      .order('created_at', { ascending: false });

    if (eventId) query = query.eq('event_id', eventId);

    const { data: crises, error } = await query;
    if (error) throw error;

    return NextResponse.json({ crises });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const body = await request.json();
    const action = body.action;

    if (action === 'create_template') {
      const { name, category, content, platforms } = body.data;

      const { data: template, error } = await supabase
        .from('crisis_response_templates')
        .insert({ name, category, content, platforms, created_at: new Date().toISOString() })
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ template }, { status: 201 });
    }

    if (action === 'add_response') {
      const { crisis_id, content, platform, responded_by } = body.data;

      const { data: response, error } = await supabase
        .from('crisis_responses')
        .insert({
          crisis_id,
          content,
          platform,
          responded_by,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ response }, { status: 201 });
    }

    const validated = crisisSchema.parse(body);
    const createdBy = body.created_by;

    const { data: crisis, error } = await supabase
      .from('crisis_incidents')
      .insert({
        ...validated,
        status: 'active',
        created_by: createdBy,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ crisis }, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const body = await request.json();
    const { id, action, ...updates } = body;

    if (action === 'resolve') {
      const { data, error } = await supabase
        .from('crisis_incidents')
        .update({ status: 'resolved', resolved_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ crisis: data });
    }

    if (action === 'escalate') {
      const { data: current } = await supabase
        .from('crisis_incidents')
        .select('severity')
        .eq('id', id)
        .single();

      const severities = ['low', 'medium', 'high', 'critical'];
      const currentIdx = severities.indexOf(current?.severity || 'low');
      const newSeverity = severities[Math.min(currentIdx + 1, 3)];

      const { data, error } = await supabase
        .from('crisis_incidents')
        .update({ severity: newSeverity })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ crisis: data });
    }

    const { data, error } = await supabase
      .from('crisis_incidents')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ crisis: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
