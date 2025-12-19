'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, MapPin, Users, DollarSign, Check } from 'lucide-react';
import { useSpace, useUpdateSpace } from '@/hooks/useSpaces';

const AMENITIES = [
  'WiFi', 'Projector', 'Sound System', 'Microphone', 'Stage',
  'Dance Floor', 'Kitchen', 'Bar', 'Outdoor Access', 'Parking',
  'Coat Check', 'Bridal Suite', 'Green Room', 'Loading Dock',
];

export default function EditSpacePage() {
  const params = useParams();
  const router = useRouter();
  const spaceId = params.id as string;

  const { data: spaceData, isLoading, error } = useSpace(spaceId);
  const updateSpace = useUpdateSpace();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    capacity: '',
    base_price: '',
    amenities: [] as string[],
    is_active: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (spaceData?.space) {
      const space = spaceData.space;
      setFormData({
        name: space.name || '',
        description: space.description || '',
        capacity: space.capacity?.toString() || '',
        base_price: space.base_price?.toString() || '',
        amenities: space.amenities || [],
        is_active: space.is_active ?? true,
      });
    }
  }, [spaceData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setHasChanges(true);
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const toggleAmenity = (amenity: string) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
    setHasChanges(true);
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Space name is required';
    }
    if (!formData.capacity || parseInt(formData.capacity) <= 0) {
      newErrors.capacity = 'Valid capacity is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await updateSpace.mutateAsync({
        spaceId,
        name: formData.name,
        description: formData.description || undefined,
        capacity: parseInt(formData.capacity),
        base_price: formData.base_price ? parseFloat(formData.base_price) : undefined,
        amenities: formData.amenities.length > 0 ? formData.amenities : undefined,
        is_active: formData.is_active,
      });
      router.push(`/spaces/${spaceId}`);
    } catch (err) {
      setErrors({ submit: err instanceof Error ? err.message : 'Failed to update space' });
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded-card w-1/3" />
          <div className="h-64 bg-muted rounded-card" />
        </div>
      </div>
    );
  }

  if (error || !spaceData?.space) {
    return (
      <div className="p-6">
        <div className="text-center py-12 bg-destructive/10 border-2 border-destructive rounded-card">
          <p className="text-destructive">Space not found</p>
          <Link href="/spaces" className="text-primary hover:underline mt-2 inline-block">
            Back to Spaces
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link
          href={`/spaces/${spaceId}`}
          className="p-2 hover:bg-muted rounded-button transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-muted-foreground" />
        </Link>
        <div>
          <h1 className="text-h2-md font-weight-bold text-foreground">Edit Space</h1>
          <p className="text-body-sm text-muted-foreground mt-1">
            Update space details and configuration
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-background border-2 border-border rounded-card p-6">
          <h2 className="text-h4-md font-weight-semibold text-foreground mb-4 flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Basic Information
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-body-sm font-weight-medium text-foreground mb-1">
                Space Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Grand Ballroom"
                className={`w-full px-4 py-2 border-2 rounded-button focus:outline-none focus:border-primary ${
                  errors.name ? 'border-destructive' : 'border-border'
                }`}
              />
              {errors.name && (
                <p className="text-body-xs text-destructive mt-1">{errors.name}</p>
              )}
            </div>
            <div>
              <label className="block text-body-sm font-weight-medium text-foreground mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                placeholder="Describe this space..."
                className="w-full px-4 py-2 border-2 border-border rounded-button focus:outline-none focus:border-primary resize-none"
              />
            </div>
          </div>
        </div>

        <div className="bg-background border-2 border-border rounded-card p-6">
          <h2 className="text-h4-md font-weight-semibold text-foreground mb-4 flex items-center gap-2">
            <Users className="h-5 w-5" />
            Capacity & Pricing
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-body-sm font-weight-medium text-foreground mb-1">
                Maximum Capacity *
              </label>
              <input
                type="number"
                name="capacity"
                value={formData.capacity}
                onChange={handleChange}
                placeholder="Number of guests"
                min="1"
                className={`w-full px-4 py-2 border-2 rounded-button focus:outline-none focus:border-primary ${
                  errors.capacity ? 'border-destructive' : 'border-border'
                }`}
              />
              {errors.capacity && (
                <p className="text-body-xs text-destructive mt-1">{errors.capacity}</p>
              )}
            </div>
            <div>
              <label className="block text-body-sm font-weight-medium text-foreground mb-1">
                Base Price ($)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="number"
                  name="base_price"
                  value={formData.base_price}
                  onChange={handleChange}
                  placeholder="Starting price"
                  min="0"
                  step="0.01"
                  className="w-full pl-10 pr-4 py-2 border-2 border-border rounded-button focus:outline-none focus:border-primary"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-background border-2 border-border rounded-card p-6">
          <h2 className="text-h4-md font-weight-semibold text-foreground mb-4">Amenities</h2>
          <div className="grid grid-cols-3 gap-2">
            {AMENITIES.map((amenity) => (
              <button
                key={amenity}
                type="button"
                onClick={() => toggleAmenity(amenity)}
                className={`flex items-center gap-2 px-3 py-2 rounded-button border-2 text-left transition-colors ${
                  formData.amenities.includes(amenity)
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-border hover:bg-muted'
                }`}
              >
                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                  formData.amenities.includes(amenity)
                    ? 'bg-primary border-primary'
                    : 'border-muted-foreground'
                }`}>
                  {formData.amenities.includes(amenity) && (
                    <Check className="h-3 w-3 text-white" />
                  )}
                </div>
                <span className="text-body-sm">{amenity}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-background border-2 border-border rounded-card p-6">
          <h2 className="text-h4-md font-weight-semibold text-foreground mb-4">Status</h2>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setFormData((prev) => ({ ...prev, is_active: !prev.is_active }));
                setHasChanges(true);
              }}
              className={`relative w-12 h-6 rounded-avatar transition-colors ${
                formData.is_active ? 'bg-success' : 'bg-muted'
              }`}
            >
              <div
                className={`absolute top-1 w-4 h-4 bg-white rounded-avatar transition-transform ${
                  formData.is_active ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
            <span className="text-body-sm text-foreground">
              {formData.is_active ? 'Active - Space is available for booking' : 'Inactive - Space is hidden from booking'}
            </span>
          </div>
        </div>

        {errors.submit && (
          <div className="p-4 bg-destructive/10 border-2 border-destructive rounded-card">
            <p className="text-body-sm text-destructive">{errors.submit}</p>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div>
            {hasChanges && (
              <span className="text-body-xs text-warning">You have unsaved changes</span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Link
              href={`/spaces/${spaceId}`}
              className="px-6 py-2 border-2 border-border rounded-button hover:bg-muted transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={updateSpace.isPending || !hasChanges}
              className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-button hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {updateSpace.isPending ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
