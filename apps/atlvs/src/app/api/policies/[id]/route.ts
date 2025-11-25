import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const updateSchema = z.object({
  policy_code: z.string().max(50).optional(),
  title: z.string().min(1).max(255).optional(),
  category: z.string().min(1).max(100).optional(),
  description: z.string().optional().nullable(),
  content: z.string().optional().nullable(),
  content_type: z.enum(['text', 'html', 'markdown', 'pdf']).optional(),
  document_url: z.string().url().optional().nullable(),
  version: z.string().min(1).max(20).optional(),
  effective_date: z.string().optional(),
  review_date: z.string().optional().nullable(),
  expiration_date: z.string().optional().nullable(),
  status: z.enum(['draft', 'pending_review', 'approved', 'active', 'archived', 'superseded']).optional(),
  requires_acknowledgment: z.boolean().optional(),
  acknowledgment_frequency: z.enum(['once', 'annually', 'semi_annually', 'quarterly']).optional(),
  applies_to_roles: z.array(z.string()).optional(),
  applies_to_departments: z.array(z.string()).optional(),
  owner_id: z.string().uuid().optional().nullable(),
  tags: z.array(z.string()).optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data, error } = await supabase
      .from('company_policies')
      .select(`
        *,
        owner:platform_users!owner_id(id, email, full_name),
        approved_by_user:platform_users!approved_by(id, email, full_name),
        created_by_user:platform_users!created_by(id, email, full_name),
        supersedes:company_policies!supersedes_policy_id(id, title, version),
        change_log:policy_change_log(
          id, change_type, previous_version, new_version, change_summary, changed_at,
          changed_by_user:platform_users!changed_by(id, email, full_name)
        )
      `)
      .eq('id', params.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Policy not found' },
          { status: 404 }
        );
      }
      throw error;
    }

    // Get acknowledgment stats
    const { count: totalAcknowledged } = await supabase
      .from('employee_acknowledgments')
      .select('*', { count: 'exact', head: true })
      .eq('policy_id', params.id);

    return NextResponse.json({
      data,
      stats: {
        acknowledged: totalAcknowledged || 0,
      },
    });
  } catch (error) {
    console.error('Error fetching policy:', error);
    return NextResponse.json(
      { error: 'Failed to fetch policy' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const validated = updateSchema.parse(body);

    // If approving, set approved_by and approved_at
    const updateData: Record<string, unknown> = { ...validated };
    if (validated.status === 'approved') {
      updateData.approved_by = user.id;
      updateData.approved_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('company_policies')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Policy not found' },
          { status: 404 }
        );
      }
      throw error;
    }

    return NextResponse.json({ data });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error updating policy:', error);
    return NextResponse.json(
      { error: 'Failed to update policy' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Soft delete by archiving
    const { error } = await supabase
      .from('company_policies')
      .update({ status: 'archived' })
      .eq('id', params.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error archiving policy:', error);
    return NextResponse.json(
      { error: 'Failed to archive policy' },
      { status: 500 }
    );
  }
}
