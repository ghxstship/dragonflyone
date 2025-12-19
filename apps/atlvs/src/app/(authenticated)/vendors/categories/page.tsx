'use client';

import { useState } from 'react';
import { Plus, Search, Folder, FolderOpen, Edit2, Trash2, ChevronRight, ChevronDown, Users } from 'lucide-react';

interface VendorCategory {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  description?: string;
  vendors_count: number;
  children?: VendorCategory[];
}

const MOCK_CATEGORIES: VendorCategory[] = [
  { 
    id: '1', 
    name: 'Catering', 
    slug: 'catering', 
    parent_id: null, 
    description: 'Food and beverage services', 
    vendors_count: 25,
    children: [
      { id: '1a', name: 'Full Service Catering', slug: 'full-service', parent_id: '1', vendors_count: 12, children: [] },
      { id: '1b', name: 'Specialty Foods', slug: 'specialty-foods', parent_id: '1', vendors_count: 8, children: [] },
      { id: '1c', name: 'Beverage Services', slug: 'beverage', parent_id: '1', vendors_count: 5, children: [] },
    ]
  },
  { 
    id: '2', 
    name: 'Florals & Decor', 
    slug: 'florals-decor', 
    parent_id: null, 
    description: 'Flowers and decorations', 
    vendors_count: 18,
    children: [
      { id: '2a', name: 'Florists', slug: 'florists', parent_id: '2', vendors_count: 10, children: [] },
      { id: '2b', name: 'Event Decor', slug: 'event-decor', parent_id: '2', vendors_count: 8, children: [] },
    ]
  },
  { 
    id: '3', 
    name: 'Entertainment', 
    slug: 'entertainment', 
    parent_id: null, 
    description: 'Music, DJs, and performers', 
    vendors_count: 30,
    children: [
      { id: '3a', name: 'Bands & Musicians', slug: 'bands', parent_id: '3', vendors_count: 15, children: [] },
      { id: '3b', name: 'DJs', slug: 'djs', parent_id: '3', vendors_count: 10, children: [] },
      { id: '3c', name: 'Specialty Acts', slug: 'specialty-acts', parent_id: '3', vendors_count: 5, children: [] },
    ]
  },
  { 
    id: '4', 
    name: 'Audio/Visual', 
    slug: 'audio-visual', 
    parent_id: null, 
    description: 'AV equipment and services', 
    vendors_count: 15,
    children: []
  },
  { 
    id: '5', 
    name: 'Photography & Video', 
    slug: 'photo-video', 
    parent_id: null, 
    description: 'Photo and video services', 
    vendors_count: 22,
    children: []
  },
  { 
    id: '6', 
    name: 'Rentals', 
    slug: 'rentals', 
    parent_id: null, 
    description: 'Tables, chairs, linens', 
    vendors_count: 20,
    children: []
  },
];

export default function VendorCategoriesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [categories] = useState<VendorCategory[]>(MOCK_CATEGORIES);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set(['1', '2', '3']));

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
  const totalVendors = categories.reduce((sum, c) => sum + c.vendors_count, 0);

  const renderCategory = (category: VendorCategory, depth: number = 0) => {
    const isExpanded = expandedIds.has(category.id);
    const hasChildren = category.children && category.children.length > 0;

    return (
      <div key={category.id}>
        <div 
          className="flex items-center gap-3 p-3 border-b border-border hover:bg-muted/30 transition-colors"
          style={{ paddingLeft: `${depth * 24 + 12}px` }}
        >
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

          <span className="inline-flex items-center gap-1 text-body-xs text-muted-foreground">
            <Users className="h-3 w-3" />
            {category.vendors_count}
          </span>

          <div className="flex items-center gap-1">
            <button 
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
          <h1 className="text-h2-md font-weight-bold text-foreground">Vendor Categories</h1>
          <p className="text-body-sm text-muted-foreground mt-1">
            Organize vendors by service type
          </p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="/vendors"
            className="px-4 py-2 border-2 border-border rounded-button text-body-sm font-weight-medium hover:bg-muted transition-colors"
          >
            View Vendors
          </a>
          <button
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-button border-2 border-primary font-weight-medium text-body-sm hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Category
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-background border-2 border-border rounded-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Folder className="h-5 w-5 text-primary" />
            <span className="text-body-sm text-muted-foreground">Categories</span>
          </div>
          <p className="text-h3-md font-weight-bold text-foreground">{totalCategories}</p>
        </div>
        <div className="bg-background border-2 border-border rounded-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-5 w-5 text-primary" />
            <span className="text-body-sm text-muted-foreground">Total Vendors</span>
          </div>
          <p className="text-h3-md font-weight-bold text-foreground">{totalVendors}</p>
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
          <div className="w-5" />
          <span className="flex-1 text-body-xs font-weight-semibold text-muted-foreground uppercase">
            Category Name
          </span>
          <span className="text-body-xs font-weight-semibold text-muted-foreground uppercase w-16 text-right">
            Vendors
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
