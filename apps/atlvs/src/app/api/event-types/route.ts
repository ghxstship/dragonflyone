export const dynamic = 'force-dynamic';

import { withAuth, PlatformRole } from '@ghxstship/config';
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { z } from 'zod';

const ATLVS_ROLES = [
  PlatformRole.ATLVS_SUPER_ADMIN, PlatformRole.ATLVS_ADMIN, PlatformRole.ATLVS_TEAM_MEMBER, PlatformRole.ATLVS_VIEWER,
  PlatformRole.LEGEND_SUPER_ADMIN, PlatformRole.LEGEND_ADMIN, PlatformRole.LEGEND_DEVELOPER,
];

const ATLVS_ADMIN_ROLES = [
  PlatformRole.ATLVS_SUPER_ADMIN, PlatformRole.ATLVS_ADMIN,
  PlatformRole.LEGEND_SUPER_ADMIN, PlatformRole.LEGEND_ADMIN, PlatformRole.LEGEND_DEVELOPER,
];

const eventTypeSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  color: z.string().default('#3B82F6'),
  icon: z.string().optional(),
  default_duration_hours: z.number().min(1).default(4),
  requires_approval: z.boolean().default(false),
  min_lead_time_days: z.number().min(0).default(0),
  max_capacity: z.number().optional(),
  default_setup_time_minutes: z.number().min(0).default(60),
  default_teardown_time_minutes: z.number().min(0).default(60),
  is_active: z.boolean().default(true),
  metadata: z.record(z.unknown()).optional(),
});

// GET /api/event-types - List event types
export async function GET(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;
    
    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden - ATLVS access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get('is_active');
    const organizationId = searchParams.get('organization_id');

    let query = supabase
      .from('event_types')
      .select('*')
      .order('name');

    if (isActive !== null) {
      query = query.eq('is_active', isActive === 'true');
    }

    if (organizationId) {
      query = query.eq('organization_id', organizationId);
    }

    const { data, error } = await query;

    if (error) {
      logger.error('Error fetching event types:', error);
      return NextResponse.json(
        { error: 'Failed to fetch event types', details: error.message },
        { status: 500 }
      );
    }

    // Calculate usage counts
    const eventTypesWithUsage = await Promise.all(
      (data || []).map(async (eventType) => {
        const { count } = await supabase
          .from('bookings')
          .select('*', { count: 'exact', head: true })
          .eq('event_type_id', eventType.id);
        
        return {
          ...eventType,
          usage_count: count || 0,
        };
      })
    );

    return NextResponse.json({
      event_types: eventTypesWithUsage,
      total: eventTypesWithUsage.length,
    });
  } catch (error) {
    logger.error('Error in GET /api/event-types:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/event-types - Create new event type
export async function POST(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;
    
    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ADMIN_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const validated = eventTypeSchema.parse(body);

    const organizationId = body.organization_id || '00000000-0000-0000-0000-000000000000';

    const { data, error } = await supabase
      .from('event_types')
      .insert([
        {
          ...validated,
          organization_id: organizationId,
          created_by: authResult.user?.id || null,
        },
      ])
      .select()
      .single();

    if (error) {
      logger.error('Error creating event type:', error);
      return NextResponse.json(
        { error: 'Failed to create event type', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    logger.error('Error in POST /api/event-types:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
