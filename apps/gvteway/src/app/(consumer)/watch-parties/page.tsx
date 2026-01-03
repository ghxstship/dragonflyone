"use client";

import { Tv, Users, Calendar, Plus, List } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Body, Button, Card, Grid, DetailPage, Section, Box} from "@ghxstship/ui";

interface WatchParty { id: string; event: string; host: string; date: string; attendees: number; }
const DEMO: WatchParty[] = [
  { id: "1", event: "Summer Festival Livestream", host: "John", date: "2024-12-20", attendees: 15 },
  { id: "2", event: "Jazz Night Virtual", host: "Sarah", date: "2024-12-22", attendees: 8 },
];

export default function WatchPartiesPage() {

  const { data: parties = [], isLoading, error, refetch } = useQuery({
    queryKey: ["watch-parties"],
    queryFn: async () => { const r = await fetch("/api/watch-parties"); if (!r.ok) return DEMO; return (await r.json()).parties?.length ? (await r.json()).parties : DEMO; },
  });

  const formatDate = (d: string) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });

  const tabs = [{
    id: "parties", label: "Watch Parties", icon: <List className="size-4" />,
    content: (
      <Section>
        {parties.length === 0 ? (
          <Card className="p-8 text-center"><Tv className="size-12 text-text-disabled mx-auto mb-4" /><Body className="font-weight-medium mb-2">No watch parties</Body><Body className="text-text-muted mb-4">Host or join a virtual watch party</Body><Button variant="solid" icon={<Plus className="size-4" />} iconPosition="left">Create Watch Party</Button></Card>
        ) : (
          <Grid cols={2} gap={4} className="grid-cols-1 md:grid-cols-2">
            {parties.map((party: WatchParty) => (
              <Card key={party.id} className="p-6 cursor-pointer hover:border-primary transition-colors">
                <Box className="flex items-start justify-between">
                  <Box>
                    <Body className="font-weight-bold">{party.event}</Body>
                    <Body size="sm" className="text-text-muted">Hosted by {party.host}</Body>
                    <Box className="flex items-center gap-4 mt-3 text-text-muted">
                      <Box className="flex items-center gap-1"><Calendar className="size-4" /><Body size="sm">{formatDate(party.date)}</Body></Box>
                      <Box className="flex items-center gap-1"><Users className="size-4" /><Body size="sm">{party.attendees} attending</Body></Box>
                    </Box>
                  </Box>
                  <Button variant="outline" size="sm">Join</Button>
                </Box>
              </Card>
            ))}
          </Grid>
        )}
      </Section>
    ),
  }];

  return <DetailPage header={{ kicker: "Virtual", title: "Watch Parties", description: "Watch together, apart" }} loading={isLoading} error={error instanceof Error ? error : null} onRetry={refetch} tabs={tabs} actions={<Button variant="solid" icon={<Plus className="size-4" />} iconPosition="left">Create Party</Button>} />;
}
