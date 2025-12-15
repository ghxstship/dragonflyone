"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { SectionHeader, Card, CardBody, Stack, Button, Body, Box, Badge, StatCard, Grid, Spinner, EmptyState, RecordFormModal, type FormFieldConfig, useNotifications } from "@ghxstship/ui";
import { Handshake, Plus, DollarSign, AlertCircle } from "lucide-react";
import { useSponsors, useSponsorStats, useCreateSponsor, useSponsorTiers } from "../../../../hooks/useSponsors";
import { useProduction } from "../../../../hooks/useProductions";
import { atlvsDemoProductions } from "../../../../data/atlvs";

const demoSponsors = [
  { id: "1", company_name: "TechCorp", tier: { name: "Platinum" }, contract_value: 50000, status: "confirmed" as const },
  { id: "2", company_name: "MediaGroup", tier: { name: "Gold" }, contract_value: 30000, status: "confirmed" as const },
  { id: "3", company_name: "BrandCo", tier: { name: "Gold" }, contract_value: 25000, status: "confirmed" as const },
  { id: "4", company_name: "StartupX", tier: { name: "Silver" }, contract_value: 15000, status: "prospect" as const },
  { id: "5", company_name: "LocalBiz", tier: { name: "Bronze" }, contract_value: 10000, status: "confirmed" as const },
];

export default function ProductionSponsorsPage() {
  const params = useParams();
  const router = useRouter();
  const { addNotification } = useNotifications();
  const productionId = params?.productionId as string;
  
  const { data: apiProduction } = useProduction(productionId);
  const demoProduction = atlvsDemoProductions.find((p) => p.id === productionId);
  const productionName = apiProduction?.title || demoProduction?.name || "Production";

  const { data: apiSponsors, isLoading, error, refetch } = useSponsors({ productionId });
  const { data: apiStats } = useSponsorStats(productionId);
  const { data: tiers } = useSponsorTiers(productionId);
  const createSponsorMutation = useCreateSponsor();
  
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // Use API data if available, fallback to demo data
  const sponsors = apiSponsors && apiSponsors.length > 0 ? apiSponsors : demoSponsors;
  const sponsorStats = apiStats || { total: sponsors.length, confirmed: sponsors.filter(s => s.status === 'confirmed' || s.status === 'active').length, prospect: sponsors.filter(s => s.status === 'prospect').length, totalValue: sponsors.reduce((sum, s) => sum + (s.contract_value || 0), 0) };

  const sponsorFields: FormFieldConfig[] = [
    { name: 'company_name', label: 'Company Name', type: 'text', required: true },
    { name: 'contact_name', label: 'Contact Name', type: 'text' },
    { name: 'contact_email', label: 'Contact Email', type: 'email' },
    { name: 'contract_value', label: 'Contract Value', type: 'number', required: true },
    { name: 'sponsor_tier_id', label: 'Tier', type: 'select', options: (tiers || []).map(t => ({ value: t.id, label: t.name })) },
    { name: 'notes', label: 'Notes', type: 'textarea' },
  ];

  const handleCreateSponsor = async (data: Record<string, unknown>) => {
    try {
      await createSponsorMutation.mutateAsync({
        company_name: data.company_name as string,
        contact_name: data.contact_name as string,
        contact_email: data.contact_email as string,
        contract_value: data.contract_value as number,
        sponsor_tier_id: data.sponsor_tier_id as string,
        production_id: productionId,
        organization_id: '00000000-0000-0000-0000-000000000000',
        status: 'prospect',
        payment_status: 'pending',
        amount_paid: 0,
      });
      setCreateModalOpen(false);
      addNotification({ type: 'success', title: 'Sponsor Added', message: `"${data.company_name}" has been added.` });
      refetch();
    } catch (err) {
      addNotification({ type: 'error', title: 'Failed to Add Sponsor', message: err instanceof Error ? err.message : 'An error occurred' });
    }
  };

  const tierColors: Record<string, "success" | "warning" | "error" | "info" | "solid"> = {
    Platinum: "info", Gold: "warning", Silver: "solid", Bronze: "solid",
  };

  const statusColors: Record<string, "success" | "warning" | "error" | "info" | "solid"> = {
    confirmed: "success", active: "success", prospect: "warning", negotiating: "info", cancelled: "error",
  };

  if (isLoading) {
    return (
      <Stack className="flex min-h-[400px] items-center justify-center">
        <Spinner size="lg" />
        <Body className="text-on-dark-muted">Loading sponsors...</Body>
      </Stack>
    );
  }

  if (error && sponsors.length === 0) {
    return (
      <EmptyState
        icon={<AlertCircle size={48} />}
        title="Failed to load sponsors"
        description={error.message}
        action={{ label: "Retry", onClick: () => refetch() }}
      />
    );
  }

  return (
    <Stack gap={8}>
      <Stack gap={4}>
        <SectionHeader
          kicker={productionName}
          title="Sponsors"
          description="Manage sponsorship relationships and deliverables"
          colorScheme="on-dark"
        />
        <Stack direction="horizontal" gap={2}>
          <Button variant="solid" size="sm" onClick={() => setCreateModalOpen(true)}>
            <Plus size={16} className="mr-2" />
            Add Sponsor
          </Button>
          <Button variant="outline" size="sm" onClick={() => router.push(`/p/${productionId}/sponsors/tiers`)}>
            Tiers
          </Button>
          <Button variant="outline" size="sm" onClick={() => router.push(`/p/${productionId}/sponsors/deliverables`)}>
            Deliverables
          </Button>
        </Stack>
      </Stack>

      <Grid cols={1} gap={4} className="sm:grid-cols-4">
        <StatCard label="Total Sponsors" value={sponsorStats.total.toString()} icon={<Handshake size={20} />} inverted />
        <StatCard label="Confirmed" value={sponsorStats.confirmed.toString()} icon={<Handshake size={20} />} trend="up" inverted />
        <StatCard label="Prospect" value={sponsorStats.prospect.toString()} icon={<Handshake size={20} />} inverted />
        <StatCard label="Total Value" value={`$${(sponsorStats.totalValue / 1000).toFixed(0)}K`} icon={<DollarSign size={20} />} trend="up" inverted />
      </Grid>

      <Card variant="elevated" inverted>
        <CardBody>
          <Stack gap={0}>
            {sponsors.length === 0 ? (
              <EmptyState
                icon={<Handshake size={48} />}
                title="No sponsors yet"
                description="Add your first sponsor to get started"
                action={{ label: "Add Sponsor", onClick: () => setCreateModalOpen(true) }}
              />
            ) : (
              sponsors.map((sponsor, index) => (
                <Box key={sponsor.id} className={`flex cursor-pointer items-center justify-between border-ink-700 p-4 transition-all hover:bg-ink-800/50 ${index < sponsors.length - 1 ? "border-b" : ""}`}>
                  <Stack direction="horizontal" gap={3} className="items-center">
                    <Box className="flex size-10 items-center justify-center rounded bg-ink-800">
                      <Handshake size={20} className="text-primary" />
                    </Box>
                    <Stack gap={1}>
                      <Body className="font-weight-medium text-white">{sponsor.company_name}</Body>
                      <Body size="sm" className=" text-on-dark-muted">${sponsor.contract_value.toLocaleString()}</Body>
                    </Stack>
                  </Stack>
                  <Stack direction="horizontal" gap={2}>
                    <Badge variant={tierColors[sponsor.tier?.name || 'Bronze']}>{sponsor.tier?.name || 'No Tier'}</Badge>
                    <Badge variant={statusColors[sponsor.status]}>{sponsor.status.toUpperCase()}</Badge>
                  </Stack>
                </Box>
              ))
            )}
          </Stack>
        </CardBody>
      </Card>

      <RecordFormModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        mode="create"
        title="Add Sponsor"
        fields={sponsorFields}
        onSubmit={handleCreateSponsor}
        size="md"
      />
    </Stack>
  );
}
