export const dynamic = 'force-dynamic';

import { withAuth, PlatformRole } from '@ghxstship/config';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const mergeContactsSchema = z.object({
  primary_contact_id: z.string().uuid(),
  secondary_contact_ids: z.array(z.string().uuid()).min(1),
  merge_strategy: z.enum(['keep_primary', 'keep_newest', 'merge_fields']).default('keep_primary'),
});

const ATLVS_ROLES = [
  PlatformRole.ATLVS_SUPER_ADMIN, PlatformRole.ATLVS_ADMIN, PlatformRole.ATLVS_TEAM_MEMBER, PlatformRole.ATLVS_VIEWER,
  PlatformRole.LEGEND_SUPER_ADMIN, PlatformRole.LEGEND_ADMIN, PlatformRole.LEGEND_DEVELOPER,
];

export async function POST(request: NextRequest) {
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const body = await request.json();
    const { primary_contact_id, secondary_contact_ids, merge_strategy } = mergeContactsSchema.parse(body);

    const { data: primaryContact, error: primaryError } = await supabase
      .from('contacts')
      .select('*')
      .eq('id', primary_contact_id)
      .single();

    if (primaryError || !primaryContact) {
      return NextResponse.json({ error: 'Primary contact not found' }, { status: 404 });
    }

    const { data: secondaryContacts, error: secondaryError } = await supabase
      .from('contacts')
      .select('*')
      .in('id', secondary_contact_ids);

    if (secondaryError || !secondaryContacts?.length) {
      return NextResponse.json({ error: 'Secondary contacts not found' }, { status: 404 });
    }

    let mergedData = { ...primaryContact };

    if (merge_strategy === 'merge_fields') {
      for (const secondary of secondaryContacts) {
        for (const [key, value] of Object.entries(secondary)) {
          if (value && !mergedData[key]) {
            mergedData[key] = value;
          }
        }
      }
    } else if (merge_strategy === 'keep_newest') {
      const allContacts = [primaryContact, ...secondaryContacts];
      allContacts.sort((a, b) => new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime());
      mergedData = { ...allContacts[0], id: primary_contact_id };
    }

    const relatedTables = [
      { table: 'leads', column: 'contact_id' },
      { table: 'bookings', column: 'contact_id' },
      { table: 'proposals', column: 'contact_id' },
      { table: 'contact_interactions', column: 'contact_id' },
    ];

    for (const { table, column } of relatedTables) {
      await supabase
        .from(table)
        .update({ [column]: primary_contact_id })
        .in(column, secondary_contact_ids);
    }

    const { data: updatedContact, error: updateError } = await supabase
      .from('contacts')
      .update({
        first_name: mergedData.first_name,
        last_name: mergedData.last_name,
        email: mergedData.email,
        phone: mergedData.phone,
        company: mergedData.company,
        metadata: {
          ...mergedData.metadata,
          merged_from: secondary_contact_ids,
          merged_at: new Date().toISOString(),
        },
      })
      .eq('id', primary_contact_id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    await supabase
      .from('contacts')
      .delete()
      .in('id', secondary_contact_ids);

    return NextResponse.json({
      contact: updatedContact,
      merged_count: secondary_contact_ids.length,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 422 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
