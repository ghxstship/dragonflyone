import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';

// GET /api/zapier/search - Search for records
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const entityType = searchParams.get('entity_type');
    const query = searchParams.get('query');
    const limit = parseInt(searchParams.get('limit') || '25');

    if (!entityType) {
      // Return available search types
      const searchTypes = [
        {
          key: 'contacts',
          name: 'Search Contacts',
          description: 'Find contacts by name, email, or company',
          searchable_fields: ['first_name', 'last_name', 'email', 'company'],
        },
        {
          key: 'deals',
          name: 'Search Deals',
          description: 'Find deals by name, stage, or value',
          searchable_fields: ['name', 'stage', 'value'],
        },
        {
          key: 'assets',
          name: 'Search Assets',
          description: 'Find assets by name, type, or serial number',
          searchable_fields: ['name', 'asset_type', 'serial_number'],
        },
        {
          key: 'events',
          name: 'Search Events',
          description: 'Find events by name, venue, or date',
          searchable_fields: ['name', 'venue_name', 'event_date'],
        },
        {
          key: 'projects',
          name: 'Search Projects',
          description: 'Find projects by name or status',
          searchable_fields: ['name', 'status'],
        },
        {
          key: 'vendors',
          name: 'Search Vendors',
          description: 'Find vendors by name or type',
          searchable_fields: ['name', 'vendor_type'],
        },
        {
          key: 'invoices',
          name: 'Search Invoices',
          description: 'Find invoices by number or contact',
          searchable_fields: ['invoice_number', 'contact_id'],
        },
        {
          key: 'crew',
          name: 'Search Crew Members',
          description: 'Find crew members by name or skill',
          searchable_fields: ['first_name', 'last_name', 'skills'],
        },
      ];

      return NextResponse.json({ search_types: searchTypes });
    }

    // Perform search based on entity type
    let results: any[] = [];

    switch (entityType) {
      case 'contacts': {
        let searchQuery = supabase
          .from('contacts')
          .select('id, first_name, last_name, email, phone, company')
          .limit(limit);

        if (query) {
          searchQuery = searchQuery.or(
            `first_name.ilike.%${query}%,last_name.ilike.%${query}%,email.ilike.%${query}%,company.ilike.%${query}%`
          );
        }

        const { data } = await searchQuery;
        results = data || [];
        break;
      }

      case 'deals': {
        let searchQuery = supabase
          .from('deals')
          .select('id, name, value, stage, contact_id, created_at')
          .limit(limit);

        if (query) {
          searchQuery = searchQuery.or(`name.ilike.%${query}%,stage.ilike.%${query}%`);
        }

        const { data } = await searchQuery;
        results = data || [];
        break;
      }

      case 'assets': {
        let searchQuery = supabase
          .from('assets')
          .select('id, name, asset_type, serial_number, status, location')
          .limit(limit);

        if (query) {
          searchQuery = searchQuery.or(
            `name.ilike.%${query}%,asset_type.ilike.%${query}%,serial_number.ilike.%${query}%`
          );
        }

        const { data } = await searchQuery;
        results = data || [];
        break;
      }

      case 'events': {
        let searchQuery = supabase
          .from('events')
          .select('id, name, venue_name, event_date, status')
          .limit(limit);

        if (query) {
          searchQuery = searchQuery.or(`name.ilike.%${query}%,venue_name.ilike.%${query}%`);
        }

        const { data } = await searchQuery;
        results = data || [];
        break;
      }

      case 'projects': {
        let searchQuery = supabase
          .from('projects')
          .select('id, name, status, start_date, end_date, budget')
          .limit(limit);

        if (query) {
          searchQuery = searchQuery.or(`name.ilike.%${query}%,status.ilike.%${query}%`);
        }

        const { data } = await searchQuery;
        results = data || [];
        break;
      }

      case 'vendors': {
        let searchQuery = supabase
          .from('vendors')
          .select('id, name, vendor_type, contact_email, phone')
          .limit(limit);

        if (query) {
          searchQuery = searchQuery.or(`name.ilike.%${query}%,vendor_type.ilike.%${query}%`);
        }

        const { data } = await searchQuery;
        results = data || [];
        break;
      }

      case 'invoices': {
        let searchQuery = supabase
          .from('invoices')
          .select('id, invoice_number, contact_id, total_amount, status, due_date')
          .limit(limit);

        if (query) {
          searchQuery = searchQuery.or(`invoice_number.ilike.%${query}%`);
        }

        const { data } = await searchQuery;
        results = data || [];
        break;
      }

      case 'crew': {
        let searchQuery = supabase
          .from('platform_users')
          .select('id, first_name, last_name, email, skills')
          .limit(limit);

        if (query) {
          searchQuery = searchQuery.or(
            `first_name.ilike.%${query}%,last_name.ilike.%${query}%,email.ilike.%${query}%`
          );
        }

        const { data } = await searchQuery;
        results = data || [];
        break;
      }

      default:
        return NextResponse.json({ error: 'Unknown entity type' }, { status: 400 });
    }

    return NextResponse.json({
      entity_type: entityType,
      query,
      results,
      count: results.length,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
