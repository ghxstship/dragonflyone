import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - Fetch group ticket orders
export async function GET(request: NextRequest) {
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
    const eventId = searchParams.get('event_id');

    let query = supabase
      .from('group_orders')
      .select(`
        *,
        event:events(id, name, date, venue),
        organizer:platform_users(id, email, first_name, last_name),
        members:group_order_members(*)
      `)
      .or(`organizer_id.eq.${user.id},members.user_id.eq.${user.id}`);

    if (eventId) {
      query = query.eq('event_id', eventId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ groups: data });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch groups' },
      { status: 500 }
    );
  }
}

// POST - Create group order
export async function POST(request: NextRequest) {
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
    const {
      event_id,
      group_name,
      ticket_type_id,
      quantity,
      member_emails,
    } = body;

    // Fetch ticket type for pricing
    const { data: ticketType, error: ticketError } = await supabase
      .from('ticket_types')
      .select('*')
      .eq('id', ticket_type_id)
      .single();

    if (ticketError || !ticketType) {
      return NextResponse.json({ error: 'Ticket type not found' }, { status: 404 });
    }

    // Calculate group discount
    let discountPercent = 0;
    if (quantity >= 20) discountPercent = 15;
    else if (quantity >= 10) discountPercent = 10;
    else if (quantity >= 5) discountPercent = 5;

    const basePrice = ticketType.price * quantity;
    const discount = basePrice * (discountPercent / 100);
    const totalPrice = basePrice - discount;

    // Create group order
    const { data: group, error: groupError } = await supabase
      .from('group_orders')
      .insert({
        event_id,
        organizer_id: user.id,
        group_name,
        ticket_type_id,
        quantity,
        base_price: basePrice,
        discount_percent: discountPercent,
        discount_amount: discount,
        total_price: totalPrice,
        status: 'pending',
        payment_deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      })
      .select()
      .single();

    if (groupError) {
      return NextResponse.json({ error: groupError.message }, { status: 500 });
    }

    // Add organizer as first member
    await supabase.from('group_order_members').insert({
      group_order_id: group.id,
      user_id: user.id,
      email: user.email,
      status: 'confirmed',
      is_organizer: true,
    });

    // Invite other members
    if (member_emails && member_emails.length > 0) {
      const memberRecords = member_emails.map((email: string) => ({
        group_order_id: group.id,
        email,
        status: 'invited',
        is_organizer: false,
        invite_token: crypto.randomUUID(),
      }));

      await supabase.from('group_order_members').insert(memberRecords);

      // TODO: Send invitation emails
    }

    return NextResponse.json({
      group,
      discount_applied: discountPercent,
      savings: discount,
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create group' },
      { status: 500 }
    );
  }
}

// PATCH - Join group or update status
export async function PATCH(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const body = await request.json();
    const { group_id, invite_token, action } = body;

    if (action === 'join' && invite_token) {
      // Join via invite token
      const { data: member, error: memberError } = await supabase
        .from('group_order_members')
        .select('*, group_order:group_orders(*)')
        .eq('invite_token', invite_token)
        .single();

      if (memberError || !member) {
        return NextResponse.json({ error: 'Invalid invite' }, { status: 404 });
      }

      if (authHeader) {
        const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
        if (user) {
          await supabase
            .from('group_order_members')
            .update({
              user_id: user.id,
              status: 'confirmed',
              confirmed_at: new Date().toISOString(),
            })
            .eq('id', member.id);
        }
      }

      return NextResponse.json({ success: true, group: member.group_order });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update group' },
      { status: 500 }
    );
  }
}
