"use client";

import { useRouter } from "next/navigation";
import { AtlvsAppLayout } from "../../components/app-layout";
import { SectionHeader, Card, CardBody, Stack, StatCard, Body, Box, H3, Grid } from "@ghxstship/ui";
import { Building2, Users, CreditCard, Shield, Settings, Bell } from "lucide-react";

export default function OrganizationPage() {
  const router = useRouter();

  const orgStats = {
    members: 45,
    teams: 8,
    productions: 12,
    activeSubscription: "Enterprise",
  };

  return (
    <AtlvsAppLayout>
      <Stack gap={8}>
        <SectionHeader
        kicker="Platform"
        title="Organization"
        description="Manage your organization settings and members"
        colorScheme="on-dark"
      />

      <Grid cols={4} gap={4} className="grid-cols-2 lg:grid-cols-4">
        <StatCard label="Members" value={orgStats.members.toString()} icon={<Users size={20} />} inverted />
        <StatCard label="Teams" value={orgStats.teams.toString()} icon={<Building2 size={20} />} inverted />
        <StatCard label="Productions" value={orgStats.productions.toString()} icon={<Building2 size={20} />} inverted />
        <StatCard label="Plan" value={orgStats.activeSubscription} icon={<CreditCard size={20} />} inverted />
      </Grid>

      <Grid cols={3} gap={4} className="grid-cols-1 md:grid-cols-3">
        <Card variant="elevated" inverted className="cursor-pointer transition-all hover:border-primary" onClick={() => router.push("/organization/members")}>
          <CardBody>
            <Stack gap={3} className="items-center text-center">
              <Box className="flex size-12 items-center justify-center rounded bg-ink-800">
                <Users size={24} className="text-primary" />
              </Box>
              <Stack gap={1}>
                <Body className="font-weight-bold text-white">Members</Body>
                <Body className="text-body-sm text-on-dark-muted">Manage team members</Body>
              </Stack>
            </Stack>
          </CardBody>
        </Card>
        <Card variant="elevated" inverted className="cursor-pointer transition-all hover:border-primary" onClick={() => router.push("/organization/billing")}>
          <CardBody>
            <Stack gap={3} className="items-center text-center">
              <Box className="flex size-12 items-center justify-center rounded bg-ink-800">
                <CreditCard size={24} className="text-secondary" />
              </Box>
              <Stack gap={1}>
                <Body className="font-weight-bold text-white">Billing</Body>
                <Body className="text-body-sm text-on-dark-muted">Subscription and invoices</Body>
              </Stack>
            </Stack>
          </CardBody>
        </Card>
        <Card variant="elevated" inverted className="cursor-pointer transition-all hover:border-primary" onClick={() => router.push("/organization/security")}>
          <CardBody>
            <Stack gap={3} className="items-center text-center">
              <Box className="flex size-12 items-center justify-center rounded bg-ink-800">
                <Shield size={24} className="text-warning" />
              </Box>
              <Stack gap={1}>
                <Body className="font-weight-bold text-white">Security</Body>
                <Body className="text-body-sm text-on-dark-muted">SSO and permissions</Body>
              </Stack>
            </Stack>
          </CardBody>
        </Card>
      </Grid>

      <Card variant="elevated" inverted>
        <CardBody>
          <Stack gap={4}>
            <H3 className="text-white">Organization Settings</H3>
            <Body className="text-on-dark-muted">Configure organization-wide settings and preferences.</Body>
          </Stack>
        </CardBody>
      </Card>
      </Stack>
    </AtlvsAppLayout>
  );
}
