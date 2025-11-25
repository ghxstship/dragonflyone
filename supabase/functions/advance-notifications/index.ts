// supabase/functions/advance-notifications/index.ts
// Edge Function for Production Advance Notifications

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AdvanceNotification {
  advance_id: string;
  event_type: 'submitted' | 'approved' | 'rejected' | 'fulfilled';
  recipient_ids: string[];
  message: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { advance_id, event_type, recipient_ids, message }: AdvanceNotification = await req.json();

    if (!advance_id || !event_type || !recipient_ids || recipient_ids.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get advance details
    const { data: advance, error: advanceError } = await supabaseClient
      .from('production_advances')
      .select(`
        id,
        status,
        team_workspace,
        activation_name,
        estimated_cost,
        organization_id,
        project:projects(name),
        submitter:platform_users!submitter_id(full_name, email)
      `)
      .eq('id', advance_id)
      .single();

    if (advanceError || !advance) {
      return new Response(
        JSON.stringify({ error: 'Advance not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Prepare notification payload
    const notificationTitle = {
      submitted: '🔔 New Production Advance Submitted',
      approved: '✅ Production Advance Approved',
      rejected: '❌ Production Advance Rejected',
      fulfilled: '🎉 Production Advance Fulfilled',
    }[event_type];

    const notificationBody = message || `
      ${notificationTitle}
      Project: ${advance.project?.name || 'N/A'}
      Workspace: ${advance.team_workspace || 'N/A'}
      Activation: ${advance.activation_name || 'N/A'}
      Estimated Cost: $${advance.estimated_cost?.toLocaleString() || '0'}
    `.trim();

    // Create notifications for recipients
    const notifications = recipient_ids.map((recipient_id) => ({
      user_id: recipient_id,
      title: notificationTitle,
      message: notificationBody,
      type: 'advance_update',
      related_id: advance_id,
      metadata: {
        advance_id,
        event_type,
        status: advance.status,
        organization_id: advance.organization_id,
      },
      read: false,
    }));

    // Note: Assumes notifications table exists - adjust based on your schema
    // If notifications don't exist, we can use email or other notification method
    const { error: notifError } = await supabaseClient
      .from('notifications')
      .insert(notifications);

    if (notifError) {
      console.error('Error creating notifications:', notifError);
      // Don't fail the request if notifications fail
    }

    // Log the notification event
    await supabaseClient.from('automation_usage_log').insert({
      organization_id: advance.organization_id,
      kind: 'action',
      identifier: `advance.notification.${event_type}`,
      status: 'success',
      platform: event_type === 'submitted' ? 'COMPVSS' : 'ATLVS',
      payload: {
        advance_id,
        event_type,
        recipient_count: recipient_ids.length,
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        notifications_sent: recipient_ids.length,
        advance_id,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in advance-notifications:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
