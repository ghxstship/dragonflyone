export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { apiRoute } from '@ghxstship/config/middleware';
import { PlatformRole } from '@ghxstship/config/roles';
import { z } from 'zod';

const updateTemplateSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  event_type: z.string().optional(),
  sections: z.object({
    timeline: z.array(z.object({
      time: z.string(),
      description: z.string(),
      department: z.string().optional(),
    })).optional(),
    room_setup: z.object({
      layout: z.string(),
      notes: z.string().optional(),
    }).optional(),
    catering: z.object({
      menu_items: z.array(z.object({
        name: z.string(),
        quantity: z.number(),
      })),
    }).optional(),
    av_requirements: z.array(z.object({
      item: z.string(),
      quantity: z.number(),
    })).optional(),
  }).optional(),
  is_default: z.boolean().optional(),
});

export const GET = apiRoute(
  async (request: NextRequest, { params }: { params: { id: string } }) => {
    const supabase = createAdminClient();
    const templateId = params.id;

    try {
      const { data: template, error } = await supabase
        .from('beo_templates')
        .select('*')
        .eq('id', templateId)
        .single();

      if (error || !template) {
        return NextResponse.json({ error: 'Template not found' }, { status: 404 });
      }

      return NextResponse.json({ template });
    } catch (error) {
      return NextResponse.json({ error: 'Failed to fetch template' }, { status: 500 });
    }
  },
  {
    auth: true,
    roles: [PlatformRole.ATLVS_ADMIN, PlatformRole.ATLVS_TEAM_MEMBER],
    audit: { action: 'beo_templates:view', resource: 'beo_templates' },
  }
);

export const PATCH = apiRoute(
  async (request: NextRequest, { params }: { params: { id: string } }) => {
    const supabase = createAdminClient();
    const templateId = params.id;

    try {
      const body = await request.json();
      const validated = updateTemplateSchema.parse(body);

      // If setting as default, unset other defaults
      if (validated.is_default) {
        await supabase
          .from('beo_templates')
          .update({ is_default: false })
          .eq('is_default', true);
      }

      const { data: template, error } = await supabase
        .from('beo_templates')
        .update({
          ...validated,
          updated_at: new Date().toISOString(),
        })
        .eq('id', templateId)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ template });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
      }
      return NextResponse.json({ error: 'Failed to update template' }, { status: 500 });
    }
  },
  {
    auth: true,
    roles: [PlatformRole.ATLVS_ADMIN],
    audit: { action: 'beo_templates:update', resource: 'beo_templates' },
  }
);

export const DELETE = apiRoute(
  async (request: NextRequest, { params }: { params: { id: string } }) => {
    const supabase = createAdminClient();
    const templateId = params.id;

    try {
      const { error } = await supabase
        .from('beo_templates')
        .delete()
        .eq('id', templateId);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true });
    } catch (error) {
      return NextResponse.json({ error: 'Failed to delete template' }, { status: 500 });
    }
  },
  {
    auth: true,
    roles: [PlatformRole.ATLVS_ADMIN],
    audit: { action: 'beo_templates:delete', resource: 'beo_templates' },
  }
);
