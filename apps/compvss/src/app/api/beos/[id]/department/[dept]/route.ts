export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { withAuth, PlatformRole } from '@ghxstship/config';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const COMPVSS_ROLES = [
  PlatformRole.COMPVSS_ADMIN, PlatformRole.COMPVSS_TEAM_MEMBER, PlatformRole.COMPVSS_VIEWER,
  PlatformRole.LEGEND_SUPER_ADMIN, PlatformRole.LEGEND_ADMIN, PlatformRole.LEGEND_DEVELOPER,
];

const DEPARTMENT_SECTIONS: Record<string, string[]> = {
  kitchen: ['catering', 'dietary_requirements', 'timeline'],
  service: ['event_details', 'client_info', 'timeline', 'catering', 'setup_requirements'],
  av: ['event_details', 'av_requirements', 'timeline'],
  setup: ['event_details', 'venue_info', 'setup_requirements', 'timeline'],
  management: ['event_details', 'client_info', 'venue_info', 'timeline', 'catering', 'av_requirements', 'setup_requirements', 'notes'],
};

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string; dept: string }> }) {
  try {
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;
    
    const userRoles = authResult.user?.platformRoles || [];
    if (!COMPVSS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden - COMPVSS access required' }, { status: 403 });
    }

    const { id: beoId, dept } = await params;
    const department = dept.toLowerCase();

    if (!DEPARTMENT_SECTIONS[department]) {
      return NextResponse.json({ error: 'Invalid department' }, { status: 400 });
    }

    const { data: beo, error } = await supabase
      .from('beos')
      .select('*')
      .eq('id', beoId)
      .single();

    if (error || !beo) {
      return NextResponse.json({ error: 'BEO not found' }, { status: 404 });
    }

    const allowedSections = DEPARTMENT_SECTIONS[department];
    const sections = beo.sections as Record<string, unknown>;
    const filteredSections: Record<string, unknown> = {};

    for (const section of allowedSections) {
      if (sections[section]) {
        filteredSections[section] = sections[section];
      }
    }

    return NextResponse.json({
      data: {
        id: beo.id,
        title: beo.title,
        event_date: beo.event_date,
        department,
        sections: filteredSections,
        status: beo.status,
        version: beo.version,
      }
    });
  } catch (error) {
    logger.error('Error in GET /api/beos/[id]/department/[dept]:', error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json({ error: 'Failed to fetch department BEO view' }, { status: 500 });
  }
}
