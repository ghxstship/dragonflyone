"use client";

/**
 * COMPVSS Production Advancing Catalog Page
 * Browse and select catalog items for advancing requests
 * Uses DetailPage template for consistent layout
 */

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext, PlatformRole } from "@ghxstship/config";
import { useAdvancingCatalog } from "@/hooks/useAdvancingCatalog";
import {
  Body, Button, Input, Card, Grid, Badge, Select, Field, DetailPage, Section, SectionHeader, Box} from "@ghxstship/ui";
import type { ProductionCatalogItem } from "@ghxstship/config/types/advancing";
import { Search, Package, Filter, X, List, ArrowLeft, Plus } from "lucide-react";

const ADMIN_ROLES = [
  PlatformRole.COMPVSS_ADMIN,
  PlatformRole.LEGEND_SUPER_ADMIN,
  PlatformRole.LEGEND_ADMIN,
  PlatformRole.LEGEND_DEVELOPER,
];

export default function CatalogPage() {
  const router = useRouter();
  const { hasRole } = useAuthContext();

  const canCreateAdvance = ADMIN_ROLES.some((role) => hasRole(role));

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>();
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>();
  const [selectedItems, setSelectedItems] = useState<ProductionCatalogItem[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const { data, isLoading, refetch } = useAdvancingCatalog({
    search: searchTerm,
    category: selectedCategory,
    subcategory: selectedSubcategory,
    limit: 100,
  });

  const subcategories = useMemo(() => {
    const items = data?.items;
    if (!items || !selectedCategory) return [];
    const subs = new Set<string>();
    items.forEach((item) => {
      if (item.category === selectedCategory && item.subcategory) {
        subs.add(item.subcategory);
      }
    });
    return Array.from(subs).sort();
  }, [data?.items, selectedCategory]);

  const clearFilters = () => {
    setSelectedCategory(undefined);
    setSelectedSubcategory(undefined);
    setSearchTerm("");
  };

  const activeFilterCount = [selectedCategory, selectedSubcategory, searchTerm].filter(Boolean).length;

  const toggleItemSelection = (item: ProductionCatalogItem) => {
    setSelectedItems((prev) => {
      const exists = prev.find((i) => i.id === item.id);
      if (exists) {
        return prev.filter((i) => i.id !== item.id);
      }
      return [...prev, item];
    });
  };

  const isSelected = (itemId: string) => selectedItems.some((i) => i.id === itemId);

  const headerActions = (
    <Box className="flex gap-3">
      {canCreateAdvance && selectedItems.length > 0 && (
        <Button
          variant="solid"
          icon={<Plus className="size-4" />}
          iconPosition="left"
          onClick={() => {
            const itemsParam = encodeURIComponent(JSON.stringify(selectedItems.map((i) => i.id)));
            router.push(`/advancing/new?items=${itemsParam}`);
          }}
        >
          Create Advance ({selectedItems.length})
        </Button>
      )}
      <Button
        variant="outline"
        icon={<ArrowLeft className="size-4" />}
        iconPosition="left"
        onClick={() => router.push("/advancing")}
      >
        View Requests
      </Button>
    </Box>
  );

  const tabs = [
    {
      id: "catalog",
      label: "Browse Catalog",
      icon: <Package className="size-4" />,
      content: (
        <>
          {/* Search and Filters */}
          <Section border className="mb-6">
            <Box className="flex gap-4 mb-4">
              <Box className="relative flex-1">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-on-dark-muted" />
                <Input
                  placeholder="Search catalog items by name, ID, or specification..."
                  value={searchTerm}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </Box>
              <Button
                variant={showFilters ? "solid" : "outline"}
                onClick={() => setShowFilters(!showFilters)}
                icon={<Filter className="size-4" />}
                iconPosition="left"
              >
                Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
              </Button>
              {activeFilterCount > 0 && (
                <Button variant="ghost" onClick={clearFilters} icon={<X className="size-4" />} iconPosition="left">
                  Clear
                </Button>
              )}
            </Box>

            {/* Category Pills */}
            <Box className="flex flex-wrap gap-2 mb-4">
              <Badge
                variant={!selectedCategory ? "solid" : "outline"}
                onClick={() => {
                  setSelectedCategory(undefined);
                  setSelectedSubcategory(undefined);
                }}
                className="cursor-pointer"
              >
                All Categories
              </Badge>
              {data?.categories?.map((category) => (
                <Badge
                  key={category}
                  variant={selectedCategory === category ? "solid" : "outline"}
                  onClick={() => {
                    setSelectedCategory(selectedCategory === category ? undefined : category);
                    setSelectedSubcategory(undefined);
                  }}
                  className="cursor-pointer"
                >
                  {category}
                </Badge>
              ))}
            </Box>

            {/* Subcategory Pills */}
            {selectedCategory && subcategories.length > 0 && (
              <Box className="space-y-2">
                <Body size="sm" className="text-on-dark-muted">Subcategories:</Body>
                <Box className="flex flex-wrap gap-2">
                  <Badge
                    variant={!selectedSubcategory ? "solid" : "outline"}
                    onClick={() => setSelectedSubcategory(undefined)}
                    className="cursor-pointer"
                  >
                    All
                  </Badge>
                  {subcategories.map((sub) => (
                    <Badge
                      key={sub}
                      variant={selectedSubcategory === sub ? "solid" : "outline"}
                      onClick={() => setSelectedSubcategory(selectedSubcategory === sub ? undefined : sub)}
                      className="cursor-pointer"
                    >
                      {sub}
                    </Badge>
                  ))}
                </Box>
              </Box>
            )}

            {/* Advanced Filters Panel */}
            {showFilters && (
              <Box className="mt-4 pt-4 border-t border-grey-700">
                <Grid cols={3} gap={4} className="grid-cols-1 sm:grid-cols-3">
                  <Field label="View Mode">
                    <Select value={viewMode} onChange={(e) => setViewMode(e.target.value as "grid" | "list")}>
                      <option value="grid">Grid View</option>
                      <option value="list">List View</option>
                    </Select>
                  </Field>
                </Grid>
              </Box>
            )}
          </Section>

          {/* Catalog Grid */}
          <Section>
            <SectionHeader
              title="Catalog Items"
              description={`Showing ${data?.items?.length || 0} of ${data?.total || 0} items${selectedCategory ? ` in ${selectedCategory}` : ""}`}
            />
            {data?.items && data.items.length > 0 ? (
              <Grid cols={3} gap={4} className="grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {data.items.map((item) => (
                  <Card
                    key={item.id}
                    onClick={() => toggleItemSelection(item)}
                    className={`cursor-pointer p-4 ${isSelected(item.id) ? "ring-2 ring-primary" : ""}`}
                  >
                    <Box className="flex items-start justify-between mb-3">
                      <Box className="flex items-center gap-2">
                        <Package className="size-4 text-on-dark-muted" />
                        <Body size="sm" className="text-on-dark-muted">{item.item_id}</Body>
                      </Box>
                      {isSelected(item.id) && <Badge variant="solid">Selected</Badge>}
                    </Box>

                    <Body className="font-weight-medium text-white mb-2">{item.item_name}</Body>

                    <Box className="flex gap-2 mb-3">
                      <Badge variant="outline">{item.category}</Badge>
                      <Badge variant="outline">{item.subcategory}</Badge>
                    </Box>

                    {item.specifications && (
                      <Body size="sm" className="text-on-dark-muted mb-3 line-clamp-2">{item.specifications}</Body>
                    )}

                    <Box className="flex gap-1">
                      <Body size="sm" className="text-on-dark-muted">Unit:</Body>
                      <Body size="sm" className="text-white">{item.standard_unit}</Body>
                    </Box>

                    {item.common_variations && item.common_variations.length > 0 && (
                      <Box className="flex flex-wrap gap-1 mt-3">
                        {item.common_variations.slice(0, 3).map((variation, idx) => (
                          <Badge key={idx} variant="outline">{variation}</Badge>
                        ))}
                        {item.common_variations.length > 3 && (
                          <Badge variant="outline">+{item.common_variations.length - 3} more</Badge>
                        )}
                      </Box>
                    )}
                  </Card>
                ))}
              </Grid>
            ) : (
              <Box className="text-center py-12">
                <Package className="size-12 text-on-dark-disabled mx-auto mb-4" />
                <Body className="text-on-dark-muted">No items found. Try adjusting your search or filters.</Body>
              </Box>
            )}
          </Section>
        </>
      ),
    },
    {
      id: "selected",
      label: `Selected (${selectedItems.length})`,
      icon: <List className="size-4" />,
      content: (
        <Section>
          <SectionHeader
            title="Selected Items"
            description={`${selectedItems.length} items selected for advancing request`}
          />
          {selectedItems.length > 0 ? (
            <Grid cols={3} gap={4} className="grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {selectedItems.map((item) => (
                <Card key={item.id} className="p-4">
                  <Box className="flex items-start justify-between mb-2">
                    <Body className="font-weight-medium text-white">{item.item_name}</Body>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleItemSelection(item)}
                      icon={<X className="size-4" />}
                    />
                  </Box>
                  <Box className="flex gap-2">
                    <Badge variant="outline">{item.category}</Badge>
                    <Badge variant="outline">{item.subcategory}</Badge>
                  </Box>
                </Card>
              ))}
            </Grid>
          ) : (
            <Box className="text-center py-12">
              <Package className="size-12 text-on-dark-disabled mx-auto mb-4" />
              <Body className="text-on-dark-muted">No items selected. Browse the catalog to select items.</Body>
            </Box>
          )}
        </Section>
      ),
    },
  ];

  return (
    <DetailPage
      header={{
        kicker: "Operations",
        title: "Production Advancing Catalog",
        description: "Browse and select items for advancing requests",
      }}
      loading={isLoading}
      error={null}
      onRetry={refetch}
      tabs={tabs}
      actions={headerActions}
    />
  );
}
