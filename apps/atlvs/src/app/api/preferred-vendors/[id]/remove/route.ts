import { withAuth, PlatformRole } from '@ghxstship/config';
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { z } from 'zod';

const removeVendorSchema = z.object({
  vendor_profile_id: z.string().uuid(),
});

const ATLVS_ROLES = [
  PlatformRole.ATLVS_SUPER_ADMIN, PlatformRole.ATLVS_ADMIN, PlatformRole.ATLVS_TEAM_MEMBER, PlatformRole.ATLVS_VIEWER,
  PlatformRole.LEGEND_SUPER_ADMIN, PlatformRole.LEGEND_ADMIN, PlatformRole.LEGEND_DEVELOPER,
];

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

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
