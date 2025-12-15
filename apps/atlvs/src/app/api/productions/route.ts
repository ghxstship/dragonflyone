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

const ProductionSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  tagline: z.string().optional(),
  description: z.string().optional(),
  format: z.string().optional(),
  genre: z.string().optional(),
  announcementDate: z.string().optional(),
  onSaleDate: z.string().optional(),
  previewStart: z.string().optional(),
  openingDate: z.string().optional(),
  closingDate: z.string().optional(),
  loadInStart: z.string().optional(),
  loadOutEnd: z.string().optional(),
  venueId: z.string().uuid().optional(),
  capacityPerShow: z.number().optional(),
  showsPerDay: z.number().optional(),
  runtimeMinutes: z.number().optional(),
  productionBudget: z.number().optional(),
  operatingBudgetWeekly: z.number().optional(),
  ticketPriceMin: z.number().optional(),
  ticketPriceMax: z.number().optional(),
  projectedGross: z.number().optional(),
  breakEvenPercentage: z.number().optional(),
  sponsorshipTarget: z.number().optional(),
  blueprintId: z.string().uuid().optional(),
});

export async function GET(request: NextRequest) {
  try {
    // Authentication check
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult; // Returns 401 if not authenticated
    }
    
    // Authorization check - verify user has ATLVS access
    const userRoles = authResult.user?.platformRoles || [];
    const hasAccess = ATLVS_ROLES.some(role => userRoles.includes(role));
    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden - ATLVS access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('productions')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      log.error('Failed to fetch productions', { error });
      return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
    }

    return NextResponse.json({ productions: data });
  } catch (error) {
    log.error('Productions GET error', { error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Authentication check
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult; // Returns 401 if not authenticated
    }
    
    // Authorization check - only admins can create productions
    const userRoles = authResult.user?.platformRoles || [];
    const canCreate = userRoles.some(role => 
      role === PlatformRole.ATLVS_SUPER_ADMIN ||
      role === PlatformRole.ATLVS_ADMIN ||
      role === PlatformRole.LEGEND_SUPER_ADMIN ||
      role === PlatformRole.LEGEND_ADMIN ||
      role === PlatformRole.LEGEND_DEVELOPER
    );
    if (!canCreate) {
      return NextResponse.json({ error: 'Forbidden - Admin access required to create productions' }, { status: 403 });
    }

    // Get user's organization_id from platform_users
    const { data: platformUser, error: userError } = await supabase
      .from('platform_users')
      .select('id, organization_id')
      .eq('auth_user_id', authResult.user?.id)
      .single();

    if (userError || !platformUser) {
      log.error('Failed to fetch platform user', { error: userError, userId: authResult.user?.id });
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    // Get or create a default project for the organization
    let projectId: string;
    const { data: existingProject } = await supabase
      .from('projects')
      .select('id')
      .eq('organization_id', platformUser.organization_id)
      .limit(1)
      .single();

    if (existingProject) {
      projectId = existingProject.id;
    } else {
      // Create a default project for productions
      const { data: newProject, error: projectError } = await supabase
        .from('projects')
        .insert({
          organization_id: platformUser.organization_id,
          name: 'Default Productions Project',
          status: 'active',
          created_by: platformUser.id,
        })
        .select('id')
        .single();

      if (projectError || !newProject) {
        log.error('Failed to create default project', { error: projectError });
        return NextResponse.json({ error: 'Failed to create project for production' }, { status: 500 });
      }
      projectId = newProject.id;
    }

    const body = await request.json();
    
    const validationResult = ProductionSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.issues },
        { status: 400 }
      );
    }
    
    const validated = validationResult.data;
    const today = new Date().toISOString().split('T')[0];

    const productionData = {
      organization_id: platformUser.organization_id,
      project_id: projectId,
      name: validated.title,
      title: validated.title,
      tagline: validated.tagline,
      description: validated.description,
      format: validated.format,
      genre: validated.genre,
      announcement_date: validated.announcementDate || null,
      on_sale_date: validated.onSaleDate || null,
      preview_start: validated.previewStart || null,
      opening_date: validated.openingDate || null,
      closing_date: validated.closingDate || null,
      load_in_date: validated.loadInStart || today,
      load_out_date: validated.loadOutEnd || today,
      event_date: validated.openingDate || today,
      venue_id: validated.venueId || null,
      capacity_per_show: validated.capacityPerShow || 0,
      shows_per_day: validated.showsPerDay || 1,
      runtime_minutes: validated.runtimeMinutes || 90,
      budget: validated.productionBudget || 0,
      operating_budget_weekly: validated.operatingBudgetWeekly || 0,
      ticket_price_min: validated.ticketPriceMin || 0,
      ticket_price_max: validated.ticketPriceMax || 0,
      projected_gross: validated.projectedGross || 0,
      break_even_percentage: validated.breakEvenPercentage || 70,
      sponsorship_target: validated.sponsorshipTarget || 0,
      blueprint_id: validated.blueprintId || null,
      status: 'draft',
      production_type: validated.format || 'other',
      created_by: platformUser.id,
    };

    const { data, error } = await supabase
      .from('productions')
      .insert(productionData)
      .select()
      .single();

    if (error) {
      log.error('Failed to create production', { error });
      return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
    }

    log.info('Production created', { productionId: data.id });

    return NextResponse.json({ id: data.id, production: data }, { status: 201 });
  } catch (error) {
    log.error('Productions POST error', { error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
