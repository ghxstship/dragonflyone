"use client";

/**
 * Production Vendors Page
 * Uses DetailPage template for consistent layout
 */

import { useState } from "react";
import { useParams } from "next/navigation";
import { Building2, Search, Plus, Mail, Phone, DollarSign, List } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import {
  Badge, Body, Button, Card, Input, Grid, StatCard, DetailPage, Section} from "@ghxstship/ui";

interface Vendor {
  id: string;
  name: string;
  category: string;
  contact: string;
  email: string;
  phone: string;
  contract_value: number;
  status: "active" | "pending" | "completed";
}

const DEMO_VENDORS: Vendor[] = [
  { id: "1", name: "StageCraft Inc", category: "Staging", contact: "John Doe", email: "john@stagecraft.com", phone: "+1 555-1234", contract_value: 25000, status: "active" },
  { id: "2", name: "LightWorks", category: "Lighting", contact: "Jane Smith", email: "jane@lightworks.com", phone: "+1 555-2345", contract_value: 18000, status: "active" },
  { id: "3", name: "SoundPro Audio", category: "Audio", contact: "Mike Chen", email: "mike@soundpro.com", phone: "+1 555-3456", contract_value: 22000, status: "pending" },
];

const STATUS_CONFIG = {
  active: { label: "Active", variant: "success" as const },
  pending: { label: "Pending", variant: "warning" as const },
  completed: { label: "Completed", variant: "info" as const },
};

export default function ProductionVendorsPage() {
  const params = useParams();
  const productionId = params.productionId as string;
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  const { data: vendors = [], isLoading, error, refetch } = useQuery<Vendor[]>({
    queryKey: ["production-vendors", productionId],
    queryFn: async () => {
      const response = await fetch(`/api/productions/${productionId}/vendors`);
      if (!response.ok) return DEMO_VENDORS;
      const data = await response.json();
      return data.vendors?.length ? data.vendors : DEMO_VENDORS;
    },
  });

  const categories: string[] = ["all", ...Array.from(new Set(vendors.map((v: Vendor) => v.category)))];
  const filteredVendors = vendors.filter((vendor: Vendor) => {
    const matchesSearch = vendor.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === "all" || vendor.category === category;
    return matchesSearch && matchesCategory;
  });

  const formatCurrency = (amount: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(amount);
  const totalValue = vendors.reduce((sum: number, v: Vendor) => sum + v.contract_value, 0);

  const tabs = [
    {
      id: "vendors",
      label: "Vendors",
      icon: <List className="size-4" />,
      content: (
        <Section>
          <Grid cols={4} gap={4} className="grid-cols-2 md:grid-cols-4 mb-6">
            <StatCard label="Total Vendors" value={vendors.length.toString()} icon={<Building2 className="size-5" />} />
            <StatCard label="Active" value={vendors.filter((v: Vendor) => v.status === "active").length.toString()} icon={<Building2 className="size-5" />} />
            <StatCard label="Total Value" value={formatCurrency(totalValue)} icon={<DollarSign className="size-5" />} />
            <StatCard label="Categories" value={new Set(vendors.map((v: Vendor) => v.category)).size.toString()} icon={<Building2 className="size-5" />} />
          </Grid>

          <div className="flex gap-4 items-center mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-on-dark-muted" />
              <Input placeholder="Search vendors..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
            </div>
            <div className="flex gap-2">
              {categories.map((cat) => (
                <Button key={cat} variant={category === cat ? "solid" : "outline"} size="sm" onClick={() => setCategory(cat)}>
                  {cat === "all" ? "All" : cat}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {filteredVendors.map((vendor: Vendor) => (
              <Card key={vendor.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="size-12 bg-primary/20 rounded-card flex items-center justify-center">
                      <Building2 className="size-6 text-primary" />
                    </div>
                    <div>
                      <Body className="font-weight-bold">{vendor.name}</Body>
                      <Body className="text-on-dark-muted">{vendor.contact}</Body>
                      <div className="flex items-center gap-4 mt-2 text-on-dark-muted">
                        <div className="flex items-center gap-1"><Mail className="size-4" /><Body size="sm">{vendor.email}</Body></div>
                        <div className="flex items-center gap-1"><Phone className="size-4" /><Body size="sm">{vendor.phone}</Body></div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Body className="font-weight-bold">{formatCurrency(vendor.contract_value)}</Body>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline">{vendor.category}</Badge>
                      <Badge variant={STATUS_CONFIG[vendor.status].variant}>{STATUS_CONFIG[vendor.status].label}</Badge>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Section>
      ),
    },
  ];

  return (
    <DetailPage
      header={{ kicker: "Production", title: "Vendors", description: "Manage production vendors and contracts" }}
      backButton={{ label: "Overview", href: `/p/${productionId}/overview` }}
      loading={isLoading}
      error={error instanceof Error ? error : null}
      onRetry={refetch}
      tabs={tabs}
      actions={<Button variant="solid" icon={<Plus className="size-4" />} iconPosition="left">Add Vendor</Button>}
    />
  );
}
