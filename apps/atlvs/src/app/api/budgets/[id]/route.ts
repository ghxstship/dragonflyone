export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@ghxstship/config/supabase-types';
import { withAuth, PlatformRole } from '@ghxstship/config';
import { z } from 'zod';

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const ATLVS_ROLES = [
  PlatformRole.ATLVS_SUPER_ADMIN,
  PlatformRole.ATLVS_ADMIN,
  PlatformRole.ATLVS_TEAM_MEMBER,
  PlatformRole.ATLVS_VIEWER,
  PlatformRole.LEGEND_SUPER_ADMIN,
  PlatformRole.LEGEND_ADMIN,
  PlatformRole.LEGEND_DEVELOPER,
];

const ATLVS_ADMIN_ROLES = [
  PlatformRole.ATLVS_SUPER_ADMIN,
  PlatformRole.ATLVS_ADMIN,
  PlatformRole.LEGEND_SUPER_ADMIN,
  PlatformRole.LEGEND_ADMIN,
  PlatformRole.LEGEND_DEVELOPER,
];

const UpdateBudgetSchema = z.object({
  name: z.string().min(1).optional(),
  category: z.string().optional(),
  planned_amount: z.number().positive().optional(),
  actual_amount: z.number().optional(),
  period_start: z.string().optional(),
  period_end: z.string().optional(),
  status: z.string().optional(),
  notes: z.string().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authentication check
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    
    // Authorization check
    const userRoles = authResult.user?.platformRoles || [];
    const hasAccess = ATLVS_ROLES.some(role => userRoles.includes(role));
    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden - ATLVS access required' }, { status: 403 });
    }

    const { id } = await params;

    const { data, error } = await supabase
      .from('budgets')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Budget not found' }, { status: 404 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const budgetWithVariance = {
      ...data,
      variance: (data.planned_amount || 0) - (data.actual_amount || 0),
      computed_status: (data.actual_amount || 0) <= (data.planned_amount || 0) ? 'on-track' : 'over',
    };

    return NextResponse.json({ budget: budgetWithVariance });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authentication check
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    
    // Authorization check - only admins can update budgets
    const userRoles = authResult.user?.platformRoles || [];
    const canUpdate = ATLVS_ADMIN_ROLES.some(role => userRoles.includes(role));
    if (!canUpdate) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();

    const validationResult = UpdateBudgetSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const updateData = {
      ...validationResult.data,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('budgets')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Budget not found' }, { status: 404 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ budget: data });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authentication check
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    
    // Authorization check - only admins can delete budgets
    const userRoles = authResult.user?.platformRoles || [];
    const canDelete = ATLVS_ADMIN_ROLES.some(role => userRoles.includes(role));
    if (!canDelete) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const { id } = await params;

    const { error } = await supabase
      .from('budgets')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
