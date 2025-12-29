export const dynamic = 'force-dynamic';

import { withAuth, PlatformRole } from '@ghxstship/config';
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { z } from 'zod';

const handbookSchema = z.object({
  version_number: z.string().min(1).max(20),
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  effective_date: z.string(),
  expiration_date: z.string().optional(),
  document_url: z.string().url().optional(),
  requires_acknowledgment: z.boolean().default(true),
  acknowledgment_deadline_days: z.number().int().default(30),
  change_summary: z.string().optional(),
});

const ATLVS_ROLES = [
  PlatformRole.ATLVS_SUPER_ADMIN, PlatformRole.ATLVS_ADMIN, PlatformRole.ATLVS_TEAM_MEMBER, PlatformRole.ATLVS_VIEWER,
  PlatformRole.LEGEND_SUPER_ADMIN, PlatformRole.LEGEND_ADMIN, PlatformRole.LEGEND_DEVELOPER,
];

export async function GET(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const include_sections = searchParams.get('include_sections') === 'true';

    let selectQuery = `
      *,
      created_by_user:platform_users!created_by(id, email, full_name),
      approved_by_user:platform_users!approved_by(id, email, full_name)
    `;

    if (include_sections) {
      selectQuery += `,
        sections:handbook_sections(
          id, section_number, title, content_type, sort_order, is_required_reading, estimated_read_time_minutes
        )
      `;
    }

    let query = supabase
      .from('handbook_versions')
      .select(selectQuery);

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query.order('effective_date', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ data });
  } catch (error) {
    logger.error('Error fetching handbooks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch handbooks' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validated = handbookSchema.parse(body);

    const { data, error } = await supabase
      .from('handbook_versions')
      .insert({
        ...validated,
        status: 'draft',
        created_by: user.id,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    logger.error('Error creating handbook:', error);
    return NextResponse.json(
      { error: 'Failed to create handbook' },
      { status: 500 }
    );
  }
}
