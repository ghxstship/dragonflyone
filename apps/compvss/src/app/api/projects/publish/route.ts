import { NextRequest, NextResponse } from 'next/server';
import { apiRoute } from '@ghxstship/config/middleware';
import { PlatformRole } from '@ghxstship/config/roles';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const publishSchema = z.object({
  project_id: z.string().uuid(),
  event_details: z.object({
    title: z.string().min(1),
    venue_id: z.string().uuid(),
    start_date: z.string(),
    end_date: z.string().optional(),
    capacity: z.number().positive().optional(),
    ticket_types: z.array(z.object({
      name: z.string(),
      price: z.number(),
      quantity: z.number(),
    })).optional(),
  }),
});

export const POST = apiRoute(
  async (request: NextRequest, context: any) => {
    try {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      const payload = context.validated;

      const { data: project, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', payload.project_id)
        .single();

      if (projectError || !project) {
        return NextResponse.json({ error: 'Project not found' }, { status: 404 });
      }

      const { data: event, error: eventError } = await supabase
        .from('events')
        .insert({
          title: payload.event_details.title,
          venue_id: payload.event_details.venue_id,
          start_date: payload.event_details.start_date,
          end_date: payload.event_details.end_date,
          capacity: payload.event_details.capacity,
          status: 'draft',
          source_project_id: project.id,
          created_by: context.user?.id,
        })
        .select()
        .single();

      if (eventError) {
        return NextResponse.json({ error: eventError.message }, { status: 500 });
      }

      if (payload.event_details.ticket_types) {
        const ticketInserts = payload.event_details.ticket_types.map((tt: any) => ({
          event_id: event.id,
          name: tt.name,
          price: tt.price,
          quantity: tt.quantity,
          available_quantity: tt.quantity,
        }));

        await supabase.from('ticket_types').insert(ticketInserts);
      }

      await supabase
        .from('integration_logs')
        .insert({
          source_platform: 'compvss',
          target_platform: 'gvteway',
          workflow_type: 'project_to_event',
          source_id: project.id,
          target_id: event.id,
          status: 'success',
          user_id: context.user?.id,
        });

      await supabase
        .from('projects')
        .update({ publish_status: 'published', published_event_id: event.id })
        .eq('id', project.id);

      return NextResponse.json({ 
        success: true,
        event,
        message: 'Project successfully published to GVTEWAY'
      }, { status: 201 });
    } catch (error: any) {
      return NextResponse.json({ error: error.message || 'Publish failed' }, { status: 500 });
    }
  },
  {
    auth: true,
    roles: [PlatformRole.COMPVSS_ADMIN],
    validation: publishSchema,
    rateLimit: { maxRequests: 30, windowMs: 60000 },
    audit: { action: 'project:publish', resource: 'projects' },
  }
);
