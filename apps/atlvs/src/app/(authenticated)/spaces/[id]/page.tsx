'use client';

import {
  Body,
  H1,
  H2,
  Text,
} from '@ghxstship/ui';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Edit2, Calendar, Users, DollarSign, MapPin, Layers } from 'lucide-react';
import { useSpace, useSpaceCapacityConfigs, useSpacePricingRules } from '@/hooks/useSpaces';

export default function SpaceDetailPage() {
  const params = useParams();
  const spaceId = params.id as string;

  const { data: spaceData, isLoading, error } = useSpace(spaceId);
  const { data: capacityData } = useSpaceCapacityConfigs(spaceId);
  const { data: pricingData } = useSpacePricingRules(spaceId);

  const space = spaceData?.space;
  const capacityConfigs = capacityData?.configs || [];
  const pricingRules = pricingData?.rules || [];

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-muted-foreground">Loading space...</div>
      </div>
    );
  }

  if (error || !space) {
    return (
      <div className="p-6">
        <div className="text-center py-12 bg-destructive/10 border-2 border-destructive rounded-card">
          <Body className="text-destructive">Space not found</Body>
          <Link href="/spaces" className="text-primary hover:underline mt-2 inline-block">
            Back to Spaces
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/spaces"
            className="p-2 hover:bg-muted rounded-button transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <H1 className="text-h2-md font-weight-bold text-foreground">{space.name}</H1>
              <Text className={`px-2 py-0.5 text-body-xs rounded ${
                space.is_active ? 'bg-success-100 text-success-800' : 'bg-ink-100 text-ink-800'
              }`}>
                {space.is_active ? 'Active' : 'Inactive'}
              </Text>
            </div>
            {space.venue && (
              <Body className="text-body-sm text-muted-foreground mt-1">
                {space.venue.name}
              </Body>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={`/spaces/${spaceId}/capacity`}
            className="flex items-center gap-2 px-4 py-2 border-2 border-border rounded-button hover:bg-muted transition-colors"
          >
            <Layers className="h-4 w-4" />
            <Text className="text-body-sm">Layouts</Text>
          </Link>
          <Link
            href={`/spaces/${spaceId}/pricing`}
            className="flex items-center gap-2 px-4 py-2 border-2 border-border rounded-button hover:bg-muted transition-colors"
          >
            <DollarSign className="h-4 w-4" />
            <Text className="text-body-sm">Pricing</Text>
          </Link>
          <Link
            href={`/spaces/${spaceId}/edit`}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-button hover:bg-primary/90 transition-colors"
          >
            <Edit2 className="h-4 w-4" />
            <Text className="text-body-sm font-weight-medium">Edit</Text>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          {space.photos && space.photos.length > 0 && (
            <div className="bg-background border-2 border-border rounded-card overflow-hidden">
              <div className="h-64 bg-muted/50 relative">
                <Image
                  src={space.photos[0]}
                  alt={space.name}
                  fill
                  className="object-cover"
                />
              </div>
              {space.photos.length > 1 && (
                <div className="p-4 flex gap-2 overflow-x-auto">
                  {space.photos.slice(1).map((photo, index) => (
                    <Image
                      key={index}
                      src={photo}
                      alt={`${space.name} ${index + 2}`}
                      width={80}
                      height={80}
                      className="object-cover rounded border-2 border-border"
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="bg-background border-2 border-border rounded-card p-6">
            <H2 className="text-h4-md font-weight-semibold text-foreground mb-4">Description</H2>
            <Body className="text-body-md text-muted-foreground">
              {space.description || 'No description available'}
            </Body>
          </div>

          <div className="bg-background border-2 border-border rounded-card p-6">
            <div className="flex items-center justify-between mb-4">
              <H2 className="text-h4-md font-weight-semibold text-foreground">Capacity Configurations</H2>
              <Link
                href={`/spaces/${spaceId}/capacity`}
                className="text-body-sm text-primary hover:underline"
              >
                Manage
              </Link>
            </div>
            {capacityConfigs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <Body className="text-body-sm">No capacity configurations</Body>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {capacityConfigs.slice(0, 4).map((config: { id: string; layout_name: string; layout_type: string; capacity: number; is_default: boolean }) => (
                  <div
                    key={config.id}
                    className={`p-3 rounded-card border ${
                      config.is_default ? 'border-primary bg-primary/5' : 'border-border'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <Text className="text-body-sm font-weight-medium text-foreground">
                        {config.layout_name}
                      </Text>
                      {config.is_default && (
                        <Text className="text-body-xs text-primary">Default</Text>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-body-xs text-muted-foreground">
                      <Text className="capitalize">{config.layout_type}</Text>
                      <Text>•</Text>
                      <Text>{config.capacity} guests</Text>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-background border-2 border-border rounded-card p-6">
            <div className="flex items-center justify-between mb-4">
              <H2 className="text-h4-md font-weight-semibold text-foreground">Pricing Rules</H2>
              <Link
                href={`/spaces/${spaceId}/pricing`}
                className="text-body-sm text-primary hover:underline"
              >
                Manage
              </Link>
            </div>
            {pricingRules.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <DollarSign className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <Body className="text-body-sm">No pricing rules</Body>
              </div>
            ) : (
              <div className="space-y-2">
                {pricingRules.slice(0, 5).map((rule: { id: string; name: string; rule_type: string; price: number; price_unit: string }) => (
                  <div
                    key={rule.id}
                    className="flex items-center justify-between p-3 border-2 border-border rounded"
                  >
                    <div>
                      <Text className="text-body-sm font-weight-medium text-foreground">
                        {rule.name}
                      </Text>
                      <Text className="text-body-xs text-muted-foreground ml-2 capitalize">
                        ({rule.rule_type})
                      </Text>
                    </div>
                    <Text className="text-body-sm font-weight-semibold text-foreground">
                      ${rule.price}
                      <Text className="text-body-xs text-muted-foreground ml-1">
                        /{rule.price_unit}
                      </Text>
                    </Text>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-background border-2 border-border rounded-card p-6">
            <H2 className="text-h4-md font-weight-semibold text-foreground mb-4">Details</H2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-muted-foreground" />
                <div>
                  <Body className="text-body-xs text-muted-foreground">Max Capacity</Body>
                  <Body className="text-body-md font-weight-medium text-foreground">
                    {space.capacity || 0} guests
                  </Body>
                </div>
              </div>
              {space.base_price && (
                <div className="flex items-center gap-3">
                  <DollarSign className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <Body className="text-body-xs text-muted-foreground">Base Price</Body>
                    <Body className="text-body-md font-weight-medium text-foreground">
                      ${space.base_price}
                    </Body>
                  </div>
                </div>
              )}
            </div>
          </div>

          {space.amenities && space.amenities.length > 0 && (
            <div className="bg-background border-2 border-border rounded-card p-6">
              <H2 className="text-h4-md font-weight-semibold text-foreground mb-4">Amenities</H2>
              <div className="flex flex-wrap gap-2">
                {space.amenities.map((amenity, index) => (
                  <Text
                    key={index}
                    className="px-3 py-1 bg-muted text-muted-foreground text-body-xs rounded-avatar"
                  >
                    {amenity}
                  </Text>
                ))}
              </div>
            </div>
          )}

          <div className="bg-background border-2 border-border rounded-card p-6">
            <H2 className="text-h4-md font-weight-semibold text-foreground mb-4">Quick Actions</H2>
            <div className="space-y-2">
              <Link
                href={`/calendar?space=${spaceId}`}
                className="flex items-center gap-2 px-4 py-2 w-full text-left hover:bg-muted rounded-button transition-colors"
              >
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <Text className="text-body-sm">View Calendar</Text>
              </Link>
              <Link
                href={`/bookings/new?space=${spaceId}`}
                className="flex items-center gap-2 px-4 py-2 w-full text-left hover:bg-muted rounded-button transition-colors"
              >
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <Text className="text-body-sm">Create Booking</Text>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
