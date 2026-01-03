export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { logger, withAuth, PlatformRole } from '@ghxstship/config';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

const COMPVSS_ADMIN_ROLES = [
  PlatformRole.COMPVSS_ADMIN,
  PlatformRole.COMPVSS_TEAM_MEMBER,
  PlatformRole.LEGEND_SUPER_ADMIN,
];

const safetyRecordSchema = z.object({
  event_id: z.string().uuid().optional(),
  record_type: z.enum(['briefing', 'inspection', 'checklist', 'certification', 'training']),
  title: z.string().min(1),
  description: z.string().optional(),
  status: z.enum(['pending', 'in_progress', 'completed', 'failed']).default('pending'),
  scheduled_date: z.string().datetime().optional(),
  completed_date: z.string().datetime().optional(),
  assigned_to: z.string().uuid().optional(),
  checklist_items: z.array(z.object({
    item: z.string(),
    completed: z.boolean().default(false),
  })).optional(),
  notes: z.string().optional(),
});

// GET /api/safety - List safety records
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    
    const eventId = searchParams.get('event_id');
    const recordType = searchParams.get('type');
    const status = searchParams.get('status');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('safety_records')
      .select(`
        *,
        event:legend_events(id, name, start_date),
        assigned_user:platform_users(id, email)
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (eventId) {
      query = query.eq('event_id', eventId);
    }
    if (recordType) {
      query = query.eq('record_type', recordType);
    }
    if (status) {
      query = query.eq('status', status);
    }

    const { data, error, count } = await query;

    if (error) {
      const errorCode = error.code || '';
      const errorMessage = error.message || '';
      if (
        errorCode === '42P01' || 
        errorCode === 'PGRST116' ||
        errorMessage.includes('does not exist') ||
        errorMessage.includes('relation') ||
        errorMessage.includes('no rows')
      ) {
        return NextResponse.json({ 
          safety_records: [], 
          total: 0, 
          limit, 
          offset,
          summary: { total: 0, by_type: {}, by_status: {}, compliance_rate: 100 }
        });
      }
      logger.error('Error fetching safety records:', error);
      return NextResponse.json({ 
        safety_records: [], 
        total: 0, 
        limit, 
        offset,
        summary: { total: 0, by_type: {}, by_status: {}, compliance_rate: 100 }
      });
    }

    const records = data || [];
    const completedCount = records.filter(r => r.status === 'completed').length;
    const summary = {
      total: count || 0,
      by_type: records.reduce((acc, r) => {
        acc[r.record_type] = (acc[r.record_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      by_status: records.reduce((acc, r) => {
        acc[r.status] = (acc[r.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      compliance_rate: records.length > 0 ? Math.round((completedCount / records.length) * 100) : 100,
    };

    return NextResponse.json({ safety_records: records, total: count, limit, offset, summary });
  } catch (error) {
    logger.error('Error in GET /api/safety:', error instanceof Error ? error : undefined);
    return NextResponse.json({ 
      safety_records: [], 
      total: 0, 
      limit: 50, 
      offset: 0,
      summary: { total: 0, by_type: {}, by_status: {}, compliance_rate: 100 }
    });
  }
}

// POST /api/safety - Create safety record
export async function POST(request: NextRequest) {
  try {
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!COMPVSS_ADMIN_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const supabase = getSupabaseClient();
    const body = await request.json();
    const validated = safetyRecordSchema.parse(body);

    const { data: record, error } = await supabase
      .from('safety_records')
      .insert({
        organization_id: body.organization_id || '00000000-0000-0000-0000-000000000001',
        event_id: validated.event_id,
        record_type: validated.record_type,
        title: validated.title,
        description: validated.description,
        status: validated.status,
        scheduled_date: validated.scheduled_date,
        completed_date: validated.completed_date,
        assigned_to: validated.assigned_to,
        checklist_items: validated.checklist_items,
        notes: validated.notes,
        created_by: authResult.user?.id,
      })
      .select()
      .single();

    if (error) {
      logger.error('Error creating safety record:', error);
      return NextResponse.json({ error: 'Failed to create safety record', details: error.message }, { status: 500 });
    }

    return NextResponse.json({ record }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    logger.error('Error in POST /api/safety:', error instanceof Error ? error : undefined);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/safety - Update safety record
export async function PATCH(request: NextRequest) {
  try {
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!COMPVSS_ADMIN_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const supabase = getSupabaseClient();
    const body = await request.json();
    const { record_id, updates, action } = body;

    if (!record_id) {
      return NextResponse.json({ error: 'record_id is required' }, { status: 400 });
    }

    if (action === 'complete') {
      updates.status = 'completed';
      updates.completed_date = new Date().toISOString();
    } else if (action === 'fail') {
      updates.status = 'failed';
    }

    const { data: record, error } = await supabase
      .from('safety_records')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', record_id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: 'Failed to update safety record' }, { status: 500 });
    }

    return NextResponse.json({ success: true, record });
  } catch (error) {
    logger.error('Error in PATCH /api/safety:', error instanceof Error ? error : undefined);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/safety - Delete safety record
export async function DELETE(request: NextRequest) {
  try {
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!COMPVSS_ADMIN_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const recordId = searchParams.get('id');

    if (!recordId) {
      return NextResponse.json({ error: 'Record ID required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('safety_records')
      .delete()
      .eq('id', recordId);

    if (error) {
      return NextResponse.json({ error: 'Failed to delete safety record' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Safety record deleted' });
  } catch (error) {
    logger.error('Error in DELETE /api/safety:', error instanceof Error ? error : undefined);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
