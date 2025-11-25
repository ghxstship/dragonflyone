'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAdvancingCatalog } from '@/hooks/useAdvancingCatalog';
import { 
  Container, 
  Section, 
  Display, 
  H2, 
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
  Label,
  Select,
  Field,
  Breadcrumb,
  BreadcrumbItem,
} from '@ghxstship/ui';
import type { ProductionCatalogItem } from '@ghxstship/config/types/advancing';
import { Search, Package, Filter, X, ChevronRight } from 'lucide-react';

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
      <Container className="p-8">
        <Alert variant="error" title="Error Loading Catalog">
          {error.message}
        </Alert>
      </Container>
    );
  }

  return (
    <Section className="min-h-screen bg-white py-8">
      <Container>
        {/* Breadcrumb */}
        <Breadcrumb className="mb-6">
          <BreadcrumbItem href="/advancing">Advancing</BreadcrumbItem>
          <BreadcrumbItem active>Catalog</BreadcrumbItem>
        </Breadcrumb>

        {/* Header */}
        <Stack direction="horizontal" className="justify-between items-start mb-8">
          <Stack gap={2}>
            <Display>PRODUCTION ADVANCING CATALOG</Display>
            <Body className="text-grey-600">
              Browse {data?.total || 329} standardized production items across all categories
            </Body>
          </Stack>
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
        <Card className="p-6 mb-8">
          <Stack direction="horizontal" gap={4} className="mb-4">
            <Stack className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-grey-600" />
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
              <Filter className="w-4 h-4 mr-2" />
              FILTERS {activeFilterCount > 0 && `(${activeFilterCount})`}
            </Button>
            {activeFilterCount > 0 && (
              <Button variant="ghost" onClick={clearFilters}>
                <X className="w-4 h-4 mr-2" />
                CLEAR
              </Button>
            )}
          </Stack>

          {/* Category Pills */}
          <Stack direction="horizontal" className="flex-wrap gap-2 mb-4">
            <Badge
              variant={!selectedCategory ? 'solid' : 'outline'}
              className="cursor-pointer"
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
                className="cursor-pointer"
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
              <Body className="text-sm text-grey-600 font-bold">SUBCATEGORIES:</Body>
              <Stack direction="horizontal" className="flex-wrap gap-2">
                <Badge
                  variant={!selectedSubcategory ? 'solid' : 'outline'}
                  className="cursor-pointer text-xs"
                  onClick={() => setSelectedSubcategory(undefined)}
                >
                  ALL
                </Badge>
                {subcategories.map((sub) => (
                  <Badge
                    key={sub}
                    variant={selectedSubcategory === sub ? 'solid' : 'outline'}
                    className="cursor-pointer text-xs"
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
            <Stack gap={4} className="mt-4 pt-4 border-t border-grey-200">
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
          <Stack className="justify-center items-center py-12">
            <Spinner />
          </Stack>
        ) : data?.items && data.items.length > 0 ? (
          <Grid cols={3} gap={6} className="mb-8">
            {data.items.map((item) => (
              <Card
                key={item.id}
                className={`p-6 cursor-pointer transition-all hover:border-2 hover:border-black ${
                  isSelected(item.id) ? 'border-2 border-black' : ''
                }`}
                onClick={() => toggleItemSelection(item)}
              >
                <Stack direction="horizontal" className="justify-between items-start mb-3">
                  <Stack direction="horizontal" gap={2} className="items-center">
                    <Package className="h-4 w-4 text-grey-600" />
                    <Body className="text-xs font-mono text-grey-600">
                      {item.item_id}
                    </Body>
                  </Stack>
                  {isSelected(item.id) && (
                    <Badge className="bg-black text-white text-xs">SELECTED</Badge>
                  )}
                </Stack>

                <H3 className="mb-2">{item.item_name}</H3>
                
                <Stack direction="horizontal" gap={2} className="items-center mb-3">
                  <Badge className="bg-grey-200 text-black text-xs">
                    {item.category.toUpperCase()}
                  </Badge>
                  <Badge className="bg-white border-2 border-black text-xs">
                    {item.subcategory.toUpperCase()}
                  </Badge>
                </Stack>

                {item.specifications && (
                  <Body className="text-sm text-grey-600 line-clamp-2 mb-3">
                    {item.specifications}
                  </Body>
                )}

                <Stack direction="horizontal" gap={1}>
                  <Body className="text-xs text-grey-600">Unit:</Body>
                  <Label className="text-xs font-bold">{item.standard_unit}</Label>
                </Stack>

                {item.common_variations && item.common_variations.length > 0 && (
                  <Stack direction="horizontal" className="mt-3 flex-wrap gap-1">
                    {item.common_variations.slice(0, 3).map((variation, idx) => (
                      <Badge key={idx} className="bg-white border border-grey-400 text-xs">
                        {variation}
                      </Badge>
                    ))}
                    {item.common_variations.length > 3 && (
                      <Badge className="bg-white border border-grey-400 text-xs">
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
            icon={<Package className="h-12 w-12 text-grey-400" />}
          />
        )}

        {/* Results Summary */}
        {data && (
          <Body className="text-center text-grey-600 mt-8">
            Showing {data.items?.length || 0} of {data.total} items
            {selectedCategory && ` in ${selectedCategory}`}
          </Body>
        )}
      </Container>
    </Section>
  );
}
