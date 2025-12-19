'use client';

import { useState, useMemo } from 'react';
import { Plus, Search, Folder, FolderOpen, Edit2, Trash2, ChevronRight, ChevronDown, GripVertical } from 'lucide-react';
import { useCatalogCategories } from '@/hooks/useCatalog';

interface Category {
  id: string;
  name: string;
  slug?: string;
  parent_id: string | null;
  description?: string;
  items_count?: number;
  children?: Category[];
  is_expanded?: boolean;
}

export default function CatalogCategoriesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data, isLoading, error } = useCatalogCategories();

  const categories: Category[] = useMemo(() => {
    if (!data?.tree) return [];
    return data.tree.map(cat => ({
      id: cat.id,
      name: cat.name,
      parent_id: cat.parent_id || null,
      description: cat.description,
      items_count: 0,
      children: cat.children?.map(child => ({
        id: child.id,
        name: child.name,
        parent_id: child.parent_id || null,
        description: child.description,
        items_count: 0,
        children: [],
      })) || [],
    }));
  }, [data]);

  const toggleExpanded = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const filteredCategories = searchQuery
    ? categories.filter((c) => 
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.children?.some((child) => child.name.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : categories;

  const totalCategories = categories.reduce((sum, c) => sum + 1 + (c.children?.length || 0), 0);
  const totalItems = categories.reduce((sum, c) => sum + (c.items_count || 0), 0);

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-muted-foreground">Loading categories...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-12 bg-destructive/10 border-2 border-destructive rounded-card">
          <p className="text-destructive">Failed to load categories</p>
        </div>
      </div>
    );
  }

  const renderCategory = (category: Category, depth: number = 0) => {
    const isExpanded = expandedIds.has(category.id);
    const hasChildren = category.children && category.children.length > 0;

    return (
      <div key={category.id}>
        <div 
          className={`flex items-center gap-3 p-3 border-b border-border hover:bg-muted/30 transition-colors ${
            depth > 0 ? 'pl-' + (depth * 8 + 3) : ''
          }`}
          style={{ paddingLeft: `${depth * 24 + 12}px` }}
        >
          <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
          
          {hasChildren ? (
            <button 
              onClick={() => toggleExpanded(category.id)}
              className="p-1 hover:bg-muted rounded-button transition-colors"
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )}
            </button>
          ) : (
            <div className="w-6" />
          )}

          {isExpanded ? (
            <FolderOpen className="h-5 w-5 text-primary" />
          ) : (
            <Folder className="h-5 w-5 text-muted-foreground" />
          )}

          <div className="flex-1">
            <span className="text-body-sm font-weight-medium text-foreground">
              {category.name}
            </span>
            {category.description && (
              <span className="ml-2 text-body-xs text-muted-foreground">
                {category.description}
              </span>
            )}
          </div>

          <span className="text-body-xs text-muted-foreground">
            {category.items_count || 0} items
          </span>

          <div className="flex items-center gap-1">
            <button 
              onClick={() => setSelectedId(selectedId === category.id ? null : category.id)}
              className="p-1.5 hover:bg-muted rounded-button transition-colors"
            >
              <Edit2 className="h-4 w-4 text-muted-foreground" />
            </button>
            <button 
              className="p-1.5 hover:bg-destructive/10 rounded-button transition-colors"
            >
              <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
            </button>
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div>
            {category.children?.map((child) => renderCategory(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h2-md font-weight-bold text-foreground">Catalog Categories</h1>
          <p className="text-body-sm text-muted-foreground mt-1">
            Organize catalog items into categories
          </p>
        </div>
        <button
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-button border-2 border-primary font-weight-medium text-body-sm hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Category
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-background border-2 border-border rounded-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Folder className="h-5 w-5 text-primary" />
            <span className="text-body-sm text-muted-foreground">Total Categories</span>
          </div>
          <p className="text-h3-md font-weight-bold text-foreground">{totalCategories}</p>
        </div>
        <div className="bg-background border-2 border-border rounded-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Folder className="h-5 w-5 text-primary" />
            <span className="text-body-sm text-muted-foreground">Total Items</span>
          </div>
          <p className="text-h3-md font-weight-bold text-foreground">{totalItems}</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          />
        </div>
      </div>

      <div className="bg-background border-2 border-border rounded-card overflow-hidden">
        <div className="border-b border-border bg-muted/30 p-3 flex items-center gap-3">
          <div className="w-6" />
          <div className="w-6" />
          <div className="w-5" />
          <span className="flex-1 text-body-xs font-weight-semibold text-muted-foreground uppercase">
            Category Name
          </span>
          <span className="text-body-xs font-weight-semibold text-muted-foreground uppercase w-20 text-right">
            Items
          </span>
          <div className="w-16" />
        </div>

        {filteredCategories.length === 0 && (
          <div className="text-center py-12">
            <Folder className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-h4-md font-weight-medium text-foreground mb-2">
              No categories found
            </h3>
            <p className="text-body-sm text-muted-foreground">
              {searchQuery ? 'Try adjusting your search' : 'Create your first category'}
            </p>
          </div>
        )}

        {filteredCategories.map((category) => renderCategory(category))}
      </div>
    </div>
  );
}
