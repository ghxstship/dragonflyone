import { NextRequest, NextResponse } from 'next/server';
import { apiRoute } from '@ghxstship/config/middleware';
import { PlatformRole } from '@ghxstship/config/roles';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const generateTicketsSchema = z.object({
  event_id: z.string().uuid(),
  ticket_type_id: z.string().uuid(),
  quantity: z.number().positive(),
  batch_prefix: z.string().optional(),
});

export const GET = apiRoute(
  async (request: NextRequest, context: any) => {
    try {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      const { searchParams } = new URL(request.url);
      
      const eventId = searchParams.get('event_id');
      const userId = searchParams.get('user_id') || context.user?.id;
      const status = searchParams.get('status');
      const limit = parseInt(searchParams.get('limit') || '50');
      const offset = parseInt(searchParams.get('offset') || '0');

      let query = supabase
        .from('tickets')
        .select('*, events(*), ticket_types(*), orders(*)', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (eventId) {
        query = query.eq('event_id', eventId);
      }

      if (userId) {
        query = query.eq('user_id', userId);
      }

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error, count } = await query;

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ 
        tickets: data, 
        total: count,
        limit,
        offset
      });
    } catch (error: any) {
      return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
  },
  {
    auth: true,
    rateLimit: { maxRequests: 100, windowMs: 60000 },
    audit: { action: 'tickets:view', resource: 'tickets' },
  }
);

export const POST = apiRoute(
  async (request: NextRequest, context: any) => {
    try {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      const payload = context.validated;

      const { data: ticketType, error: typeError } = await supabase
        .from('ticket_types')
        .select('*')
        .eq('id', payload.ticket_type_id)
        .single();

      if (typeError || !ticketType) {
        return NextResponse.json({ error: 'Ticket type not found' }, { status: 404 });
      }

      if (ticketType.available_quantity < payload.quantity) {
        return NextResponse.json({ error: 'Insufficient tickets available' }, { status: 400 });
      }

      const tickets = [];
      for (let i = 0; i < payload.quantity; i++) {
        const ticketCode = `${payload.batch_prefix || 'TKT'}-${Date.now()}-${i}`;
        tickets.push({
          event_id: payload.event_id,
          ticket_type_id: payload.ticket_type_id,
          ticket_code: ticketCode,
          status: 'available',
          created_by: context.user?.id,
        });
      }

      const { data: generatedTickets, error: insertError } = await supabase
        .from('tickets')
        .insert(tickets)
        .select();

      if (insertError) {
        return NextResponse.json({ error: insertError.message }, { status: 500 });
      }

      await supabase
        .from('ticket_types')
        .update({ 
          available_quantity: ticketType.available_quantity - payload.quantity 
        })
        .eq('id', payload.ticket_type_id);

      return NextResponse.json({ 
        tickets: generatedTickets,
        count: generatedTickets.length,
        message: `Generated ${generatedTickets.length} tickets`
      }, { status: 201 });
    } catch (error: any) {
      return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
  },
  {
    auth: true,
    roles: [PlatformRole.GVTEWAY_ADMIN, PlatformRole.GVTEWAY_EXPERIENCE_CREATOR],
    validation: generateTicketsSchema,
    rateLimit: { maxRequests: 20, windowMs: 60000 },
    audit: { action: 'tickets:generate', resource: 'tickets' },
  }
);
