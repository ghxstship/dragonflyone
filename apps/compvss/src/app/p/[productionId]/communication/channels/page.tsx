"use client";

import { useParams } from "next/navigation";
import { SectionHeader, Card, CardBody, Stack, StatCard, Body, H3, Button, Spinner, Alert, Grid } from "@ghxstship/ui";
import { Hash, Users, Lock, Plus } from "lucide-react";
import { useProject } from "../../../../../hooks/useProjects";
import { useCommunications } from "../../../../../hooks/useCommunications";

export default function ChannelsPage() {
  const params = useParams();
  const productionId = params?.productionId as string;
  const { data: production, isLoading: loadingProduction } = useProject(productionId);
  const { data: communications, isLoading: loadingComms, error } = useCommunications();

  const isLoading = loadingProduction || loadingComms;

  if (isLoading) {
    return (
      <Stack gap={4} className="items-center justify-center py-12">
        <Spinner size="lg" />
        <Body>Loading channels...</Body>
      </Stack>
    );
  }

  if (error) {
    return (
      <Stack gap={4}>
        <Alert variant="error">Failed to load channels. Please try again.</Alert>
      </Stack>
    );
  }

  const channels = communications || [];
  const stats = {
    total: channels.length,
    public: channels.filter(c => c.type === 'announcement').length,
    private: channels.filter(c => c.type === 'direct').length,
    members: channels.length,
  };

  return (
    <Stack gap={8}>
      <Stack gap={4}>
        <SectionHeader kicker={production?.name || 'Production'} title="Channels" description="Team communication channels" />
        <Button variant="solid" size="sm"><Plus size={16} className="mr-2" />New Channel</Button>
      </Stack>
      <Grid cols={4} gap={4} className="sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total" value={stats.total.toString()} icon={<Hash size={20} />} />
        <StatCard label="Public" value={stats.public.toString()} icon={<Hash size={20} />} />
        <StatCard label="Private" value={stats.private.toString()} icon={<Lock size={20} />} />
        <StatCard label="Members" value={stats.members.toString()} icon={<Users size={20} />} />
      </Grid>
      {channels.length === 0 ? (
        <Card variant="elevated">
          <CardBody>
            <Stack gap={4} className="items-center py-8">
              <Hash size={48} className="text-grey-400" />
              <H3>No Channels Yet</H3>
              <Body className="text-grey-500">Create your first communication channel to get started.</Body>
              <Button variant="solid"><Plus size={16} className="mr-2" />Create Channel</Button>
            </Stack>
          </CardBody>
        </Card>
      ) : (
        <Card variant="elevated">
          <CardBody>
            <Stack gap={4}>
              <H3>Channel List</H3>
              {channels.map((channel) => (
                <Stack key={channel.id} direction="horizontal" gap={4} className="items-center border-b border-grey-100 pb-4 last:border-0">
                  <Hash size={20} className="text-primary" />
                  <Stack gap={0}>
                    <Body className="font-weight-semibold">{channel.subject || 'Untitled Channel'}</Body>
                    <Body size="sm" className="text-grey-500">{channel.type}</Body>
                  </Stack>
                </Stack>
              ))}
            </Stack>
          </CardBody>
        </Card>
      )}
    </Stack>
  );
}
