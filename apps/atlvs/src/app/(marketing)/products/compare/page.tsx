"use client";

/**
 * Product Comparison Page
 * Compare all products
 * Uses DetailPage template for consistent layout
 */

import { useRouter } from "next/navigation";
import { Check, X, Zap, Users, Ticket, List } from "lucide-react";
import {
  Body, Button, Card, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, DetailPage, Section} from "@ghxstship/ui";

const PRODUCTS = [
  { id: "atlvs", name: "ATLVS", icon: <Zap className="size-5" /> },
  { id: "compvss", name: "COMPVSS", icon: <Users className="size-5" /> },
  { id: "gvteway", name: "GVTEWAY", icon: <Ticket className="size-5" /> },
];

const FEATURES = [
  { category: "Production", features: [
    { name: "Production Planning", atlvs: true, compvss: false, gvteway: false },
    { name: "Document Management", atlvs: true, compvss: false, gvteway: false },
    { name: "Budget Tracking", atlvs: true, compvss: false, gvteway: false },
    { name: "Vendor Management", atlvs: true, compvss: false, gvteway: false },
  ]},
  { category: "Crew", features: [
    { name: "Crew Database", atlvs: false, compvss: true, gvteway: false },
    { name: "Scheduling", atlvs: false, compvss: true, gvteway: false },
    { name: "Time Tracking", atlvs: false, compvss: true, gvteway: false },
    { name: "Payroll Integration", atlvs: false, compvss: true, gvteway: false },
  ]},
  { category: "Ticketing", features: [
    { name: "Ticket Sales", atlvs: false, compvss: false, gvteway: true },
    { name: "Access Control", atlvs: false, compvss: false, gvteway: true },
    { name: "Event Discovery", atlvs: false, compvss: false, gvteway: true },
    { name: "Attendee Analytics", atlvs: false, compvss: false, gvteway: true },
  ]},
  { category: "General", features: [
    { name: "Team Collaboration", atlvs: true, compvss: true, gvteway: true },
    { name: "Mobile App", atlvs: true, compvss: true, gvteway: true },
    { name: "API Access", atlvs: true, compvss: true, gvteway: true },
    { name: "SSO Support", atlvs: true, compvss: true, gvteway: true },
  ]},
];

export default function ProductComparePage() {
  const router = useRouter();

  const tabs = [
    {
      id: "compare",
      label: "Compare",
      icon: <List className="size-4" />,
      content: (
        <Section>
          <Card className="overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-1/4">Feature</TableHead>
                  {PRODUCTS.map((product) => (
                    <TableHead key={product.id} className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        {product.icon}
                        <Body className="font-weight-bold">{product.name}</Body>
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {FEATURES.map((category) => (
                  <>
                    <TableRow key={category.category}>
                      <TableCell colSpan={4} className="bg-grey-800">
                        <Body className="font-weight-bold">{category.category}</Body>
                      </TableCell>
                    </TableRow>
                    {category.features.map((feature) => (
                      <TableRow key={feature.name}>
                        <TableCell><Body size="sm">{feature.name}</Body></TableCell>
                        <TableCell className="text-center">{feature.atlvs ? <Check className="size-5 text-success mx-auto" /> : <X className="size-5 text-on-dark-disabled mx-auto" />}</TableCell>
                        <TableCell className="text-center">{feature.compvss ? <Check className="size-5 text-success mx-auto" /> : <X className="size-5 text-on-dark-disabled mx-auto" />}</TableCell>
                        <TableCell className="text-center">{feature.gvteway ? <Check className="size-5 text-success mx-auto" /> : <X className="size-5 text-on-dark-disabled mx-auto" />}</TableCell>
                      </TableRow>
                    ))}
                  </>
                ))}
              </TableBody>
            </Table>
          </Card>

          <Card className="p-8 mt-8 text-center">
            <Body className="font-weight-bold font-weight-bold mb-2">Need the complete suite?</Body>
            <Body className="text-on-dark-muted mb-4">Get all three products bundled together for the best value</Body>
            <div className="flex gap-4 justify-center">
              <Button variant="solid" onClick={() => router.push("/demo")}>Request Demo</Button>
              <Button variant="outline" onClick={() => router.push("/pricing")}>View Pricing</Button>
            </div>
          </Card>
        </Section>
      ),
    },
  ];

  return (
    <DetailPage
      header={{ kicker: "Products", title: "Compare Products", description: "Find the right solution for your needs" }}
      backButton={{ label: "Products", href: "/products" }}
      tabs={tabs}
    />
  );
}
