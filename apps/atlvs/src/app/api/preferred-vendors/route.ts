import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { z } from 'zod';

// Validation schemas
const preferredVendorSchema = z.object({
  vendor_id: z.string().uuid(),
  category: z.string().min(1),
  priority: z.number().min(1).default(1),
  negotiated_discount: z.number().min(0).max(100).optional(),
  contract_id: z.string().uuid().optional(),
  valid_from: z.string().datetime().optional(),
  valid_to: z.string().datetime().optional(),
  notes: z.string().optional(),
});

// GET - Get preferred vendors
export async function GET(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'all' | 'category' | 'vendor' | 'matrix'
    const category = searchParams.get('category');
    const vendorId = searchParams.get('vendor_id');

    if (type === 'category' && category) {
      const { data: preferred, error } = await supabase
        .from('preferred_vendors')
        .select(`
          *,
          vendor:vendors(id, name, email, phone, rating),
          contract:contracts(id, name, end_date)
        `)
        .eq('category', category)
        .eq('status', 'active')
        .order('priority', { ascending: true });

      if (error) throw error;

      return NextResponse.json({
        preferred_vendors: preferred,
        category,
      });
    }

    if (type === 'vendor' && vendorId) {
      const { data: categories, error } = await supabase
        .from('preferred_vendors')
        .select(`
          *,
          contract:contracts(id, name, end_date)
        `)
        .eq('vendor_id', vendorId)
        .eq('status', 'active');

      if (error) throw error;

      return NextResponse.json({
        vendor_id: vendorId,
        preferred_categories: categories,
      });
    }

    if (type === 'matrix') {
      // Get preferred vendor matrix by category
      const { data: preferred, error } = await supabase
        .from('preferred_vendors')
        .select(`
          category,
          priority,
          negotiated_discount,
          vendor:vendors(id, name, rating)
        `)
        .eq('status', 'active')
        .order('category', { ascending: true })
        .order('priority', { ascending: true });

      if (error) throw error;

      // Group by category
      const matrix = preferred?.reduce((acc: Record<string, any[]>, p) => {
        if (!acc[p.category]) acc[p.category] = [];
        acc[p.category].push({
          vendor: p.vendor,
          priority: p.priority,
          discount: p.negotiated_discount,
        });
        return acc;
      }, {});

      return NextResponse.json({
        matrix,
        categories: Object.keys(matrix || {}),
      });
    }

    // Default: return all preferred vendors
    const { data: preferred, error } = await supabase
      .from('preferred_vendors')
      .select(`
        *,
        vendor:vendors(id, name, email, rating),
        contract:contracts(id, name, end_date)
      `)
      .eq('status', 'active')
      .order('category', { ascending: true })
      .order('priority', { ascending: true });

    if (error) throw error;

    // Get categories
    const categories = [...new Set(preferred?.map(p => p.category))];

    return NextResponse.json({
      preferred_vendors: preferred,
      categories,
      total: preferred?.length || 0,
    });
  } catch (error: any) {
    console.error('Preferred vendors error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Add preferred vendor
export async function POST(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const body = await request.json();
    const validated = preferredVendorSchema.parse(body);

    // Check if vendor is already preferred for this category
    const { data: existing } = await supabase
      .from('preferred_vendors')
      .select('id')
      .eq('vendor_id', validated.vendor_id)
      .eq('category', validated.category)
      .eq('status', 'active')
      .single();

    if (existing) {
      return NextResponse.json({ 
        error: 'Vendor is already preferred for this category' 
      }, { status: 409 });
    }

    const { data: preferred, error } = await supabase
      .from('preferred_vendors')
      .insert({
        ...validated,
        status: 'active',
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ preferred_vendor: preferred }, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    console.error('Preferred vendors error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH - Update preferred vendor
export async function PATCH(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    const { data: preferred, error } = await supabase
      .from('preferred_vendors')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ preferred_vendor: preferred });
  } catch (error: any) {
    console.error('Preferred vendors error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Remove preferred vendor
export async function DELETE(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('preferred_vendors')
      .update({ status: 'inactive' })
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Preferred vendors error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
