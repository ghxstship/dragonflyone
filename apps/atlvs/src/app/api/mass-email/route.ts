import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { z } from 'zod';

const CampaignSchema = z.object({
  name: z.string(),
  subject: z.string(),
  from_name: z.string(),
  from_email: z.string().email(),
  reply_to: z.string().email().optional(),
  template_id: z.string().uuid().optional(),
  html_content: z.string().optional(),
  text_content: z.string().optional(),
  recipient_list_id: z.string().uuid().optional(),
  recipient_filter: z.object({
    tags: z.array(z.string()).optional(),
    segments: z.array(z.string()).optional(),
    custom_query: z.record(z.any()).optional(),
  }).optional(),
  schedule_at: z.string().optional(),
  track_opens: z.boolean().default(true),
  track_clicks: z.boolean().default(true),
});

// GET /api/mass-email - Get campaigns and stats
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
    const campaignId = searchParams.get('campaign_id');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (campaignId) {
      // Get specific campaign with stats
      const { data: campaign, error } = await supabase
        .from('email_campaigns')
        .select('*')
        .eq('id', campaignId)
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Get campaign stats
      const { data: stats } = await supabase
        .from('email_campaign_stats')
        .select('*')
        .eq('campaign_id', campaignId)
        .single();

      // Get recipient activity
      const { data: recipients } = await supabase
        .from('email_campaign_recipients')
        .select(`
          *,
          contact:contacts(id, first_name, last_name, email)
        `)
        .eq('campaign_id', campaignId)
        .order('sent_at', { ascending: false })
        .limit(100);

      return NextResponse.json({
        campaign,
        stats: stats || {
          sent: 0,
          delivered: 0,
          opened: 0,
          clicked: 0,
          bounced: 0,
          unsubscribed: 0,
          complained: 0,
        },
        recipients: recipients || [],
      });
    } else {
      // Get all campaigns
      let query = supabase
        .from('email_campaigns')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (status) {
        query = query.eq('status', status);
      }

      const { data: campaigns, error, count } = await query;

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Get stats for each campaign
      const campaignIds = campaigns?.map(c => c.id) || [];
      const { data: allStats } = await supabase
        .from('email_campaign_stats')
        .select('*')
        .in('campaign_id', campaignIds);

      const statsByCampaign: Record<string, any> = {};
      allStats?.forEach(s => {
        statsByCampaign[s.campaign_id] = s;
      });

      const campaignsWithStats = campaigns?.map(c => ({
        ...c,
        stats: statsByCampaign[c.id] || { sent: 0, opened: 0, clicked: 0 },
      }));

      return NextResponse.json({
        campaigns: campaignsWithStats || [],
        total: count || 0,
        limit,
        offset,
      });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch campaigns' }, { status: 500 });
  }
}

// POST /api/mass-email - Create or send campaign
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
    const action = body.action || 'create';

    if (action === 'create') {
      const validated = CampaignSchema.parse(body);

      const { data: campaign, error } = await supabase
        .from('email_campaigns')
        .insert({
          ...validated,
          status: 'draft',
          created_by: user.id,
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Initialize stats
      await supabase.from('email_campaign_stats').insert({
        campaign_id: campaign.id,
        sent: 0,
        delivered: 0,
        opened: 0,
        clicked: 0,
        bounced: 0,
        unsubscribed: 0,
        complained: 0,
      });

      return NextResponse.json({ campaign }, { status: 201 });
    } else if (action === 'send' || action === 'schedule') {
      const { campaign_id, schedule_at } = body;

      if (!campaign_id) {
        return NextResponse.json({ error: 'Campaign ID required' }, { status: 400 });
      }

      // Get campaign
      const { data: campaign } = await supabase
        .from('email_campaigns')
        .select('*')
        .eq('id', campaign_id)
        .single();

      if (!campaign) {
        return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
      }

      // Get recipients based on filter
      let recipientQuery = supabase.from('contacts').select('id, email, first_name, last_name');

      if (campaign.recipient_list_id) {
        const { data: listMembers } = await supabase
          .from('contact_list_members')
          .select('contact_id')
          .eq('list_id', campaign.recipient_list_id);
        
        const contactIds = listMembers?.map(m => m.contact_id) || [];
        recipientQuery = recipientQuery.in('id', contactIds);
      }

      if (campaign.recipient_filter?.tags?.length > 0) {
        recipientQuery = recipientQuery.contains('tags', campaign.recipient_filter.tags);
      }

      const { data: recipients } = await recipientQuery;

      if (!recipients || recipients.length === 0) {
        return NextResponse.json({ error: 'No recipients found' }, { status: 400 });
      }

      // Create recipient records
      const recipientRecords = recipients.map(r => ({
        campaign_id,
        contact_id: r.id,
        email: r.email,
        status: 'pending',
      }));

      await supabase.from('email_campaign_recipients').insert(recipientRecords);

      // Update campaign status
      const newStatus = action === 'schedule' ? 'scheduled' : 'sending';
      const { data: updatedCampaign, error } = await supabase
        .from('email_campaigns')
        .update({
          status: newStatus,
          scheduled_at: schedule_at || null,
          sent_at: action === 'send' ? new Date().toISOString() : null,
          recipient_count: recipients.length,
        })
        .eq('id', campaign_id)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // In production, this would trigger the email sending service
      // For now, simulate sending
      if (action === 'send') {
        await supabase
          .from('email_campaign_recipients')
          .update({ status: 'sent', sent_at: new Date().toISOString() })
          .eq('campaign_id', campaign_id);

        await supabase
          .from('email_campaign_stats')
          .update({ sent: recipients.length, delivered: recipients.length })
          .eq('campaign_id', campaign_id);

        await supabase
          .from('email_campaigns')
          .update({ status: 'sent' })
          .eq('id', campaign_id);
      }

      return NextResponse.json({
        campaign: updatedCampaign,
        recipient_count: recipients.length,
        status: newStatus,
      });
    } else if (action === 'track_open') {
      const { campaign_id, recipient_id } = body;

      await supabase
        .from('email_campaign_recipients')
        .update({ 
          opened_at: new Date().toISOString(),
          open_count: supabase.rpc('increment', { row_id: recipient_id, column_name: 'open_count' }),
        })
        .eq('id', recipient_id);

      await supabase.rpc('increment_campaign_stat', {
        p_campaign_id: campaign_id,
        p_stat: 'opened',
      });

      return NextResponse.json({ success: true });
    } else if (action === 'track_click') {
      const { campaign_id, recipient_id, link_url } = body;

      await supabase
        .from('email_campaign_recipients')
        .update({ 
          clicked_at: new Date().toISOString(),
          click_count: supabase.rpc('increment', { row_id: recipient_id, column_name: 'click_count' }),
        })
        .eq('id', recipient_id);

      await supabase.from('email_campaign_clicks').insert({
        campaign_id,
        recipient_id,
        link_url,
      });

      await supabase.rpc('increment_campaign_stat', {
        p_campaign_id: campaign_id,
        p_stat: 'clicked',
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}

// PATCH /api/mass-email - Update campaign
export async function PATCH(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const campaignId = searchParams.get('campaign_id');

    if (!campaignId) {
      return NextResponse.json({ error: 'Campaign ID required' }, { status: 400 });
    }

    const body = await request.json();

    const { data: campaign, error } = await supabase
      .from('email_campaigns')
      .update({
        ...body,
        updated_at: new Date().toISOString(),
      })
      .eq('id', campaignId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ campaign });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update campaign' }, { status: 500 });
  }
}

// DELETE /api/mass-email - Delete campaign
export async function DELETE(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const campaignId = searchParams.get('campaign_id');

    if (!campaignId) {
      return NextResponse.json({ error: 'Campaign ID required' }, { status: 400 });
    }

    // Only allow deleting draft campaigns
    const { data: campaign } = await supabase
      .from('email_campaigns')
      .select('status')
      .eq('id', campaignId)
      .single();

    if (campaign?.status !== 'draft') {
      return NextResponse.json({ error: 'Can only delete draft campaigns' }, { status: 400 });
    }

    const { error } = await supabase
      .from('email_campaigns')
      .delete()
      .eq('id', campaignId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete campaign' }, { status: 500 });
  }
}
