"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CompvssAppLayout } from "../../../components/app-layout";
import {
  Container,
  Body,
  Grid,
  Stack,
  StatCard,
  Button,
  Card,
  Badge,
  ProgressBar,
  EnterprisePageHeader,
  MainContent,
} from "@ghxstship/ui";

interface Vendor {
  id: string;
  name: string;
  category: string;
  rating: number;
  reviews: number;
  location: string;
  distance: string;
  pricing: "Budget" | "Mid-Range" | "Premium";
  responseTime: string;
  completedProjects: number;
  certifications: string[];
  specialties: string[];
  availability: "Available" | "Limited" | "Booked";
}

const mockVendors: Vendor[] = [
  { id: "VND-001", name: "Pro Audio Solutions", category: "Audio", rating: 4.8, reviews: 156, location: "Los Angeles, CA", distance: "12 mi", pricing: "Premium", responseTime: "< 2 hours", completedProjects: 234, certifications: ["L-Acoustics", "d&b audiotechnik"], specialties: ["Festivals", "Concerts", "Corporate"], availability: "Available" },
  { id: "VND-002", name: "SoundWave Productions", category: "Audio", rating: 4.5, reviews: 89, location: "Burbank, CA", distance: "8 mi", pricing: "Mid-Range", responseTime: "< 4 hours", completedProjects: 156, certifications: ["JBL Professional"], specialties: ["Corporate", "Theater"], availability: "Available" },
  { id: "VND-003", name: "Elite Audio Services", category: "Audio", rating: 4.9, reviews: 203, location: "Santa Monica, CA", distance: "18 mi", pricing: "Premium", responseTime: "< 1 hour", completedProjects: 312, certifications: ["Meyer Sound", "L-Acoustics"], specialties: ["Festivals", "Tours", "Broadcast"], availability: "Limited" },
  { id: "VND-004", name: "Budget Sound Co", category: "Audio", rating: 4.2, reviews: 67, location: "Glendale, CA", distance: "5 mi", pricing: "Budget", responseTime: "< 6 hours", completedProjects: 89, certifications: ["QSC"], specialties: ["Corporate", "Small Events"], availability: "Available" },
];

const comparisonMetrics = [
  { key: "rating", label: "Rating", format: (v: Vendor) => `${v.rating}/5` },
  { key: "pricing", label: "Pricing Tier", format: (v: Vendor) => v.pricing },
  { key: "responseTime", label: "Response Time", format: (v: Vendor) => v.responseTime },
  { key: "completedProjects", label: "Completed Projects", format: (v: Vendor) => v.completedProjects.toString() },
  { key: "availability", label: "Availability", format: (v: Vendor) => v.availability },
  { key: "distance", label: "Distance", format: (v: Vendor) => v.distance },
];

export default function VendorComparePage() {
  const router = useRouter();
  const [selectedVendors, setSelectedVendors] = useState<string[]>(["VND-001", "VND-003"]);
  const [categoryFilter, setCategoryFilter] = useState("Audio");

  const toggleVendor = (id: string) => {
    if (selectedVendors.includes(id)) {
      setSelectedVendors(selectedVendors.filter(v => v !== id));
    } else if (selectedVendors.length < 4) {
      setSelectedVendors([...selectedVendors, id]);
    }
  };

  const comparedVendors = mockVendors.filter(v => selectedVendors.includes(v.id));

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case "Available": return "text-success-400";
      case "Limited": return "text-warning-400";
      case "Booked": return "text-error-400";
      default: return "text-ink-400";
    }
  };

  const getPricingColor = (pricing: string) => {
    switch (pricing) {
      case "Budget": return "bg-success-900/20 border-success-800";
      case "Mid-Range": return "bg-warning-900/20 border-warning-800";
      case "Premium": return "bg-purple-900/20 border-purple-800";
      default: return "bg-ink-900/50 border-ink-800";
    }
  };

  return (
    <CompvssAppLayout>
      <EnterprisePageHeader
        title="Vendor Comparison"
        subtitle="Compare vendors side-by-side to make informed decisions"
        breadcrumbs={[{ label: 'COMPVSS', href: '/dashboard' }, { label: 'Vendors', href: '/vendors' }, { label: 'Compare' }]}
        views={[{ id: 'default', label: 'Default', icon: 'grid' }]}
        activeView="default"
        showFavorite
        showSettings
      />
      <MainContent padding="lg">
        <Container>
          <Stack gap={10}>

            <Grid cols={4} gap={6}>
              <StatCard label="Vendors Available" value={mockVendors.length.toString()} />
              <StatCard label="Comparing" value={selectedVendors.length.toString()} />
              <StatCard label="Avg Rating" value="4.6" />
              <StatCard label="Available Now" value={mockVendors.filter(v => v.availability === "Available").length.toString()} />
            </Grid>

            <Card>
              <Stack gap={4}>
                <Body className="text-body-sm">Select vendors to compare (max 4)</Body>
                <Grid cols={4} gap={3}>
                  {mockVendors.map((vendor) => (
                    <Card key={vendor.id} onClick={() => toggleVendor(vendor.id)}>
                      <Stack gap={2}>
                        <Stack direction="horizontal" className="justify-between items-start">
                          <Body>{vendor.name}</Body>
                          {selectedVendors.includes(vendor.id) && <Badge variant="solid">✓</Badge>}
                        </Stack>
                        <Body className="text-body-sm">{vendor.rating}★ • {vendor.pricing}</Body>
                      </Stack>
                    </Card>
                  ))}
                </Grid>
              </Stack>
            </Card>

            {comparedVendors.length >= 2 && (
              <Card>
                <Stack gap={4}>
                  <Grid cols={4} gap={4}>
                    <Body className="text-body-sm">Comparison</Body>
                    {comparedVendors.slice(0, 3).map((vendor) => (
                      <Stack key={vendor.id} gap={1} className="text-center">
                        <Body className="font-display">{vendor.name}</Body>
                        <Badge variant="outline">{vendor.pricing}</Badge>
                      </Stack>
                    ))}
                  </Grid>

                  {comparisonMetrics.map((metric) => (
                    <Grid key={metric.key} cols={4} gap={4}>
                      <Body className="text-body-sm">{metric.label}</Body>
                      {comparedVendors.slice(0, 3).map((vendor) => (
                        <Body key={vendor.id} className="text-center">
                          {metric.format(vendor)}
                        </Body>
                      ))}
                    </Grid>
                  ))}

                  <Grid cols={4} gap={4}>
                    <Body className="text-body-sm">Certifications</Body>
                    {comparedVendors.slice(0, 3).map((vendor) => (
                      <Stack key={vendor.id} gap={1} className="text-center">
                        {vendor.certifications.map(cert => <Badge key={cert} variant="outline">{cert}</Badge>)}
                      </Stack>
                    ))}
                  </Grid>

                  <Grid cols={4} gap={4}>
                    <Body className="text-body-sm">Specialties</Body>
                    {comparedVendors.slice(0, 3).map((vendor) => (
                      <Stack key={vendor.id} gap={1} className="text-center">
                        {vendor.specialties.map(spec => <Badge key={spec} variant="outline">{spec}</Badge>)}
                      </Stack>
                    ))}
                  </Grid>

                  <Grid cols={4} gap={4}>
                    <Body className="text-body-sm">Rating</Body>
                    {comparedVendors.slice(0, 3).map((vendor) => (
                      <Stack key={vendor.id} gap={2}>
                        <ProgressBar value={vendor.rating * 20} />
                        <Body className="text-body-sm text-center">{vendor.reviews} reviews</Body>
                      </Stack>
                    ))}
                  </Grid>

                  <Grid cols={4} gap={4}>
                    <Body className="text-body-sm">Actions</Body>
                    {comparedVendors.slice(0, 3).map((vendor) => (
                      <Stack key={vendor.id} gap={2}>
                        <Button variant="solid" size="sm">Request Quote</Button>
                        <Button variant="outline" size="sm">View Profile</Button>
                      </Stack>
                    ))}
                  </Grid>
                </Stack>
              </Card>
            )}

            {comparedVendors.length < 2 && (
              <Card>
                <Body className="text-body-sm text-center">Select at least 2 vendors to compare</Body>
              </Card>
            )}

            <Grid cols={3} gap={4}>
              <Button variant="outline">Export Comparison</Button>
              <Button variant="outline" onClick={() => router.push("/vendors")}>All Vendors</Button>
              <Button variant="outline" onClick={() => router.push("/procurement")}>Procurement</Button>
            </Grid>
          </Stack>
        </Container>
      </MainContent>
    </CompvssAppLayout>
  );
}
