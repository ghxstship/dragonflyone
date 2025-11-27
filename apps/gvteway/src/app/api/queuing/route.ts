import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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

// GET - Fetch queue status or user's position
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const authHeader = request.headers.get('authorization');
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('event_id');
    const queueType = searchParams.get('type'); // 'concessions', 'merchandise', 'restroom', 'entry'

    if (!eventId) {
      return NextResponse.json({ error: 'Event ID required' }, { status: 400 });
    }

    // Fetch all queues for the event
    const { data: queues, error } = await supabase
      .from('virtual_queues')
      .select(`
        *,
        current_count:queue_entries(count)
      `)
      .eq('event_id', eventId)
      .eq('is_active', true);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // If user is authenticated, get their queue positions
    let userQueues: any[] = [];
    if (authHeader) {
      const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
      if (user) {
        const { data: entries } = await supabase
          .from('queue_entries')
          .select(`
            *,
            queue:virtual_queues(*)
          `)
          .eq('user_id', user.id)
          .eq('status', 'waiting');

        userQueues = entries || [];
      }
    }

    // Calculate estimated wait times
    const queuesWithEstimates = queues.map(queue => {
      const avgServiceTime = queue.avg_service_time_seconds || 60;
      const currentCount = queue.current_count?.[0]?.count || 0;
      const estimatedWaitMinutes = Math.ceil((currentCount * avgServiceTime) / 60);

      return {
        ...queue,
        current_count: currentCount,
        estimated_wait_minutes: estimatedWaitMinutes,
        status: getQueueStatus(currentCount, queue.capacity),
      };
    });

    return NextResponse.json({
      queues: queuesWithEstimates,
      user_queues: userQueues.map(uq => ({
        ...uq,
        position: uq.position,
        estimated_wait_minutes: Math.ceil((uq.position * (uq.queue?.avg_service_time_seconds || 60)) / 60),
      })),
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch queue status' },
      { status: 500 }
    );
  }
}

// POST - Join a queue
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { queue_id, party_size, notes } = body;

    // Check if queue exists and is active
    const { data: queue, error: queueError } = await supabase
      .from('virtual_queues')
      .select('*')
      .eq('id', queue_id)
      .eq('is_active', true)
      .single();

    if (queueError || !queue) {
      return NextResponse.json({ error: 'Queue not available' }, { status: 404 });
    }

    // Check if user is already in this queue
    const { data: existing } = await supabase
      .from('queue_entries')
      .select('id')
      .eq('queue_id', queue_id)
      .eq('user_id', user.id)
      .eq('status', 'waiting')
      .single();

    if (existing) {
      return NextResponse.json({ error: 'Already in queue' }, { status: 400 });
    }

    // Get current position
    const { count } = await supabase
      .from('queue_entries')
      .select('*', { count: 'exact', head: true })
      .eq('queue_id', queue_id)
      .eq('status', 'waiting');

    const position = (count || 0) + 1;

    // Join queue
    const { data: entry, error: entryError } = await supabase
      .from('queue_entries')
      .insert({
        queue_id,
        user_id: user.id,
        position,
        party_size: party_size || 1,
        notes,
        status: 'waiting',
        joined_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (entryError) {
      return NextResponse.json({ error: entryError.message }, { status: 500 });
    }

    const estimatedWaitMinutes = Math.ceil((position * (queue.avg_service_time_seconds || 60)) / 60);

    return NextResponse.json({
      entry,
      position,
      estimated_wait_minutes: estimatedWaitMinutes,
      message: `You are #${position} in line. Estimated wait: ${estimatedWaitMinutes} minutes.`,
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to join queue' },
      { status: 500 }
    );
  }
}

// PATCH - Update queue entry (leave, notify ready)
export async function PATCH(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { entry_id, action } = body; // 'leave', 'ready', 'complete', 'no_show'

    const { data: entry, error: fetchError } = await supabase
      .from('queue_entries')
      .select('*')
      .eq('id', entry_id)
      .single();

    if (fetchError || !entry) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
    }

    let updateData: Record<string, any> = {};

    switch (action) {
      case 'leave':
        updateData = {
          status: 'cancelled',
          left_at: new Date().toISOString(),
        };
        break;
      case 'ready':
        updateData = {
          status: 'ready',
          notified_at: new Date().toISOString(),
        };
        // Send push notification
        await supabase.from('notifications').insert({
          user_id: entry.user_id,
          type: 'queue_ready',
          title: 'Your turn is coming up!',
          message: 'Please proceed to the service area.',
          priority: 'high',
        });
        break;
      case 'complete':
        updateData = {
          status: 'completed',
          served_at: new Date().toISOString(),
        };
        break;
      case 'no_show':
        updateData = {
          status: 'no_show',
          expired_at: new Date().toISOString(),
        };
        break;
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const { error: updateError } = await supabase
      .from('queue_entries')
      .update(updateData)
      .eq('id', entry_id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // If leaving, update positions for others in queue
    if (action === 'leave' || action === 'complete' || action === 'no_show') {
      await supabase.rpc('reorder_queue_positions', { p_queue_id: entry.queue_id });
    }

    return NextResponse.json({ success: true, action });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update queue entry' },
      { status: 500 }
    );
  }
}

function getQueueStatus(currentCount: number, capacity: number): string {
  const ratio = currentCount / capacity;
  if (ratio < 0.3) return 'short';
  if (ratio < 0.7) return 'moderate';
  return 'long';
}
