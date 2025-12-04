"use client";

import { useParams } from "next/navigation";
import { SectionHeader, Card, CardBody, Stack, StatCard, Body, H3, Button } from "@ghxstship/ui";
import { Hash, Users, Lock, Plus } from "lucide-react";
import { compvssDemoProductions } from "../../../../../data/compvss";

export default function ChannelsPage() {
  const params = useParams();
  const productionId = params?.productionId as string;
  const production = compvssDemoProductions.find((p) => p.id === productionId);

  if (!production) {
    return <Stack gap={4}><SectionHeader kicker="Channels" title="Production Not Found" /></Stack>;
  }

  const stats = { total: 12, public: 8, private: 4, members: 45 };

  return (
    <Stack gap={8}>
      <Stack gap={4}>
        <SectionHeader kicker={production.name} title="Channels" description="Team communication channels" />
        <Button variant="solid" size="sm"><Plus size={16} className="mr-2" />New Channel</Button>
      </Stack>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total" value={stats.total.toString()} icon={<Hash size={20} />} />
        <StatCard label="Public" value={stats.public.toString()} icon={<Hash size={20} />} />
        <StatCard label="Private" value={stats.private.toString()} icon={<Lock size={20} />} />
        <StatCard label="Members" value={stats.members.toString()} icon={<Users size={20} />} />
      </div>
      <Card variant="elevated"><CardBody><Stack gap={4}><H3>Channel List</H3><Body className="text-muted">Channels will be displayed here.</Body></Stack></CardBody></Card>
    </Stack>
  );
}
