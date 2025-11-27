import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { z } from 'zod';

// Validation schemas
const communicationSchema = z.object({
  contact_id: z.string().uuid(),
  type: z.enum(['email', 'call', 'meeting', 'note', 'sms', 'chat', 'video_call']),
  direction: z.enum(['inbound', 'outbound', 'internal']).optional(),
  subject: z.string().optional(),
  content: z.string(),
  occurred_at: z.string().datetime(),
  duration_minutes: z.number().optional(),
  participants: z.array(z.string()).optional(),
  attachments: z.array(z.object({
    name: z.string(),
    url: z.string(),
    type: z.string(),
  })).optional(),
  deal_id: z.string().uuid().optional(),
  project_id: z.string().uuid().optional(),
  tags: z.array(z.string()).optional(),
  sentiment: z.enum(['positive', 'neutral', 'negative']).optional(),
  follow_up_required: z.boolean().default(false),
  follow_up_date: z.string().datetime().optional(),
});

// GET - Get communication history
export async function GET(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'all' | 'contact' | 'deal' | 'timeline' | 'summary'
    const contactId = searchParams.get('contact_id');
    const dealId = searchParams.get('deal_id');
    const commType = searchParams.get('comm_type');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');

    if (type === 'contact' && contactId) {
      // Get all communications for a contact
      let query = supabase
        .from('communications')
        .select(`
          *,
          created_by:platform_users(id, first_name, last_name)
        `)
        .eq('contact_id', contactId)
        .order('occurred_at', { ascending: false });

      if (commType) query = query.eq('type', commType);
      if (startDate) query = query.gte('occurred_at', startDate);
      if (endDate) query = query.lte('occurred_at', endDate);

      const { data: communications, error } = await query;

      if (error) throw error;

      // Group by type
      const byType = communications?.reduce((acc: Record<string, number>, c) => {
        acc[c.type] = (acc[c.type] || 0) + 1;
        return acc;
      }, {});

      // Get last communication
      const lastComm = communications?.[0];

      return NextResponse.json({
        communications,
        by_type: byType,
        total: communications?.length || 0,
        last_communication: lastComm ? {
          type: lastComm.type,
          date: lastComm.occurred_at,
          subject: lastComm.subject,
        } : null,
      });
    }

    if (type === 'deal' && dealId) {
      // Get communications related to a deal
      const { data: communications, error } = await supabase
        .from('communications')
        .select(`
          *,
          contact:contacts(id, first_name, last_name),
          created_by:platform_users(id, first_name, last_name)
        `)
        .eq('deal_id', dealId)
        .order('occurred_at', { ascending: false });

      if (error) throw error;

      return NextResponse.json({ communications });
    }

    if (type === 'timeline' && contactId) {
      // Get communication timeline with activity
      const { data: communications, error } = await supabase
        .from('communications')
        .select(`
          id,
          type,
          subject,
          content,
          occurred_at,
          direction,
          sentiment
        `)
        .eq('contact_id', contactId)
        .order('occurred_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      // Get related activities
      const { data: activities } = await supabase
        .from('activities')
        .select('id, type, description, created_at')
        .eq('contact_id', contactId)
        .order('created_at', { ascending: false })
        .limit(50);

      // Merge and sort
      const timeline = [
        ...(communications?.map(c => ({
          id: c.id,
          type: 'communication',
          subtype: c.type,
          title: c.subject || `${c.type} - ${c.direction || 'outbound'}`,
          description: c.content?.substring(0, 200),
          date: c.occurred_at,
          sentiment: c.sentiment,
        })) || []),
        ...(activities?.map(a => ({
          id: a.id,
          type: 'activity',
          subtype: a.type,
          title: a.type,
          description: a.description,
          date: a.created_at,
        })) || []),
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      return NextResponse.json({ timeline });
    }

    if (type === 'summary') {
      // Get communication summary for dashboard
      const period = searchParams.get('period') || '30'; // days
      const periodStart = new Date(Date.now() - parseInt(period) * 24 * 60 * 60 * 1000).toISOString();

      const { data: communications, error } = await supabase
        .from('communications')
        .select('type, direction, sentiment, occurred_at')
        .gte('occurred_at', periodStart);

      if (error) throw error;

      // Group by type
      const byType = communications?.reduce((acc: Record<string, number>, c) => {
        acc[c.type] = (acc[c.type] || 0) + 1;
        return acc;
      }, {});

      // Group by direction
      const byDirection = communications?.reduce((acc: Record<string, number>, c) => {
        const dir = c.direction || 'outbound';
        acc[dir] = (acc[dir] || 0) + 1;
        return acc;
      }, {});

      // Group by sentiment
      const bySentiment = communications?.reduce((acc: Record<string, number>, c) => {
        if (c.sentiment) acc[c.sentiment] = (acc[c.sentiment] || 0) + 1;
        return acc;
      }, {});

      // Daily breakdown
      const byDay = communications?.reduce((acc: Record<string, number>, c) => {
        const day = c.occurred_at.split('T')[0];
        acc[day] = (acc[day] || 0) + 1;
        return acc;
      }, {});

      return NextResponse.json({
        period_days: parseInt(period),
        total: communications?.length || 0,
        by_type: byType,
        by_direction: byDirection,
        by_sentiment: bySentiment,
        by_day: byDay,
      });
    }

    if (type === 'follow_ups') {
      // Get pending follow-ups
      const { data: followUps, error } = await supabase
        .from('communications')
        .select(`
          *,
          contact:contacts(id, first_name, last_name, email)
        `)
        .eq('follow_up_required', true)
        .is('follow_up_completed', null)
        .order('follow_up_date', { ascending: true });

      if (error) throw error;

      const overdue = followUps?.filter(f => 
        f.follow_up_date && new Date(f.follow_up_date) < new Date()
      ) || [];

      const upcoming = followUps?.filter(f => 
        !f.follow_up_date || new Date(f.follow_up_date) >= new Date()
      ) || [];

      return NextResponse.json({
        follow_ups: followUps,
        overdue,
        upcoming,
        total_pending: followUps?.length || 0,
      });
    }

    // Default: return recent communications
    const { data: communications, error } = await supabase
      .from('communications')
      .select(`
        *,
        contact:contacts(id, first_name, last_name)
      `)
      .order('occurred_at', { ascending: false })
      .limit(50);

    if (error) throw error;

    return NextResponse.json({ communications });
  } catch (error: any) {
    console.error('Communication history error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Create communication record
export async function POST(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const body = await request.json();
    const action = body.action;

    if (action === 'log_communication') {
      const validated = communicationSchema.parse(body.data);
      const createdBy = body.created_by;

      const { data: communication, error } = await supabase
        .from('communications')
        .insert({
          ...validated,
          created_by: createdBy,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      // Update contact's last_contacted_at
      await supabase
        .from('contacts')
        .update({ 
          last_contacted_at: validated.occurred_at,
          updated_at: new Date().toISOString(),
        })
        .eq('id', validated.contact_id);

      return NextResponse.json({ communication }, { status: 201 });
    }

    if (action === 'log_email') {
      // Log email from integration
      const { contact_id, subject, body: emailBody, from, to, cc, occurred_at, thread_id, message_id } = body.data;

      const direction = to?.includes(body.user_email) ? 'inbound' : 'outbound';

      const { data: communication, error } = await supabase
        .from('communications')
        .insert({
          contact_id,
          type: 'email',
          direction,
          subject,
          content: emailBody,
          occurred_at,
          metadata: { from, to, cc, thread_id, message_id },
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json({ communication }, { status: 201 });
    }

    if (action === 'log_call') {
      const { contact_id, direction, duration_minutes, notes, outcome, occurred_at } = body.data;
      const createdBy = body.created_by;

      const { data: communication, error } = await supabase
        .from('communications')
        .insert({
          contact_id,
          type: 'call',
          direction,
          duration_minutes,
          content: notes,
          occurred_at,
          metadata: { outcome },
          created_by: createdBy,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json({ communication }, { status: 201 });
    }

    if (action === 'log_meeting') {
      const { contact_id, subject, notes, participants, duration_minutes, occurred_at, location, meeting_type } = body.data;
      const createdBy = body.created_by;

      const { data: communication, error } = await supabase
        .from('communications')
        .insert({
          contact_id,
          type: 'meeting',
          subject,
          content: notes,
          participants,
          duration_minutes,
          occurred_at,
          metadata: { location, meeting_type },
          created_by: createdBy,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json({ communication }, { status: 201 });
    }

    if (action === 'complete_follow_up') {
      const { communication_id, notes } = body.data;

      const { data: communication, error } = await supabase
        .from('communications')
        .update({
          follow_up_completed: true,
          follow_up_notes: notes,
          follow_up_completed_at: new Date().toISOString(),
        })
        .eq('id', communication_id)
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json({ communication });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    console.error('Communication history error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH - Update communication
export async function PATCH(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    const { data: communication, error } = await supabase
      .from('communications')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ communication });
  } catch (error: any) {
    console.error('Communication history error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Delete communication
export async function DELETE(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('communications')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Communication history error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
