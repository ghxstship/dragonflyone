"use client";

import { useParams } from "next/navigation";
import { Heart, MessageSquare, Share2, Award, List } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Body, Button, Card, Grid, StatCard, DetailPage, Section, SectionHeader } from "@ghxstship/ui";

export default function EventEngagePage() {
  const params = useParams();
  const eventId = params.eventId as string;

  const { isLoading, error, refetch } = useQuery({
    queryKey: ["event-engage", eventId],
    queryFn: async () => {
      const response = await fetch(`/api/events/${eventId}/engage`);
      if (!response.ok) return { polls: [], challenges: [] };
      return response.json();
    },
  });

  const tabs = [{
    id: "engage", label: "Engage", icon: <List className="size-4" />,
    content: (
      <Section>
        <Grid cols={4} gap={4} className="grid-cols-2 md:grid-cols-4 mb-6">
          <StatCard label="Likes" value="1.2K" icon={<Heart className="size-5" />} />
          <StatCard label="Comments" value="342" icon={<MessageSquare className="size-5" />} />
          <StatCard label="Shares" value="89" icon={<Share2 className="size-5" />} />
          <StatCard label="Points" value="500" icon={<Award className="size-5" />} />
        </Grid>
        <SectionHeader title="Polls & Challenges" description="Participate and earn points" />
        <Grid cols={2} gap={4} className="grid-cols-1 md:grid-cols-2 mt-4">
          <Card className="p-6">
            <Body className="font-weight-bold mb-2">Vote for Headliner</Body>
            <Body size="sm" className="text-text-muted mb-4">Which artist are you most excited to see?</Body>
            <Button variant="outline" className="w-full">Vote Now</Button>
          </Card>
          <Card className="p-6">
            <Body className="font-weight-bold mb-2">Photo Challenge</Body>
            <Body size="sm" className="text-text-muted mb-4">Share your best festival outfit</Body>
            <Button variant="outline" className="w-full">Participate</Button>
          </Card>
        </Grid>
      </Section>
    ),
  }];

  return <DetailPage header={{ kicker: "Event", title: "Engage", description: "Interact and earn rewards" }} backButton={{ label: "Event", href: `/e/${eventId}` }} loading={isLoading} error={error instanceof Error ? error : null} onRetry={refetch} tabs={tabs} />;
}
