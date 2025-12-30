"use client";

import { useState } from "react";
import { Users, Search, Plus, List } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Body, Button, Card, Input, Grid, DetailPage, Section, Box} from "@ghxstship/ui";

interface Group { id: string; name: string; members: number; events: number; }
const DEMO: Group[] = [
  { id: "1", name: "Festival Crew", members: 12, events: 5 },
  { id: "2", name: "Jazz Lovers", members: 8, events: 3 },
];

export default function GroupsPage() {
  const [search, setSearch] = useState("");

  const { data: groups = [], isLoading, error, refetch } = useQuery({
    queryKey: ["groups"],
    queryFn: async () => { const r = await fetch("/api/groups"); if (!r.ok) return DEMO; return (await r.json()).groups?.length ? (await r.json()).groups : DEMO; },
  });

  const filtered = groups.filter((g: Group) => g.name.toLowerCase().includes(search.toLowerCase()));

  const tabs = [{
    id: "groups", label: "Groups", icon: <List className="size-4" />,
    content: (
      <Section>
        <Box className="flex gap-4 items-center mb-6">
          <Box className="relative flex-1 max-w-md"><Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-on-dark-muted" /><Input placeholder="Search groups..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" /></Box>
        </Box>
        {filtered.length === 0 ? (
          <Card className="p-8 text-center"><Users className="size-12 text-on-dark-disabled mx-auto mb-4" /><Body className="font-weight-medium mb-2">No groups yet</Body><Body className="text-on-dark-muted mb-4">Create or join a group</Body><Button variant="solid" icon={<Plus className="size-4" />} iconPosition="left">Create Group</Button></Card>
        ) : (
          <Grid cols={3} gap={4} className="grid-cols-1 md:grid-cols-3">
            {filtered.map((group: Group) => (
              <Card key={group.id} className="p-6">
                <Body className="font-weight-bold">{group.name}</Body>
                <Box className="flex items-center gap-4 mt-2 text-on-dark-muted">
                  <Body size="sm">{group.members} members</Body>
                  <Body size="sm">{group.events} events</Body>
                </Box>
                <Button variant="outline" className="w-full mt-4">View Group</Button>
              </Card>
            ))}
          </Grid>
        )}
      </Section>
    ),
  }];

  return <DetailPage header={{ kicker: "Social", title: "Groups", description: "Your groups" }} loading={isLoading} error={error instanceof Error ? error : null} onRetry={refetch} tabs={tabs} actions={<Button variant="solid" icon={<Plus className="size-4" />} iconPosition="left">Create Group</Button>} />;
}
