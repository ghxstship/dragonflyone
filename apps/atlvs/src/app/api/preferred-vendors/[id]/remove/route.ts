import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { z } from 'zod';

const removeVendorSchema = z.object({
  vendor_profile_id: z.string().uuid(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createAdminClient();
    const listId = params.id;

    const body = await request.json();
    const validatedData = removeVendorSchema.parse(body);

    // Check if list exists
    const { data: list, error: listError } = await supabase
      .from('preferred_vendor_lists')
      .select('id')
      .eq('id', listId)
      .single();

    if (listError || !list) {
      return NextResponse.json(
        { error: 'Preferred vendor list not found' },
        { status: 404 }
      );
    }

    // Remove vendor from list
    const { error: deleteError } = await supabase
      .from('preferred_vendor_list_items')
      .delete()
      .eq('list_id', listId)
      .eq('vendor_profile_id', validatedData.vendor_profile_id);

    if (deleteError) {
      return NextResponse.json(
        { error: 'Failed to remove vendor from list' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Vendor removed from preferred vendor list',
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
