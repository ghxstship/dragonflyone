import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { apiRoute } from '@ghxstship/config/middleware';
import { PlatformRole } from '@ghxstship/config/roles';
import { getServerSupabase } from '@ghxstship/config';

const campaignSchema = z.object({
  name: z.string().min(1),
  type: z.enum(['email', 'sms', 'push', 'in_app']),
  event_id: z.string().uuid().optional(),
  target_audience: z.object({
    segment: z.enum(['all', 'past_attendees', 'wishlist', 'followers', 'members', 'custom']),
    filters: z.object({
      location: z.string().optional(),
      age_min: z.number().optional(),
      age_max: z.number().optional(),
      interests: z.array(z.string()).optional(),
      purchase_history: z.object({
        min_orders: z.number().optional(),
        min_amount: z.number().optional(),
        event_types: z.array(z.string()).optional()
      }).optional()
    }).optional()
  }),
  content: z.object({
    subject: z.string().optional(),
    body: z.string(),
    cta_text: z.string().optional(),
    cta_url: z.string().url().optional(),
    template_id: z.string().optional()
  }),
  schedule: z.object({
    send_immediately: z.boolean().default(false),
    scheduled_at: z.string().optional(),
    timezone: z.string().optional()
  }),
  ab_test: z.object({
    enabled: z.boolean().default(false),
    variant_b_subject: z.string().optional(),
    variant_b_body: z.string().optional(),
    split_percentage: z.number().min(10).max(50).optional()
  }).optional(),
  status: z.enum(['draft', 'scheduled', 'sending', 'sent', 'paused']).default('draft')
});

const automationRuleSchema = z.object({
  name: z.string().min(1),
  trigger: z.enum([
    'event_published',
    'ticket_purchased',
    'event_reminder',
    'abandoned_cart',
    'post_event',
    'wishlist_available',
    'price_drop'
  ]),
  conditions: z.object({
    event_types: z.array(z.string()).optional(),
    days_before_event: z.number().optional(),
    cart_abandoned_hours: z.number().optional(),
    days_after_event: z.number().optional()
  }).optional(),
  actions: z.array(z.object({
    type: z.enum(['send_email', 'send_sms', 'send_push', 'add_to_segment', 'trigger_webhook']),
    template_id: z.string().optional(),
    content: z.object({
      subject: z.string().optional(),
      body: z.string().optional()
    }).optional(),
    delay_hours: z.number().optional()
  })),
  active: z.boolean().default(true)
});

// GET - List campaigns or automation rules
export const GET = apiRoute(
  async (request: NextRequest) => {
    const supabase = getServerSupabase();
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const event_id = searchParams.get('event_id');

    if (type === 'automations') {
      let query = supabase
        .from('marketing_automations')
        .select('*')
        .order('created_at', { ascending: false });

      if (status) {
        query = query.eq('active', status === 'active');
      }

      const { data, error } = await query;

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ automations: data });
    }

    // List campaigns
    let query = supabase
      .from('marketing_campaigns')
      .select(`
        *,
        events (
          id,
          name,
          date
        ),
        campaign_metrics (
          sent_count,
          delivered_count,
          opened_count,
          clicked_count,
          conversion_count
        )
      `)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    if (event_id) {
      query = query.eq('event_id', event_id);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ campaigns: data });
  },
  {
    auth: true,
    roles: [PlatformRole.GVTEWAY_ADMIN, PlatformRole.GVTEWAY_EXPERIENCE_CREATOR],
    audit: { action: 'campaigns:list', resource: 'marketing_campaigns' }
  }
);

// POST - Create campaign or automation rule
export const POST = apiRoute(
  async (request: NextRequest, context: any) => {
    const supabase = getServerSupabase();
    const body = await request.json();
    const { type } = body;

    if (type === 'automation') {
      const validated = automationRuleSchema.parse(body.data);

      const { data: automation, error } = await supabase
        .from('marketing_automations')
        .insert({
          name: validated.name,
          trigger_type: validated.trigger as 'ticket_purchase' | 'lapsed_fan' | 'vip_upsell' | 'event_reminder' | 'post_event' | 'birthday' | 'custom',
          trigger_conditions: validated.conditions || {},
          actions: validated.actions,
          is_active: validated.active,
          created_by: context.user.id
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({
        automation,
        message: 'Automation rule created successfully'
      }, { status: 201 });
    }

    // Create campaign
    const validated = campaignSchema.parse(body.data || body);

    // Build audience query
    const audience = await buildAudienceQuery(supabase, validated.target_audience);

    const { data: campaign, error } = await supabase
      .from('marketing_campaigns')
      .insert({
        ...validated,
        created_by: context.user.id,
        estimated_recipients: audience.count
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Schedule or send immediately
    if (validated.schedule.send_immediately) {
      await processCampaign(supabase, campaign.id, audience.recipients);
    }

    return NextResponse.json({
      campaign,
      estimated_recipients: audience.count,
      message: 'Campaign created successfully'
    }, { status: 201 });
  },
  {
    auth: true,
    roles: [PlatformRole.GVTEWAY_ADMIN, PlatformRole.GVTEWAY_EXPERIENCE_CREATOR],
    audit: { action: 'campaigns:create', resource: 'marketing_campaigns' }
  }
);

// Helper function to build audience
async function buildAudienceQuery(supabase: ReturnType<typeof getServerSupabase>, targetAudience: any) {
  let query = supabase.from('platform_users').select('id, email, phone');

  switch (targetAudience.segment) {
    case 'past_attendees':
      query = query.in('id', 
        supabase.from('orders').select('user_id').eq('status', 'completed')
      );
      break;
    
    case 'wishlist':
      query = query.in('id',
        supabase.from('wishlists').select('user_id')
      );
      break;

    case 'followers':
      query = query.in('id',
        supabase.from('follows').select('follower_id')
      );
      break;

    case 'members':
      query = query.not('membership_tier', 'is', null);
      break;
  }

  // Apply filters
  if (targetAudience.filters) {
    if (targetAudience.filters.location) {
      query = query.eq('location', targetAudience.filters.location);
    }
    if (targetAudience.filters.interests) {
      query = query.contains('interests', targetAudience.filters.interests);
    }
  }

  const { data, count, error } = await query;
  
  return {
    recipients: data || [],
    count: count || 0
  };
}

// Helper function to process campaign
async function processCampaign(supabase: ReturnType<typeof getServerSupabase>, campaignId: string, recipients: any[]) {
  // Update status
  await supabase
    .from('marketing_campaigns')
    .update({ status: 'sending' })
    .eq('id', campaignId);

  // Queue messages for sending (integrate with email/SMS service)
  // This would typically use a job queue like Bull or AWS SQS
  
  // For now, log the campaign sends
  const sends = recipients.map(recipient => ({
    campaign_id: campaignId,
    recipient_id: recipient.id,
    recipient_email: recipient.email,
    status: 'queued'
  }));

  await supabase.from('campaign_sends').insert(sends);

  // Update metrics
  await supabase
    .from('campaign_metrics')
    .insert({
      campaign_id: campaignId,
      sent_count: recipients.length,
      delivered_count: 0,
      opened_count: 0,
      clicked_count: 0,
      conversion_count: 0
    });
}

// PUT - Update campaign or pause/resume
export const PUT = apiRoute(
  async (request: NextRequest) => {
    const supabase = getServerSupabase();
    const body = await request.json();
    const { id, type, action, updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    if (type === 'automation') {
      const { data, error } = await supabase
        .from('marketing_automations')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ automation: data });
    }

    if (action === 'pause') {
      const { error } = await supabase
        .from('marketing_campaigns')
        .update({ status: 'paused' })
        .eq('id', id);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ message: 'Campaign paused' });
    }

    // Update campaign
    const { data, error } = await supabase
      .from('marketing_campaigns')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ campaign: data });
  },
  {
    auth: true,
    roles: [PlatformRole.GVTEWAY_ADMIN],
    audit: { action: 'campaigns:update', resource: 'marketing_campaigns' }
  }
);

// DELETE - Cancel campaign or delete automation
export const DELETE = apiRoute(
  async (request: NextRequest) => {
    const supabase = getServerSupabase();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const type = searchParams.get('type');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    if (type === 'automation') {
      const { error } = await supabase
        .from('marketing_automations')
        .delete()
        .eq('id', id);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ message: 'Automation deleted' });
    }

    // Cancel campaign
    const { error } = await supabase
      .from('marketing_campaigns')
      .update({ status: 'cancelled' })
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Campaign cancelled' });
  },
  {
    auth: true,
    roles: [PlatformRole.GVTEWAY_ADMIN],
    audit: { action: 'campaigns:delete', resource: 'marketing_campaigns' }
  }
);
