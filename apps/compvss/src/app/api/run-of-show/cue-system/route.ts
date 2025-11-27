import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@ghxstship/config';
import { z } from 'zod';

const CueSchema = z.object({
  run_of_show_id: z.string().uuid(),
  cue_number: z.string(),
  cue_type: z.enum(['lighting', 'sound', 'video', 'pyro', 'automation', 'scenic', 'follow_spot', 'comms', 'custom']),
  description: z.string(),
  trigger_type: z.enum(['manual', 'timecode', 'midi', 'osc', 'follow']).default('manual'),
  trigger_value: z.string().optional(),
  duration_seconds: z.number().optional(),
  notes: z.string().optional(),
  department: z.string().optional(),
  assigned_to: z.string().uuid().optional(),
  dependencies: z.array(z.string().uuid()).optional(),
  is_standby: z.boolean().default(false),
});

// GET /api/run-of-show/cue-system - Get cues and cue sheets
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
    const rosId = searchParams.get('run_of_show_id');
    const projectId = searchParams.get('project_id');
    const department = searchParams.get('department');
    const action = searchParams.get('action');

    if (action === 'cue_sheet' && rosId) {
      // Get formatted cue sheet
      const { data: cues } = await supabase
        .from('cues')
        .select(`
          *,
          assigned_user:platform_users!assigned_to(first_name, last_name)
        `)
        .eq('run_of_show_id', rosId)
        .order('sort_order');

      // Group by department
      const byDepartment: Record<string, any[]> = {};
      cues?.forEach(cue => {
        const dept = cue.department || 'General';
        if (!byDepartment[dept]) byDepartment[dept] = [];
        byDepartment[dept].push(cue);
      });

      return NextResponse.json({
        cue_sheet: {
          total_cues: cues?.length || 0,
          by_department: byDepartment,
          cues: cues || [],
        },
      });
    }

    if (action === 'live_status' && rosId) {
      // Get live show status
      const { data: showStatus } = await supabase
        .from('live_show_status')
        .select('*')
        .eq('run_of_show_id', rosId)
        .single();

      const { data: currentCue } = await supabase
        .from('cues')
        .select('*')
        .eq('id', showStatus?.current_cue_id)
        .single();

      const { data: nextCue } = await supabase
        .from('cues')
        .select('*')
        .eq('run_of_show_id', rosId)
        .gt('sort_order', currentCue?.sort_order || 0)
        .order('sort_order')
        .limit(1)
        .single();

      return NextResponse.json({
        status: showStatus?.status || 'not_started',
        current_cue: currentCue,
        next_cue: nextCue,
        elapsed_time: showStatus?.elapsed_time,
        started_at: showStatus?.started_at,
      });
    }

    if (rosId) {
      let query = supabase
        .from('cues')
        .select(`
          *,
          assigned_user:platform_users!assigned_to(first_name, last_name)
        `)
        .eq('run_of_show_id', rosId)
        .order('sort_order');

      if (department) {
        query = query.eq('department', department);
      }

      const { data: cues } = await query;

      return NextResponse.json({ cues: cues || [] });
    }

    if (projectId) {
      // Get all run of shows for project
      const { data: runOfShows } = await supabase
        .from('run_of_show')
        .select(`
          *,
          cues:cues(count)
        `)
        .eq('project_id', projectId)
        .order('show_date');

      return NextResponse.json({ run_of_shows: runOfShows || [] });
    }

    return NextResponse.json({ error: 'run_of_show_id or project_id required' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch cue data' }, { status: 500 });
  }
}

// POST /api/run-of-show/cue-system - Create cue or manage live show
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

    const body = await request.json();
    const action = body.action || 'create_cue';

    if (action === 'create_cue') {
      const validated = CueSchema.parse(body);

      // Get next sort order
      const { data: lastCue } = await supabase
        .from('cues')
        .select('sort_order')
        .eq('run_of_show_id', validated.run_of_show_id)
        .order('sort_order', { ascending: false })
        .limit(1)
        .single();

      const { data: cue, error } = await supabase
        .from('cues')
        .insert({
          ...validated,
          sort_order: (lastCue?.sort_order || 0) + 1,
          status: 'pending',
          created_by: user.id,
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ cue }, { status: 201 });
    } else if (action === 'start_show') {
      const { run_of_show_id } = body;

      // Create or update live show status
      const { data: status, error } = await supabase
        .from('live_show_status')
        .upsert({
          run_of_show_id,
          status: 'running',
          started_at: new Date().toISOString(),
          started_by: user.id,
        }, { onConflict: 'run_of_show_id' })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Log show start
      await supabase.from('show_logs').insert({
        run_of_show_id,
        event_type: 'show_start',
        logged_by: user.id,
      });

      return NextResponse.json({ status });
    } else if (action === 'go_cue') {
      const { run_of_show_id, cue_id } = body;

      // Update cue status
      await supabase
        .from('cues')
        .update({
          status: 'executed',
          executed_at: new Date().toISOString(),
          executed_by: user.id,
        })
        .eq('id', cue_id);

      // Update live show status
      await supabase
        .from('live_show_status')
        .update({
          current_cue_id: cue_id,
          last_cue_at: new Date().toISOString(),
        })
        .eq('run_of_show_id', run_of_show_id);

      // Log cue execution
      await supabase.from('show_logs').insert({
        run_of_show_id,
        cue_id,
        event_type: 'cue_go',
        logged_by: user.id,
      });

      // Get next cue
      const { data: currentCue } = await supabase
        .from('cues')
        .select('sort_order')
        .eq('id', cue_id)
        .single();

      const { data: nextCue } = await supabase
        .from('cues')
        .select('*')
        .eq('run_of_show_id', run_of_show_id)
        .gt('sort_order', currentCue?.sort_order || 0)
        .order('sort_order')
        .limit(1)
        .single();

      return NextResponse.json({
        success: true,
        next_cue: nextCue,
      });
    } else if (action === 'standby_cue') {
      const { cue_id } = body;

      await supabase
        .from('cues')
        .update({
          status: 'standby',
          standby_at: new Date().toISOString(),
        })
        .eq('id', cue_id);

      return NextResponse.json({ success: true });
    } else if (action === 'hold_show') {
      const { run_of_show_id, reason } = body;

      await supabase
        .from('live_show_status')
        .update({
          status: 'hold',
          hold_reason: reason,
          hold_at: new Date().toISOString(),
        })
        .eq('run_of_show_id', run_of_show_id);

      await supabase.from('show_logs').insert({
        run_of_show_id,
        event_type: 'show_hold',
        notes: reason,
        logged_by: user.id,
      });

      return NextResponse.json({ success: true });
    } else if (action === 'resume_show') {
      const { run_of_show_id } = body;

      await supabase
        .from('live_show_status')
        .update({
          status: 'running',
          hold_reason: null,
          hold_at: null,
        })
        .eq('run_of_show_id', run_of_show_id);

      await supabase.from('show_logs').insert({
        run_of_show_id,
        event_type: 'show_resume',
        logged_by: user.id,
      });

      return NextResponse.json({ success: true });
    } else if (action === 'end_show') {
      const { run_of_show_id } = body;

      await supabase
        .from('live_show_status')
        .update({
          status: 'completed',
          ended_at: new Date().toISOString(),
          ended_by: user.id,
        })
        .eq('run_of_show_id', run_of_show_id);

      await supabase.from('show_logs').insert({
        run_of_show_id,
        event_type: 'show_end',
        logged_by: user.id,
      });

      return NextResponse.json({ success: true });
    } else if (action === 'add_note') {
      const { run_of_show_id, cue_id, note } = body;

      await supabase.from('show_logs').insert({
        run_of_show_id,
        cue_id,
        event_type: 'note',
        notes: note,
        logged_by: user.id,
      });

      return NextResponse.json({ success: true });
    } else if (action === 'reorder_cues') {
      const { run_of_show_id, cue_order } = body;

      // Update sort order for each cue
      for (let i = 0; i < cue_order.length; i++) {
        await supabase
          .from('cues')
          .update({ sort_order: i + 1 })
          .eq('id', cue_order[i])
          .eq('run_of_show_id', run_of_show_id);
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}

// PATCH /api/run-of-show/cue-system - Update cue
export async function PATCH(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const cueId = searchParams.get('cue_id');

    if (!cueId) {
      return NextResponse.json({ error: 'Cue ID required' }, { status: 400 });
    }

    const body = await request.json();

    const { data: cue, error } = await supabase
      .from('cues')
      .update({
        ...body,
        updated_at: new Date().toISOString(),
      })
      .eq('id', cueId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ cue });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update cue' }, { status: 500 });
  }
}

// DELETE /api/run-of-show/cue-system - Delete cue
export async function DELETE(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const cueId = searchParams.get('cue_id');

    if (!cueId) {
      return NextResponse.json({ error: 'Cue ID required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('cues')
      .delete()
      .eq('id', cueId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete cue' }, { status: 500 });
  }
}
