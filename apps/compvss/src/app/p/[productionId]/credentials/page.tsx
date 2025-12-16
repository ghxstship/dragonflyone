"use client";

import { useParams, useRouter } from "next/navigation";
import { EnterprisePageHeader, MainContent, Container, Card, CardBody, Stack, Button, Body, Box, StatCard, Grid } from "@ghxstship/ui";
import { IdCard, Plus, QrCode, Layers, BarChart } from "lucide-react";
import { compvssDemoProductions } from "../../../../data/compvss";

export default function CredentialsPage() {
  const params = useParams();
  const router = useRouter();
  const productionId = params?.productionId as string;
  const production = compvssDemoProductions.find((p) => p.id === productionId);

  const credentialStats = { issued: 120, active: 95, revoked: 5, pending: 20 };

  return (
    <>
      <EnterprisePageHeader
        title="Credentials"
        subtitle="Issue and manage access credentials"
        primaryAction={{ label: "Issue Credential", onClick: () => router.push(`/p/${productionId}/credentials/issue`), icon: <Plus size={16} /> }}
        showFavorite
        showSettings
      />
      <MainContent padding="lg">
        <Container>
          <Stack gap={8}>
            <Stack direction="horizontal" gap={2}>
              <Button variant="outline" size="sm" onClick={() => router.push(`/p/${productionId}/credentials/scan`)}>
                <QrCode size={16} className="mr-2" />
                Scan
              </Button>
            </Stack>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
              <StatCard label="Total Issued" value={credentialStats.issued.toString()} icon={<IdCard size={20} />} />
              <StatCard label="Active" value={credentialStats.active.toString()} icon={<IdCard size={20} />} trend="up" />
              <StatCard label="Pending" value={credentialStats.pending.toString()} icon={<IdCard size={20} />} />
              <StatCard label="Revoked" value={credentialStats.revoked.toString()} icon={<IdCard size={20} />} />
            </div>

            <Grid cols={3} gap={4}>
              <Card variant="elevated" className="cursor-pointer transition-all hover:border-primary" onClick={() => router.push(`/p/${productionId}/credentials/zones`)}>
                <CardBody>
                  <Stack gap={4} className="items-center text-center">
                    <Box className="flex size-12 items-center justify-center rounded-card bg-grey-100">
                      <Layers size={24} className="text-primary" />
                    </Box>
                    <Stack gap={1}>
                      <Body className="font-weight-bold">Zone Access</Body>
                      <Body size="sm" className="text-grey-500">Manage access zones</Body>
                    </Stack>
                  </Stack>
                </CardBody>
              </Card>
              <Card variant="elevated" className="cursor-pointer transition-all hover:border-primary" onClick={() => router.push(`/p/${productionId}/credentials/scan`)}>
                <CardBody>
                  <Stack gap={4} className="items-center text-center">
                    <Box className="flex size-12 items-center justify-center rounded-card bg-grey-100">
                      <QrCode size={24} className="text-secondary" />
                    </Box>
                    <Stack gap={1}>
                      <Body className="font-weight-bold">Scan Credentials</Body>
                      <Body size="sm" className="text-grey-500">Check-in and verify</Body>
                    </Stack>
                  </Stack>
                </CardBody>
              </Card>
              <Card variant="elevated" className="cursor-pointer transition-all hover:border-primary" onClick={() => router.push(`/p/${productionId}/credentials/reports`)}>
                <CardBody>
                  <Stack gap={4} className="items-center text-center">
                    <Box className="flex size-12 items-center justify-center rounded-card bg-grey-100">
                      <BarChart size={24} className="text-warning" />
                    </Box>
                    <Stack gap={1}>
                      <Body className="font-weight-bold">Reports</Body>
                      <Body size="sm" className="text-grey-500">Access analytics</Body>
                    </Stack>
                  </Stack>
                </CardBody>
              </Card>
            </Grid>
          </Stack>
        </Container>
      </MainContent>
    </>
  );
}
