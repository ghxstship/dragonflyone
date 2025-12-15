export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { log, withAuth, PlatformRole } from '@ghxstship/config';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const ATLVS_ROLES = [
  PlatformRole.ATLVS_SUPER_ADMIN,
  PlatformRole.ATLVS_ADMIN,
  PlatformRole.ATLVS_TEAM_MEMBER,
  PlatformRole.ATLVS_VIEWER,
  PlatformRole.LEGEND_SUPER_ADMIN,
  PlatformRole.LEGEND_ADMIN,
  PlatformRole.LEGEND_DEVELOPER,
];

const ATLVS_ADMIN_ROLES = [
  PlatformRole.ATLVS_SUPER_ADMIN,
  PlatformRole.ATLVS_ADMIN,
  PlatformRole.LEGEND_SUPER_ADMIN,
  PlatformRole.LEGEND_ADMIN,
  PlatformRole.LEGEND_DEVELOPER,
];

const UpdateProductionSchema = z.object({
  title: z.string().min(1).optional(),
  tagline: z.string().optional(),
  description: z.string().optional(),
  format: z.string().optional(),
  genre: z.string().optional(),
  status: z.string().optional(),
  opening_date: z.string().optional(),
  closing_date: z.string().optional(),
  venue_id: z.string().uuid().optional(),
  budget: z.number().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authentication check
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    
    // Authorization check
    const userRoles = authResult.user?.platformRoles || [];
    const hasAccess = ATLVS_ROLES.some(role => userRoles.includes(role));
    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden - ATLVS access required' }, { status: 403 });
    }

    const { id } = await params;

    const { data, error } = await supabase
      .from('productions')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Production not found' }, { status: 404 });
      }
      log.error('Failed to fetch production', { error, id });
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

    return NextResponse.json({ production: data });
  } catch (error) {
    log.error('Production GET error', { error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authentication check
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    
    // Authorization check - only admins can update productions
    const userRoles = authResult.user?.platformRoles || [];
    const canUpdate = ATLVS_ADMIN_ROLES.some(role => userRoles.includes(role));
    if (!canUpdate) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();

    const validationResult = UpdateProductionSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const updateData = {
      ...validationResult.data,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('productions')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Production not found' }, { status: 404 });
      }
      log.error('Failed to update production', { error, id });
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

    log.info('Production updated', { productionId: id });
    return NextResponse.json({ production: data });
  } catch (error) {
    log.error('Production PATCH error', { error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authentication check
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    
    // Authorization check - only admins can delete productions
    const userRoles = authResult.user?.platformRoles || [];
    const canDelete = ATLVS_ADMIN_ROLES.some(role => userRoles.includes(role));
    if (!canDelete) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const { id } = await params;

    const { error } = await supabase
      .from('productions')
      .delete()
      .eq('id', id);

    if (error) {
      log.error('Failed to delete production', { error, id });
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

    log.info('Production deleted', { productionId: id });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    log.error('Production DELETE error', { error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
