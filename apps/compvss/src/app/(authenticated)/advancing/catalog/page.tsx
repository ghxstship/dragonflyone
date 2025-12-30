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
  Body, Button, Input, Card, Grid, Badge, Select, Field, DetailPage, Section, SectionHeader} from "@ghxstship/ui";
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
    <div className="flex gap-3">
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
    </div>
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
            <div className="flex gap-4 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-grey-400" />
                <Input
                  placeholder="Search catalog items by name, ID, or specification..."
                  value={searchTerm}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
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
            </div>

            {/* Category Pills */}
            <div className="flex flex-wrap gap-2 mb-4">
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
            </div>

            {/* Subcategory Pills */}
            {selectedCategory && subcategories.length > 0 && (
              <div className="space-y-2">
                <Body size="sm" className="text-grey-400">Subcategories:</Body>
                <div className="flex flex-wrap gap-2">
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
                </div>
              </div>
            )}

            {/* Advanced Filters Panel */}
            {showFilters && (
              <div className="mt-4 pt-4 border-t border-grey-700">
                <Grid cols={3} gap={4} className="grid-cols-1 sm:grid-cols-3">
                  <Field label="View Mode">
                    <Select value={viewMode} onChange={(e) => setViewMode(e.target.value as "grid" | "list")}>
                      <option value="grid">Grid View</option>
                      <option value="list">List View</option>
                    </Select>
                  </Field>
                </Grid>
              </div>
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
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Package className="size-4 text-grey-400" />
                        <Body size="sm" className="text-grey-400">{item.item_id}</Body>
                      </div>
                      {isSelected(item.id) && <Badge variant="solid">Selected</Badge>}
                    </div>

                    <Body className="font-weight-medium text-white mb-2">{item.item_name}</Body>

                    <div className="flex gap-2 mb-3">
                      <Badge variant="outline">{item.category}</Badge>
                      <Badge variant="outline">{item.subcategory}</Badge>
                    </div>

                    {item.specifications && (
                      <Body size="sm" className="text-grey-400 mb-3 line-clamp-2">{item.specifications}</Body>
                    )}

                    <div className="flex gap-1">
                      <Body size="sm" className="text-grey-400">Unit:</Body>
                      <Body size="sm" className="text-white">{item.standard_unit}</Body>
                    </div>

                    {item.common_variations && item.common_variations.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {item.common_variations.slice(0, 3).map((variation, idx) => (
                          <Badge key={idx} variant="outline">{variation}</Badge>
                        ))}
                        {item.common_variations.length > 3 && (
                          <Badge variant="outline">+{item.common_variations.length - 3} more</Badge>
                        )}
                      </div>
                    )}
                  </Card>
                ))}
              </Grid>
            ) : (
              <div className="text-center py-12">
                <Package className="size-12 text-grey-600 mx-auto mb-4" />
                <Body className="text-grey-400">No items found. Try adjusting your search or filters.</Body>
              </div>
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
                  <div className="flex items-start justify-between mb-2">
                    <Body className="font-weight-medium text-white">{item.item_name}</Body>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleItemSelection(item)}
                      icon={<X className="size-4" />}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="outline">{item.category}</Badge>
                    <Badge variant="outline">{item.subcategory}</Badge>
                  </div>
                </Card>
              ))}
            </Grid>
          ) : (
            <div className="text-center py-12">
              <Package className="size-12 text-grey-600 mx-auto mb-4" />
              <Body className="text-grey-400">No items selected. Browse the catalog to select items.</Body>
            </div>
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
