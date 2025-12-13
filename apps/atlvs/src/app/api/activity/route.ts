export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const ActivitySchema = z.object({
  user_id: z.string().uuid().optional(),
  actor_id: z.string().uuid().optional(),
  action_type: z.enum(['created', 'updated', 'deleted', 'commented', 'shared', 'assigned', 'completed', 'approved', 'rejected', 'uploaded', 'downloaded', 'mentioned', 'joined', 'left']),
  entity_type: z.string().min(1),
  entity_id: z.string().min(1),
  entity_name: z.string().optional(),
  description: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { searchParams } = new URL(request.url);
    
    const userId = searchParams.get('user_id');
    const entityType = searchParams.get('entity_type');
    const entityId = searchParams.get('entity_id');
    const actionType = searchParams.get('action_type');
    const unreadOnly = searchParams.get('unread_only') === 'true';
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('activity_feed')
      .select(`
        *,
        actor:platform_users!actor_id(id, full_name, email)
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (userId) {
      query = query.eq('user_id', userId);
    }
    if (entityType) {
      query = query.eq('entity_type', entityType);
    }
    if (entityId) {
      query = query.eq('entity_id', entityId);
    }
    if (actionType && actionType !== 'all') {
      query = query.eq('action_type', actionType);
    }
    if (unreadOnly) {
      query = query.eq('is_read', false);
    }

    const { data, error, count } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const activities = data || [];
    const summary = {
      total: count || 0,
      unread: activities.filter(a => !a.is_read).length,
      by_action: activities.reduce((acc, a) => {
        acc[a.action_type] = (acc[a.action_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };

    return NextResponse.json({
      activities,
      summary,
      pagination: { limit, offset, total: count || 0 },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch activity feed' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const body = await request.json();
    const validatedData = ActivitySchema.parse(body);

    const { data, error } = await supabase
      .from('activity_feed')
      .insert({
        ...validatedData,
        metadata: validatedData.metadata || {},
      })
      .select(`
        *,
        actor:platform_users!actor_id(id, full_name, email)
      `)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ activity: data }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 422 });
    }
    return NextResponse.json({ error: 'Failed to create activity' }, { status: 500 });
  }
}
