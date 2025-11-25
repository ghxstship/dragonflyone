'use client';

import { useState } from 'react';
import {
  Card,
  CardHeader,
  CardBody,
  Input,
  Select,
  Button,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Badge,
  Pagination,
  EmptyState,
  LoadingSpinner,
  H3,
  Body,
  Search,
  Plus,
} from '@ghxstship/ui';
import { useAdvancingCatalog, useCatalogCategories, type CatalogCategory } from '@ghxstship/config';
import type { ProductionCatalogItem } from '@ghxstship/config/types/advancing';

interface CatalogBrowserProps {
  onSelectItem?: (item: ProductionCatalogItem) => void;
  multiSelect?: boolean;
  selectedItems?: ProductionCatalogItem[];
}

export function CatalogBrowser({
  onSelectItem,
  multiSelect = false,
  selectedItems = [],
}: CatalogBrowserProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const { data: categoriesData } = useCatalogCategories();
  const categories = categoriesData || [];

  const { data: catalogData, isLoading } = useAdvancingCatalog({
    search: searchQuery || undefined,
    category: selectedCategory || undefined,
    subcategory: selectedSubcategory || undefined,
    limit: itemsPerPage,
    offset: (currentPage - 1) * itemsPerPage,
  });

  const catalog = catalogData?.data || [];
  const totalCount = catalogData?.count || 0;
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  const selectedCategoryData = categories.find((c: CatalogCategory) => c.category === selectedCategory);
  const subcategories = selectedCategoryData?.subcategories || [];

  const isItemSelected = (item: ProductionCatalogItem) => {
    return selectedItems.some((selected) => selected.id === item.id);
  };

  const handleSelectItem = (item: ProductionCatalogItem) => {
    if (onSelectItem) {
      onSelectItem(item);
    }
  };

  return (
    <Card>
      <CardHeader>
        <H3>Production Advancing Catalog</H3>
        <Body>Browse 500+ universal production items across 36 categories</Body>
      </CardHeader>

      <CardBody>
        {/* Search and Filters */}
        <Input
          type="text"
          placeholder="Search catalog items..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <Select
          value={selectedCategory}
          onChange={(e) => {
            setSelectedCategory(e.target.value);
            setSelectedSubcategory('');
            setCurrentPage(1);
          }}
        >
          <option value="">All Categories</option>
          {categories.map((cat: CatalogCategory) => (
            <option key={cat.category} value={cat.category}>
              {cat.category}
            </option>
          ))}
        </Select>

        {selectedCategory && subcategories.length > 0 && (
          <Select
            value={selectedSubcategory}
            onChange={(e) => {
              setSelectedSubcategory(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">All Subcategories</option>
            {subcategories.map((sub: string) => (
              <option key={sub} value={sub}>
                {sub}
              </option>
            ))}
          </Select>
        )}

        {/* Catalog Table */}
        {isLoading ? (
          <LoadingSpinner />
        ) : catalog.length === 0 ? (
          <EmptyState
            title="No items found"
            description="Try adjusting your search or filters"
          />
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Subcategory</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {catalog.map((item: ProductionCatalogItem) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Badge variant="outline">{item.item_id}</Badge>
                    </TableCell>
                    <TableCell>
                      <Body>{item.item_name}</Body>
                    </TableCell>
                    <TableCell>
                      <Badge>{item.category}</Badge>
                    </TableCell>
                    <TableCell>{item.subcategory}</TableCell>
                    <TableCell>{item.standard_unit}</TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant={isItemSelected(item) ? 'solid' : 'outline'}
                        onClick={() => handleSelectItem(item)}
                      >
                        {isItemSelected(item) ? 'Selected' : 'Add'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            )}
          </>
        )}
      </CardBody>
    </Card>
  );
}
