"use client";

/**
 * Production Vendors Page
 * Vendor management for production
 * Uses DetailPage template for consistent layout
 */

import { useState } from "react";
import { useParams } from "next/navigation";
import { Building2, Plus, Mail, Phone, Search, DollarSign, List, FileText } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import {
  Badge, Body, Button, Card, Grid, Input, StatCard, DetailPage, Section, Box, Stack} from "@ghxstship/ui";

interface Vendor {
  id: string;
  name: string;
  category: string;
  contact_name: string;
  email: string;
  phone: string;
  contract_value: number;
  status: "pending" | "contracted" | "completed";
}

const DEMO_VENDORS: Vendor[] = [
  { id: "1", name: "StageCraft Pro", category: "Staging", contact_name: "Tom Wilson", email: "tom@stagecraft.com", phone: "+1 555-0201", contract_value: 45000, status: "contracted" },
  { id: "2", name: "LightWorks Inc", category: "Lighting", contact_name: "Amy Chen", email: "amy@lightworks.com", phone: "+1 555-0202", contract_value: 32000, status: "contracted" },
  { id: "3", name: "SoundMax Audio", category: "Audio", contact_name: "Dave Brown", email: "dave@soundmax.com", phone: "+1 555-0203", contract_value: 28000, status: "pending" },
  { id: "4", name: "Event Catering Co", category: "Catering", contact_name: "Maria Garcia", email: "maria@eventcatering.com", phone: "+1 555-0204", contract_value: 15000, status: "contracted" },
  { id: "5", name: "SecureEvents", category: "Security", contact_name: "James Lee", email: "james@secureevents.com", phone: "+1 555-0205", contract_value: 12000, status: "pending" },
];

const CATEGORIES = ["All", "Staging", "Lighting", "Audio", "Catering", "Security"];
const STATUS_CONFIG = {
  pending: { label: "Pending", variant: "warning" as const },
  contracted: { label: "Contracted", variant: "success" as const },
  completed: { label: "Completed", variant: "info" as const },
};

export default function ProductionVendorsPage() {
  const params = useParams();
  const productionId = params.productionId as string;
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const { data: vendors = [], isLoading, error, refetch } = useQuery({
    queryKey: ["production-vendors", productionId],
    queryFn: async () => {
      const response = await fetch(`/api/productions/${productionId}/vendors`);
      if (!response.ok) return DEMO_VENDORS;
      const data = await response.json();
      return data.vendors?.length ? data.vendors : DEMO_VENDORS;
    },
  });

  const filteredVendors = vendors.filter((vendor: Vendor) => {
    const matchesSearch = !search || vendor.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === "All" || vendor.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const formatCurrency = (amount: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(amount);
  const totalValue = vendors.reduce((sum: number, v: Vendor) => sum + v.contract_value, 0);
  const contractedValue = vendors.filter((v: Vendor) => v.status === "contracted").reduce((sum: number, v: Vendor) => sum + v.contract_value, 0);

  const tabs = [
    {
      id: "vendors",
      label: "Vendors",
      icon: <List className="size-4" />,
      content: (
        <Section>
          <Grid cols={4} gap={4} className="grid-cols-2 md:grid-cols-4 mb-6">
            <StatCard label="Total Vendors" value={vendors.length.toString()} icon={<Building2 className="size-5" />} />
            <StatCard label="Contracted" value={vendors.filter((v: Vendor) => v.status === "contracted").length.toString()} icon={<FileText className="size-5" />} />
            <StatCard label="Total Value" value={formatCurrency(totalValue)} icon={<DollarSign className="size-5" />} />
            <StatCard label="Contracted Value" value={formatCurrency(contractedValue)} icon={<DollarSign className="size-5" />} />
          </Grid>

          <Card className="p-4 mb-6">
            <Box className="flex items-center gap-4 flex-wrap">
              <Box className="flex-1 min-w-[200px] relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-text-muted" />
                <Input placeholder="Search vendors..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
              </Box>
              <Box className="flex gap-2 flex-wrap">
                {CATEGORIES.map((cat) => (
                  <Button key={cat} variant={selectedCategory === cat ? "solid" : "outline"} size="sm" onClick={() => setSelectedCategory(cat)}>
                    {cat}
                  </Button>
                ))}
              </Box>
            </Box>
          </Card>

          <Stack gap={4}>
            {filteredVendors.map((vendor: Vendor) => (
              <Card key={vendor.id} className="p-6">
                <Box className="flex items-start justify-between">
                  <Box className="flex items-start gap-4">
                    <Box className="p-3 bg-surface-elevated rounded-card"><Building2 className="size-6 text-text-muted" /></Box>
                    <Box>
                      <Body className="font-weight-bold font-weight-medium">{vendor.name}</Body>
                      <Body size="sm" className="text-text-muted">{vendor.contact_name}</Body>
                      <Box className="flex items-center gap-4 mt-2">
                        <Box className="flex items-center gap-1 text-text-muted"><Mail className="size-4" /><Body size="sm">{vendor.email}</Body></Box>
                        <Box className="flex items-center gap-1 text-text-muted"><Phone className="size-4" /><Body size="sm">{vendor.phone}</Body></Box>
                      </Box>
                    </Box>
                  </Box>
                  <Box className="text-right">
                    <Body className="font-weight-bold font-weight-medium">{formatCurrency(vendor.contract_value)}</Body>
                    <Box className="flex items-center gap-2 mt-2">
                      <Badge variant="outline">{vendor.category}</Badge>
                      <Badge variant={STATUS_CONFIG[vendor.status].variant}>{STATUS_CONFIG[vendor.status].label}</Badge>
                    </Box>
                  </Box>
                </Box>
              </Card>
            ))}
          </Stack>
        </Section>
      ),
    },
  ];

  return (
    <DetailPage
      header={{
        kicker: "Production",
        title: "Vendors",
        description: "Manage production vendors and contracts",
      }}
      backButton={{ label: "Overview", href: `/p/${productionId}/overview` }}
      loading={isLoading}
      error={error instanceof Error ? error : null}
      onRetry={refetch}
      tabs={tabs}
      actions={<Button variant="solid" icon={<Plus className="size-4" />} iconPosition="left">Add Vendor</Button>}
    />
  );
}
