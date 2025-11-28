"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ConsumerNavigationPublic } from "@/components/navigation";
import {
  H2,
  Body,
  StatCard,
  Select,
  Button,
  Badge,
  LoadingSpinner,
  EmptyState,
  Container,
  Grid,
  Stack,
  Card,
  Section,
  Input,
  Field,
  useNotifications,
  PageLayout,
  Footer,
  FooterColumn,
  FooterLink,
  Display,
  Kicker,
} from "@ghxstship/ui";

interface Group {
  id: string;
  name: string;
  description: string;
  category: string;
  member_count: number;
  event_count: number;
  image_url?: string;
  is_private: boolean;
  is_member: boolean;
  created_at: string;
  admin_name: string;
}

interface GroupSummary {
  total_groups: number;
  my_groups: number;
  trending_count: number;
  new_this_week: number;
}

export default function GroupsPage() {
  const router = useRouter();
  const { addNotification } = useNotifications();
  const [groups, setGroups] = useState<Group[]>([]);
  const [summary, setSummary] = useState<GroupSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchGroups = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterCategory !== "all") params.append("category", filterCategory);
      if (searchQuery) params.append("search", searchQuery);

      const response = await fetch(`/api/groups?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch groups");
      
      const data = await response.json();
      setGroups(data.groups || []);
      setSummary(data.summary || null);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [filterCategory, searchQuery]);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  const handleJoinGroup = async (groupId: string) => {
    try {
      const response = await fetch(`/api/groups/${groupId}/join`, {
        method: "POST",
      });
      if (response.ok) {
        addNotification({ type: "success", title: "Joined!", message: "You've joined the group" });
        fetchGroups();
      }
    } catch (err) {
      addNotification({ type: "error", title: "Error", message: "Failed to join group" });
    }
  };

  const handleLeaveGroup = async (groupId: string) => {
    try {
      const response = await fetch(`/api/groups/${groupId}/leave`, {
        method: "POST",
      });
      if (response.ok) {
        addNotification({ type: "success", title: "Left", message: "You've left the group" });
        fetchGroups();
      }
    } catch (err) {
      addNotification({ type: "error", title: "Error", message: "Failed to leave group" });
    }
  };

  const footerContent = (
    <Footer
      logo={<Display size="md">GVTEWAY</Display>}
      copyright="© 2024 GHXSTSHIP INDUSTRIES. ALL RIGHTS RESERVED."
    >
      <FooterColumn title="Community">
        <FooterLink href="/groups">Groups</FooterLink>
        <FooterLink href="/forums">Forums</FooterLink>
      </FooterColumn>
      <FooterColumn title="Legal">
        <FooterLink href="/legal/privacy">Privacy</FooterLink>
        <FooterLink href="/legal/terms">Terms</FooterLink>
      </FooterColumn>
    </Footer>
  );

  if (loading) {
    return (
      <PageLayout background="black" header={<ConsumerNavigationPublic />} footer={footerContent}>
        <Section background="black" className="flex min-h-[60vh] items-center justify-center">
          <LoadingSpinner size="lg" text="Loading groups..." />
        </Section>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout background="black" header={<ConsumerNavigationPublic />} footer={footerContent}>
        <Section background="black" className="min-h-screen py-16">
          <Container>
            <EmptyState
              title="Error Loading Groups"
              description={error}
              action={{ label: "Retry", onClick: fetchGroups }}
              inverted
            />
          </Container>
        </Section>
      </PageLayout>
    );
  }

  return (
    <PageLayout background="black" header={<ConsumerNavigationPublic />} footer={footerContent}>
      <Section background="black" className="relative min-h-screen overflow-hidden py-16">
        <div
          className="pointer-events-none absolute inset-0 opacity-5"
          style={{
            backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />
        <Container className="relative z-10">
          <Stack gap={8}>
            <Stack gap={2}>
              <Kicker colorScheme="on-dark">Community</Kicker>
              <H2 size="lg" className="text-white">Groups</H2>
              <Body className="text-on-dark-muted">
                Connect with fans who share your interests
              </Body>
            </Stack>

            <Grid cols={4} gap={6}>
              <StatCard
                value={(summary?.total_groups || 0).toString()}
                label="Total Groups"
                inverted
              />
              <StatCard
                value={(summary?.my_groups || 0).toString()}
                label="My Groups"
                inverted
              />
              <StatCard
                value={(summary?.trending_count || 0).toString()}
                label="Trending"
                inverted
              />
              <StatCard
                value={(summary?.new_this_week || 0).toString()}
                label="New This Week"
                inverted
              />
            </Grid>

          <Stack gap={4} direction="horizontal">
            <Field className="flex-1">
              <Input
                placeholder="Search groups..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                inverted
              />
            </Field>
            <Select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              inverted
            >
              <option value="all">All Categories</option>
              <option value="music">Music</option>
              <option value="sports">Sports</option>
              <option value="comedy">Comedy</option>
              <option value="theater">Theater</option>
              <option value="festivals">Festivals</option>
              <option value="local">Local Events</option>
            </Select>
          </Stack>

          {groups.length === 0 ? (
            <EmptyState
              title="No Groups Found"
              description="Create a new group or try different filters"
              action={{ label: "Create Group", onClick: () => router.push("/groups/new") }}
              inverted
            />
          ) : (
            <Grid cols={3} gap={6}>
              {groups.map((group) => (
                <Card key={group.id} inverted interactive>
                  <Stack gap={4}>
                    <Stack gap={2}>
                      <Stack gap={2} direction="horizontal" className="items-start justify-between">
                        <H2 className="text-body-md">{group.name}</H2>
                        {group.is_private && (
                          <Badge variant="ghost">Private</Badge>
                        )}
                      </Stack>
                      <Body size="sm" className="text-on-dark-muted line-clamp-2">
                        {group.description}
                      </Body>
                    </Stack>

                    <Stack gap={2}>
                      <Badge variant="outline">{group.category}</Badge>
                      <Stack gap={1} direction="horizontal" className="text-on-dark-disabled">
                        <Body>{group.member_count} members</Body>
                        <Body>•</Body>
                        <Body>{group.event_count} events</Body>
                      </Stack>
                    </Stack>

                    <Stack gap={2} direction="horizontal">
                      {group.is_member ? (
                        <>
                          <Button 
                            variant="outlineInk" 
                            size="sm"
                            onClick={() => router.push(`/groups/${group.id}`)}
                            className="flex-1"
                          >
                            View Group
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleLeaveGroup(group.id)}
                          >
                            Leave
                          </Button>
                        </>
                      ) : (
                        <Button 
                          variant="solid" 
                          size="sm"
                          inverted
                          onClick={() => handleJoinGroup(group.id)}
                          className="flex-1"
                        >
                          Join Group
                        </Button>
                      )}
                    </Stack>
                  </Stack>
                </Card>
              ))}
            </Grid>
          )}

          <Stack gap={3} direction="horizontal" className="justify-center">
            <Button variant="outlineInk" onClick={() => router.push("/groups/new")}>
              Create a Group
            </Button>
          </Stack>
          </Stack>
        </Container>
      </Section>
    </PageLayout>
  );
}
