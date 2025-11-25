import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

const groupSchema = z.object({
  event_id: z.string().uuid(),
  name: z.string().min(1),
  organizer_name: z.string().min(1),
  organizer_email: z.string().email(),
  organizer_phone: z.string().optional(),
  expected_size: z.number().min(2),
  ticket_type_id: z.string().uuid().optional(),
  notes: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get('group_id');
    const eventId = searchParams.get('event_id');
    const organizerEmail = searchParams.get('organizer_email');
    const type = searchParams.get('type');

    if (type === 'dashboard' && organizerEmail) {
      const { data: groups, error } = await supabase
        .from('group_registrations')
        .select(`
          *,
          event:events(id, name, start_date),
          members:group_members(*)
        `)
        .eq('organizer_email', organizerEmail)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return NextResponse.json({ groups });
    }

    if (groupId) {
      const { data: group, error } = await supabase
        .from('group_registrations')
        .select(`
          *,
          event:events(id, name, start_date, venue:venues(name)),
          members:group_members(*),
          payments:group_payments(*)
        `)
        .eq('id', groupId)
        .single();

      if (error) throw error;

      const summary = {
        total_members: group.members?.length || 0,
        confirmed_members: group.members?.filter((m: any) => m.status === 'confirmed').length || 0,
        pending_members: group.members?.filter((m: any) => m.status === 'pending').length || 0,
        total_paid: group.payments?.reduce((sum: number, p: any) => p.status === 'completed' ? sum + p.amount : sum, 0) || 0,
      };

      return NextResponse.json({ group, summary });
    }

    if (eventId) {
      const { data: groups, error } = await supabase
        .from('group_registrations')
        .select('id, name, organizer_name, expected_size, status, created_at')
        .eq('event_id', eventId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return NextResponse.json({ groups });
    }

    return NextResponse.json({ error: 'group_id, event_id, or organizer_email required' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const action = body.action;

    if (action === 'create_group') {
      const validated = groupSchema.parse(body.data);

      // Generate invite code
      const inviteCode = Math.random().toString(36).substring(2, 10).toUpperCase();

      const { data: group, error } = await supabase
        .from('group_registrations')
        .insert({
          ...validated,
          invite_code: inviteCode,
          status: 'open',
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ group, invite_link: `/groups/join/${inviteCode}` }, { status: 201 });
    }

    if (action === 'add_member') {
      const { group_id, name, email, phone } = body.data;

      const { data: member, error } = await supabase
        .from('group_members')
        .insert({
          group_id,
          name,
          email,
          phone,
          status: 'pending',
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ member }, { status: 201 });
    }

    if (action === 'join_by_code') {
      const { invite_code, name, email, phone } = body.data;

      const { data: group } = await supabase
        .from('group_registrations')
        .select('id, expected_size, status')
        .eq('invite_code', invite_code)
        .eq('status', 'open')
        .single();

      if (!group) return NextResponse.json({ error: 'Invalid or closed group' }, { status: 404 });

      // Check if group is full
      const { count } = await supabase
        .from('group_members')
        .select('*', { count: 'exact', head: true })
        .eq('group_id', group.id);

      if ((count || 0) >= group.expected_size) {
        return NextResponse.json({ error: 'Group is full' }, { status: 400 });
      }

      const { data: member, error } = await supabase
        .from('group_members')
        .insert({
          group_id: group.id,
          name,
          email,
          phone,
          status: 'pending',
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ member, group_id: group.id }, { status: 201 });
    }

    if (action === 'record_payment') {
      const { group_id, member_id, amount, payment_method } = body.data;

      const { data: payment, error } = await supabase
        .from('group_payments')
        .insert({
          group_id,
          member_id,
          amount,
          payment_method,
          status: 'completed',
          paid_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      // Update member status
      if (member_id) {
        await supabase
          .from('group_members')
          .update({ status: 'confirmed', paid_at: new Date().toISOString() })
          .eq('id', member_id);
      }

      return NextResponse.json({ payment }, { status: 201 });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, action, ...updates } = body;

    if (action === 'close_group') {
      const { data, error } = await supabase
        .from('group_registrations')
        .update({ status: 'closed' })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ group: data });
    }

    if (action === 'confirm_member') {
      const { data, error } = await supabase
        .from('group_members')
        .update({ status: 'confirmed' })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ member: data });
    }

    if (action === 'remove_member') {
      const { error } = await supabase
        .from('group_members')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    const { data, error } = await supabase
      .from('group_registrations')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ group: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
