import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * POST /api/productions/from-blueprint
 * Convert an Experience Generator blueprint into a production
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      blueprintId,
      name,
      description,
      startDate,
      endDate,
      venue,
      capacity,
      ticketPrice,
      organizationId,
      createdBy,
    } = body;

    // Validate required fields
    if (!blueprintId || !name || !startDate || !organizationId || !createdBy) {
      return NextResponse.json(
        { error: 'Missing required fields: blueprintId, name, startDate, organizationId, createdBy' },
        { status: 400 }
      );
    }

    // Fetch the blueprint data
    const { data: blueprint, error: blueprintError } = await supabase
      .from('experience_blueprints')
      .select('*')
      .eq('id', blueprintId)
      .single();

    if (blueprintError || !blueprint) {
      return NextResponse.json(
        { error: 'Blueprint not found' },
        { status: 404 }
      );
    }

    // Generate a unified production ID that will be used across all platforms
    const productionId = `prod-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    // Create the production in ATLVS
    const { data: production, error: productionError } = await supabase
      .from('productions')
      .insert({
        id: productionId,
        name,
        description: description || blueprint.description,
        status: 'planning',
        start_date: startDate,
        end_date: endDate,
        organization_id: organizationId,
        created_by: createdBy,
        blueprint_id: blueprintId,
        metadata: {
          source: 'experience_generator',
          blueprint_version: blueprint.version || '1.0',
          foundation: blueprint.foundation,
          senses: blueprint.senses,
          journey_phases: blueprint.journey_phases,
        },
      })
      .select()
      .single();

    if (productionError) {
      console.error('Error creating production:', productionError);
      return NextResponse.json(
        { error: 'Failed to create production' },
        { status: 500 }
      );
    }

    // Create corresponding event in GVTEWAY (cross-platform sync)
    const { data: event, error: eventError } = await supabase
      .from('events')
      .insert({
        production_id: productionId,
        name,
        description: description || blueprint.description,
        status: 'draft',
        start_date: startDate,
        end_date: endDate,
        venue_name: venue,
        capacity: capacity ? parseInt(capacity, 10) : null,
        base_ticket_price: ticketPrice ? parseFloat(ticketPrice) : null,
        organization_id: organizationId,
        created_by: createdBy,
        metadata: {
          source: 'experience_generator',
          blueprint_id: blueprintId,
        },
      })
      .select()
      .single();

    if (eventError) {
      console.error('Error creating event:', eventError);
      // Don't fail the whole operation, just log the error
    }

    // Create crew workspace in COMPVSS (cross-platform sync)
    const { error: workspaceError } = await supabase
      .from('crew_workspaces')
      .insert({
        production_id: productionId,
        name: `${name} - Crew`,
        status: 'active',
        organization_id: organizationId,
        created_by: createdBy,
        metadata: {
          source: 'experience_generator',
          blueprint_id: blueprintId,
        },
      });

    if (workspaceError) {
      console.error('Error creating crew workspace:', workspaceError);
      // Don't fail the whole operation, just log the error
    }

    // Create production milestones from journey phases
    if (blueprint.journey_phases && Array.isArray(blueprint.journey_phases)) {
      const milestones = blueprint.journey_phases.map((phase: string, index: number) => ({
        production_id: productionId,
        name: phase,
        order: index + 1,
        status: 'pending',
        created_by: createdBy,
      }));

      const { error: milestonesError } = await supabase
        .from('production_milestones')
        .insert(milestones);

      if (milestonesError) {
        console.error('Error creating milestones:', milestonesError);
      }
    }

    // Update blueprint to mark it as converted
    await supabase
      .from('experience_blueprints')
      .update({
        converted_to_production: true,
        production_id: productionId,
        converted_at: new Date().toISOString(),
      })
      .eq('id', blueprintId);

    return NextResponse.json({
      success: true,
      production: {
        id: productionId,
        ...production,
      },
      event: event || null,
      message: 'Production created successfully from blueprint',
      crossPlatformSync: {
        atlvs: true,
        gvteway: !eventError,
        compvss: !workspaceError,
      },
    });
  } catch (error) {
    console.error('Error in from-blueprint API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/productions/from-blueprint
 * Get available blueprints for conversion
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');
    const includeConverted = searchParams.get('includeConverted') === 'true';

    let query = supabase
      .from('experience_blueprints')
      .select('*')
      .order('created_at', { ascending: false });

    if (organizationId) {
      query = query.eq('organization_id', organizationId);
    }

    if (!includeConverted) {
      query = query.or('converted_to_production.is.null,converted_to_production.eq.false');
    }

    const { data: blueprints, error } = await query;

    if (error) {
      console.error('Error fetching blueprints:', error);
      return NextResponse.json(
        { error: 'Failed to fetch blueprints' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      blueprints: blueprints || [],
      count: blueprints?.length || 0,
    });
  } catch (error) {
    console.error('Error in from-blueprint GET API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
