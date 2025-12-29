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

const organizationSettingsSchema = z.object({
  name: z.string().min(1, 'Organization name is required'),
  legal_name: z.string().optional(),
  logo_url: z.string().url().optional().nullable(),
  website: z.string().url().optional().nullable(),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zip: z.string().optional(),
    country: z.string().optional(),
  }).optional().nullable(),
  tax_id: z.string().optional().nullable(),
  industry: z.string().optional().nullable(),
  timezone: z.string().default('America/New_York'),
  currency: z.string().default('USD'),
  date_format: z.string().default('MM/DD/YYYY'),
  fiscal_year_start: z.string().default('January'),
});

// GET /api/settings/organization - Get organization settings
export async function GET(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;
    
    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden - ATLVS access required' }, { status: 403 });
    }

    // Get organization ID from user context or query param
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organization_id') || authResult.user?.organizationId;

    if (!organizationId) {
      return NextResponse.json({ error: 'Organization ID required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', organizationId)
      .single();

    if (error) {
      logger.error('Error fetching organization settings:', error);
      // Return empty settings structure if organization not found
      if (error.code === 'PGRST116') {
        return NextResponse.json({
          id: organizationId,
          name: '',
          timezone: 'America/New_York',
          currency: 'USD',
          date_format: 'MM/DD/YYYY',
          fiscal_year_start: 'January',
        });
      }
      return NextResponse.json(
        { error: 'Failed to fetch organization settings', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    logger.error('Error in GET /api/settings/organization:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/settings/organization - Update organization settings
export async function PUT(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;
    
    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ADMIN_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const validated = organizationSettingsSchema.parse(body);

    const organizationId = body.id || authResult.user?.organizationId;

    if (!organizationId) {
      return NextResponse.json({ error: 'Organization ID required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('organizations')
      .update({
        ...validated,
        updated_at: new Date().toISOString(),
        updated_by: authResult.user?.id,
      })
      .eq('id', organizationId)
      .select()
      .single();

    if (error) {
      logger.error('Error updating organization settings:', error);
      return NextResponse.json(
        { error: 'Failed to update organization settings', details: error.message },
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

    logger.error('Error in PUT /api/settings/organization:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
