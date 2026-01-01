"use client";

import { Users, MessageSquare, Calendar, Award, List } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Body, Button, Card, Grid, StatCard, DetailPage, Section, SectionHeader, Box, Stack } from "@ghxstship/ui";

interface Discussion { id: string; title: string; replies: number; author: string; }
const DEMO: Discussion[] = [
  { id: "1", title: "Best festivals this summer?", replies: 24, author: "Sarah" },
  { id: "2", title: "Tips for first-time concert goers", replies: 18, author: "Mike" },
];

export default function CommunityPage() {

  const { data: discussions = [], isLoading, error, refetch } = useQuery({
    queryKey: ["community"],
    queryFn: async () => { const r = await fetch("/api/community"); if (!r.ok) return DEMO; return (await r.json()).discussions?.length ? (await r.json()).discussions : DEMO; },
  });

  const tabs = [{
    id: "community", label: "Community", icon: <List className="size-4" />,
    content: (
      <Section>
        <Grid cols={4} gap={4} className="grid-cols-2 md:grid-cols-4 mb-6">
          <StatCard label="Members" value="12.5K" icon={<Users className="size-5" />} />
          <StatCard label="Discussions" value="1.2K" icon={<MessageSquare className="size-5" />} />
          <StatCard label="Events Shared" value="450" icon={<Calendar className="size-5" />} />
          <StatCard label="Top Contributors" value="50" icon={<Award className="size-5" />} />
        </Grid>
        <SectionHeader title="Recent Discussions" />
        <Stack gap={4} className="mt-4">
          {discussions.map((d: Discussion) => (
            <Card key={d.id} className="p-4 cursor-pointer hover:border-primary transition-colors">
              <Box className="flex items-center justify-between">
                <Box><Body className="font-weight-bold">{d.title}</Body><Body size="sm" className="text-on-dark-muted">by {d.author}</Body></Box>
                <Box className="flex items-center gap-2 text-on-dark-muted"><MessageSquare className="size-4" /><Body size="sm">{d.replies}</Body></Box>
              </Box>
            </Card>
          ))}
        </Stack>
        <Button variant="outline" className="w-full mt-4">View All Discussions</Button>
      </Section>
    ),
  }];

  return <DetailPage header={{ kicker: "Social", title: "Community", description: "Connect with fellow event lovers" }} loading={isLoading} error={error instanceof Error ? error : null} onRetry={refetch} tabs={tabs} actions={<Button variant="solid">Start Discussion</Button>} />;
}
