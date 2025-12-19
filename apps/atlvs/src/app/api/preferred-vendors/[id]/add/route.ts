import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { z } from 'zod';

const addVendorSchema = z.object({
  vendor_profile_id: z.string().uuid(),
  priority: z.number().min(1).max(10).optional(),
  notes: z.string().optional(),
  categories: z.array(z.string()).optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createAdminClient();
    const listId = params.id;

    const body = await request.json();
    const validatedData = addVendorSchema.parse(body);

    // Check if list exists
    const { data: list, error: listError } = await supabase
      .from('preferred_vendor_lists')
      .select('id, organization_id')
      .eq('id', listId)
      .single();

    if (listError || !list) {
      return NextResponse.json(
        { error: 'Preferred vendor list not found' },
        { status: 404 }
      );
    }

    // Check if vendor exists
    const { data: vendor, error: vendorError } = await supabase
      .from('vendor_profiles')
      .select('id, name')
      .eq('id', validatedData.vendor_profile_id)
      .single();

    if (vendorError || !vendor) {
      return NextResponse.json(
        { error: 'Vendor not found' },
        { status: 404 }
      );
    }

    // Check if vendor is already in the list
    const { data: existing } = await supabase
      .from('preferred_vendor_list_items')
      .select('id')
      .eq('list_id', listId)
      .eq('vendor_profile_id', validatedData.vendor_profile_id)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'Vendor is already in this list' },
        { status: 409 }
      );
    }

    // Add vendor to list
    const { data: item, error: insertError } = await supabase
      .from('preferred_vendor_list_items')
      .insert({
        list_id: listId,
        vendor_profile_id: validatedData.vendor_profile_id,
        priority: validatedData.priority || 5,
        notes: validatedData.notes || null,
        categories: validatedData.categories || null,
        added_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      })
      .select(`
        id,
        priority,
        notes,
        categories,
        added_at,
        vendor_profile:vendor_profiles(id, name, company_name, rating)
      `)
      .single();

    if (insertError) {
      return NextResponse.json(
        { error: 'Failed to add vendor to list' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      item,
      message: `${vendor.name} added to preferred vendor list`,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
