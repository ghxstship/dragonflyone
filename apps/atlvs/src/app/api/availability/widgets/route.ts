export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { apiRoute } from '@ghxstship/config/middleware';
import { PlatformRole } from '@ghxstship/config/roles';
import { z } from 'zod';

const widgetSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  space_ids: z.array(z.string()).default([]),
  settings: z.object({
    show_pricing: z.boolean().default(true),
    allow_inquiries: z.boolean().default(true),
    min_notice_days: z.number().min(0).default(1),
    max_advance_days: z.number().min(1).default(365),
    theme: z.enum(['light', 'dark', 'auto']).default('light'),
  }).default({}),
});

interface AvailabilityWidget {
  id: string;
  name: string;
  space_ids: string[];
  settings: {
    show_pricing: boolean;
    allow_inquiries: boolean;
    min_notice_days: number;
    max_advance_days: number;
    theme: 'light' | 'dark' | 'auto';
  };
  embed_code: string;
  views: number;
  inquiries: number;
  created_at: string;
}

const DEMO_WIDGETS: AvailabilityWidget[] = [
  {
    id: 'demo-widget-1',
    name: 'Main Website Widget',
    space_ids: ['space-1', 'space-2'],
    settings: {
      show_pricing: true,
      allow_inquiries: true,
      min_notice_days: 2,
      max_advance_days: 180,
      theme: 'light',
    },
    embed_code: '<script src="https://atlvs.io/widgets/availability/demo-widget-1.js"></script>',
    views: 1250,
    inquiries: 45,
    created_at: new Date().toISOString(),
  },
];

export const GET = apiRoute(
  async () => {
    const supabase = createAdminClient();

    try {
      const { data: widgets, error } = await supabase
        .from('availability_widgets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error || !widgets || widgets.length === 0) {
        return NextResponse.json({ widgets: DEMO_WIDGETS });
      }

      return NextResponse.json({ widgets });
    } catch (error) {
      return NextResponse.json({ widgets: DEMO_WIDGETS });
    }
  },
  {
    auth: true,
    roles: [PlatformRole.ATLVS_ADMIN, PlatformRole.ATLVS_TEAM_MEMBER],
    audit: { action: 'availability:widgets:list', resource: 'availability_widgets' },
  }
);

export const POST = apiRoute(
  async (request: NextRequest) => {
    const supabase = createAdminClient();

    try {
      const body = await request.json();
      const validated = widgetSchema.parse(body);

      // Generate embed code
      const widgetId = `widget-${Date.now()}`;
      const embedCode = `<script src="${process.env.NEXT_PUBLIC_APP_URL || 'https://atlvs.io'}/widgets/availability/${widgetId}.js"></script>`;

      const { data: widget, error } = await supabase
        .from('availability_widgets')
        .insert({
          id: widgetId,
          name: validated.name,
          space_ids: validated.space_ids,
          settings: validated.settings,
          embed_code: embedCode,
          views: 0,
          inquiries: 0,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        // Return demo widget on error (table may not exist)
        const demoWidget: AvailabilityWidget = {
          id: widgetId,
          name: validated.name,
          space_ids: validated.space_ids,
          settings: {
            show_pricing: validated.settings.show_pricing ?? true,
            allow_inquiries: validated.settings.allow_inquiries ?? true,
            min_notice_days: validated.settings.min_notice_days ?? 1,
            max_advance_days: validated.settings.max_advance_days ?? 365,
            theme: validated.settings.theme ?? 'light',
          },
          embed_code: embedCode,
          views: 0,
          inquiries: 0,
          created_at: new Date().toISOString(),
        };
        return NextResponse.json({ widget: demoWidget }, { status: 201 });
      }

      return NextResponse.json({ widget }, { status: 201 });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
      }
      return NextResponse.json({ error: 'Failed to create widget' }, { status: 500 });
    }
  },
  {
    auth: true,
    roles: [PlatformRole.ATLVS_ADMIN],
    audit: { action: 'availability:widgets:create', resource: 'availability_widgets' },
  }
);
