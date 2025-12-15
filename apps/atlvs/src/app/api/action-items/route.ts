export const dynamic = 'force-dynamic';

import { logger, withAuth, PlatformRole } from '@ghxstship/config';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const ATLVS_ROLES = [
  PlatformRole.ATLVS_SUPER_ADMIN, PlatformRole.ATLVS_ADMIN, PlatformRole.ATLVS_TEAM_MEMBER, PlatformRole.ATLVS_VIEWER,
  PlatformRole.LEGEND_SUPER_ADMIN, PlatformRole.LEGEND_ADMIN, PlatformRole.LEGEND_DEVELOPER,
];

interface ActionItem {
  id: string;
  source: 'task' | 'meeting';
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  due_date?: string;
  assigned_to?: string;
  assignee_name?: string;
  project_id?: string;
  production_id?: string;
  created_at: string;
  updated_at: string;
}

export async function GET(request: NextRequest) {
  try {
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;
    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    // Fetch schedule tasks
    let tasksQuery = supabase
      .from('schedule_tasks')
      .select(`
        id,
        title,
        description,
        priority,
        status,
        due_date,
        assigned_to,
        production_id,
        created_at,
        updated_at
      `)
      .in('status', ['pending', 'in_progress'])
      .order('priority', { ascending: false })
      .order('due_date', { ascending: true, nullsFirst: false })
      .limit(limit);

    if (status) {
      tasksQuery = tasksQuery.eq('status', status);
    }
    if (priority) {
      tasksQuery = tasksQuery.eq('priority', priority);
    }

    // Fetch meeting action items
    let meetingItemsQuery = supabase
      .from('meeting_action_items')
      .select(`
        id,
        description,
        priority,
        status,
        due_date,
        assigned_to,
        assigned_to_name,
        created_at,
        updated_at,
        meeting_note:meeting_notes(
          id,
          title,
          project_id
        )
      `)
      .in('status', ['pending', 'in_progress'])
      .order('priority', { ascending: false })
      .order('due_date', { ascending: true, nullsFirst: false })
      .limit(limit);

    if (status) {
      meetingItemsQuery = meetingItemsQuery.eq('status', status);
    }
    if (priority) {
      meetingItemsQuery = meetingItemsQuery.eq('priority', priority);
    }

    const [tasksResult, meetingItemsResult] = await Promise.all([
      tasksQuery,
      meetingItemsQuery,
    ]);

    if (tasksResult.error) {
      logger.error('Tasks query error:', tasksResult.error);
    }
    if (meetingItemsResult.error) {
      logger.error('Meeting items query error:', meetingItemsResult.error);
    }

    // Transform schedule tasks
    const taskItems: ActionItem[] = (tasksResult.data || []).map((task) => ({
      id: task.id,
      source: 'task' as const,
      title: task.title,
      description: task.description,
      priority: task.priority,
      status: task.status,
      due_date: task.due_date,
      assigned_to: task.assigned_to,
      production_id: task.production_id,
      created_at: task.created_at,
      updated_at: task.updated_at,
    }));

    // Transform meeting action items
    const meetingNote = (item: { meeting_note?: { title?: string; project_id?: string } | null }) => 
      item.meeting_note as { title?: string; project_id?: string } | null;
    
    const meetingItems: ActionItem[] = (meetingItemsResult.data || []).map((item) => ({
      id: item.id,
      source: 'meeting' as const,
      title: item.description,
      description: meetingNote(item)?.title ? `From meeting: ${meetingNote(item)?.title}` : undefined,
      priority: item.priority,
      status: item.status,
      due_date: item.due_date,
      assigned_to: item.assigned_to,
      assignee_name: item.assigned_to_name,
      project_id: meetingNote(item)?.project_id,
      created_at: item.created_at,
      updated_at: item.updated_at,
    }));

    // Combine and sort
    const priorityOrder: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
    const allItems = [...taskItems, ...meetingItems].sort((a, b) => {
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;
      
      if (!a.due_date && !b.due_date) return 0;
      if (!a.due_date) return 1;
      if (!b.due_date) return -1;
      return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
    });

    return NextResponse.json({
      action_items: allItems.slice(0, limit),
      total: allItems.length,
    });
  } catch (error) {
    logger.error('Error fetching action items:', error);
    return NextResponse.json(
      { error: 'Failed to fetch action items' },
      { status: 500 }
    );
  }
}
