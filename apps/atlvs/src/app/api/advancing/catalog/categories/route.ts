import { withAuth, PlatformRole, log as logger } from '@ghxstship/config';
// apps/atlvs/src/app/api/advancing/catalog/categories/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

/**
 * GET /api/advancing/catalog/categories
 * Get unique categories and subcategories from catalog
 */
const ATLVS_ROLES = [
  PlatformRole.ATLVS_SUPER_ADMIN, PlatformRole.ATLVS_ADMIN, PlatformRole.ATLVS_TEAM_MEMBER, PlatformRole.ATLVS_VIEWER,
  PlatformRole.LEGEND_SUPER_ADMIN, PlatformRole.LEGEND_ADMIN, PlatformRole.LEGEND_DEVELOPER,
];

export async function GET(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get all categories with their subcategories
    const { data, error } = await supabase
      .from('production_advancing_catalog')
      .select('category, subcategory')
      .eq('enabled', true);

    if (error) {
      logger.error('Error fetching categories:', error);
      return NextResponse.json(
        { error: 'Failed to fetch categories', details: error.message },
        { status: 500 }
      );
    }

    // Type for catalog items
    type CatalogItem = { category: string; subcategory: string };
    const typedData = data as CatalogItem[];

    // Group by category and collect subcategories
    const categoriesMap = new Map<string, Set<string>>();

    typedData.forEach((item) => {
      if (!categoriesMap.has(item.category)) {
        categoriesMap.set(item.category, new Set());
      }
      categoriesMap.get(item.category)!.add(item.subcategory);
    });

    // Convert to structured format
    const categories = Array.from(categoriesMap.entries()).map(
      ([category, subcategories]) => ({
        category,
        subcategories: Array.from(subcategories).sort(),
      })
    );

    // Sort by category name
    categories.sort((a, b) => a.category.localeCompare(b.category));

    return NextResponse.json({ data: categories });
  } catch (error) {
    logger.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
