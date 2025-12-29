export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase, withAuth, PlatformRole } from '@ghxstship/config';
import { z } from 'zod';

const createAlertSchema = z.object({
  action: z.literal('create'),
  name: z.string(),
  skills: z.array(z.string()).optional(),
  categories: z.array(z.string()).optional(),
  locations: z.array(z.string()).optional(),
  min_rate: z.number().optional(),
  max_rate: z.number().optional(),
  frequency: z.string().optional(),
});

const updateAlertSchema = z.object({
  action: z.literal('update'),
  alert_id: z.string().uuid(),
}).catchall(z.unknown());

const toggleAlertSchema = z.object({
  action: z.literal('toggle'),
  alert_id: z.string().uuid(),
  active: z.boolean(),
});

const deleteAlertSchema = z.object({
  action: z.literal('delete'),
  alert_id: z.string().uuid(),
});

const alertActionSchema = z.union([createAlertSchema, updateAlertSchema, toggleAlertSchema, deleteAlertSchema]);

// Email alerts for matching opportunities based on skills
const COMPVSS_ROLES = [
  PlatformRole.COMPVSS_ADMIN, PlatformRole.COMPVSS_TEAM_MEMBER, PlatformRole.COMPVSS_VIEWER,
  PlatformRole.LEGEND_SUPER_ADMIN, PlatformRole.LEGEND_ADMIN, PlatformRole.LEGEND_DEVELOPER,
];

export async function GET(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!COMPVSS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data, error } = await supabase.from('opportunity_alerts').select('*').eq('user_id', user.id);
    if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });

    return NextResponse.json({ alerts: data });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!COMPVSS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const validatedData = alertActionSchema.parse(body);
    const { action } = validatedData;

    if (action === 'create') {
      const { name, skills, categories, locations, min_rate, max_rate, frequency } = validatedData as z.infer<typeof createAlertSchema>;

      const { data, error } = await supabase.from('opportunity_alerts').insert({
        user_id: user.id, name, skills: skills || [], categories: categories || [],
        locations: locations || [], min_rate, max_rate, frequency: frequency || 'daily', active: true
      }).select().single();

      if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
      return NextResponse.json({ alert: data }, { status: 201 });
    }

    if (action === 'update') {
      const { alert_id, ...updates } = validatedData as z.infer<typeof updateAlertSchema>;

      await supabase.from('opportunity_alerts').update(updates).eq('id', alert_id).eq('user_id', user.id);
      return NextResponse.json({ success: true });
    }

    if (action === 'toggle') {
      const { alert_id, active } = validatedData as z.infer<typeof toggleAlertSchema>;

      await supabase.from('opportunity_alerts').update({ active }).eq('id', alert_id).eq('user_id', user.id);
      return NextResponse.json({ success: true });
    }

    if (action === 'delete') {
      const { alert_id } = validatedData as z.infer<typeof deleteAlertSchema>;

      await supabase.from('opportunity_alerts').delete().eq('id', alert_id).eq('user_id', user.id);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 });
  }
}
