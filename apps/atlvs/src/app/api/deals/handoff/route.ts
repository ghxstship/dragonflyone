import { NextRequest, NextResponse } from 'next/server';
import { apiRoute } from '@ghxstship/config/middleware';
import { PlatformRole } from '@ghxstship/config/roles';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const handoffSchema = z.object({
  deal_id: z.string().uuid(),
  target_platform: z.enum(['compvss', 'gvteway']),
  handoff_data: z.object({
    budget: z.number().optional(),
    timeline: z.string().optional(),
    requirements: z.string().optional(),
  }),
});

export const POST = apiRoute(
  async (request: NextRequest, context: any) => {
    try {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      const payload = context.validated;

      const { data: deal, error: dealError } = await supabase
        .from('deals')
        .select('*')
        .eq('id', payload.deal_id)
        .single();

      if (dealError || !deal) {
        return NextResponse.json({ error: 'Deal not found' }, { status: 404 });
      }

      if (payload.target_platform === 'compvss') {
        const { data: project, error: projectError } = await supabase
          .from('projects')
          .insert({
            name: deal.title,
            organization_id: deal.organization_id,
            description: `Converted from deal: ${deal.title}`,
            status: 'planning',
            budget: payload.handoff_data.budget || deal.value,
            source_deal_id: deal.id,
            created_by: context.user?.id,
          })
          .select()
          .single();

        if (projectError) {
          return NextResponse.json({ error: projectError.message }, { status: 500 });
        }

        await supabase
          .from('integration_logs')
          .insert({
            source_platform: 'atlvs',
            target_platform: 'compvss',
            workflow_type: 'deal_to_project',
            source_id: deal.id,
            target_id: project.id,
            status: 'success',
            user_id: context.user?.id,
          });

        await supabase
          .from('deals')
          .update({ status: 'won', handoff_status: 'completed' })
          .eq('id', deal.id);

        return NextResponse.json({ 
          success: true,
          project,
          message: 'Deal successfully handed off to COMPVSS'
        }, { status: 201 });
      }

      return NextResponse.json({ error: 'Invalid target platform' }, { status: 400 });
    } catch (error: any) {
      return NextResponse.json({ error: error.message || 'Handoff failed' }, { status: 500 });
    }
  },
  {
    auth: true,
    roles: [PlatformRole.ATLVS_ADMIN, PlatformRole.ATLVS_SUPER_ADMIN],
    validation: handoffSchema,
    rateLimit: { maxRequests: 30, windowMs: 60000 },
    audit: { action: 'deal:handoff', resource: 'deals' },
  }
);
