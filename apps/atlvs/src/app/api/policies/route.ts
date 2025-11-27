import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { z } from 'zod';

const policySchema = z.object({
  policy_code: z.string().max(50).optional(),
  title: z.string().min(1).max(255),
  category: z.string().min(1).max(100),
  description: z.string().optional(),
  content: z.string().optional(),
  content_type: z.enum(['text', 'html', 'markdown', 'pdf']).default('text'),
  document_url: z.string().url().optional(),
  version: z.string().min(1).max(20),
  effective_date: z.string(),
  review_date: z.string().optional(),
  expiration_date: z.string().optional(),
  requires_acknowledgment: z.boolean().default(true),
  acknowledgment_frequency: z.enum(['once', 'annually', 'semi_annually', 'quarterly']).default('once'),
  applies_to_roles: z.array(z.string()).optional(),
  applies_to_departments: z.array(z.string()).optional(),
  owner_id: z.string().uuid().optional(),
  supersedes_policy_id: z.string().uuid().optional(),
  tags: z.array(z.string()).optional(),
});

export async function GET(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const requires_acknowledgment = searchParams.get('requires_acknowledgment');

    let query = supabase
      .from('company_policies')
      .select(`
        *,
        owner:platform_users!owner_id(id, email, full_name),
        approved_by_user:platform_users!approved_by(id, email, full_name),
        supersedes:company_policies!supersedes_policy_id(id, title, version)
      `);

    if (status) {
      query = query.eq('status', status);
    }
    if (category) {
      query = query.eq('category', category);
    }
    if (requires_acknowledgment === 'true') {
      query = query.eq('requires_acknowledgment', true);
    }

    const { data, error } = await query.order('category').order('title');

    if (error) throw error;

    // Get unique categories for filtering
    const { data: categories } = await supabase
      .from('company_policies')
      .select('category')
      .eq('status', 'active');

    const uniqueCategories = [...new Set(categories?.map(c => c.category) || [])];

    return NextResponse.json({ 
      data,
      categories: uniqueCategories,
    });
  } catch (error) {
    console.error('Error fetching policies:', error);
    return NextResponse.json(
      { error: 'Failed to fetch policies' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const supabase = createAdminClient();
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
    const validated = policySchema.parse(body);

    // Check for duplicate policy code
    if (validated.policy_code) {
      const { data: existing } = await supabase
        .from('company_policies')
        .select('id')
        .eq('policy_code', validated.policy_code)
        .single();

      if (existing) {
        return NextResponse.json(
          { error: 'Policy code already exists' },
          { status: 409 }
        );
      }
    }

    const { data, error } = await supabase
      .from('company_policies')
      .insert({
        ...validated,
        status: 'draft',
        created_by: user.id,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error creating policy:', error);
    return NextResponse.json(
      { error: 'Failed to create policy' },
      { status: 500 }
    );
  }
}
