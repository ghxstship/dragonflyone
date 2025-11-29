'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { CompvssAppLayout } from '../../../components/app-layout';
import { useAdvancingCatalog } from '@/hooks/useAdvancingCatalog';
import { 
  Container, 
  H3, 
  Body, 
  Button, 
  Input, 
  Card, 
  Grid, 
  Badge, 
  Spinner, 
  Alert,
  Stack,
  EmptyState,
  Select,
  Field,
  EnterprisePageHeader,
  MainContent,
} from '@ghxstship/ui';
import type { ProductionCatalogItem } from '@ghxstship/config/types/advancing';
import { Search, Package, Filter, X } from 'lucide-react';

export default function CatalogPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>();
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>();
  const [selectedItems, setSelectedItems] = useState<ProductionCatalogItem[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const { data, isLoading, error } = useAdvancingCatalog({
    search: searchTerm,
    category: selectedCategory,
    subcategory: selectedSubcategory,
    limit: 100,
  });

  // Extract unique subcategories from current category
  const subcategories = useMemo(() => {
    if (!data?.items || !selectedCategory) return [];
    const subs = new Set<string>();
    data.items.forEach(item => {
      if (item.category === selectedCategory && item.subcategory) {
        subs.add(item.subcategory);
      }
    });
    return Array.from(subs).sort();
  }, [data?.items, selectedCategory]);

  const clearFilters = () => {
    setSelectedCategory(undefined);
    setSelectedSubcategory(undefined);
    setSearchTerm('');
  };

  const activeFilterCount = [selectedCategory, selectedSubcategory, searchTerm].filter(Boolean).length;

  const toggleItemSelection = (item: ProductionCatalogItem) => {
    setSelectedItems(prev => {
      const exists = prev.find(i => i.id === item.id);
      if (exists) {
        return prev.filter(i => i.id !== item.id);
      }
      return [...prev, item];
    });
  };

  const isSelected = (itemId: string) => selectedItems.some(i => i.id === itemId);

  if (error) {
    return (
      <CompvssAppLayout>
        <MainContent padding="lg">
          <Container>
            <Alert variant="error" title="Error Loading Catalog">
              {error.message}
            </Alert>
          </Container>
        </MainContent>
      </CompvssAppLayout>
    );
  }

  return (
    <CompvssAppLayout>
      <EnterprisePageHeader
        title="Production Advancing Catalog"
        subtitle={`Browse ${data?.total || 329} standardized production items across all categories`}
        breadcrumbs={[{ label: 'COMPVSS', href: '/dashboard' }, { label: 'Advancing', href: '/advancing' }, { label: 'Catalog' }]}
        views={[{ id: 'default', label: 'Default', icon: 'grid' }]}
        activeView="default"
        showFavorite
        showSettings
      />
      <MainContent padding="lg">
        <Container>
          {/* Header Actions */}
          <Stack direction="horizontal" className="mb-8 items-start justify-end">
            <Stack direction="horizontal" gap={3}>
              {selectedItems.length > 0 && (
                <Button onClick={() => {
                  const itemsParam = encodeURIComponent(JSON.stringify(selectedItems.map(i => i.id)));
                  router.push(`/advancing/new?items=${itemsParam}`);
                }}>
                  CREATE ADVANCE ({selectedItems.length})
                </Button>
              )}
              <Button variant="outline" onClick={() => router.push('/advancing')}>
                VIEW REQUESTS
              </Button>
            </Stack>
          </Stack>

          {/* Search and Filters */}
          <Card className="mb-8">
            <Stack direction="horizontal" gap={4} className="mb-4">
              <Stack className="relative flex-1">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2" />
                <Input
                  placeholder="Search catalog items by name, ID, or specification..."
                  value={searchTerm}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </Stack>
              <Button
                variant={showFilters ? 'solid' : 'outline'}
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="mr-2 size-4" />
                FILTERS {activeFilterCount > 0 && `(${activeFilterCount})`}
              </Button>
              {activeFilterCount > 0 && (
                <Button variant="ghost" onClick={clearFilters}>
                  <X className="mr-2 size-4" />
                  CLEAR
                </Button>
              )}
            </Stack>

            {/* Category Pills */}
            <Stack direction="horizontal" className="mb-4 flex-wrap gap-2">
              <Badge
                variant={!selectedCategory ? 'solid' : 'outline'}
                onClick={() => {
                  setSelectedCategory(undefined);
                  setSelectedSubcategory(undefined);
                }}
              >
                ALL CATEGORIES
              </Badge>
              {data?.categories && data.categories.map((category) => (
                <Badge
                  key={category}
                  variant={selectedCategory === category ? 'solid' : 'outline'}
                  onClick={() => {
                    setSelectedCategory(selectedCategory === category ? undefined : category);
                    setSelectedSubcategory(undefined);
                  }}
                >
                  {category.toUpperCase()}
                </Badge>
              ))}
            </Stack>

            {/* Subcategory Pills - Show when category is selected */}
            {selectedCategory && subcategories.length > 0 && (
              <Stack gap={2}>
                <Body className="text-body-sm">SUBCATEGORIES:</Body>
                <Stack direction="horizontal" className="flex-wrap gap-2">
                  <Badge
                    variant={!selectedSubcategory ? 'solid' : 'outline'}
                    onClick={() => setSelectedSubcategory(undefined)}
                  >
                    ALL
                  </Badge>
                  {subcategories.map((sub) => (
                    <Badge
                      key={sub}
                      variant={selectedSubcategory === sub ? 'solid' : 'outline'}
                      onClick={() => setSelectedSubcategory(selectedSubcategory === sub ? undefined : sub)}
                    >
                      {sub.toUpperCase()}
                    </Badge>
                  ))}
                </Stack>
              </Stack>
            )}

            {/* Advanced Filters Panel */}
            {showFilters && (
              <Stack gap={4} className="mt-4 pt-4">
                <Grid cols={3} gap={4}>
                  <Field label="View Mode">
                    <Select value={viewMode} onChange={(e) => setViewMode(e.target.value as 'grid' | 'list')}>
                      <option value="grid">Grid View</option>
                      <option value="list">List View</option>
                    </Select>
                  </Field>
                </Grid>
              </Stack>
            )}
          </Card>

          {/* Catalog Grid */}
          {isLoading ? (
            <Stack className="items-center justify-center py-12">
              <Spinner />
            </Stack>
          ) : data?.items && data.items.length > 0 ? (
            <Grid cols={3} gap={6} className="mb-8">
              {data.items.map((item) => (
                <Card
                  key={item.id}
                  onClick={() => toggleItemSelection(item)}
                >
                  <Stack direction="horizontal" className="mb-3 items-start justify-between">
                    <Stack direction="horizontal" gap={2} className="items-center">
                      <Package className="size-4" />
                      <Body className="text-body-sm">
                        {item.item_id}
                      </Body>
                    </Stack>
                    {isSelected(item.id) && (
                      <Badge variant="solid">SELECTED</Badge>
                    )}
                  </Stack>

                  <H3 className="mb-2">{item.item_name}</H3>
                  
                  <Stack direction="horizontal" gap={2} className="mb-3 items-center">
                    <Badge variant="outline">
                      {item.category.toUpperCase()}
                    </Badge>
                    <Badge variant="outline">
                      {item.subcategory.toUpperCase()}
                    </Badge>
                  </Stack>

                  {item.specifications && (
                    <Body className="mb-3 line-clamp-2 text-body-sm">
                      {item.specifications}
                    </Body>
                  )}

                  <Stack direction="horizontal" gap={1}>
                    <Body className="text-body-sm">Unit:</Body>
                    <Body className="font-display text-body-sm">{item.standard_unit}</Body>
                  </Stack>

                  {item.common_variations && item.common_variations.length > 0 && (
                    <Stack direction="horizontal" className="mt-3 flex-wrap gap-1">
                      {item.common_variations.slice(0, 3).map((variation, idx) => (
                        <Badge key={idx} variant="outline">
                          {variation}
                        </Badge>
                      ))}
                      {item.common_variations.length > 3 && (
                        <Badge variant="outline">
                          +{item.common_variations.length - 3} more
                        </Badge>
                      )}
                    </Stack>
                  )}
                </Card>
              ))}
            </Grid>
          ) : (
            <EmptyState
              title="NO ITEMS FOUND"
              description="Try adjusting your search or filters"
              icon={<Package className="size-12" />}
            />
          )}

          {/* Results Summary */}
          {data && (
            <Body className="mt-8 text-center text-body-sm">
              Showing {data.items?.length || 0} of {data.total} items
              {selectedCategory && ` in ${selectedCategory}`}
            </Body>
          )}
        </Container>
      </MainContent>
    </CompvssAppLayout>
  );
}
