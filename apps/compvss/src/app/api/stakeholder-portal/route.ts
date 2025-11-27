import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@ghxstship/config';
import { z } from 'zod';

const StakeholderSchema = z.object({
  project_id: z.string().uuid(),
  name: z.string(),
  email: z.string().email(),
  role: z.enum(['client', 'sponsor', 'vendor', 'partner', 'observer', 'approver']),
  organization: z.string().optional(),
  phone: z.string().optional(),
  permissions: z.array(z.enum(['view_schedule', 'view_budget', 'view_documents', 'approve_changes', 'add_comments', 'upload_files'])).default(['view_schedule']),
  notification_preferences: z.object({
    email: z.boolean().default(true),
    sms: z.boolean().default(false),
    digest_frequency: z.enum(['realtime', 'daily', 'weekly']).default('daily'),
  }).optional(),
});

const CommunicationSchema = z.object({
  project_id: z.string().uuid(),
  stakeholder_ids: z.array(z.string().uuid()).optional(),
  subject: z.string(),
  message: z.string(),
  type: z.enum(['update', 'announcement', 'request', 'approval_needed', 'milestone']),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
  attachments: z.array(z.object({
    name: z.string(),
    url: z.string().url(),
    type: z.string(),
  })).optional(),
});

// GET /api/stakeholder-portal - Get stakeholders and communications
export async function GET(request: NextRequest) {
  const supabase = getServerSupabase();
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
    const projectId = searchParams.get('project_id');
    const stakeholderId = searchParams.get('stakeholder_id');
    const portalView = searchParams.get('portal_view') === 'true';

    if (stakeholderId) {
      // Get specific stakeholder with their access
      const { data: stakeholder, error } = await supabase
        .from('project_stakeholders')
        .select(`
          *,
          project:projects(id, name, status, start_date, end_date)
        `)
        .eq('id', stakeholderId)
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Get communications for this stakeholder
      const { data: communications } = await supabase
        .from('stakeholder_communications')
        .select('*')
        .or(`stakeholder_ids.cs.{${stakeholderId}},stakeholder_ids.is.null`)
        .eq('project_id', stakeholder.project_id)
        .order('created_at', { ascending: false })
        .limit(20);

      return NextResponse.json({
        stakeholder,
        communications: communications || [],
      });
    } else if (projectId) {
      if (portalView) {
        // Portal view for stakeholders - limited data based on permissions
        const { data: project } = await supabase
          .from('projects')
          .select(`
            id, name, status, start_date, end_date, description,
            milestones:project_milestones(id, name, due_date, status)
          `)
          .eq('id', projectId)
          .single();

        const { data: updates } = await supabase
          .from('stakeholder_communications')
          .select('*')
          .eq('project_id', projectId)
          .order('created_at', { ascending: false })
          .limit(10);

        const { data: documents } = await supabase
          .from('project_documents')
          .select('id, name, type, url, created_at')
          .eq('project_id', projectId)
          .eq('is_stakeholder_visible', true)
          .order('created_at', { ascending: false });

        return NextResponse.json({
          project,
          updates: updates || [],
          documents: documents || [],
        });
      } else {
        // Admin view - all stakeholders for project
        const { data: stakeholders, error } = await supabase
          .from('project_stakeholders')
          .select('*')
          .eq('project_id', projectId)
          .order('role', { ascending: true });

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Get recent communications
        const { data: communications } = await supabase
          .from('stakeholder_communications')
          .select('*')
          .eq('project_id', projectId)
          .order('created_at', { ascending: false })
          .limit(20);

        return NextResponse.json({
          stakeholders: stakeholders || [],
          communications: communications || [],
        });
      }
    }

    return NextResponse.json({ error: 'Project ID required' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch stakeholder data' }, { status: 500 });
  }
}

// POST /api/stakeholder-portal - Create stakeholder or send communication
export async function POST(request: NextRequest) {
  const supabase = getServerSupabase();
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
    const action = body.action || 'add_stakeholder';

    if (action === 'add_stakeholder') {
      const validated = StakeholderSchema.parse(body);

      // Generate access token for portal
      const accessToken = crypto.randomUUID();

      const { data: stakeholder, error } = await supabase
        .from('project_stakeholders')
        .insert({
          ...validated,
          access_token: accessToken,
          is_active: true,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Send invitation email (in production)
      const portalUrl = `${process.env.NEXT_PUBLIC_APP_URL}/portal/${stakeholder.id}?token=${accessToken}`;

      return NextResponse.json({
        stakeholder,
        portal_url: portalUrl,
      }, { status: 201 });
    } else if (action === 'send_communication') {
      const validated = CommunicationSchema.parse(body);

      const { data: communication, error } = await supabase
        .from('stakeholder_communications')
        .insert({
          ...validated,
          sent_by: user.id,
          sent_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Get stakeholders to notify
      let stakeholdersToNotify;
      if (validated.stakeholder_ids && validated.stakeholder_ids.length > 0) {
        const { data } = await supabase
          .from('project_stakeholders')
          .select('id, email, name, notification_preferences')
          .in('id', validated.stakeholder_ids);
        stakeholdersToNotify = data;
      } else {
        const { data } = await supabase
          .from('project_stakeholders')
          .select('id, email, name, notification_preferences')
          .eq('project_id', validated.project_id)
          .eq('is_active', true);
        stakeholdersToNotify = data;
      }

      // Create notifications for each stakeholder
      const notifications = stakeholdersToNotify?.map(s => ({
        user_id: user.id,
        type: 'stakeholder_update',
        title: validated.subject,
        message: validated.message.substring(0, 200),
        link: `/portal/${s.id}`,
        reference_type: 'stakeholder_communication',
        reference_id: communication.id,
      }));

      if (notifications && notifications.length > 0) {
        await supabase.from('notifications').insert(notifications);
      }

      return NextResponse.json({
        communication,
        notified_count: stakeholdersToNotify?.length || 0,
      }, { status: 201 });
    } else if (action === 'request_approval') {
      const { project_id, stakeholder_ids, item_type, item_id, description } = body;

      const { data: approval, error } = await supabase
        .from('stakeholder_approvals')
        .insert({
          project_id,
          stakeholder_ids,
          item_type,
          item_id,
          description,
          status: 'pending',
          requested_by: user.id,
          requested_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ approval }, { status: 201 });
    } else if (action === 'submit_approval') {
      const { approval_id, decision, comments } = body;

      const { data: approval, error } = await supabase
        .from('stakeholder_approvals')
        .update({
          status: decision,
          decision_comments: comments,
          decided_by: user.id,
          decided_at: new Date().toISOString(),
        })
        .eq('id', approval_id)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ approval });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}

// PATCH /api/stakeholder-portal - Update stakeholder
export async function PATCH(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const stakeholderId = searchParams.get('stakeholder_id');

    if (!stakeholderId) {
      return NextResponse.json({ error: 'Stakeholder ID required' }, { status: 400 });
    }

    const body = await request.json();

    const { data: stakeholder, error } = await supabase
      .from('project_stakeholders')
      .update({
        ...body,
        updated_at: new Date().toISOString(),
      })
      .eq('id', stakeholderId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ stakeholder });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update stakeholder' }, { status: 500 });
  }
}

// DELETE /api/stakeholder-portal - Remove stakeholder access
export async function DELETE(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const stakeholderId = searchParams.get('stakeholder_id');

    if (!stakeholderId) {
      return NextResponse.json({ error: 'Stakeholder ID required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('project_stakeholders')
      .update({
        is_active: false,
        deactivated_at: new Date().toISOString(),
      })
      .eq('id', stakeholderId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Stakeholder access revoked' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to remove stakeholder' }, { status: 500 });
  }
}
