export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

interface Contact {
  id: string;
  organization_id: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  company?: string;
  created_at: string;
}

interface DuplicateGroup {
  match_type: 'email' | 'phone' | 'name';
  match_value: string;
  confidence: number;
  contacts: Contact[];
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { searchParams } = new URL(request.url);
    
    const orgId = searchParams.get('organization_id');
    
    if (!orgId) {
      return NextResponse.json({ error: 'organization_id required' }, { status: 400 });
    }

    const { data: contacts, error } = await supabase
      .from('contacts')
      .select('*')
      .eq('organization_id', orgId)
      .order('created_at', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const duplicateGroups: DuplicateGroup[] = [];
    const processedIds = new Set<string>();

    const emailMap = new Map<string, Contact[]>();
    const phoneMap = new Map<string, Contact[]>();
    const nameMap = new Map<string, Contact[]>();

    for (const contact of contacts || []) {
      if (contact.email) {
        const normalizedEmail = contact.email.toLowerCase().trim();
        if (!emailMap.has(normalizedEmail)) {
          emailMap.set(normalizedEmail, []);
        }
        emailMap.get(normalizedEmail)!.push(contact);
      }

      if (contact.phone) {
        const normalizedPhone = contact.phone.replace(/\D/g, '');
        if (normalizedPhone.length >= 10) {
          const phoneKey = normalizedPhone.slice(-10);
          if (!phoneMap.has(phoneKey)) {
            phoneMap.set(phoneKey, []);
          }
          phoneMap.get(phoneKey)!.push(contact);
        }
      }

      if (contact.first_name && contact.last_name) {
        const nameKey = `${contact.first_name.toLowerCase().trim()}_${contact.last_name.toLowerCase().trim()}`;
        if (!nameMap.has(nameKey)) {
          nameMap.set(nameKey, []);
        }
        nameMap.get(nameKey)!.push(contact);
      }
    }

    for (const [email, group] of emailMap) {
      if (group.length > 1) {
        const ids = group.map(c => c.id).sort().join(',');
        if (!processedIds.has(ids)) {
          processedIds.add(ids);
          duplicateGroups.push({
            match_type: 'email',
            match_value: email,
            confidence: 0.95,
            contacts: group,
          });
        }
      }
    }

    for (const [phone, group] of phoneMap) {
      if (group.length > 1) {
        const ids = group.map(c => c.id).sort().join(',');
        if (!processedIds.has(ids)) {
          processedIds.add(ids);
          duplicateGroups.push({
            match_type: 'phone',
            match_value: phone,
            confidence: 0.85,
            contacts: group,
          });
        }
      }
    }

    for (const [name, group] of nameMap) {
      if (group.length > 1) {
        const ids = group.map(c => c.id).sort().join(',');
        if (!processedIds.has(ids)) {
          processedIds.add(ids);
          duplicateGroups.push({
            match_type: 'name',
            match_value: name.replace('_', ' '),
            confidence: 0.7,
            contacts: group,
          });
        }
      }
    }

    duplicateGroups.sort((a, b) => b.confidence - a.confidence);

    return NextResponse.json({
      duplicate_groups: duplicateGroups,
      total_groups: duplicateGroups.length,
      total_duplicates: duplicateGroups.reduce((sum, g) => sum + g.contacts.length - 1, 0),
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
