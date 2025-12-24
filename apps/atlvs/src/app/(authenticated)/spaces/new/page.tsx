'use client';

import {
  Body,
  Button,
  Form,
  H1,
  H2,
  Input,
  Label,
  Text,
  Textarea,
} from '@ghxstship/ui';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, MapPin, Users, Check } from 'lucide-react';
import { useCreateSpace } from '@/hooks/useSpaces';

export default function NewSpacePage() {
  const router = useRouter();
  const createSpace = useCreateSpace();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    capacity: '',
    base_price: '',
    venue_id: '',
    amenities: [] as string[],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const AMENITIES = [
    'WiFi', 'Projector', 'Sound System', 'Microphone', 'Stage',
    'Dance Floor', 'Kitchen', 'Bar', 'Outdoor Access', 'Parking',
    'Coat Check', 'Bridal Suite', 'Green Room', 'Loading Dock',
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
      const result = await createSpace.mutateAsync({
        venue_id: formData.venue_id || 'default', // Will be set by backend
        name: formData.name,
        description: formData.description || undefined,
        capacity: parseInt(formData.capacity),
        base_price: formData.base_price ? parseFloat(formData.base_price) : undefined,
        amenities: formData.amenities.length > 0 ? formData.amenities : undefined,
        is_active: true,
      });
      if (result?.space?.id) {
        router.push(`/spaces/${result.space.id}`);
      } else {
        router.push('/spaces');
      }
    } catch (error) {
      setErrors({ submit: 'Failed to create space' });
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/spaces"
          className="p-2 hover:bg-muted rounded-button transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-muted-foreground" />
        </Link>
        <div>
          <H1 className="text-h2-md font-weight-bold text-foreground">New Space</H1>
          <Body className="text-body-sm text-muted-foreground mt-1">
            Add a new space to your venue
          </Body>
        </div>
      </div>

      <Form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-background border-2 border-border rounded-card p-6">
          <H2 className="text-h4-md font-weight-semibold text-foreground mb-4 flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Basic Information
          </H2>
          <div className="space-y-4">
            <div>
              <Label className="block text-body-sm font-weight-medium text-foreground mb-1">
                Space Name *
              </Label>
              <Input
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
                <Body className="text-body-xs text-destructive mt-1">{errors.name}</Body>
              )}
            </div>
            <div>
              <Label className="block text-body-sm font-weight-medium text-foreground mb-1">
                Description
              </Label>
              <Textarea
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
          <H2 className="text-h4-md font-weight-semibold text-foreground mb-4 flex items-center gap-2">
            <Users className="h-5 w-5" />
            Capacity & Pricing
          </H2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="block text-body-sm font-weight-medium text-foreground mb-1">
                Maximum Capacity *
              </Label>
              <Input
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
                <Body className="text-body-xs text-destructive mt-1">{errors.capacity}</Body>
              )}
            </div>
            <div>
              <Label className="block text-body-sm font-weight-medium text-foreground mb-1">
                Base Price ($)
              </Label>
              <Input
                type="number"
                name="base_price"
                value={formData.base_price}
                onChange={handleChange}
                placeholder="Starting price"
                min="0"
                step="0.01"
                className="w-full px-4 py-2 border-2 border-border rounded-button focus:outline-none focus:border-primary"
              />
            </div>
          </div>
        </div>

        <div className="bg-background border-2 border-border rounded-card p-6">
          <H2 className="text-h4-md font-weight-semibold text-foreground mb-4">Amenities</H2>
          <div className="grid grid-cols-3 gap-2">
            {AMENITIES.map((amenity) => (
              <Button
                key={amenity}
                type="button"
                onClick={() => toggleAmenity(amenity)}
                className={`flex items-center gap-2 px-3 py-2 rounded-button border-2 text-left transition-colors ${
                  formData.amenities.includes(amenity)
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-border hover:bg-muted'
                }`}
              >
                <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                  formData.amenities.includes(amenity)
                    ? 'bg-primary border-primary'
                    : 'border-muted-foreground'
                }`}>
                  {formData.amenities.includes(amenity) && (
                    <Check className="h-3 w-3 text-white" />
                  )}
                </div>
                <Text className="text-body-sm">{amenity}</Text>
              </Button>
            ))}
          </div>
        </div>

        {errors.submit && (
          <div className="p-4 bg-destructive/10 border-2 border-destructive rounded-card">
            <Body className="text-body-sm text-destructive">{errors.submit}</Body>
          </div>
        )}

        <div className="flex items-center justify-end gap-3">
          <Link
            href="/spaces"
            className="px-6 py-2 border-2 border-border rounded-button hover:bg-muted transition-colors"
          >
            Cancel
          </Link>
          <Button
            type="submit"
            disabled={createSpace.isPending}
            className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-button hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {createSpace.isPending ? 'Creating...' : 'Create Space'}
          </Button>
        </div>
      </Form>
    </div>
  );
}
