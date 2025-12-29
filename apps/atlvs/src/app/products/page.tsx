"use client";

/**
 * Products Page
 * Product suite overview
 * Uses DetailPage template for consistent layout
 */

import { useRouter } from "next/navigation";
import { Zap, Users, Ticket, ArrowRight, List, Star } from "lucide-react";
import {
  Body,
  Button,
  Card,
  Grid,
  Stack,
  DetailPage,
  Section,
  SectionHeader,
} from "@ghxstship/ui";

const PRODUCTS = [
  { id: "atlvs", name: "ATLVS", tagline: "Production Management", description: "Complete production management platform for live events", icon: <Zap className="size-8" />, href: "/products/atlvs", features: ["Production planning", "Team collaboration", "Document management", "Budget tracking"] },
  { id: "compvss", name: "COMPVSS", tagline: "Crew Management", description: "Comprehensive crew and talent management solution", icon: <Users className="size-8" />, href: "/products/compvss", features: ["Crew scheduling", "Talent database", "Availability tracking", "Payroll integration"] },
  { id: "gvteway", name: "GVTEWAY", tagline: "Ticketing & Access", description: "Modern ticketing and access control platform", icon: <Ticket className="size-8" />, href: "/products/gvteway", features: ["Ticket sales", "Access control", "Event discovery", "Analytics"] },
];

export default function ProductsPage() {
  const router = useRouter();

  const tabs = [
    {
      id: "products",
      label: "Products",
      icon: <List className="size-4" />,
      content: (
        <Section>
          <Grid cols={3} gap={6} className="grid-cols-1 md:grid-cols-3">
            {PRODUCTS.map((product) => (
              <Card key={product.id} className="p-6 cursor-pointer hover:border-primary transition-colors" onClick={() => router.push(product.href)}>
                <div className="p-4 bg-primary/20 rounded-card text-primary w-fit mb-4">{product.icon}</div>
                <Body className="font-weight-bold font-weight-bold">{product.name}</Body>
                <Body size="sm" className="text-primary mb-2">{product.tagline}</Body>
                <Body className="text-grey-400 mb-4">{product.description}</Body>
                <Stack gap={2} className="mb-6">
                  {product.features.map((feature, idx) => (
                    <Stack key={idx} direction="horizontal" gap={2} className="items-center">
                      <div className="size-1.5 rounded-avatar bg-primary" />
                      <Body size="sm">{feature}</Body>
                    </Stack>
                  ))}
                </Stack>
                <Button variant="outline" className="w-full" icon={<ArrowRight className="size-4" />} iconPosition="right">Learn More</Button>
              </Card>
            ))}
          </Grid>

          <Card className="p-8 mt-8 text-center">
            <Body className="font-weight-bold font-weight-bold mb-2">Need all three?</Body>
            <Body className="text-grey-400 mb-4">Get the complete GHXSTSHIP suite for the best value</Body>
            <div className="flex gap-4 justify-center">
              <Button variant="solid" onClick={() => router.push("/products/compare")}>Compare Products</Button>
              <Button variant="outline" onClick={() => router.push("/pricing")}>View Pricing</Button>
            </div>
          </Card>
        </Section>
      ),
    },
    {
      id: "compare",
      label: "Compare",
      icon: <Star className="size-4" />,
      content: (
        <Section>
          <SectionHeader title="Compare Products" description="Find the right solution for your needs" />
          <Button variant="solid" className="mt-4" onClick={() => router.push("/products/compare")}>View Full Comparison</Button>
        </Section>
      ),
    },
  ];

  return (
    <DetailPage
      header={{
        kicker: "Platform",
        title: "Our Products",
        description: "The complete suite for live event management",
      }}
      tabs={tabs}
      actions={<Button variant="solid" onClick={() => router.push("/demo")}>Request Demo</Button>}
    />
  );
}
