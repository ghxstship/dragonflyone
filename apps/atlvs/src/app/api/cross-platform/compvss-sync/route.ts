import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { z } from 'zod';

const ProjectSyncSchema = z.object({
  atlvs_project_id: z.string().uuid().optional(),
  compvss_project_id: z.string().uuid().optional(),
  sync_direction: z.enum(['atlvs_to_compvss', 'compvss_to_atlvs', 'bidirectional']).default('bidirectional'),
  sync_fields: z.array(z.string()).optional(),
});

// GET /api/cross-platform/compvss-sync - Get sync status and linked projects
export async function GET(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const projectId = searchParams.get('project_id');

    if (action === 'linked_projects') {
      // Get all linked projects
      const { data: links } = await supabase
        .from('cross_platform_links')
        .select(`
          *,
          atlvs_project:projects!atlvs_project_id(id, name, status, budget, start_date, end_date),
          compvss_project:compvss_projects!compvss_project_id(id, name, status, start_date, end_date)
        `)
        .eq('link_type', 'atlvs_compvss');

      return NextResponse.json({ linked_projects: links || [] });
    }

    if (action === 'sync_status' && projectId) {
      // Get sync status for specific project
      const { data: syncLogs } = await supabase
        .from('cross_platform_sync_logs')
        .select('*')
        .or(`atlvs_project_id.eq.${projectId},compvss_project_id.eq.${projectId}`)
        .order('synced_at', { ascending: false })
        .limit(10);

      const { data: link } = await supabase
        .from('cross_platform_links')
        .select('*')
        .or(`atlvs_project_id.eq.${projectId},compvss_project_id.eq.${projectId}`)
        .single();

      return NextResponse.json({
        link,
        sync_logs: syncLogs || [],
        last_sync: syncLogs?.[0]?.synced_at,
      });
    }

    // Default: Get sync overview
    const { data: recentSyncs } = await supabase
      .from('cross_platform_sync_logs')
      .select('*')
      .eq('link_type', 'atlvs_compvss')
      .order('synced_at', { ascending: false })
      .limit(20);

    const { data: links } = await supabase
      .from('cross_platform_links')
      .select('id')
      .eq('link_type', 'atlvs_compvss');

    return NextResponse.json({
      total_linked_projects: links?.length || 0,
      recent_syncs: recentSyncs || [],
      sync_types: ['budget', 'timeline', 'team', 'milestones', 'status'],
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch sync data' }, { status: 500 });
  }
}

// POST /api/cross-platform/compvss-sync - Create link or trigger sync
export async function POST(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const action = body.action || 'create_link';

    if (action === 'create_link') {
      const { atlvs_project_id, compvss_project_id } = body;

      if (!atlvs_project_id || !compvss_project_id) {
        return NextResponse.json({ error: 'Both project IDs required' }, { status: 400 });
      }

      // Check if link already exists
      const { data: existing } = await supabase
        .from('cross_platform_links')
        .select('id')
        .eq('atlvs_project_id', atlvs_project_id)
        .eq('compvss_project_id', compvss_project_id)
        .single();

      if (existing) {
        return NextResponse.json({ error: 'Link already exists', link_id: existing.id }, { status: 400 });
      }

      const { data: link, error } = await supabase
        .from('cross_platform_links')
        .insert({
          link_type: 'atlvs_compvss',
          atlvs_project_id,
          compvss_project_id,
          sync_enabled: true,
          sync_direction: 'bidirectional',
          created_by: user.id,
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ link }, { status: 201 });
    } else if (action === 'sync_projects') {
      const validated = ProjectSyncSchema.parse(body);

      // Get the link
      let linkQuery = supabase.from('cross_platform_links').select('*');
      
      if (validated.atlvs_project_id) {
        linkQuery = linkQuery.eq('atlvs_project_id', validated.atlvs_project_id);
      }
      if (validated.compvss_project_id) {
        linkQuery = linkQuery.eq('compvss_project_id', validated.compvss_project_id);
      }

      const { data: link } = await linkQuery.single();

      if (!link) {
        return NextResponse.json({ error: 'Projects not linked' }, { status: 404 });
      }

      // Get both projects
      const { data: atlvsProject } = await supabase
        .from('projects')
        .select('*')
        .eq('id', link.atlvs_project_id)
        .single();

      const { data: compvssProject } = await supabase
        .from('compvss_projects')
        .select('*')
        .eq('id', link.compvss_project_id)
        .single();

      const syncResults: Record<string, any> = {};
      const syncFields = validated.sync_fields || ['budget', 'timeline', 'status', 'team'];

      // Sync budget (ATLVS → COMPVSS)
      if (syncFields.includes('budget') && (validated.sync_direction === 'atlvs_to_compvss' || validated.sync_direction === 'bidirectional')) {
        await supabase
          .from('compvss_projects')
          .update({ budget: atlvsProject?.budget })
          .eq('id', link.compvss_project_id);
        syncResults.budget = { synced: true, value: atlvsProject?.budget };
      }

      // Sync timeline
      if (syncFields.includes('timeline')) {
        if (validated.sync_direction === 'atlvs_to_compvss' || validated.sync_direction === 'bidirectional') {
          await supabase
            .from('compvss_projects')
            .update({
              start_date: atlvsProject?.start_date,
              end_date: atlvsProject?.end_date,
            })
            .eq('id', link.compvss_project_id);
        }
        if (validated.sync_direction === 'compvss_to_atlvs' || validated.sync_direction === 'bidirectional') {
          await supabase
            .from('projects')
            .update({
              start_date: compvssProject?.start_date,
              end_date: compvssProject?.end_date,
            })
            .eq('id', link.atlvs_project_id);
        }
        syncResults.timeline = { synced: true };
      }

      // Sync status
      if (syncFields.includes('status')) {
        // Map status between platforms
        const statusMap: Record<string, string> = {
          'planning': 'pre_production',
          'active': 'production',
          'completed': 'wrap',
          'on_hold': 'on_hold',
        };

        if (validated.sync_direction === 'atlvs_to_compvss' || validated.sync_direction === 'bidirectional') {
          const mappedStatus = statusMap[atlvsProject?.status] || atlvsProject?.status;
          await supabase
            .from('compvss_projects')
            .update({ status: mappedStatus })
            .eq('id', link.compvss_project_id);
        }
        syncResults.status = { synced: true };
      }

      // Log the sync
      await supabase.from('cross_platform_sync_logs').insert({
        link_id: link.id,
        link_type: 'atlvs_compvss',
        atlvs_project_id: link.atlvs_project_id,
        compvss_project_id: link.compvss_project_id,
        sync_direction: validated.sync_direction,
        fields_synced: syncFields,
        sync_results: syncResults,
        synced_by: user.id,
        synced_at: new Date().toISOString(),
      });

      // Update link last sync time
      await supabase
        .from('cross_platform_links')
        .update({ last_synced_at: new Date().toISOString() })
        .eq('id', link.id);

      return NextResponse.json({
        success: true,
        sync_results: syncResults,
        synced_at: new Date().toISOString(),
      });
    } else if (action === 'sync_team') {
      const { atlvs_project_id, compvss_project_id } = body;

      // Get ATLVS team assignments
      const { data: atlvsTeam } = await supabase
        .from('project_team_members')
        .select('user_id, role')
        .eq('project_id', atlvs_project_id);

      // Sync to COMPVSS crew assignments
      if (atlvsTeam && atlvsTeam.length > 0) {
        const crewAssignments = atlvsTeam.map(member => ({
          project_id: compvss_project_id,
          user_id: member.user_id,
          role: member.role,
          assigned_by: user.id,
        }));

        await supabase
          .from('crew_assignments')
          .upsert(crewAssignments, { onConflict: 'project_id,user_id' });
      }

      return NextResponse.json({
        success: true,
        team_members_synced: atlvsTeam?.length || 0,
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to process sync' }, { status: 500 });
  }
}

// DELETE /api/cross-platform/compvss-sync - Remove link
export async function DELETE(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const linkId = searchParams.get('link_id');

    if (!linkId) {
      return NextResponse.json({ error: 'Link ID required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('cross_platform_links')
      .delete()
      .eq('id', linkId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete link' }, { status: 500 });
  }
}
