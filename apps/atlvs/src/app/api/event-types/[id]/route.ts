export const dynamic = 'force-dynamic';

import { logger, withAuth, PlatformRole } from '@ghxstship/config';
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { z } from 'zod';

const ATLVS_ADMIN_ROLES = [
  PlatformRole.ATLVS_SUPER_ADMIN, PlatformRole.ATLVS_ADMIN,
  PlatformRole.LEGEND_SUPER_ADMIN, PlatformRole.LEGEND_ADMIN, PlatformRole.LEGEND_DEVELOPER,
];

const updateEventTypeSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  color: z.string().optional(),
  icon: z.string().optional(),
  default_duration_hours: z.number().min(1).optional(),
  requires_approval: z.boolean().optional(),
  min_lead_time_days: z.number().min(0).optional(),
  max_capacity: z.number().optional(),
  default_setup_time_minutes: z.number().min(0).optional(),
  default_teardown_time_minutes: z.number().min(0).optional(),
  is_active: z.boolean().optional(),
  metadata: z.record(z.unknown()).optional(),
});

// GET /api/event-types/[id] - Get event type by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = createAdminClient();
  try {
    const { id } = await params;

    const { data, error } = await supabase
      .from('event_types')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Event type not found' }, { status: 404 });
      }
      logger.error('Error fetching event type:', error);
      return NextResponse.json(
        { error: 'Failed to fetch event type', details: error.message },
        { status: 500 }
      );
    }

    // Get usage count
    const { count } = await supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .eq('event_type_id', id);

    return NextResponse.json({
      ...data,
      usage_count: count || 0,
    });
  } catch (error) {
    logger.error('Error in GET /api/event-types/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/event-types/[id] - Update event type
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = createAdminClient();
  try {
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;
    
    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ADMIN_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const validated = updateEventTypeSchema.parse(body);

    const { data, error } = await supabase
      .from('event_types')
      .update({
        ...validated,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Event type not found' }, { status: 404 });
      }
      logger.error('Error updating event type:', error);
      return NextResponse.json(
        { error: 'Failed to update event type', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    logger.error('Error in PUT /api/event-types/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/event-types/[id] - Soft delete event type
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = createAdminClient();
  try {
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;
    
    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ADMIN_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const { id } = await params;

    // Check if event type is in use
    const { count } = await supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .eq('event_type_id', id);

    if (count && count > 0) {
      // Soft delete by setting is_active to false
      const { data, error } = await supabase
        .from('event_types')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        logger.error('Error deactivating event type:', error);
        return NextResponse.json(
          { error: 'Failed to deactivate event type', details: error.message },
          { status: 500 }
        );
      }

      return NextResponse.json({ 
        success: true, 
        message: 'Event type deactivated (has bookings)',
        event_type: data,
      });
    }

    // Hard delete if no bookings
    const { error } = await supabase
      .from('event_types')
      .delete()
      .eq('id', id);

    if (error) {
      logger.error('Error deleting event type:', error);
      return NextResponse.json(
        { error: 'Failed to delete event type', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Error in DELETE /api/event-types/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
