import { getServerSupabase } from './supabase-client';

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
      
      const { data: newProject, error: projectError } = await (supabase as any)
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

      // Create integration link
      if (newProject) {
        await supabase
          .from('integration_project_links')
          .insert({
            organization_id: deal.organization_id,
            project_id: newProject.id,
            compvss_project_id: newProject.id,
            status: 'synced',
            last_synced_at: new Date().toISOString(),
          } as Record<string, unknown>);

        return { success: true, projectId: newProject.id, created: true };
      }
      throw new Error('Project creation returned null');
    }

    return { success: false, message: 'Deal not won or auto-create disabled' };
  } catch (error) {
    console.error('Deal to project handoff error:', error);
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

    // Enqueue sync job for event creation
    const { data: syncJob, error: syncError } = await supabase.rpc('rpc_enqueue_sync_job', {
      p_org_slug: params.orgSlug,
      p_source_system: 'compvss',
      p_target_system: 'gvteway',
      p_payload: {
        action: 'create_event',
        project_id: params.projectId,
        event_data: eventMetadata,
      },
    });

    if (syncError) {
      throw new Error(`Sync job creation failed: ${syncError.message}`);
    }

    return { success: true, syncJobId: (syncJob as { id: string })?.id };
  } catch (error) {
    console.error('Project to event sync error:', error);
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
    const { data: ingestion, error } = await supabase.rpc('rpc_ingest_ticket_revenue', {
      p_org_slug: params.orgSlug,
      p_project_code: params.projectCode,
      p_event_code: params.eventCode,
      p_ticket_count: params.ticketCount,
      p_gross_amount: params.grossAmount,
      p_currency: params.currency || 'USD',
      p_source: 'gvteway',
      p_payload: {
        synced_at: new Date().toISOString(),
      },
    });

    if (error) {
      throw new Error(`Ticket revenue ingestion failed: ${error.message}`);
    }

    // Create corresponding ledger entry
    const { data: project } = await supabase
      .from('projects')
      .select('id, organization_id')
      .eq('code', params.projectCode)
      .single();

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

    return { success: true, ingestionId: (ingestion as { id: string })?.id };
  } catch (error) {
    console.error('Ticket revenue ingestion error:', error);
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
    console.error('Asset availability check error:', error);
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
    console.error('Event lifecycle orchestration error:', error);
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
