"use client";

/**
 * Production Team Page
 * Team members and roles
 * Uses DetailPage template for consistent layout
 */

import { useState } from "react";
import { useParams } from "next/navigation";
import { Users, Plus, Mail, Phone, Search, List, UserPlus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import {
  Badge, Body, Button, Card, Grid, Input, StatCard, DetailPage, Section, SectionHeader, Box} from "@ghxstship/ui";

interface TeamMember {
  id: string;
  name: string;
  role: string;
  department: string;
  email: string;
  phone: string;
  avatar: string;
}

const DEMO_TEAM: TeamMember[] = [
  { id: "1", name: "John Smith", role: "Production Manager", department: "Production", email: "john@example.com", phone: "+1 555-0101", avatar: "JS" },
  { id: "2", name: "Sarah Williams", role: "Stage Manager", department: "Stage", email: "sarah@example.com", phone: "+1 555-0102", avatar: "SW" },
  { id: "3", name: "Mike Johnson", role: "Technical Director", department: "Technical", email: "mike@example.com", phone: "+1 555-0103", avatar: "MJ" },
  { id: "4", name: "Emily Davis", role: "Lighting Designer", department: "Technical", email: "emily@example.com", phone: "+1 555-0104", avatar: "ED" },
  { id: "5", name: "Alex Chen", role: "Sound Engineer", department: "Technical", email: "alex@example.com", phone: "+1 555-0105", avatar: "AC" },
  { id: "6", name: "Lisa Brown", role: "Production Coordinator", department: "Production", email: "lisa@example.com", phone: "+1 555-0106", avatar: "LB" },
];

const DEPARTMENTS = ["All", "Production", "Stage", "Technical"];

export default function ProductionTeamPage() {
  const params = useParams();
  const productionId = params.productionId as string;
  const [search, setSearch] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("All");

  const { data: team = [], isLoading, error, refetch } = useQuery({
    queryKey: ["production-team", productionId],
    queryFn: async () => {
      const response = await fetch(`/api/productions/${productionId}/team`);
      if (!response.ok) return DEMO_TEAM;
      const data = await response.json();
      return data.team?.length ? data.team : DEMO_TEAM;
    },
  });

  const filteredTeam = team.filter((member: TeamMember) => {
    const matchesSearch = !search || member.name.toLowerCase().includes(search.toLowerCase()) || member.role.toLowerCase().includes(search.toLowerCase());
    const matchesDepartment = selectedDepartment === "All" || member.department === selectedDepartment;
    return matchesSearch && matchesDepartment;
  });

  const departmentCounts = DEPARTMENTS.reduce((acc, dept) => {
    acc[dept] = dept === "All" ? team.length : team.filter((m: TeamMember) => m.department === dept).length;
    return acc;
  }, {} as Record<string, number>);

  const tabs = [
    {
      id: "team",
      label: "Team",
      icon: <List className="size-4" />,
      content: (
        <Section>
          <Grid cols={4} gap={4} className="grid-cols-2 md:grid-cols-4 mb-6">
            {DEPARTMENTS.map((dept) => (
              <StatCard key={dept} label={dept} value={departmentCounts[dept].toString()} icon={<Users className="size-5" />} />
            ))}
          </Grid>

          <Card className="p-4 mb-6">
            <Box className="flex items-center gap-4 flex-wrap">
              <Box className="flex-1 min-w-[200px] relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-on-dark-muted" />
                <Input placeholder="Search team..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
              </Box>
              <Box className="flex gap-2">
                {DEPARTMENTS.map((dept) => (
                  <Button key={dept} variant={selectedDepartment === dept ? "solid" : "outline"} size="sm" onClick={() => setSelectedDepartment(dept)}>
                    {dept}
                  </Button>
                ))}
              </Box>
            </Box>
          </Card>

          <Grid cols={3} gap={4} className="grid-cols-1 md:grid-cols-3">
            {filteredTeam.map((member: TeamMember) => (
              <Card key={member.id} className="p-6">
                <Box className="flex items-start gap-4">
                  <Box className="size-12 bg-primary rounded-avatar flex items-center justify-center text-white font-weight-bold">
                    {member.avatar}
                  </Box>
                  <Box className="flex-1">
                    <Body className="font-weight-bold">{member.name}</Body>
                    <Body size="sm" className="text-on-dark-muted">{member.role}</Body>
                    <Badge variant="outline" className="mt-2">{member.department}</Badge>
                  </Box>
                </Box>
                <Box className="mt-4 space-y-2">
                  <Box className="flex items-center gap-2 text-on-dark-muted">
                    <Mail className="size-4" />
                    <Body size="sm">{member.email}</Body>
                  </Box>
                  <Box className="flex items-center gap-2 text-on-dark-muted">
                    <Phone className="size-4" />
                    <Body size="sm">{member.phone}</Body>
                  </Box>
                </Box>
              </Card>
            ))}
          </Grid>
        </Section>
      ),
    },
    {
      id: "invite",
      label: "Invite",
      icon: <UserPlus className="size-4" />,
      content: (
        <Section>
          <SectionHeader title="Invite Team Members" description="Add new members to this production" />
          <Card className="p-6 mt-4 max-w-md">
            <Box className="space-y-4">
              <Box>
                <Body size="sm" className="text-on-dark-muted mb-1">Email Address</Body>
                <Input type="email" placeholder="colleague@example.com" />
              </Box>
              <Box>
                <Body size="sm" className="text-on-dark-muted mb-1">Role</Body>
                <Input placeholder="e.g., Stage Manager" />
              </Box>
              <Button variant="solid" icon={<UserPlus className="size-4" />} iconPosition="left">Send Invitation</Button>
            </Box>
          </Card>
        </Section>
      ),
    },
  ];

  return (
    <DetailPage
      header={{
        kicker: "Production",
        title: "Team",
        description: "Manage production team members",
      }}
      backButton={{ label: "Overview", href: `/p/${productionId}/overview` }}
      loading={isLoading}
      error={error instanceof Error ? error : null}
      onRetry={refetch}
      tabs={tabs}
      actions={<Button variant="solid" icon={<Plus className="size-4" />} iconPosition="left">Add Member</Button>}
    />
  );
}
