import { getServerSupabase } from './supabase-client';
import { logger } from './logger';

export interface DealToProjectHandoff {
  dealId: string;
  orgSlug: string;
  autoCreateProject?: boolean;
}

export interface ProjectToEventSync {
  projectId: string;
  orgSlug: string;
  eventData: {
    title: string;
    venue?: string;
    startDate?: string;
    capacity?: number;
  };
}

export interface TicketRevenueSync {
  orgSlug: string;
  projectCode: string;
  eventCode: string;
  ticketCount: number;
  grossAmount: number;
  currency?: string;
}

export interface AssetAvailabilityCheck {
  assetIds: string[];
  projectId: string;
  startDate: string;
  endDate: string;
}

/**
 * ATLVS → COMPVSS Integration
 * Handles deal-to-project handoff when deal status = 'won'
 */
export async function handleDealToProjectHandoff(params: DealToProjectHandoff) {
  const supabase = getServerSupabase();
  
  try {
    // Check if deal exists and is won
    const { data: deal, error: dealError } = await supabase
      .from('deals')
      .select('*, organizations!inner(slug)')
      .eq('id', params.dealId)
      .single() as { data: { id: string; status: string; organization_id: string; title: string; value: number } | null; error: Error | null };

    if (dealError || !deal) {
      throw new Error(`Deal not found: ${dealError?.message}`);
    }

    // Check if project already exists for this deal
    const { data: existingProject } = await supabase
      .from('projects')
      .select('id')
      .eq('deal_id', params.dealId)
      .single() as { data: { id: string } | null };

    if (existingProject) {
      return { success: true, projectId: existingProject.id, alreadyExists: true };
    }

    // Create project if autoCreateProject is true and deal is won
    if (params.autoCreateProject && deal.status === 'won') {
      const projectCode = `PROJ-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;
      
      const { data: newProject, error: projectError } = await supabase
        .from('projects')
        .insert({
          organization_id: deal.organization_id,
          deal_id: deal.id,
          code: projectCode,
          name: deal.title,
          phase: 'intake',
          budget: deal.value,
          currency: 'USD',
        })
        .select()
        .single() as { data: { id: string } | null; error: Error | null };

      if (projectError) {
        throw new Error(`Project creation failed: ${projectError.message}`);
      }

      // Create integration link - using correct schema
      if (newProject) {
        await supabase
          .from('integration_project_links')
          .insert({
            organization_id: deal.organization_id,
            compvss_project_id: newProject.id,
            external_system: 'atlvs',
            external_id: deal.id,
            sync_status: 'active',
            last_sync_at: new Date().toISOString(),
          });

        return { success: true, projectId: newProject.id, created: true };
      }
      throw new Error('Project creation returned null');
    }

    return { success: false, message: 'Deal not won or auto-create disabled' };
  } catch (error) {
    logger.error('Deal to project handoff error', error instanceof Error ? error : undefined);
    throw error;
  }
}

/**
 * COMPVSS → GVTEWAY Integration
 * Creates event in GVTEWAY from COMPVSS project
 */
export async function syncProjectToEvent(params: ProjectToEventSync) {
  const supabase = getServerSupabase();

  try {
    // Get project details
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*, organizations!inner(slug)')
      .eq('id', params.projectId)
      .single();

    if (projectError || !project) {
      throw new Error(`Project not found: ${projectError?.message}`);
    }

    // Check if event link already exists
    const { data: existingLink } = await supabase
      .from('integration_event_links')
      .select('gvteway_event_id')
      .eq('project_id', params.projectId)
      .single() as { data: { gvteway_event_id: string } | null };

    if (existingLink) {
      return { success: true, eventId: existingLink.gvteway_event_id, alreadyLinked: true };
    }

    // Create event metadata
    const projectData = project as { code?: string; name: string };
    const eventMetadata = {
      source: 'compvss_project',
      project_code: projectData.code || '',
      project_name: projectData.name,
      ...params.eventData,
    };

    // Get organization ID from project
    const projectOrg = project as { organization_id: string };
    
    // Enqueue sync job for event creation - using correct RPC signature
    const { data: syncJob, error: syncError } = await supabase.rpc('rpc_enqueue_sync_job', {
      p_org_id: projectOrg.organization_id,
      p_job_type: 'create_event',
      p_entity_type: 'project',
      p_entity_id: params.projectId,
      p_external_system: 'gvteway',
      p_direction: 'outbound',
      p_payload: {
        action: 'create_event',
        project_id: params.projectId,
        event_data: eventMetadata,
      },
    });

    if (syncError) {
      throw new Error(`Sync job creation failed: ${syncError.message}`);
    }

    return { success: true, syncJobId: (syncJob as unknown as string) };
  } catch (error) {
    logger.error('Project to event sync error', error instanceof Error ? error : undefined);
    throw error;
  }
}

/**
 * GVTEWAY → ATLVS Integration
 * Ingests ticket revenue into ATLVS finance
 */
export async function ingestTicketRevenue(params: TicketRevenueSync) {
  const supabase = getServerSupabase();

  try {
    // Get organization and event IDs first
    const { data: project } = await supabase
      .from('projects')
      .select('id, organization_id')
      .eq('code', params.projectCode)
      .single();

    if (!project) {
      throw new Error(`Project not found: ${params.projectCode}`);
    }

    // Get event ID from event code
    const { data: event } = await supabase
      .from('legend_events')
      .select('id')
      .eq('code', params.eventCode)
      .single();

    // Call RPC with correct signature
    const { data: ingestion, error } = await supabase.rpc('rpc_ingest_ticket_revenue', {
      p_org_id: project.organization_id,
      p_external_system: 'gvteway',
      p_external_event_id: params.eventCode,
      p_event_id: event?.id || params.eventCode,
      p_ingestion_date: new Date().toISOString().split('T')[0],
      p_ticket_type: 'general',
      p_tickets_sold: params.ticketCount,
      p_gross_revenue: params.grossAmount,
    });

    if (error) {
      throw new Error(`Ticket revenue ingestion failed: ${error.message}`);
    }

    // Create corresponding ledger entry
    if (project) {
      // Find revenue account
      const { data: revenueAccount } = await supabase
        .from('ledger_accounts')
        .select('id')
        .eq('organization_id', project.organization_id)
        .eq('account_type', 'revenue')
        .limit(1)
        .single();

      if (revenueAccount) {
        await supabase
          .from('ledger_entries')
          .insert({
            organization_id: project.organization_id,
            project_id: project.id,
            account_id: revenueAccount.id,
            amount: params.grossAmount,
            side: 'credit',
            entry_date: new Date().toISOString().split('T')[0],
            memo: `Ticket revenue: ${params.eventCode} (${params.ticketCount} tickets)`,
          });
      }
    }

    return { success: true, ingestionId: (ingestion as unknown as string) };
  } catch (error) {
    logger.error('Ticket revenue ingestion error', error instanceof Error ? error : undefined);
    throw error;
  }
}

/**
 * ATLVS → COMPVSS Integration
 * Checks asset availability across projects
 */
export async function checkAssetAvailability(params: AssetAvailabilityCheck) {
  const supabase = getServerSupabase();

  try {
    const { data: assets, error } = await supabase
      .from('assets')
      .select('id, tag, category, state, project_id, metadata')
      .in('id', params.assetIds);

    if (error) {
      throw new Error(`Asset query failed: ${error.message}`);
    }

    const availability = assets?.map((asset) => {
      const isAvailable = asset.state === 'available' || 
                         (asset.state === 'reserved' && asset.project_id === params.projectId);
      
      return {
        assetId: asset.id,
        tag: asset.tag,
        category: asset.category,
        state: asset.state,
        available: isAvailable,
        conflict: !isAvailable ? asset.project_id : null,
      };
    });

    return { success: true, availability };
  } catch (error) {
    logger.error('Asset availability check error', error instanceof Error ? error : undefined);
    throw error;
  }
}

/**
 * Tri-Platform Workflow: Complete Event Lifecycle
 * Orchestrates deal → project → event → revenue flow
 */
export async function orchestrateEventLifecycle(dealId: string, orgSlug: string) {
  try {
    // Step 1: ATLVS - Deal to Project
    const projectResult = await handleDealToProjectHandoff({
      dealId,
      orgSlug,
      autoCreateProject: true,
    });

    if (!projectResult.success) {
      throw new Error('Project creation failed');
    }

    // Step 2: COMPVSS - Project setup would happen here
    // (crew assignment, asset allocation, production planning)

    // Step 3: GVTEWAY - Create event from project
    const eventResult = await syncProjectToEvent({
      projectId: projectResult.projectId!,
      orgSlug,
      eventData: {
        title: 'Auto-generated Event',
        capacity: 1000,
      },
    });

    return {
      success: true,
      workflow: {
        dealId,
        projectId: projectResult.projectId,
        syncJobId: eventResult.syncJobId,
      },
    };
  } catch (error) {
    logger.error('Event lifecycle orchestration error', error instanceof Error ? error : undefined);
    throw error;
  }
}

/**
 * Real-time sync status checker
 */
export async function getSyncJobStatus(jobId: string) {
  const supabase = getServerSupabase();

  const { data, error } = await supabase
    .from('integration_sync_jobs')
    .select('*')
    .eq('id', jobId)
    .single();

  if (error) {
    throw new Error(`Sync job not found: ${error.message}`);
  }

  return data;
}

/**
 * Get cross-platform links for a project
 */
export async function getProjectIntegrationStatus(projectId: string) {
  const supabase = getServerSupabase();

  const [projectLinks, eventLinks, assetLinks] = await Promise.all([
    supabase
      .from('integration_project_links')
      .select('*')
      .eq('project_id', projectId)
      .single(),
    supabase
      .from('integration_event_links')
      .select('*')
      .eq('project_id', projectId)
      .maybeSingle(),
    supabase
      .from('integration_asset_links')
      .select('*, assets(*)')
      .eq('assets.project_id', projectId),
  ]);

  return {
    projectLink: projectLinks.data,
    eventLink: eventLinks.data,
    assetLinks: assetLinks.data,
  };
}
