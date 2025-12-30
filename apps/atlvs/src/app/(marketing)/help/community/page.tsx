"use client";

/**
 * Community Page
 * User community and forums
 * Uses DetailPage template for consistent layout
 */

import { Users, MessageSquare, Star, Trophy, ExternalLink, List, TrendingUp } from "lucide-react";
import {
  Badge, Body, Button, Card, Grid, StatCard, DetailPage, Section, SectionHeader} from "@ghxstship/ui";

const COMMUNITY_STATS = { members: "5,000+", discussions: "2,500+", solutions: "1,200+" };

const FEATURED_DISCUSSIONS = [
  { id: "1", title: "Best practices for large-scale productions", author: "Sarah M.", replies: 45, views: 1200 },
  { id: "2", title: "How to automate your workflow", author: "John D.", replies: 32, views: 890 },
  { id: "3", title: "Tips for team collaboration", author: "Emily R.", replies: 28, views: 750 },
];

const TOP_CONTRIBUTORS = [
  { name: "Alex Chen", points: 2500, badge: "Expert" },
  { name: "Maria Garcia", points: 1800, badge: "Pro" },
  { name: "James Wilson", points: 1500, badge: "Pro" },
];

export default function CommunityPage() {

  const tabs = [
    {
      id: "community",
      label: "Community",
      icon: <List className="size-4" />,
      content: (
        <Section>
          <Grid cols={3} gap={4} className="grid-cols-1 md:grid-cols-3 mb-6">
            <StatCard label="Members" value={COMMUNITY_STATS.members} icon={<Users className="size-5" />} />
            <StatCard label="Discussions" value={COMMUNITY_STATS.discussions} icon={<MessageSquare className="size-5" />} />
            <StatCard label="Solutions" value={COMMUNITY_STATS.solutions} icon={<Star className="size-5" />} />
          </Grid>

          <Card className="p-6 mb-6">
            <SectionHeader title="Featured Discussions" />
            <div className="space-y-4 mt-4">
              {FEATURED_DISCUSSIONS.map((discussion) => (
                <Card key={discussion.id} className="p-4 cursor-pointer hover:border-primary">
                  <div className="flex items-center justify-between">
                    <div>
                      <Body className="font-weight-medium">{discussion.title}</Body>
                      <Body size="sm" className="text-on-dark-muted">by {discussion.author}</Body>
                    </div>
                    <div className="flex items-center gap-4 text-on-dark-disabled">
                      <Body size="sm">{discussion.replies} replies</Body>
                      <Body size="sm">{discussion.views} views</Body>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
            <Button variant="outline" className="mt-4" icon={<ExternalLink className="size-4" />} iconPosition="right">
              View All Discussions
            </Button>
          </Card>

          <Card className="p-8 text-center">
            <Users className="size-12 text-primary mx-auto mb-4" />
            <Body className="font-weight-bold font-weight-bold mb-2">Join the Community</Body>
            <Body className="text-on-dark-muted mb-4">Connect with other ATLVS users, share tips, and get help</Body>
            <Button variant="solid">Join Now</Button>
          </Card>
        </Section>
      ),
    },
    {
      id: "leaderboard",
      label: "Leaderboard",
      icon: <TrendingUp className="size-4" />,
      content: (
        <Section>
          <SectionHeader title="Top Contributors" description="Our most helpful community members" />
          <div className="space-y-4 mt-6">
            {TOP_CONTRIBUTORS.map((contributor, idx) => (
              <Card key={idx} className="p-4">
                <div className="flex items-center gap-4">
                  <div className="size-10 rounded-avatar bg-primary flex items-center justify-center text-white font-weight-bold">
                    #{idx + 1}
                  </div>
                  <div className="flex-1">
                    <Body className="font-weight-medium">{contributor.name}</Body>
                    <Badge variant="outline">{contributor.badge}</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Trophy className="size-4 text-warning" />
                    <Body className="font-weight-bold">{contributor.points} pts</Body>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Section>
      ),
    },
  ];

  return (
    <DetailPage
      header={{
        kicker: "Help",
        title: "Community",
        description: "Connect with other ATLVS users",
      }}
      backButton={{ label: "Help Center", href: "/help" }}
      tabs={tabs}
    />
  );
}
