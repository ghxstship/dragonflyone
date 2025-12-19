'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Plus, Search, Filter, Building2, Phone, Mail, MapPin, ExternalLink } from 'lucide-react';
import { useVendorProfiles, useVendorCategories } from '@/hooks/useVendorProfiles';

const STATUS_CONFIG = {
  active: { label: 'Active', color: 'bg-success/20 text-success' },
  inactive: { label: 'Inactive', color: 'bg-muted text-muted-foreground' },
  pending: { label: 'Pending', color: 'bg-warning/20 text-warning' },
  suspended: { label: 'Suspended', color: 'bg-destructive/20 text-destructive' },
};

export default function VendorsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  const { data, isLoading, error } = useVendorProfiles({
    category_id: categoryFilter || undefined,
    status: statusFilter || undefined,
    search: searchQuery || undefined,
  });

  const { data: categoriesData } = useVendorCategories();

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded-card w-1/3" />
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-muted rounded-card" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-destructive/10 border-2 border-destructive rounded-card p-4 text-destructive">
          Failed to load vendors. Please try again.
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h2-md font-weight-bold text-foreground">Vendor Directory</h1>
          <p className="text-body-sm text-muted-foreground mt-1">
            Centralized database of vendors with categories and certifications
          </p>
        </div>
        <a
          href="/vendors/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-button border-2 border-primary font-weight-medium text-body-sm hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Vendor
        </a>
      </div>

      <div className="flex items-center gap-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search vendors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">All Categories</option>
            {categoriesData?.categories?.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">All Statuses</option>
          {Object.entries(STATUS_CONFIG).map(([status, config]) => (
            <option key={status} value={status}>
              {config.label}
            </option>
          ))}
        </select>
      </div>

      {(!data?.vendors || data.vendors.length === 0) && (
        <div className="text-center py-12 bg-muted/30 rounded-card border-2 border-dashed border-border">
          <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-h4-md font-weight-medium text-foreground mb-2">
            No vendors found
          </h3>
          <p className="text-body-sm text-muted-foreground mb-4">
            Add vendors to your directory to start managing relationships.
          </p>
          <a
            href="/vendors/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-button border-2 border-primary font-weight-medium text-body-sm"
          >
            <Plus className="h-4 w-4" />
            Add First Vendor
          </a>
        </div>
      )}

      {data?.vendors && data.vendors.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.vendors.map((vendor) => {
            const statusConfig = STATUS_CONFIG[vendor.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.active;
            return (
              <a
                key={vendor.id}
                href={`/vendors/${vendor.id}`}
                className="bg-background border-2 border-border rounded-card p-4 hover:border-primary/50 transition-colors"
              >
                <div className="flex items-start gap-3 mb-3">
                  {vendor.logo_url ? (
                    <Image
                      src={vendor.logo_url}
                      alt={vendor.name}
                      width={48}
                      height={48}
                      className="rounded-card object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-card bg-muted flex items-center justify-center">
                      <Building2 className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-weight-semibold text-foreground truncate">
                        {vendor.name}
                      </h3>
                      <span className={`px-2 py-0.5 rounded-badge text-body-xs font-weight-medium shrink-0 ${statusConfig.color}`}>
                        {statusConfig.label}
                      </span>
                    </div>
                    {vendor.category && (
                      <p className="text-body-xs text-muted-foreground">
                        {vendor.category.name}
                      </p>
                    )}
                  </div>
                </div>

                {vendor.description && (
                  <p className="text-body-sm text-muted-foreground mb-3 line-clamp-2">
                    {vendor.description}
                  </p>
                )}

                <div className="space-y-1 text-body-xs text-muted-foreground">
                  {typeof vendor.contact_info?.email === 'string' && vendor.contact_info.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-3 w-3" />
                      <span className="truncate">{vendor.contact_info.email}</span>
                    </div>
                  )}
                  {typeof vendor.contact_info?.phone === 'string' && vendor.contact_info.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-3 w-3" />
                      <span>{vendor.contact_info.phone}</span>
                    </div>
                  )}
                  {vendor.service_areas && vendor.service_areas.length > 0 && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3 w-3" />
                      <span className="truncate">{vendor.service_areas.slice(0, 2).join(', ')}</span>
                    </div>
                  )}
                  {vendor.website && (
                    <div className="flex items-center gap-2">
                      <ExternalLink className="h-3 w-3" />
                      <span className="truncate">{vendor.website}</span>
                    </div>
                  )}
                </div>

                              </a>
            );
          })}
        </div>
      )}

      {data && data.total > (data.vendors?.length || 0) && (
        <div className="flex items-center justify-center">
          <p className="text-body-sm text-muted-foreground">
            Showing {data.vendors?.length || 0} of {data.total} vendors
          </p>
        </div>
      )}
    </div>
  );
}
