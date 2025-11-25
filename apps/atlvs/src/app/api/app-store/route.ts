import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Third-Party App Store API
 * Marketplace for third-party integrations and extensions
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const category = searchParams.get('category');
    const appId = searchParams.get('app_id');
    const search = searchParams.get('search');

    if (type === 'categories') {
      const categories = [
        { id: 'crm', name: 'CRM & Sales', icon: 'Users', count: 0 },
        { id: 'finance', name: 'Finance & Accounting', icon: 'DollarSign', count: 0 },
        { id: 'marketing', name: 'Marketing & Email', icon: 'Mail', count: 0 },
        { id: 'productivity', name: 'Productivity', icon: 'CheckSquare', count: 0 },
        { id: 'communication', name: 'Communication', icon: 'MessageSquare', count: 0 },
        { id: 'analytics', name: 'Analytics & BI', icon: 'BarChart', count: 0 },
        { id: 'hr', name: 'HR & Payroll', icon: 'Briefcase', count: 0 },
        { id: 'ticketing', name: 'Ticketing & Events', icon: 'Ticket', count: 0 },
        { id: 'streaming', name: 'Streaming & Media', icon: 'Video', count: 0 },
        { id: 'social', name: 'Social Media', icon: 'Share2', count: 0 },
        { id: 'payments', name: 'Payments', icon: 'CreditCard', count: 0 },
        { id: 'developer', name: 'Developer Tools', icon: 'Code', count: 0 }
      ];

      // Get counts
      const { data: apps } = await supabase
        .from('app_store_listings')
        .select('category')
        .eq('status', 'published');

      const counts = (apps || []).reduce((acc: Record<string, number>, app) => {
        acc[app.category] = (acc[app.category] || 0) + 1;
        return acc;
      }, {});

      const categoriesWithCounts = categories.map(c => ({
        ...c,
        count: counts[c.id] || 0
      }));

      return NextResponse.json({ categories: categoriesWithCounts });
    }

    if (type === 'apps') {
      let query = supabase
        .from('app_store_listings')
        .select(`
          *,
          developer:app_developers(id, name, verified),
          reviews:app_reviews(rating)
        `)
        .eq('status', 'published')
        .order('featured', { ascending: false })
        .order('installs', { ascending: false });

      if (category) {
        query = query.eq('category', category);
      }

      if (search) {
        query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
      }

      const { data, error } = await query.limit(50);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Calculate average ratings
      const appsWithRatings = (data || []).map(app => {
        const ratings = app.reviews || [];
        const avgRating = ratings.length > 0
          ? ratings.reduce((sum: number, r: any) => sum + r.rating, 0) / ratings.length
          : 0;
        return {
          ...app,
          avg_rating: Math.round(avgRating * 10) / 10,
          review_count: ratings.length,
          reviews: undefined
        };
      });

      return NextResponse.json({ apps: appsWithRatings });
    }

    if (type === 'app' && appId) {
      const { data, error } = await supabase
        .from('app_store_listings')
        .select(`
          *,
          developer:app_developers(*),
          reviews:app_reviews(*, user:profiles(id, full_name)),
          permissions:app_permissions(*),
          changelog:app_changelog(*)
        `)
        .eq('id', appId)
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ app: data });
    }

    if (type === 'featured') {
      const { data, error } = await supabase
        .from('app_store_listings')
        .select(`
          *,
          developer:app_developers(id, name, verified)
        `)
        .eq('status', 'published')
        .eq('featured', true)
        .limit(10);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ featured_apps: data });
    }

    if (type === 'installed') {
      const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
      if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

      const { data, error } = await supabase
        .from('app_installations')
        .select(`
          *,
          app:app_store_listings(*)
        `)
        .eq('workspace_id', user.id)
        .eq('status', 'active');

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ installed_apps: data });
    }

    if (type === 'developer_apps') {
      const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
      if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

      const { data, error } = await supabase
        .from('app_store_listings')
        .select('*')
        .eq('developer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ developer_apps: data });
    }

    // Default: return summary
    const [totalApps, featuredApps] = await Promise.all([
      supabase.from('app_store_listings').select('id', { count: 'exact', head: true }).eq('status', 'published'),
      supabase.from('app_store_listings').select('id', { count: 'exact', head: true }).eq('featured', true)
    ]);

    return NextResponse.json({
      summary: {
        total_apps: totalApps.count || 0,
        featured_apps: featuredApps.count || 0
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch app store data' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { action } = body;

    if (action === 'install') {
      const { app_id, workspace_id } = body;

      // Check if already installed
      const { data: existing } = await supabase
        .from('app_installations')
        .select('id')
        .eq('app_id', app_id)
        .eq('workspace_id', workspace_id || user.id)
        .single();

      if (existing) {
        return NextResponse.json({ error: 'App already installed' }, { status: 400 });
      }

      // Get app details
      const { data: app } = await supabase
        .from('app_store_listings')
        .select('*')
        .eq('id', app_id)
        .single();

      if (!app) {
        return NextResponse.json({ error: 'App not found' }, { status: 404 });
      }

      // Create installation
      const { data: installation, error } = await supabase
        .from('app_installations')
        .insert({
          app_id,
          workspace_id: workspace_id || user.id,
          installed_by: user.id,
          status: 'active',
          config: {},
          installed_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Increment install count
      await supabase.rpc('increment_app_installs', { app_id });

      return NextResponse.json({ installation }, { status: 201 });
    }

    if (action === 'uninstall') {
      const { app_id, workspace_id } = body;

      const { error } = await supabase
        .from('app_installations')
        .update({ status: 'uninstalled', uninstalled_at: new Date().toISOString() })
        .eq('app_id', app_id)
        .eq('workspace_id', workspace_id || user.id);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true });
    }

    if (action === 'configure') {
      const { installation_id, config } = body;

      const { data, error } = await supabase
        .from('app_installations')
        .update({ config, updated_at: new Date().toISOString() })
        .eq('id', installation_id)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ installation: data });
    }

    if (action === 'review') {
      const { app_id, rating, title, content } = body;

      // Check if user has installed the app
      const { data: installation } = await supabase
        .from('app_installations')
        .select('id')
        .eq('app_id', app_id)
        .eq('installed_by', user.id)
        .single();

      if (!installation) {
        return NextResponse.json({ error: 'Must install app before reviewing' }, { status: 400 });
      }

      const { data, error } = await supabase
        .from('app_reviews')
        .upsert({
          app_id,
          user_id: user.id,
          rating,
          title,
          content,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ review: data });
    }

    if (action === 'submit_app') {
      // Developer submits a new app
      const { name, description, category, icon_url, screenshots, website, support_email, oauth_config, webhook_config, permissions } = body;

      // Get or create developer profile
      let { data: developer } = await supabase
        .from('app_developers')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!developer) {
        const { data: newDev } = await supabase
          .from('app_developers')
          .insert({
            user_id: user.id,
            name: user.email?.split('@')[0] || 'Developer',
            email: user.email,
            verified: false
          })
          .select()
          .single();
        developer = newDev;
      }

      const { data: app, error } = await supabase
        .from('app_store_listings')
        .insert({
          developer_id: developer?.id,
          name,
          description,
          category,
          icon_url,
          screenshots: screenshots || [],
          website,
          support_email,
          oauth_config: oauth_config || {},
          webhook_config: webhook_config || {},
          status: 'pending_review',
          version: '1.0.0'
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Add permissions
      if (permissions && permissions.length > 0) {
        const permRecords = permissions.map((p: string) => ({
          app_id: app.id,
          permission: p
        }));
        await supabase.from('app_permissions').insert(permRecords);
      }

      return NextResponse.json({ app }, { status: 201 });
    }

    if (action === 'update_app') {
      const { app_id, name, description, icon_url, screenshots, website, support_email, version, changelog } = body;

      const { data: app, error } = await supabase
        .from('app_store_listings')
        .update({
          name,
          description,
          icon_url,
          screenshots,
          website,
          support_email,
          version,
          updated_at: new Date().toISOString()
        })
        .eq('id', app_id)
        .eq('developer_id', user.id)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Add changelog entry
      if (changelog) {
        await supabase.from('app_changelog').insert({
          app_id,
          version,
          changes: changelog,
          released_at: new Date().toISOString()
        });
      }

      return NextResponse.json({ app });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process app store request' }, { status: 500 });
  }
}
