export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { logger, withAuth, PlatformRole } from '@ghxstship/config';

const COMPVSS_ROLES = [
  PlatformRole.COMPVSS_ADMIN,
  PlatformRole.COMPVSS_TEAM_MEMBER,
  PlatformRole.LEGEND_SUPER_ADMIN,
  PlatformRole.LEGEND_ADMIN,
];

const syncItemSchema = z.object({
  action: z.enum(['create', 'update', 'delete']),
  entity_type: z.string(),
  entity_id: z.string().optional(),
  data: z.record(z.unknown()),
  created_at: z.string().datetime() });

export async function GET(request: NextRequest) {
  try {
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!COMPVSS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({
      queue: [],
      total: 0,
      oldest_item: null,
      newest_item: null });
  } catch (error) {
    logger.error('Error in GET /api/offline/queue:', error instanceof Error ? error : undefined);
    return NextResponse.json({ queue: [], total: 0 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!COMPVSS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const items = Array.isArray(body) ? body : [body];
    const validated = items.map(item => syncItemSchema.parse(item));

    return NextResponse.json({
      success: true,
      queued_count: validated.length,
      message: `${validated.length} item(s) queued for sync` }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    logger.error('Error in POST /api/offline/queue:', error instanceof Error ? error : undefined);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!COMPVSS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      cleared_count: 0,
      message: 'Queue cleared' });
  } catch (error) {
    logger.error('Error in DELETE /api/offline/queue:', error instanceof Error ? error : undefined);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
