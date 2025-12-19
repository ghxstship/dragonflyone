export const dynamic = 'force-dynamic';

import { logger, withAuth, PlatformRole } from '@ghxstship/config';
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

const templateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.enum(['service', 'event', 'vendor', 'nda', 'custom']),
  description: z.string().optional(),
  content: z.string().default(''),
  clauses: z.array(z.string()).default([]),
  variables: z.array(z.string()).default([]),
  is_default: z.boolean().default(false),
});

// GET /api/contract-templates - List contract templates
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
    const type = searchParams.get('type');

    let query = supabase
      .from('contract_templates')
      .select('*')
      .order('is_default', { ascending: false })
      .order('usage_count', { ascending: false })
      .order('name');

    if (type) {
      query = query.eq('type', type);
    }

    const { data, error } = await query;

    if (error) {
      logger.error('Error fetching contract templates:', error);
      return NextResponse.json(
        { error: 'Failed to fetch templates', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      templates: data || [],
      total: data?.length || 0,
    });
  } catch (error) {
    logger.error('Error in GET /api/contract-templates:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/contract-templates - Create new template
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
    const validated = templateSchema.parse(body);

    const organizationId = body.organization_id || '00000000-0000-0000-0000-000000000000';

    // If setting as default, unset other defaults for this type
    if (validated.is_default) {
      await supabase
        .from('contract_templates')
        .update({ is_default: false })
        .eq('type', validated.type)
        .eq('is_default', true);
    }

    const { data, error } = await supabase
      .from('contract_templates')
      .insert([
        {
          ...validated,
          organization_id: organizationId,
          usage_count: 0,
          created_by: authResult.user?.id || null,
        },
      ])
      .select()
      .single();

    if (error) {
      logger.error('Error creating contract template:', error);
      return NextResponse.json(
        { error: 'Failed to create template', details: error.message },
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

    logger.error('Error in POST /api/contract-templates:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
