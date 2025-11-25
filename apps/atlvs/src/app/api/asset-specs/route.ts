import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const AssetSpecSchema = z.object({
  asset_id: z.string().uuid().optional(),
  category: z.string(),
  name: z.string(),
  manufacturer: z.string().optional(),
  model: z.string().optional(),
  specifications: z.record(z.any()),
  technical_docs: z.array(z.object({
    name: z.string(),
    url: z.string().url(),
    type: z.enum(['manual', 'datasheet', 'diagram', 'video', 'other']),
  })).optional(),
  power_requirements: z.object({
    voltage: z.number().optional(),
    amperage: z.number().optional(),
    wattage: z.number().optional(),
    connector_type: z.string().optional(),
  }).optional(),
  dimensions: z.object({
    length: z.number().optional(),
    width: z.number().optional(),
    height: z.number().optional(),
    weight: z.number().optional(),
    unit: z.enum(['metric', 'imperial']).default('imperial'),
  }).optional(),
  tags: z.array(z.string()).optional(),
});

// GET /api/asset-specs - Get asset specifications library
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const assetId = searchParams.get('asset_id');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('asset_specifications')
      .select(`
        *,
        technical_documents:asset_technical_documents(*)
      `, { count: 'exact' })
      .order('name')
      .range(offset, offset + limit - 1);

    if (category) {
      query = query.eq('category', category);
    }

    if (assetId) {
      query = query.eq('asset_id', assetId);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,manufacturer.ilike.%${search}%,model.ilike.%${search}%`);
    }

    const { data: specs, error, count } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Get categories for filtering
    const { data: categories } = await supabase
      .from('asset_specifications')
      .select('category')
      .order('category');

    const uniqueCategories = [...new Set(categories?.map(c => c.category))];

    return NextResponse.json({
      specifications: specs || [],
      total: count || 0,
      categories: uniqueCategories,
      limit,
      offset,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch asset specifications' }, { status: 500 });
  }
}

// POST /api/asset-specs - Create asset specification
export async function POST(request: NextRequest) {
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
    const validated = AssetSpecSchema.parse(body);

    const { data: spec, error } = await supabase
      .from('asset_specifications')
      .insert({
        asset_id: validated.asset_id,
        category: validated.category,
        name: validated.name,
        manufacturer: validated.manufacturer,
        model: validated.model,
        specifications: validated.specifications,
        power_requirements: validated.power_requirements,
        dimensions: validated.dimensions,
        tags: validated.tags,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Add technical documents if provided
    if (validated.technical_docs && validated.technical_docs.length > 0) {
      await supabase.from('asset_technical_documents').insert(
        validated.technical_docs.map(doc => ({
          specification_id: spec.id,
          name: doc.name,
          url: doc.url,
          type: doc.type,
          created_by: user.id,
        }))
      );
    }

    return NextResponse.json({ specification: spec }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create asset specification' }, { status: 500 });
  }
}

// PATCH /api/asset-specs - Update asset specification
export async function PATCH(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const specId = searchParams.get('id');

    if (!specId) {
      return NextResponse.json({ error: 'Specification ID required' }, { status: 400 });
    }

    const body = await request.json();

    const { data: spec, error } = await supabase
      .from('asset_specifications')
      .update({
        ...body,
        updated_at: new Date().toISOString(),
        updated_by: user.id,
      })
      .eq('id', specId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ specification: spec });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update asset specification' }, { status: 500 });
  }
}

// DELETE /api/asset-specs - Delete asset specification
export async function DELETE(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const specId = searchParams.get('id');

    if (!specId) {
      return NextResponse.json({ error: 'Specification ID required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('asset_specifications')
      .delete()
      .eq('id', specId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete asset specification' }, { status: 500 });
  }
}
