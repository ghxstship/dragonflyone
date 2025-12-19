export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { apiRoute } from '@ghxstship/config/middleware';
import { PlatformRole } from '@ghxstship/config/roles';
import { z } from 'zod';

interface BEO {
  id: string;
  beo_number: string;
  event_name: string;
  event_date: string;
  start_time: string;
  end_time: string;
  guest_count: number;
  status: string;
  space: {
    name: string;
    setup_type: string;
  };
  contact: {
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
  };
  sections: {
    timeline: Array<{
      time: string;
      description: string;
      department?: string;
    }>;
    room_setup: {
      layout: string;
      notes?: string;
    };
    catering: {
      menu_items: Array<{
        name: string;
        quantity: number;
        dietary_notes?: string;
      }>;
      dietary_requirements?: string[];
    };
    av_requirements: Array<{
      item: string;
      quantity: number;
      notes?: string;
    }>;
    notes?: string;
  };
  organization: {
    name: string;
    logo_url?: string;
  };
}

const DEMO_BEO: BEO = {
  id: 'demo-beo-1',
  beo_number: 'BEO-2024-001',
  event_name: 'Annual Corporate Gala',
  event_date: new Date().toISOString().split('T')[0],
  start_time: '18:00',
  end_time: '23:00',
  guest_count: 250,
  status: 'approved',
  space: {
    name: 'Grand Ballroom',
    setup_type: 'Banquet',
  },
  contact: {
    first_name: 'John',
    last_name: 'Smith',
    email: 'john.smith@example.com',
    phone: '(555) 123-4567',
  },
  sections: {
    timeline: [
      { time: '17:00', description: 'Vendor load-in and setup', department: 'Operations' },
      { time: '18:00', description: 'Guest arrival and cocktail hour', department: 'F&B' },
      { time: '19:00', description: 'Dinner service begins', department: 'F&B' },
      { time: '20:30', description: 'Program and speeches', department: 'AV' },
      { time: '21:30', description: 'Dancing and dessert', department: 'F&B' },
      { time: '23:00', description: 'Event concludes', department: 'Operations' },
    ],
    room_setup: {
      layout: 'banquet',
      notes: '25 rounds of 10, head table for 10',
    },
    catering: {
      menu_items: [
        { name: 'Caesar Salad', quantity: 250 },
        { name: 'Filet Mignon', quantity: 150, dietary_notes: 'GF available' },
        { name: 'Salmon en Croute', quantity: 100 },
        { name: 'Chocolate Mousse', quantity: 250 },
      ],
      dietary_requirements: ['Vegetarian options', 'Gluten-free options', 'Nut-free kitchen'],
    },
    av_requirements: [
      { item: 'Wireless Microphone', quantity: 4 },
      { item: 'Projection Screen', quantity: 2 },
      { item: 'LED Uplighting', quantity: 20 },
    ],
    notes: 'VIP guests require reserved parking. Check coat service needed.',
  },
  organization: {
    name: 'ATLVS Events',
  },
};

const updateBEOSchema = z.object({
  event_name: z.string().optional(),
  event_date: z.string().optional(),
  start_time: z.string().optional(),
  end_time: z.string().optional(),
  guest_count: z.number().optional(),
  status: z.enum(['draft', 'pending', 'approved', 'archived']).optional(),
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
        dietary_notes: z.string().optional(),
      })),
      dietary_requirements: z.array(z.string()).optional(),
    }).optional(),
    av_requirements: z.array(z.object({
      item: z.string(),
      quantity: z.number(),
      notes: z.string().optional(),
    })).optional(),
    notes: z.string().optional(),
  }).optional(),
});

export const GET = apiRoute(
  async (request: NextRequest, { params }: { params: { id: string } }) => {
    const supabase = createAdminClient();
    const beoId = params.id;

    try {
      const { data: beo, error } = await supabase
        .from('beos')
        .select(`
          *,
          space:spaces(name, setup_type),
          contact:contacts(first_name, last_name, email, phone),
          organization:organizations(name, logo_url)
        `)
        .eq('id', beoId)
        .single();

      if (error || !beo) {
        // Return demo BEO for preview purposes
        return NextResponse.json({ ...DEMO_BEO, id: beoId });
      }

      return NextResponse.json(beo);
    } catch (error) {
      return NextResponse.json({ ...DEMO_BEO, id: beoId });
    }
  },
  {
    auth: true,
    roles: [PlatformRole.ATLVS_ADMIN, PlatformRole.ATLVS_TEAM_MEMBER, PlatformRole.ATLVS_VIEWER],
    audit: { action: 'beo:view', resource: 'beos' },
  }
);

export const PATCH = apiRoute(
  async (request: NextRequest, { params }: { params: { id: string } }) => {
    const supabase = createAdminClient();
    const beoId = params.id;

    try {
      const body = await request.json();
      const validated = updateBEOSchema.parse(body);

      const { data: beo, error } = await supabase
        .from('beos')
        .update({
          ...validated,
          updated_at: new Date().toISOString(),
        })
        .eq('id', beoId)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ beo });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
      }
      return NextResponse.json({ error: 'Failed to update BEO' }, { status: 500 });
    }
  },
  {
    auth: true,
    roles: [PlatformRole.ATLVS_ADMIN, PlatformRole.ATLVS_TEAM_MEMBER],
    audit: { action: 'beo:update', resource: 'beos' },
  }
);

export const DELETE = apiRoute(
  async (request: NextRequest, { params }: { params: { id: string } }) => {
    const supabase = createAdminClient();
    const beoId = params.id;

    try {
      const { error } = await supabase
        .from('beos')
        .delete()
        .eq('id', beoId);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true });
    } catch (error) {
      return NextResponse.json({ error: 'Failed to delete BEO' }, { status: 500 });
    }
  },
  {
    auth: true,
    roles: [PlatformRole.ATLVS_ADMIN],
    audit: { action: 'beo:delete', resource: 'beos' },
  }
);
