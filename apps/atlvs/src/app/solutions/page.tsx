"use client";

/**
 * Solutions Page
 * Industry solutions overview
 * Uses DetailPage template for consistent layout
 */

import { useRouter } from "next/navigation";
import { Music, Building2, Users, Briefcase, MapPin, Award, List, Star } from "lucide-react";
import {
  Body,
  Button,
  Card,
  Grid,
  DetailPage,
  Section,
  SectionHeader,
} from "@ghxstship/ui";

const SOLUTIONS = [
  { id: "festivals", title: "Festivals", description: "Multi-stage event management", icon: <Music className="size-6" />, href: "/solutions/festivals" },
  { id: "corporate", title: "Corporate Events", description: "Professional event management", icon: <Building2 className="size-6" />, href: "/solutions/corporate" },
  { id: "concerts", title: "Concerts", description: "Tour and concert production", icon: <Music className="size-6" />, href: "/solutions/concerts" },
  { id: "theater", title: "Theater", description: "Theater production management", icon: <Award className="size-6" />, href: "/solutions/theater" },
];

const ROLES = [
  { id: "artists", title: "Artists", description: "Manage bookings and career", href: "/solutions/artists" },
  { id: "contractors", title: "Contractors", description: "Freelance business tools", href: "/solutions/contractors" },
  { id: "brand-ambassadors", title: "Brand Ambassadors", description: "Activation management", href: "/solutions/brand-ambassadors" },
  { id: "destinations", title: "Venues", description: "Venue management", href: "/solutions/destinations" },
];

export default function SolutionsPage() {
  const router = useRouter();

  const tabs = [
    {
      id: "industries",
      label: "By Industry",
      icon: <List className="size-4" />,
      content: (
        <Section>
          <SectionHeader title="Industry Solutions" description="Tailored solutions for your industry" />
          <Grid cols={2} gap={6} className="grid-cols-1 md:grid-cols-2 mt-6">
            {SOLUTIONS.map((solution) => (
              <Card key={solution.id} className="p-6 cursor-pointer hover:border-primary transition-colors" onClick={() => router.push(solution.href)}>
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary/20 rounded-card text-primary">{solution.icon}</div>
                  <div>
                    <Body className="font-weight-bold font-weight-medium">{solution.title}</Body>
                    <Body className="text-grey-400">{solution.description}</Body>
                  </div>
                </div>
              </Card>
            ))}
          </Grid>
        </Section>
      ),
    },
    {
      id: "roles",
      label: "By Role",
      icon: <Star className="size-4" />,
      content: (
        <Section>
          <SectionHeader title="Role-Based Solutions" description="Tools for your specific role" />
          <Grid cols={2} gap={6} className="grid-cols-1 md:grid-cols-2 mt-6">
            {ROLES.map((role) => (
              <Card key={role.id} className="p-6 cursor-pointer hover:border-primary transition-colors" onClick={() => router.push(role.href)}>
                <Body className="font-weight-bold font-weight-medium">{role.title}</Body>
                <Body className="text-grey-400">{role.description}</Body>
              </Card>
            ))}
          </Grid>
        </Section>
      ),
    },
  ];

  return (
    <DetailPage
      header={{ kicker: "Platform", title: "Solutions", description: "Find the right solution for your needs" }}
      tabs={tabs}
      actions={<Button variant="solid" onClick={() => router.push("/demo")}>Request Demo</Button>}
    />
  );
}
