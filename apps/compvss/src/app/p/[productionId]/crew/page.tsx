"use client";

/**
 * Production Crew Page
 * Uses DetailPage template for consistent layout
 */

import { useState } from "react";
import { useParams } from "next/navigation";
import { Users, Search, Plus, Mail, Phone, List, UserPlus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import {
  Badge, Body, Button, Card, Input, Grid, StatCard, DetailPage, Section, SectionHeader, Box, Stack} from "@ghxstship/ui";

interface CrewMember {
  id: string;
  name: string;
  role: string;
  department: string;
  email: string;
  phone: string;
  status: "confirmed" | "pending" | "unavailable";
}

const DEMO_CREW: CrewMember[] = [
  { id: "1", name: "John Smith", role: "Stage Manager", department: "Production", email: "john@example.com", phone: "+1 555-1234", status: "confirmed" },
  { id: "2", name: "Sarah Johnson", role: "Lighting Director", department: "Technical", email: "sarah@example.com", phone: "+1 555-2345", status: "confirmed" },
  { id: "3", name: "Mike Chen", role: "Sound Engineer", department: "Technical", email: "mike@example.com", phone: "+1 555-3456", status: "pending" },
];

const STATUS_CONFIG = {
  confirmed: { label: "Confirmed", variant: "success" as const },
  pending: { label: "Pending", variant: "warning" as const },
  unavailable: { label: "Unavailable", variant: "error" as const },
};

export default function ProductionCrewPage() {
  const params = useParams();
  const productionId = params.productionId as string;
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("all");

  const { data: crew = [], isLoading, error, refetch } = useQuery<CrewMember[]>({
    queryKey: ["production-crew", productionId],
    queryFn: async () => {
      const response = await fetch(`/api/productions/${productionId}/crew`);
      if (!response.ok) return DEMO_CREW;
      const data = await response.json();
      return data.crew?.length ? data.crew : DEMO_CREW;
    },
  });

  const departments: string[] = ["all", ...Array.from(new Set(crew.map((c: CrewMember) => c.department)))];
  const filteredCrew = crew.filter((member: CrewMember) => {
    const matchesSearch = member.name.toLowerCase().includes(search.toLowerCase()) || member.role.toLowerCase().includes(search.toLowerCase());
    const matchesDept = department === "all" || member.department === department;
    return matchesSearch && matchesDept;
  });

  const tabs = [
    {
      id: "crew",
      label: "Crew List",
      icon: <List className="size-4" />,
      content: (
        <Section>
          <Grid cols={4} gap={4} className="grid-cols-2 md:grid-cols-4 mb-6">
            <StatCard label="Total Crew" value={crew.length.toString()} icon={<Users className="size-5" />} />
            <StatCard label="Confirmed" value={crew.filter((c: CrewMember) => c.status === "confirmed").length.toString()} icon={<Users className="size-5" />} />
            <StatCard label="Pending" value={crew.filter((c: CrewMember) => c.status === "pending").length.toString()} icon={<Users className="size-5" />} />
            <StatCard label="Departments" value={new Set(crew.map((c: CrewMember) => c.department)).size.toString()} icon={<Users className="size-5" />} />
          </Grid>

          <Box className="flex gap-4 items-center mb-6">
            <Box className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-text-muted" />
              <Input placeholder="Search crew..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
            </Box>
            <Box className="flex gap-2">
              {departments.map((dept) => (
                <Button key={dept} variant={department === dept ? "solid" : "outline"} size="sm" onClick={() => setDepartment(dept)}>
                  {dept === "all" ? "All" : dept}
                </Button>
              ))}
            </Box>
          </Box>

          <Stack gap={4}>
            {filteredCrew.map((member: CrewMember) => (
              <Card key={member.id} className="p-6">
                <Box className="flex items-start justify-between">
                  <Box className="flex items-start gap-4">
                    <Box className="size-12 bg-primary rounded-avatar flex items-center justify-center">
                      <Users className="size-6 text-white" />
                    </Box>
                    <Box>
                      <Body className="font-weight-bold">{member.name}</Body>
                      <Body className="text-text-muted">{member.role}</Body>
                      <Box className="flex items-center gap-4 mt-2 text-text-muted">
                        <Box className="flex items-center gap-1"><Mail className="size-4" /><Body size="sm">{member.email}</Body></Box>
                        <Box className="flex items-center gap-1"><Phone className="size-4" /><Body size="sm">{member.phone}</Body></Box>
                      </Box>
                    </Box>
                  </Box>
                  <Box className="flex items-center gap-2">
                    <Badge variant="outline">{member.department}</Badge>
                    <Badge variant={STATUS_CONFIG[member.status].variant}>{STATUS_CONFIG[member.status].label}</Badge>
                  </Box>
                </Box>
              </Card>
            ))}
          </Stack>
        </Section>
      ),
    },
    {
      id: "invite",
      label: "Invite",
      icon: <UserPlus className="size-4" />,
      content: (
        <Section>
          <SectionHeader title="Invite Crew Member" description="Add new members to this production" />
          <Card className="p-6 mt-4">
            <Stack gap={4}>
              <Box><Body size="sm" className="mb-1">Email</Body><Input placeholder="crew@example.com" /></Box>
              <Box><Body size="sm" className="mb-1">Role</Body><Input placeholder="Stage Manager" /></Box>
              <Box><Body size="sm" className="mb-1">Department</Body><Input placeholder="Production" /></Box>
              <Button variant="solid" icon={<UserPlus className="size-4" />} iconPosition="left">Send Invitation</Button>
            </Stack>
          </Card>
        </Section>
      ),
    },
  ];

  return (
    <DetailPage
      header={{ kicker: "Production", title: "Crew", description: "Manage production crew members" }}
      backButton={{ label: "Overview", href: `/p/${productionId}/overview` }}
      loading={isLoading}
      error={error instanceof Error ? error : null}
      onRetry={refetch}
      tabs={tabs}
      actions={<Button variant="solid" icon={<Plus className="size-4" />} iconPosition="left">Add Crew</Button>}
    />
  );
}
