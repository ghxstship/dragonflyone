import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const kudosSchema = z.object({
  to_user_id: z.string().uuid(),
  project_id: z.string().uuid().optional(),
  event_id: z.string().uuid().optional(),
  kudos_type: z.enum([
    'great_work', 'team_player', 'problem_solver', 'leadership', 'creativity',
    'reliability', 'mentorship', 'safety_champion', 'above_beyond', 'technical_excellence'
  ]),
  message: z.string().optional(),
  is_public: z.boolean().default(true),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const user_id = searchParams.get('user_id');
    const direction = searchParams.get('direction'); // 'received' or 'given'
    const kudos_type = searchParams.get('kudos_type');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    let query = supabase
      .from('crew_kudos')
      .select(`
        *,
        from_user:platform_users!from_user_id(id, email, full_name, avatar_url),
        to_user:platform_users!to_user_id(id, email, full_name, avatar_url),
        project:projects(id, name),
        event:events(id, name)
      `, { count: 'exact' });

    if (user_id) {
      if (direction === 'received') {
        query = query.eq('to_user_id', user_id);
      } else if (direction === 'given') {
        query = query.eq('from_user_id', user_id);
      } else {
        query = query.or(`to_user_id.eq.${user_id},from_user_id.eq.${user_id}`);
      }
    }

    if (kudos_type) {
      query = query.eq('kudos_type', kudos_type);
    }

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    // Get kudos summary for user
    let summary = null;
    if (user_id) {
      const { data: summaryData } = await supabase
        .from('crew_kudos')
        .select('kudos_type')
        .eq('to_user_id', user_id);

      if (summaryData) {
        const typeCounts: Record<string, number> = {};
        summaryData.forEach(k => {
          typeCounts[k.kudos_type] = (typeCounts[k.kudos_type] || 0) + 1;
        });
        summary = {
          total: summaryData.length,
          by_type: typeCounts,
        };
      }
    }

    return NextResponse.json({
      data,
      summary,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching kudos:', error);
    return NextResponse.json(
      { error: 'Failed to fetch kudos' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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
    const validated = kudosSchema.parse(body);

    // Can't give kudos to yourself
    if (validated.to_user_id === user.id) {
      return NextResponse.json(
        { error: 'Cannot give kudos to yourself' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('crew_kudos')
      .insert({
        from_user_id: user.id,
        ...validated,
      })
      .select(`
        *,
        from_user:platform_users!from_user_id(id, email, full_name, avatar_url),
        to_user:platform_users!to_user_id(id, email, full_name, avatar_url)
      `)
      .single();

    if (error) throw error;

    // Create activity feed entry for recipient
    await supabase.from('crew_activity_feed').insert({
      user_id: validated.to_user_id,
      activity_type: 'kudos_received',
      target_type: 'kudos',
      target_id: data.id,
      content: `Received ${validated.kudos_type.replace('_', ' ')} kudos`,
      metadata: { from_user_id: user.id, kudos_type: validated.kudos_type },
      visibility: validated.is_public ? 'connections' : 'private',
    });

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error giving kudos:', error);
    return NextResponse.json(
      { error: 'Failed to give kudos' },
      { status: 500 }
    );
  }
}
