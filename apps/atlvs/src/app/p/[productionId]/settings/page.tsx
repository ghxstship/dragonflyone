"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { SectionHeader, Card, CardBody, Stack, Button, Body, Box, Grid, Spinner, EmptyState, ConfirmDialog, useNotifications } from "@ghxstship/ui";
import { Settings, Users, Bell, Lock, Palette, Globe, Trash2, AlertCircle } from "lucide-react";
import { useProduction } from "../../../../hooks/useProductions";
import { atlvsDemoProductions } from "../../../../data/atlvs";

export default function ProductionSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const { addNotification } = useNotifications();
  const productionId = params?.productionId as string;
  
  const { data: apiProduction, isLoading, error, refetch } = useProduction(productionId);
  const demoProduction = atlvsDemoProductions.find((p) => p.id === productionId);
  const productionName = apiProduction?.title || demoProduction?.name || "Production";

  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);

  const settingsSections = [
    { id: "general", name: "General", description: "Basic production settings", icon: Settings, href: `/p/${productionId}/settings/general` },
    { id: "team", name: "Team Access", description: "Manage team permissions", icon: Users, href: `/p/${productionId}/settings/team` },
    { id: "notifications", name: "Notifications", description: "Alert preferences", icon: Bell, href: `/p/${productionId}/settings/notifications` },
    { id: "privacy", name: "Privacy", description: "Visibility and sharing", icon: Lock, href: `/p/${productionId}/settings/privacy` },
    { id: "branding", name: "Branding", description: "Colors and logos", icon: Palette, href: `/p/${productionId}/settings/branding` },
    { id: "integrations", name: "Integrations", description: "Connected services", icon: Globe, href: `/p/${productionId}/settings/integrations` },
  ];

  const handleArchive = async () => {
    setIsArchiving(true);
    try {
      const response = await fetch(`/api/productions/${productionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'archived' }),
      });
      if (!response.ok) {
        throw new Error('Failed to archive production');
      }
      addNotification({
        type: 'success',
        title: 'Production Archived',
        message: `"${productionName}" has been archived.`,
      });
      router.push('/productions');
    } catch (err) {
      addNotification({
        type: 'error',
        title: 'Archive Failed',
        message: err instanceof Error ? err.message : 'An error occurred',
      });
    } finally {
      setIsArchiving(false);
      setArchiveDialogOpen(false);
    }
  };

  if (isLoading) {
    return (
      <Stack className="flex min-h-[400px] items-center justify-center">
        <Spinner size="lg" />
        <Body className="text-on-dark-muted">Loading settings...</Body>
      </Stack>
    );
  }

  if (error && !demoProduction) {
    return (
      <EmptyState
        icon={<AlertCircle size={48} />}
        title="Failed to load production"
        description={error.message}
        action={{ label: "Retry", onClick: () => refetch() }}
      />
    );
  }

  return (
    <Stack gap={8}>
      <SectionHeader
        kicker={productionName}
        title="Settings"
        description="Configure production preferences and access"
        colorScheme="on-dark"
      />

      <Grid cols={2} gap={4}>
        {settingsSections.map((section) => (
          <Card 
            key={section.id} 
            variant="elevated" 
            inverted 
            className="cursor-pointer transition-all hover:border-primary"
            onClick={() => router.push(section.href)}
          >
            <CardBody>
              <Stack direction="horizontal" gap={4} className="items-center">
                <Box className="flex size-12 items-center justify-center rounded bg-ink-800">
                  <section.icon size={24} className="text-primary" />
                </Box>
                <Stack gap={1}>
                  <Body className="font-weight-bold text-white">{section.name}</Body>
                  <Body size="sm" className=" text-on-dark-muted">{section.description}</Body>
                </Stack>
              </Stack>
            </CardBody>
          </Card>
        ))}
      </Grid>

      <Card variant="elevated" inverted className="border-error/30">
        <CardBody>
          <Stack direction="horizontal" gap={4} className="items-center justify-between">
            <Stack direction="horizontal" gap={4} className="items-center">
              <Box className="flex size-12 items-center justify-center rounded bg-error/20">
                <Trash2 size={24} className="text-error" />
              </Box>
              <Stack gap={1}>
                <Body className="font-weight-bold text-white">Danger Zone</Body>
                <Body size="sm" className=" text-on-dark-muted">Archive or delete this production</Body>
              </Stack>
            </Stack>
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={() => setArchiveDialogOpen(true)}
              disabled={isArchiving}
            >
              {isArchiving ? 'Archiving...' : 'Archive Production'}
            </Button>
          </Stack>
        </CardBody>
      </Card>

      <ConfirmDialog
        open={archiveDialogOpen}
        title="Archive Production"
        message={`Are you sure you want to archive "${productionName}"? This action can be undone later.`}
        variant="danger"
        confirmLabel="Archive"
        onConfirm={handleArchive}
        onCancel={() => setArchiveDialogOpen(false)}
      />
    </Stack>
  );
}
