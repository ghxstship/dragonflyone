"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Navigation } from "../../../components/navigation";
import {
  Container, H1, H3, Body, Label, Grid, Stack, StatCard, Input, Select, Button,
  Section as UISection, Card, Tabs, TabsList, Tab, TabPanel, Badge,
  Modal, ModalHeader, ModalBody, ModalFooter, ProgressBar,
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
      case "Available": return "text-green-400";
      case "Limited": return "text-yellow-400";
      case "Booked": return "text-red-400";
      default: return "text-ink-400";
    }
  };

  const getPricingColor = (pricing: string) => {
    switch (pricing) {
      case "Budget": return "bg-green-900/20 border-green-800";
      case "Mid-Range": return "bg-yellow-900/20 border-yellow-800";
      case "Premium": return "bg-purple-900/20 border-purple-800";
      default: return "bg-ink-900/50 border-ink-800";
    }
  };

  return (
    <UISection className="relative min-h-screen overflow-hidden bg-ink-950 text-ink-50">
      <Card className="pointer-events-none absolute inset-0 grid-overlay opacity-40" />
      <Navigation />
      <Container className="py-16">
        <Stack gap={8}>
          <Stack gap={2}>
            <H1>Vendor Comparison</H1>
            <Label className="text-ink-400">Compare vendors side-by-side to make informed decisions</Label>
          </Stack>

          <Grid cols={4} gap={6}>
            <StatCard label="Vendors Available" value={mockVendors.length} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Comparing" value={selectedVendors.length} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Avg Rating" value="4.6" className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Available Now" value={mockVendors.filter(v => v.availability === "Available").length} className="bg-transparent border-2 border-ink-800" />
          </Grid>

          <Card className="border-2 border-ink-800 bg-ink-900/50 p-4">
            <Stack gap={4}>
              <Label className="text-ink-400">Select vendors to compare (max 4)</Label>
              <Grid cols={4} gap={3}>
                {mockVendors.map((vendor) => (
                  <Card key={vendor.id} className={`p-3 border-2 cursor-pointer ${selectedVendors.includes(vendor.id) ? "border-white bg-ink-800" : "border-ink-700"}`} onClick={() => toggleVendor(vendor.id)}>
                    <Stack gap={2}>
                      <Stack direction="horizontal" className="justify-between items-start">
                        <Label className="text-white">{vendor.name}</Label>
                        {selectedVendors.includes(vendor.id) && <Badge variant="solid">✓</Badge>}
                      </Stack>
                      <Label size="xs" className="text-ink-400">{vendor.rating}★ • {vendor.pricing}</Label>
                    </Stack>
                  </Card>
                ))}
              </Grid>
            </Stack>
          </Card>

          {comparedVendors.length >= 2 && (
            <Card className="border-2 border-ink-800 bg-ink-900/50 overflow-hidden">
              <Card className="p-4 bg-ink-800 border-b border-ink-700">
                <Grid cols={4} gap={4}>
                  <Label className="text-ink-400">Comparison</Label>
                  {comparedVendors.slice(0, 3).map((vendor) => (
                    <Stack key={vendor.id} gap={1} className="text-center">
                      <Body className="font-display text-white">{vendor.name}</Body>
                      <Badge variant="outline" className={getPricingColor(vendor.pricing)}>{vendor.pricing}</Badge>
                    </Stack>
                  ))}
                </Grid>
              </Card>

              <Stack className="p-4" gap={0}>
                {comparisonMetrics.map((metric, idx) => (
                  <Grid key={metric.key} cols={4} gap={4} className={`py-3 ${idx < comparisonMetrics.length - 1 ? "border-b border-ink-800" : ""}`}>
                    <Label className="text-ink-400">{metric.label}</Label>
                    {comparedVendors.slice(0, 3).map((vendor) => (
                      <Label key={vendor.id} className={`text-center ${metric.key === "availability" ? getAvailabilityColor(vendor.availability) : "text-white"}`}>
                        {metric.format(vendor)}
                      </Label>
                    ))}
                  </Grid>
                ))}

                <Grid cols={4} gap={4} className="py-3 border-t border-ink-700 mt-2">
                  <Label className="text-ink-400">Certifications</Label>
                  {comparedVendors.slice(0, 3).map((vendor) => (
                    <Stack key={vendor.id} gap={1} className="text-center">
                      {vendor.certifications.map(cert => <Badge key={cert} variant="outline">{cert}</Badge>)}
                    </Stack>
                  ))}
                </Grid>

                <Grid cols={4} gap={4} className="py-3 border-t border-ink-800">
                  <Label className="text-ink-400">Specialties</Label>
                  {comparedVendors.slice(0, 3).map((vendor) => (
                    <Stack key={vendor.id} gap={1} className="text-center">
                      {vendor.specialties.map(spec => <Badge key={spec} variant="outline">{spec}</Badge>)}
                    </Stack>
                  ))}
                </Grid>

                <Grid cols={4} gap={4} className="py-3 border-t border-ink-800">
                  <Label className="text-ink-400">Rating</Label>
                  {comparedVendors.slice(0, 3).map((vendor) => (
                    <Stack key={vendor.id} gap={2}>
                      <ProgressBar value={vendor.rating * 20} className="h-2" />
                      <Label size="xs" className="text-ink-400 text-center">{vendor.reviews} reviews</Label>
                    </Stack>
                  ))}
                </Grid>
              </Stack>

              <Card className="p-4 bg-ink-800 border-t border-ink-700">
                <Grid cols={4} gap={4}>
                  <Label className="text-ink-400">Actions</Label>
                  {comparedVendors.slice(0, 3).map((vendor) => (
                    <Stack key={vendor.id} gap={2}>
                      <Button variant="solid" size="sm">Request Quote</Button>
                      <Button variant="outline" size="sm">View Profile</Button>
                    </Stack>
                  ))}
                </Grid>
              </Card>
            </Card>
          )}

          {comparedVendors.length < 2 && (
            <Card className="border-2 border-ink-800 bg-ink-900/50 p-8 text-center">
              <Label className="text-ink-400">Select at least 2 vendors to compare</Label>
            </Card>
          )}

          <Grid cols={3} gap={4}>
            <Button variant="outline" className="border-ink-700 text-ink-400">Export Comparison</Button>
            <Button variant="outline" className="border-ink-700 text-ink-400" onClick={() => router.push("/vendors")}>All Vendors</Button>
            <Button variant="outline" className="border-ink-700 text-ink-400" onClick={() => router.push("/procurement")}>Procurement</Button>
          </Grid>
        </Stack>
      </Container>
    </UISection>
  );
}
