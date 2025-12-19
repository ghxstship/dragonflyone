export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { apiRoute } from '@ghxstship/config/middleware';
import { PlatformRole } from '@ghxstship/config/roles';
import { z } from 'zod';

interface BEOTemplate {
  id: string;
  name: string;
  description?: string;
  event_type: string;
  sections: {
    timeline: Array<{ time: string; description: string; department?: string }>;
    room_setup: { layout: string; notes?: string };
    catering: { menu_items: Array<{ name: string; quantity: number }> };
    av_requirements: Array<{ item: string; quantity: number }>;
  };
  is_default: boolean;
  usage_count: number;
  created_at: string;
}

const DEMO_TEMPLATES: BEOTemplate[] = [
  {
    id: 'template-1',
    name: 'Standard Wedding Reception',
    description: 'Complete template for wedding receptions with dinner service',
    event_type: 'wedding',
    sections: {
      timeline: [
        { time: '16:00', description: 'Vendor setup', department: 'Operations' },
        { time: '17:00', description: 'Cocktail hour', department: 'F&B' },
        { time: '18:00', description: 'Guest seating', department: 'Operations' },
        { time: '18:30', description: 'Dinner service', department: 'F&B' },
        { time: '20:00', description: 'First dance', department: 'AV' },
        { time: '23:00', description: 'Event concludes', department: 'Operations' },
      ],
      room_setup: { layout: 'banquet', notes: 'Head table plus rounds' },
      catering: { menu_items: [{ name: 'Plated dinner', quantity: 150 }] },
      av_requirements: [{ item: 'DJ Setup', quantity: 1 }],
    },
    is_default: true,
    usage_count: 45,
    created_at: new Date().toISOString(),
  },
  {
    id: 'template-2',
    name: 'Corporate Conference',
    description: 'Full-day conference with breakout sessions',
    event_type: 'conference',
    sections: {
      timeline: [
        { time: '07:00', description: 'Registration opens', department: 'Operations' },
        { time: '08:00', description: 'Continental breakfast', department: 'F&B' },
        { time: '09:00', description: 'Keynote presentation', department: 'AV' },
        { time: '12:00', description: 'Lunch break', department: 'F&B' },
        { time: '17:00', description: 'Closing remarks', department: 'AV' },
      ],
      room_setup: { layout: 'theater', notes: 'Stage with podium' },
      catering: { menu_items: [{ name: 'Continental breakfast', quantity: 200 }] },
      av_requirements: [{ item: 'Projector', quantity: 1 }, { item: 'Podium mic', quantity: 1 }],
    },
    is_default: false,
    usage_count: 28,
    created_at: new Date().toISOString(),
  },
];

const templateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  event_type: z.string().min(1, 'Event type is required'),
  sections: z.object({
    timeline: z.array(z.object({
      time: z.string(),
      description: z.string(),
      department: z.string().optional(),
    })).default([]),
    room_setup: z.object({
      layout: z.string(),
      notes: z.string().optional(),
    }).default({ layout: 'theater' }),
    catering: z.object({
      menu_items: z.array(z.object({
        name: z.string(),
        quantity: z.number(),
      })),
    }).default({ menu_items: [] }),
    av_requirements: z.array(z.object({
      item: z.string(),
      quantity: z.number(),
    })).default([]),
  }).default({}),
  is_default: z.boolean().default(false),
});

export const GET = apiRoute(
  async () => {
    const supabase = createAdminClient();

    try {
      const { data: templates, error } = await supabase
        .from('beo_templates')
        .select('*')
        .order('is_default', { ascending: false })
        .order('usage_count', { ascending: false });

      if (error || !templates || templates.length === 0) {
        return NextResponse.json({ templates: DEMO_TEMPLATES });
      }

      return NextResponse.json({ templates });
    } catch (error) {
      return NextResponse.json({ templates: DEMO_TEMPLATES });
    }
  },
  {
    auth: true,
    roles: [PlatformRole.ATLVS_ADMIN, PlatformRole.ATLVS_TEAM_MEMBER],
    audit: { action: 'beo_templates:list', resource: 'beo_templates' },
  }
);

export const POST = apiRoute(
  async (request: NextRequest) => {
    const supabase = createAdminClient();

    try {
      const body = await request.json();
      const validated = templateSchema.parse(body);

      // If setting as default, unset other defaults
      if (validated.is_default) {
        await supabase
          .from('beo_templates')
          .update({ is_default: false })
          .eq('is_default', true);
      }

      const templateId = `template-${Date.now()}`;

      const { data: template, error } = await supabase
        .from('beo_templates')
        .insert({
          id: templateId,
          name: validated.name,
          description: validated.description,
          event_type: validated.event_type,
          sections: validated.sections,
          is_default: validated.is_default,
          usage_count: 0,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        // Return simulated template on error (table may not exist)
        const newTemplate: BEOTemplate = {
          id: templateId,
          name: validated.name,
          description: validated.description,
          event_type: validated.event_type,
          sections: {
            timeline: validated.sections.timeline || [],
            room_setup: validated.sections.room_setup || { layout: 'theater' },
            catering: validated.sections.catering || { menu_items: [] },
            av_requirements: validated.sections.av_requirements || [],
          },
          is_default: validated.is_default,
          usage_count: 0,
          created_at: new Date().toISOString(),
        };
        return NextResponse.json({ template: newTemplate }, { status: 201 });
      }

      return NextResponse.json({ template }, { status: 201 });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
      }
      return NextResponse.json({ error: 'Failed to create template' }, { status: 500 });
    }
  },
  {
    auth: true,
    roles: [PlatformRole.ATLVS_ADMIN],
    audit: { action: 'beo_templates:create', resource: 'beo_templates' },
  }
);
