import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@ghxstship/config';
import { z } from 'zod';

const EquipmentSpecSchema = z.object({
  name: z.string(),
  manufacturer: z.string(),
  model: z.string(),
  category: z.string(),
  subcategory: z.string().optional(),
  description: z.string().optional(),
  specifications: z.record(z.any()),
  power_requirements: z.object({
    voltage: z.string().optional(),
    amperage: z.string().optional(),
    wattage: z.string().optional(),
    connector_type: z.string().optional(),
  }).optional(),
  dimensions: z.object({
    width: z.number().optional(),
    height: z.number().optional(),
    depth: z.number().optional(),
    weight: z.number().optional(),
    unit: z.enum(['inches', 'cm', 'mm']).optional(),
    weight_unit: z.enum(['lbs', 'kg']).optional(),
  }).optional(),
  images: z.array(z.string()).optional(),
  manuals: z.array(z.object({
    title: z.string(),
    url: z.string(),
    type: z.enum(['user_manual', 'quick_start', 'service_manual', 'datasheet']),
  })).optional(),
  tags: z.array(z.string()).optional(),
});

// GET /api/equipment-specs - Get equipment specifications
export async function GET(request: NextRequest) {
  const supabase = getServerSupabase();
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
    const specId = searchParams.get('spec_id');
    const category = searchParams.get('category');
    const manufacturer = searchParams.get('manufacturer');
    const action = searchParams.get('action');

    if (action === 'categories') {
      const { data: categories } = await supabase
        .from('equipment_specs')
        .select('category')
        .eq('status', 'published');

      const uniqueCategories = Array.from(new Set(categories?.map(c => c.category) || []));

      return NextResponse.json({ categories: uniqueCategories });
    }

    if (action === 'manufacturers') {
      let query = supabase
        .from('equipment_specs')
        .select('manufacturer')
        .eq('status', 'published');

      if (category) {
        query = query.eq('category', category);
      }

      const { data: manufacturers } = await query;
      const uniqueManufacturers = Array.from(new Set(manufacturers?.map(m => m.manufacturer) || []));

      return NextResponse.json({ manufacturers: uniqueManufacturers });
    }

    if (action === 'search') {
      const query = searchParams.get('q');
      if (!query) {
        return NextResponse.json({ error: 'Search query required' }, { status: 400 });
      }

      const { data: results } = await supabase
        .from('equipment_specs')
        .select('id, name, manufacturer, model, category, images')
        .eq('status', 'published')
        .or(`name.ilike.%${query}%,manufacturer.ilike.%${query}%,model.ilike.%${query}%,tags.cs.{${query}}`)
        .limit(30);

      return NextResponse.json({ results: results || [] });
    }

    if (action === 'compare') {
      const ids = searchParams.get('ids')?.split(',');
      if (!ids || ids.length < 2) {
        return NextResponse.json({ error: 'At least 2 IDs required for comparison' }, { status: 400 });
      }

      const { data: specs } = await supabase
        .from('equipment_specs')
        .select('*')
        .in('id', ids);

      // Extract common specification keys
      const allKeys = new Set<string>();
      specs?.forEach(spec => {
        Object.keys(spec.specifications || {}).forEach(key => allKeys.add(key));
      });

      const comparison = {
        items: specs,
        specification_keys: Array.from(allKeys),
      };

      return NextResponse.json({ comparison });
    }

    if (action === 'recent') {
      const { data: recent } = await supabase
        .from('equipment_specs')
        .select('id, name, manufacturer, model, category, images, created_at')
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(10);

      return NextResponse.json({ recent: recent || [] });
    }

    if (action === 'popular') {
      const { data: popular } = await supabase
        .from('equipment_specs')
        .select('id, name, manufacturer, model, category, images, view_count')
        .eq('status', 'published')
        .order('view_count', { ascending: false })
        .limit(10);

      return NextResponse.json({ popular: popular || [] });
    }

    if (specId) {
      const { data: spec } = await supabase
        .from('equipment_specs')
        .select('*')
        .eq('id', specId)
        .single();

      if (!spec) {
        return NextResponse.json({ error: 'Specification not found' }, { status: 404 });
      }

      // Increment view count
      await supabase
        .from('equipment_specs')
        .update({ view_count: (spec.view_count || 0) + 1 })
        .eq('id', specId);

      // Get related equipment
      const { data: related } = await supabase
        .from('equipment_specs')
        .select('id, name, manufacturer, model, images')
        .eq('category', spec.category)
        .neq('id', specId)
        .eq('status', 'published')
        .limit(5);

      return NextResponse.json({
        spec,
        related: related || [],
      });
    }

    // List equipment specs
    let query = supabase
      .from('equipment_specs')
      .select('id, name, manufacturer, model, category, subcategory, images, created_at')
      .eq('status', 'published')
      .order('name');

    if (category) {
      query = query.eq('category', category);
    }
    if (manufacturer) {
      query = query.eq('manufacturer', manufacturer);
    }

    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    query = query.range(offset, offset + limit - 1);

    const { data: specs, count } = await query;

    return NextResponse.json({
      specs: specs || [],
      total: count || 0,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch equipment specs' }, { status: 500 });
  }
}

// POST /api/equipment-specs - Create or manage specs
export async function POST(request: NextRequest) {
  const supabase = getServerSupabase();
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
    const action = body.action || 'create';

    if (action === 'create') {
      const validated = EquipmentSpecSchema.parse(body);

      const { data: spec, error } = await supabase
        .from('equipment_specs')
        .insert({
          ...validated,
          status: 'draft',
          created_by: user.id,
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ spec }, { status: 201 });
    } else if (action === 'publish') {
      const { spec_id } = body;

      const { data: spec, error } = await supabase
        .from('equipment_specs')
        .update({
          status: 'published',
          published_at: new Date().toISOString(),
        })
        .eq('id', spec_id)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ spec });
    } else if (action === 'add_to_favorites') {
      const { spec_id } = body;

      const { data: favorite, error } = await supabase
        .from('equipment_favorites')
        .upsert({
          user_id: user.id,
          spec_id,
        }, { onConflict: 'user_id,spec_id' })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ favorite });
    } else if (action === 'remove_from_favorites') {
      const { spec_id } = body;

      const { error } = await supabase
        .from('equipment_favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('spec_id', spec_id);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true });
    } else if (action === 'request_spec') {
      // Request a new equipment spec to be added
      const { equipment_name, manufacturer, model, notes } = body;

      const { data: request, error } = await supabase
        .from('equipment_spec_requests')
        .insert({
          equipment_name,
          manufacturer,
          model,
          notes,
          requested_by: user.id,
          status: 'pending',
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ request }, { status: 201 });
    } else if (action === 'submit_correction') {
      const { spec_id, field, current_value, suggested_value, notes } = body;

      const { data: correction, error } = await supabase
        .from('equipment_spec_corrections')
        .insert({
          spec_id,
          field,
          current_value,
          suggested_value,
          notes,
          submitted_by: user.id,
          status: 'pending',
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ correction }, { status: 201 });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}

// PATCH /api/equipment-specs - Update spec
export async function PATCH(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const specId = searchParams.get('spec_id');

    if (!specId) {
      return NextResponse.json({ error: 'Spec ID required' }, { status: 400 });
    }

    const body = await request.json();

    const { data: spec, error } = await supabase
      .from('equipment_specs')
      .update({
        ...body,
        updated_at: new Date().toISOString(),
      })
      .eq('id', specId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ spec });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update spec' }, { status: 500 });
  }
}
