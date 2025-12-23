"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
// Layout provided by route group
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
  Select,
} from "@ghxstship/ui";
import {
  useVendorsForCompare,
  type VendorCompare as Vendor,
} from '../../../../hooks/useVendorCompare';

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
  const { data: vendors = [] } = useVendorsForCompare();
  const [selectedVendors, setSelectedVendors] = useState<string[]>([]);
  const [categoryFilter, setCategoryFilter] = useState("All");

  const toggleVendor = (id: string) => {
    if (selectedVendors.includes(id)) {
      setSelectedVendors(selectedVendors.filter(v => v !== id));
    } else if (selectedVendors.length < 4) {
      setSelectedVendors([...selectedVendors, id]);
    }
  };

  const comparedVendors = vendors.filter(v => selectedVendors.includes(v.id));

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case "Available": return "text-success-400";
      case "Limited": return "text-warning-400";
      case "Booked": return "bg-success-100 text-success-800";
      default: return "text-ink-400";
    }
  };

  const getPricingColor = (pricing: string) => {
    switch (pricing) {
      case "Budget": return "bg-success-900/20 border-success-800";
      case "Mid-Range": return "bg-warning-900/20 border-warning-800";
      case "Premium": return "bg-violet-900/20 border-violet-800";
      default: return "bg-ink-900/50 border-ink-800";
    }
  };

  return (
    <>
      <EnterprisePageHeader
        title="Vendor Comparison"
        subtitle="Compare vendors side-by-side to make informed decisions"


        showFavorite
        showSettings
      />
      <MainContent padding="lg">
        <Container>
          <Stack gap={10}>

            <Grid cols={4} gap={6} className="sm:grid-cols-2 lg:grid-cols-4">
              <StatCard label="Vendors Available" value={vendors.length.toString()} />
              <StatCard label="Comparing" value={selectedVendors.length.toString()} />
              <StatCard label="Avg Rating" value="4.6" />
              <StatCard label="Available Now" value={vendors.filter(v => v.availability === "Available").length.toString()} />
            </Grid>

            <Card>
              <Stack gap={4}>
                <Stack direction="horizontal" className="justify-between items-center">
                  <Body size="sm" className="">Select vendors to compare (max 4)</Body>
                  <Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                    <option value="All">All Categories</option>
                    <option value="Audio">Audio</option>
                    <option value="Lighting">Lighting</option>
                    <option value="Video">Video</option>
                    <option value="Staging">Staging</option>
                  </Select>
                </Stack>
                <Grid cols={4} gap={3} className="sm:grid-cols-2 lg:grid-cols-4">
                  {vendors.filter(v => categoryFilter === "All" || v.category === categoryFilter).map((vendor) => (
                    <Card key={vendor.id} onClick={() => toggleVendor(vendor.id)}>
                      <Stack gap={2}>
                        <Stack direction="horizontal" className="justify-between items-start">
                          <Body>{vendor.name}</Body>
                          {selectedVendors.includes(vendor.id) && <Badge variant="solid">✓</Badge>}
                        </Stack>
                        <Stack direction="horizontal" gap={2}>
                          <Body size="sm" className={getAvailabilityColor(vendor.availability)}>{vendor.availability}</Body>
                          <Badge className={getPricingColor(vendor.pricing)}>{vendor.pricing}</Badge>
                        </Stack>
                      </Stack>
                    </Card>
                  ))}
                </Grid>
              </Stack>
            </Card>

            {comparedVendors.length >= 2 && (
              <Card>
                <Stack gap={4}>
                  <Grid cols={4} gap={4} className="sm:grid-cols-2 lg:grid-cols-4">
                    <Body size="sm" className="">Comparison</Body>
                    {comparedVendors.slice(0, 3).map((vendor) => (
                      <Stack key={vendor.id} gap={1} className="text-center">
                        <Body className="font-display">{vendor.name}</Body>
                        <Badge variant="outline">{vendor.pricing}</Badge>
                      </Stack>
                    ))}
                  </Grid>

                  {comparisonMetrics.map((metric) => (
                    <Grid key={metric.key} cols={4} gap={4}>
                      <Body size="sm" className="">{metric.label}</Body>
                      {comparedVendors.slice(0, 3).map((vendor) => (
                        <Body key={vendor.id} className="text-center">
                          {metric.format(vendor)}
                        </Body>
                      ))}
                    </Grid>
                  ))}

                  <Grid cols={4} gap={4} className="sm:grid-cols-2 lg:grid-cols-4">
                    <Body size="sm" className="">Certifications</Body>
                    {comparedVendors.slice(0, 3).map((vendor) => (
                      <Stack key={vendor.id} gap={1} className="text-center">
                        {vendor.certifications.map(cert => <Badge key={cert} variant="outline">{cert}</Badge>)}
                      </Stack>
                    ))}
                  </Grid>

                  <Grid cols={4} gap={4} className="sm:grid-cols-2 lg:grid-cols-4">
                    <Body size="sm" className="">Specialties</Body>
                    {comparedVendors.slice(0, 3).map((vendor) => (
                      <Stack key={vendor.id} gap={1} className="text-center">
                        {vendor.specialties.map(spec => <Badge key={spec} variant="outline">{spec}</Badge>)}
                      </Stack>
                    ))}
                  </Grid>

                  <Grid cols={4} gap={4} className="sm:grid-cols-2 lg:grid-cols-4">
                    <Body size="sm" className="">Rating</Body>
                    {comparedVendors.slice(0, 3).map((vendor) => (
                      <Stack key={vendor.id} gap={2}>
                        <ProgressBar value={vendor.rating * 20} />
                        <Body size="sm" className=" text-center">{vendor.reviews} reviews</Body>
                      </Stack>
                    ))}
                  </Grid>

                  <Grid cols={4} gap={4} className="sm:grid-cols-2 lg:grid-cols-4">
                    <Body size="sm" className="">Actions</Body>
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
                <Body size="sm" className=" text-center">Select at least 2 vendors to compare</Body>
              </Card>
            )}

            <Grid cols={3} gap={4} className="sm:grid-cols-2 lg:grid-cols-3">
              <Button variant="outline">Export Comparison</Button>
              <Button variant="outline" onClick={() => router.push("/vendors")}>All Vendors</Button>
              <Button variant="outline" onClick={() => router.push("/procurement")}>Procurement</Button>
            </Grid>
          </Stack>
        </Container>
      </MainContent>
    </>
  );
}
