'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Building2 } from 'lucide-react';
import { useCreateVendor, useVendorCategories } from '@/hooks/useVendorProfiles';

const SERVICE_AREAS = [
  'Northeast US',
  'Southeast US',
  'Midwest US',
  'Southwest US',
  'West Coast US',
  'Pacific Northwest',
  'International',
];

export default function NewVendorPage() {
  const router = useRouter();
  const createMutation = useCreateVendor();
  const { data: categoriesData } = useVendorCategories();

  const [formData, setFormData] = useState({
    name: '',
    category_id: '',
    description: '',
    website: '',
    tax_id: '',
    payment_terms: 'Net 30',
    contact_email: '',
    contact_phone: '',
    contact_name: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'US',
    service_areas: [] as string[],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Vendor name is required';
    if (!formData.category_id) newErrors.category_id = 'Category is required';
    if (formData.contact_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contact_email)) {
      newErrors.contact_email = 'Invalid email address';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleServiceAreaToggle = (area: string) => {
    setFormData((prev) => ({
      ...prev,
      service_areas: prev.service_areas.includes(area)
        ? prev.service_areas.filter((a) => a !== area)
        : [...prev.service_areas, area],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await createMutation.mutateAsync({
        organization_id: 'current',
        name: formData.name,
        category_id: formData.category_id || undefined,
        description: formData.description || undefined,
        website: formData.website || undefined,
        tax_id: formData.tax_id || undefined,
        payment_terms: formData.payment_terms || undefined,
        service_areas: formData.service_areas.length > 0 ? formData.service_areas : undefined,
        contact_info: {
          email: formData.contact_email || undefined,
          phone: formData.contact_phone || undefined,
          name: formData.contact_name || undefined,
          address: {
            line1: formData.address_line1 || undefined,
            line2: formData.address_line2 || undefined,
            city: formData.city || undefined,
            state: formData.state || undefined,
            postal_code: formData.postal_code || undefined,
            country: formData.country || undefined,
          },
        },
      });
      router.push('/vendors');
    } catch (error) {
      setErrors({
        submit: error instanceof Error ? error.message : 'Failed to create vendor',
      });
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <Link
          href="/vendors"
          className="inline-flex items-center gap-2 text-body-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Vendors
        </Link>
      </div>

      <div className="bg-background border-2 border-border rounded-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-primary/10 rounded-card">
            <Building2 className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-h3-md font-weight-bold text-foreground">Add New Vendor</h1>
            <p className="text-body-sm text-muted-foreground">
              Add a vendor to your directory
            </p>
          </div>
        </div>

        {errors.submit && (
          <div className="mb-6 p-4 bg-destructive/10 border-2 border-destructive rounded-card text-destructive text-body-sm">
            {errors.submit}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <h2 className="text-h4-md font-weight-semibold text-foreground border-b border-border pb-2">
              Basic Information
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-body-sm font-weight-medium text-foreground mb-2">
                  Vendor Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. ABC Audio Solutions"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                />
                {errors.name && (
                  <p className="mt-1 text-body-xs text-destructive">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-body-sm font-weight-medium text-foreground mb-2">
                  Category *
                </label>
                <select
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  <option value="">Select category</option>
                  {categoriesData?.categories?.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                {errors.category_id && (
                  <p className="mt-1 text-body-xs text-destructive">{errors.category_id}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-body-sm font-weight-medium text-foreground mb-2">
                Description
              </label>
              <textarea
                rows={3}
                placeholder="Brief description of vendor services..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-body-sm font-weight-medium text-foreground mb-2">
                  Website
                </label>
                <input
                  type="url"
                  placeholder="https://example.com"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-body-sm font-weight-medium text-foreground mb-2">
                  Tax ID / EIN
                </label>
                <input
                  type="text"
                  placeholder="XX-XXXXXXX"
                  value={formData.tax_id}
                  onChange={(e) => setFormData({ ...formData, tax_id: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-h4-md font-weight-semibold text-foreground border-b border-border pb-2">
              Contact Information
            </h2>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-body-sm font-weight-medium text-foreground mb-2">
                  Contact Name
                </label>
                <input
                  type="text"
                  placeholder="Primary contact"
                  value={formData.contact_name}
                  onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-body-sm font-weight-medium text-foreground mb-2">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="contact@vendor.com"
                  value={formData.contact_email}
                  onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                />
                {errors.contact_email && (
                  <p className="mt-1 text-body-xs text-destructive">{errors.contact_email}</p>
                )}
              </div>

              <div>
                <label className="block text-body-sm font-weight-medium text-foreground mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  placeholder="(555) 123-4567"
                  value={formData.contact_phone}
                  onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-body-sm font-weight-medium text-foreground mb-2">
                  Address Line 1
                </label>
                <input
                  type="text"
                  placeholder="Street address"
                  value={formData.address_line1}
                  onChange={(e) => setFormData({ ...formData, address_line1: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-body-sm font-weight-medium text-foreground mb-2">
                  Address Line 2
                </label>
                <input
                  type="text"
                  placeholder="Suite, unit, etc."
                  value={formData.address_line2}
                  onChange={(e) => setFormData({ ...formData, address_line2: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4">
              <div>
                <label className="block text-body-sm font-weight-medium text-foreground mb-2">
                  City
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-body-sm font-weight-medium text-foreground mb-2">
                  State
                </label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-body-sm font-weight-medium text-foreground mb-2">
                  Postal Code
                </label>
                <input
                  type="text"
                  value={formData.postal_code}
                  onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-body-sm font-weight-medium text-foreground mb-2">
                  Country
                </label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-h4-md font-weight-semibold text-foreground border-b border-border pb-2">
              Service Details
            </h2>

            <div>
              <label className="block text-body-sm font-weight-medium text-foreground mb-2">
                Payment Terms
              </label>
              <select
                value={formData.payment_terms}
                onChange={(e) => setFormData({ ...formData, payment_terms: e.target.value })}
                className="w-full max-w-xs px-4 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              >
                <option value="Due on Receipt">Due on Receipt</option>
                <option value="Net 15">Net 15</option>
                <option value="Net 30">Net 30</option>
                <option value="Net 45">Net 45</option>
                <option value="Net 60">Net 60</option>
                <option value="50% Deposit">50% Deposit Required</option>
              </select>
            </div>

            <div>
              <label className="block text-body-sm font-weight-medium text-foreground mb-2">
                Service Areas
              </label>
              <div className="flex flex-wrap gap-2">
                {SERVICE_AREAS.map((area) => (
                  <button
                    key={area}
                    type="button"
                    onClick={() => handleServiceAreaToggle(area)}
                    className={`px-3 py-1.5 rounded-badge text-body-sm border-2 transition-colors ${
                      formData.service_areas.includes(area)
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    {area}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <Link
              href="/vendors"
              className="px-4 py-2 border-2 border-border rounded-button text-body-sm font-weight-medium hover:bg-muted transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-button border-2 border-primary font-weight-medium text-body-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {createMutation.isPending ? 'Creating...' : 'Create Vendor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
