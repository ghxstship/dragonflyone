import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

// Validation schemas
const stakeholderSchema = z.object({
  project_id: z.string().uuid(),
  contact_id: z.string().uuid(),
  role: z.enum(['owner', 'sponsor', 'executive', 'manager', 'contributor', 'observer', 'external']),
  permission_level: z.enum(['full', 'edit', 'comment', 'view']),
  notification_preferences: z.object({
    email: z.boolean().default(true),
    in_app: z.boolean().default(true),
    sms: z.boolean().default(false),
    digest_frequency: z.enum(['realtime', 'daily', 'weekly']).default('daily'),
  }).optional(),
  access_areas: z.array(z.string()).optional(),
});

const communicationSchema = z.object({
  project_id: z.string().uuid(),
  type: z.enum(['announcement', 'update', 'request', 'decision', 'milestone', 'alert']),
  subject: z.string().min(1).max(200),
  content: z.string().min(1),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
  target_roles: z.array(z.string()).optional(),
  target_stakeholders: z.array(z.string().uuid()).optional(),
  attachments: z.array(z.object({
    name: z.string(),
    url: z.string().url(),
    type: z.string(),
  })).optional(),
  requires_acknowledgment: z.boolean().default(false),
  scheduled_at: z.string().datetime().optional(),
});

// GET - List stakeholders and communications
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('project_id');
    const type = searchParams.get('type'); // 'stakeholders' | 'communications' | 'activity'
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    if (!projectId) {
      return NextResponse.json({ error: 'project_id is required' }, { status: 400 });
    }

    if (type === 'stakeholders') {
      // Get project stakeholders with their permissions
      const { data: stakeholders, error, count } = await supabase
        .from('project_stakeholders')
        .select(`
          *,
          contact:contacts(id, first_name, last_name, email, phone, organization_id),
          organization:organizations(id, name)
        `, { count: 'exact' })
        .eq('project_id', projectId)
        .order('role', { ascending: true })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      // Get permission matrix
      const permissionMatrix = {
        full: ['view', 'comment', 'edit', 'delete', 'manage_stakeholders', 'approve'],
        edit: ['view', 'comment', 'edit'],
        comment: ['view', 'comment'],
        view: ['view'],
      };

      const enrichedStakeholders = stakeholders?.map(s => ({
        ...s,
        effective_permissions: permissionMatrix[s.permission_level as keyof typeof permissionMatrix] || [],
      }));

      return NextResponse.json({
        stakeholders: enrichedStakeholders,
        total: count,
        page,
        limit,
      });
    }

    if (type === 'communications') {
      // Get communications for the project
      const { data: communications, error, count } = await supabase
        .from('stakeholder_communications')
        .select(`
          *,
          sender:platform_users(id, email, first_name, last_name),
          acknowledgments:communication_acknowledgments(stakeholder_id, acknowledged_at)
        `, { count: 'exact' })
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      return NextResponse.json({
        communications,
        total: count,
        page,
        limit,
      });
    }

    if (type === 'activity') {
      // Get stakeholder activity feed
      const { data: activity, error, count } = await supabase
        .from('stakeholder_activity')
        .select('*', { count: 'exact' })
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      return NextResponse.json({
        activity,
        total: count,
        page,
        limit,
      });
    }

    // Default: return overview
    const [stakeholdersResult, communicationsResult, pendingResult] = await Promise.all([
      supabase
        .from('project_stakeholders')
        .select('role, permission_level', { count: 'exact' })
        .eq('project_id', projectId),
      supabase
        .from('stakeholder_communications')
        .select('type, priority', { count: 'exact' })
        .eq('project_id', projectId)
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
      supabase
        .from('stakeholder_communications')
        .select('id', { count: 'exact' })
        .eq('project_id', projectId)
        .eq('requires_acknowledgment', true)
        .is('acknowledged_by_all', null),
    ]);

    // Calculate role distribution
    const roleDistribution = stakeholdersResult.data?.reduce((acc: Record<string, number>, s) => {
      acc[s.role] = (acc[s.role] || 0) + 1;
      return acc;
    }, {});

    return NextResponse.json({
      overview: {
        total_stakeholders: stakeholdersResult.count || 0,
        role_distribution: roleDistribution,
        recent_communications: communicationsResult.count || 0,
        pending_acknowledgments: pendingResult.count || 0,
      },
    });
  } catch (error: any) {
    console.error('Stakeholder hub error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Add stakeholder or send communication
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const action = body.action; // 'add_stakeholder' | 'send_communication'

    if (action === 'add_stakeholder') {
      const validated = stakeholderSchema.parse(body.data);

      // Check if stakeholder already exists
      const { data: existing } = await supabase
        .from('project_stakeholders')
        .select('id')
        .eq('project_id', validated.project_id)
        .eq('contact_id', validated.contact_id)
        .single();

      if (existing) {
        return NextResponse.json({ error: 'Stakeholder already exists for this project' }, { status: 409 });
      }

      const { data: stakeholder, error } = await supabase
        .from('project_stakeholders')
        .insert({
          ...validated,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      // Log activity
      await supabase.from('stakeholder_activity').insert({
        project_id: validated.project_id,
        activity_type: 'stakeholder_added',
        description: `New stakeholder added with ${validated.role} role`,
        metadata: { stakeholder_id: stakeholder.id, role: validated.role },
        created_at: new Date().toISOString(),
      });

      return NextResponse.json({ stakeholder }, { status: 201 });
    }

    if (action === 'send_communication') {
      const validated = communicationSchema.parse(body.data);
      const senderId = body.sender_id;

      // Get target stakeholders
      let targetStakeholders: string[] = [];
      
      if (validated.target_stakeholders?.length) {
        targetStakeholders = validated.target_stakeholders;
      } else if (validated.target_roles?.length) {
        const { data: stakeholders } = await supabase
          .from('project_stakeholders')
          .select('id')
          .eq('project_id', validated.project_id)
          .in('role', validated.target_roles);
        targetStakeholders = stakeholders?.map(s => s.id) || [];
      } else {
        // Send to all stakeholders
        const { data: stakeholders } = await supabase
          .from('project_stakeholders')
          .select('id')
          .eq('project_id', validated.project_id);
        targetStakeholders = stakeholders?.map(s => s.id) || [];
      }

      const { data: communication, error } = await supabase
        .from('stakeholder_communications')
        .insert({
          ...validated,
          sender_id: senderId,
          target_stakeholder_ids: targetStakeholders,
          status: validated.scheduled_at ? 'scheduled' : 'sent',
          sent_at: validated.scheduled_at ? null : new Date().toISOString(),
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      // Create notification records for each stakeholder
      if (!validated.scheduled_at) {
        const notifications = targetStakeholders.map(stakeholderId => ({
          stakeholder_id: stakeholderId,
          communication_id: communication.id,
          project_id: validated.project_id,
          type: validated.type,
          priority: validated.priority,
          read: false,
          created_at: new Date().toISOString(),
        }));

        await supabase.from('stakeholder_notifications').insert(notifications);
      }

      // Log activity
      await supabase.from('stakeholder_activity').insert({
        project_id: validated.project_id,
        activity_type: 'communication_sent',
        description: `${validated.type} sent: ${validated.subject}`,
        metadata: { communication_id: communication.id, recipients: targetStakeholders.length },
        created_at: new Date().toISOString(),
      });

      return NextResponse.json({ communication }, { status: 201 });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    console.error('Stakeholder hub error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH - Update stakeholder or acknowledge communication
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const action = body.action;

    if (action === 'update_stakeholder') {
      const { stakeholder_id, ...updates } = body.data;

      const { data: stakeholder, error } = await supabase
        .from('project_stakeholders')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', stakeholder_id)
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json({ stakeholder });
    }

    if (action === 'acknowledge_communication') {
      const { communication_id, stakeholder_id } = body.data;

      const { data: acknowledgment, error } = await supabase
        .from('communication_acknowledgments')
        .insert({
          communication_id,
          stakeholder_id,
          acknowledged_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      // Check if all stakeholders have acknowledged
      const { data: communication } = await supabase
        .from('stakeholder_communications')
        .select('target_stakeholder_ids')
        .eq('id', communication_id)
        .single();

      const { count: ackCount } = await supabase
        .from('communication_acknowledgments')
        .select('*', { count: 'exact' })
        .eq('communication_id', communication_id);

      if (ackCount === communication?.target_stakeholder_ids?.length) {
        await supabase
          .from('stakeholder_communications')
          .update({ acknowledged_by_all: new Date().toISOString() })
          .eq('id', communication_id);
      }

      return NextResponse.json({ acknowledgment });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Stakeholder hub error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Remove stakeholder
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const stakeholderId = searchParams.get('stakeholder_id');

    if (!stakeholderId) {
      return NextResponse.json({ error: 'stakeholder_id is required' }, { status: 400 });
    }

    // Get stakeholder info for activity log
    const { data: stakeholder } = await supabase
      .from('project_stakeholders')
      .select('project_id, role')
      .eq('id', stakeholderId)
      .single();

    const { error } = await supabase
      .from('project_stakeholders')
      .delete()
      .eq('id', stakeholderId);

    if (error) throw error;

    // Log activity
    if (stakeholder) {
      await supabase.from('stakeholder_activity').insert({
        project_id: stakeholder.project_id,
        activity_type: 'stakeholder_removed',
        description: `Stakeholder with ${stakeholder.role} role removed`,
        metadata: { stakeholder_id: stakeholderId },
        created_at: new Date().toISOString(),
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Stakeholder hub error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
